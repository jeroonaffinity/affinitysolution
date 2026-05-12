import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AI keyword analysis for auto-tagging and priority
function analyzeTicketContent(subject, description) {
  const text = `${subject || ""} ${description || ""}`.toLowerCase();
  
  // Priority rules (first match wins)
  let priority = "medium";
  const priorityRules = [
    { keywords: ["critical", "emergency", "down", "ransomware", "breach", "outage", "not working", "server down", "cannot access", "locked out", "urgent", "asap"], priority: "critical" },
    { keywords: ["slow", "intermittent", "degraded", "warning", "error", "failed", "issue", "problem", "broken", "high"], priority: "high" },
    { keywords: ["question", "query", "how to", "guide", "information", "request", "change", "low"], priority: "low" },
  ];
  for (const rule of priorityRules) {
    if (rule.keywords.some(k => text.includes(k))) { priority = rule.priority; break; }
  }

  // Category classification
  let category = "other";
  const categoryRules = [
    { keywords: ["network", "wifi", "internet", "vpn", "firewall", "connectivity", "dns", "ip", "connection"], tag: "network" },
    { keywords: ["email", "outlook", "microsoft 365", "spam", "mailbox", "calendar", "teams", "mail"], tag: "email" },
    { keywords: ["virus", "malware", "ransomware", "phishing", "breach", "security", "password", "mfa", "2fa", "hack"], tag: "security" },
    { keywords: ["printer", "hardware", "laptop", "screen", "keyboard", "monitor", "device", "pc", "computer", "crash", "mouse"], tag: "hardware" },
    { keywords: ["software", "install", "update", "application", "app", "license", "windows", "driver", "plugin"], tag: "software" },
    { keywords: ["backup", "restore", "data", "file", "storage", "cloud", "sharepoint", "onedrive", "sync"], tag: "data" },
  ];
  for (const rule of categoryRules) {
    if (rule.keywords.some(k => text.includes(k))) { category = rule.tag; break; }
  }

  return { priority, category };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json();
  const { action, ticketId, data } = payload;

  // Non-admins can only create/list tickets
  const isAdmin = user.role === "admin";
  const clientOnlyActions = ["create_ticket", "list_tickets", "get_ticket", "analyze"];
  if (!isAdmin && !clientOnlyActions.includes(action)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Analyze ticket content for suggested priority & category (instant, no Zoho needed)
  if (action === "analyze") {
    const { subject, description } = payload;
    const { priority, category } = analyzeTicketContent(subject, description);
    return Response.json({ priority, category });
  }

  // List tickets (local database)
  if (action === "list_tickets") {
    const { status } = payload;
    let query = {};
    if (status) query.status = status;
    const tickets = await base44.asServiceRole.entities.SupportTicket.filter(query, "-created_date", 100);
    return Response.json({ data: tickets });
  }

  // Get single ticket
  if (action === "get_ticket" && ticketId) {
    const ticket = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticketId });
    return Response.json({ data: ticket[0] || null });
  }

  // Create ticket (local only)
  if (action === "create_ticket" && data) {
    const clientEmail = data.email || data.clientEmail;
    const { priority, category } = analyzeTicketContent(data.subject, data.description);
    
    // Look up the team this email belongs to
    const teams = await base44.asServiceRole.entities.Team.list();
    const team = teams.find(t => t.member_emails?.includes(clientEmail));
    
    const ticket = await base44.asServiceRole.entities.SupportTicket.create({
      title: data.subject || "Support Ticket",
      description: data.description || "",
      client_email: clientEmail,
      team_id: team?.id || null,
      status: "open",
      priority: priority,
      category: category,
    });
    
    return Response.json({ data: ticket, suggested: { priority, category } });
  }

  // Update ticket (local only)
  if (action === "update_ticket" && ticketId && data) {
    const ticket = await base44.asServiceRole.entities.SupportTicket.update(ticketId, data);
    return Response.json({ data: ticket });
  }

  // Get ticket messages/threads (mock for now)
  if (action === "get_threads" && ticketId) {
    return Response.json({ data: { data: [] } });
  }

  // Add comment/reply (local only)
  if (action === "add_reply" && ticketId && data) {
    // TODO: Create a TicketComment entity if needed for full threading
    return Response.json({ success: true });
  }

  // Fetch Action1 device info (still uses ACTION1 API)
  if (action === "customer_360") {
    const { email } = payload;
    if (!email) return Response.json({ error: "email required" }, { status: 400 });

    const ACTION1_BASE = "https://app.eu.action1.com/api/3.0";

    async function getAction1Token() {
      const res = await fetch(`${ACTION1_BASE}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: Deno.env.get("ACTION1_CLIENT_ID"),
          client_secret: Deno.env.get("ACTION1_CLIENT_SECRET"),
        }),
      });
      const d = await res.json();
      if (!d.access_token) throw new Error("Failed to get Action1 token");
      return d.access_token;
    }

    const teams = await base44.asServiceRole.entities.Team.list();
    const team = teams.find(t => t.member_emails?.includes(email));

    if (!team?.action1_org_id || !team?.action1_group_id) {
      return Response.json({ devices: [], alerts: [], teamName: team?.name || null, noAction1: true });
    }

    const a1Token = await getAction1Token();

    const epRes = await fetch(
      `${ACTION1_BASE}/endpoints/managed/${team.action1_org_id}?endpoint_group_id=${team.action1_group_id}&fields=*`,
      { headers: { Authorization: `Bearer ${a1Token}` } }
    );
    const epData = await epRes.json();
    const devices = (epData?.items || []).map(ep => ({
      id: ep.id,
      name: ep.name,
      status: ep.status,
      OS: ep.OS,
      user: ep.user,
      last_seen: ep.last_seen,
      update_status: ep.update_status,
      reboot_required: ep.reboot_required,
      missing_updates: ep.missing_updates,
      address: ep.address,
    }));

    const alerts = [];
    for (const d of devices) {
      if (d.status === "Disconnected") alerts.push({ type: "offline", device: d.name, msg: "Device offline" });
      if (d.reboot_required === "Yes") alerts.push({ type: "reboot", device: d.name, msg: "Reboot required" });
      if ((d.missing_updates?.critical || 0) > 0) alerts.push({ type: "updates", device: d.name, msg: `${d.missing_updates.critical} critical update(s) pending` });
    }

    return Response.json({ devices, alerts, teamName: team.name, noAction1: false });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});