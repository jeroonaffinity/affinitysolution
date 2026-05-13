import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Automation payloads have body.event.entity_id; direct calls have body.ticket_id
    const isAutomation = !!body?.event?.entity_id;
    const ticket_id = isAutomation ? body.event.entity_id : body.ticket_id;
    const preview_only = !isAutomation && !!body.preview_only;

    // Enforce auth only for direct (non-automation) calls
    if (!isAutomation) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ticket_id) return Response.json({ error: "ticket_id required" }, { status: 400 });

    // Fetch ticket
    const ticketRows = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticket_id });
    if (!ticketRows[0]) return Response.json({ error: "Ticket not found" }, { status: 404 });
    const ticketData = ticketRows[0];

    // Fetch thread history (last 10)
    const threads = await base44.asServiceRole.entities.TicketThread.filter({ ticket_id }, "-created_date", 10);
    const threadHistory = threads
      .slice()
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .map(t => `${t.author_name || t.author_email}: ${t.content}`)
      .join("\n");

    // KB suggestions
    let suggestedArticles = [];
    try {
      const kbSuggestions = await base44.functions.invoke("kbSmartSuggest", {
        action: "suggest_for_ticket",
        ticket_id,
      });
      suggestedArticles = kbSuggestions.data?.suggestions || [];
    } catch (e) {
      console.log("KB suggestions skipped:", e.message);
    }

    // Build LLM prompt
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional IT support technician at AffinitySolution. A support ticket has been raised. Write a helpful first response to the client.

Ticket Title: ${ticketData.title}
Priority: ${ticketData.priority}
Category: ${ticketData.category}
Description: ${ticketData.description || "(none provided)"}
Affected Users: ${ticketData.affected_users_count || 1}
${ticketData.device_asset ? `Device/Asset: ${ticketData.device_asset}` : ""}
${ticketData.department ? `Department: ${ticketData.department}` : ""}

${threadHistory ? `Previous messages:\n${threadHistory}` : ""}

${suggestedArticles.length > 0 ? `Related Knowledge Base Articles:\n${suggestedArticles.map((a, i) => `${i + 1}. "${a.title}" (${a.category}) - ${a.summary}`).join("\n")}\nReference these if relevant.` : ""}

Write a professional, friendly response (2-3 short paragraphs) that:
1. Acknowledges the issue and confirms receipt
2. Suggests immediate troubleshooting steps specific to this issue
3. States the next action and sets expectations

Do NOT use placeholder text like [Your Name] or [Technician Name]. Sign off as "The AffinitySolution Support Team".`,
    });

    const kbSection = suggestedArticles.length > 0
      ? `\n\n--- Related Knowledge Base Articles ---\n${suggestedArticles.map(a => `• "${a.title}" (${a.category}): ${a.summary}`).join("\n")}`
      : "";

    const fullContent = aiResponse + kbSection;

    // If preview_only, just return the text — don't save it
    if (preview_only) {
      return Response.json({ success: true, preview: fullContent });
    }

    // Save to thread
    const aiMessage = await base44.asServiceRole.entities.TicketThread.create({
      ticket_id,
      author_email: "ai-support@affinitysolution.com",
      author_name: "AffinitySolution AI Support",
      is_ai_response: true,
      content: fullContent,
      is_public: true,
      kb_article_ids: suggestedArticles.map(a => a.id),
    });

    return Response.json({ success: true, aiMessage });
  } catch (error) {
    console.error("AI response error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});