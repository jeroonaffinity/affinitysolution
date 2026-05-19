import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId, endpointContext } = await req.json();
  if (!ticketId) return Response.json({ error: "ticketId required" }, { status: 400 });

  // Fetch the ticket
  const ticket = await base44.entities.SupportTicket.filter({ id: ticketId });
  const t = ticket[0];
  if (!t) return Response.json({ error: "Ticket not found" }, { status: 404 });

  // Fetch recent thread messages for context
  const threads = await base44.entities.TicketThread.filter({ ticket_id: ticketId });
  const recentMessages = threads
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6)
    .reverse()
    .map(m => `[${m.author_name || m.author_email}]: ${m.content}`)
    .join("\n");

  // Build endpoint context summary
  let endpointSummary = "No endpoint data available.";
  if (endpointContext && Array.isArray(endpointContext) && endpointContext.length > 0) {
    // Find the device matching the ticket's device_asset if possible
    const matched = t.device_asset
      ? endpointContext.find(e =>
          e.name?.toLowerCase().includes(t.device_asset?.toLowerCase()) ||
          t.device_asset?.toLowerCase().includes(e.name?.toLowerCase())
        )
      : null;

    const relevant = matched ? [matched] : endpointContext.slice(0, 5);
    endpointSummary = relevant.map(e => {
      const parts = [
        `Device: ${e.name}`,
        `Status: ${e.status}`,
        e.reboot_required === "Yes" ? "Reboot Required: Yes" : null,
        e.missing_updates?.critical > 0 ? `Critical Updates Pending: ${e.missing_updates.critical}` : null,
        e.missing_updates?.other > 0 ? `Other Updates Pending: ${e.missing_updates.other}` : null,
        e.OS ? `OS: ${e.OS}` : null,
      ].filter(Boolean).join(", ");
      return parts;
    }).join("\n");
  }

  const prompt = `You are an MSP (Managed Service Provider) IT support AI assistant. Analyze this support ticket and endpoint health data, then suggest 2-4 specific quick actions a technician should take.

TICKET DETAILS:
- Title: ${t.title}
- Category: ${t.category || "unknown"}
- Priority: ${t.priority || "medium"}
- Status: ${t.status}
- Device/Asset: ${t.device_asset || "not specified"}
- Description: ${t.description || "none"}

RECENT CONVERSATION:
${recentMessages || "No messages yet."}

ENDPOINT HEALTH DATA:
${endpointSummary}

Based on the above, suggest 2-4 specific quick actions. Each action should be immediately actionable by a technician. Focus on actions relevant to the specific issue described.

Available action types: "Force Reboot", "Deploy Critical Updates", "Run Cleanup Script", "Run Diagnostics", "Isolate Endpoint", "Collect Logs", "Check Event Viewer", "Flush DNS Cache", "Restart Service", "Run Disk Check", "Clear Temp Files", "Verify Network Connectivity", "Check Antivirus Status", "Deploy Configuration", "Reset User Password", "Check Disk Space"

Respond ONLY with a JSON object (no markdown, no extra text):
{
  "actions": [
    {
      "id": "unique_id",
      "label": "Action label (max 4 words)",
      "description": "Why this action is recommended (1 sentence)",
      "type": "reboot|update|script|diagnostic|network|security|maintenance",
      "urgency": "critical|high|medium|low",
      "command": "Optional PowerShell or CLI command hint"
    }
  ],
  "summary": "One sentence summary of the diagnosis"
}`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              description: { type: "string" },
              type: { type: "string" },
              urgency: { type: "string" },
              command: { type: "string" }
            }
          }
        },
        summary: { type: "string" }
      }
    }
  });

  return Response.json(result);
});