import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLIENT_ID = "1000.IV4T37FGQ9KIGGHR52I5S1UUGEZ6TD";
const CLIENT_SECRET = "d5f8654adf6d2ec14f5a3a8624e3033e5b8e4c8b41";
const ZOHO_ACCOUNTS = "https://accounts.zoho.eu/oauth/v2/token";
const DESK_BASE = "https://desk.zoho.eu/api/v1";

async function getAccessToken() {
  const res = await fetch(ZOHO_ACCOUNTS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: Deno.env.get("ZOHO_REFRESH_TOKEN"),
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Failed to get Zoho access token: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function deskFetch(accessToken, orgId, path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      orgId: orgId,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${DESK_BASE}${path}`, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`Zoho Desk ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json();
  const { action, orgId, ticketId, data } = payload;

  // Non-admins can only create tickets or list their own
  const isAdmin = user.role === "admin";
  const clientOnlyActions = ["create_ticket", "list_tickets", "get_ticket"];
  if (!isAdmin && !clientOnlyActions.includes(action)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const accessToken = await getAccessToken();

  // Get organisations (use this first to find orgId)
  if (action === "organizations") {
    const result = await deskFetch(accessToken, "", "/organizations");
    return Response.json({ data: result });
  }

  if (!orgId) return Response.json({ error: "orgId required" }, { status: 400 });

  // List tickets (admin — no email filter needed, clients use get_tickets_by_ids)
  if (action === "list_tickets") {
    const { status, from = 0, limit = 50 } = payload;
    const params = new URLSearchParams({ from, limit });
    if (status) params.set("status", status);
    const result = await deskFetch(accessToken, orgId, `/tickets?${params}`);
    return Response.json({ data: result });
  }

  // Get single ticket
  if (action === "get_ticket" && ticketId) {
    const result = await deskFetch(accessToken, orgId, `/tickets/${ticketId}`);
    return Response.json({ data: result });
  }

  // Get multiple tickets by IDs (for client portal)
  if (action === "get_tickets_by_ids") {
    const { ticketIds } = payload;
    if (!ticketIds || !ticketIds.length) return Response.json({ data: { data: [] } });
    
    // Fetch in parallel (Zoho has rate limits but for small arrays this is fine, limit to 20 to be safe)
    const toFetch = ticketIds.slice(0, 20);
    const promises = toFetch.map(id => deskFetch(accessToken, orgId, `/tickets/${id}`).catch(() => null));
    const results = await Promise.all(promises);
    return Response.json({ data: { data: results.filter(Boolean) } });
  }

  // Create ticket
  if (action === "create_ticket" && data) {
    // Build payload — wrap email in contact object if no contactId provided
    const clientEmail = data.email || data.clientEmail;
    const ticketPayload = { ...data };
    delete ticketPayload.clientEmail;
    if (!ticketPayload.contactId && ticketPayload.email) {
      ticketPayload.contact = { email: ticketPayload.email };
      delete ticketPayload.email;
    }
    const result = await deskFetch(accessToken, orgId, "/tickets", "POST", ticketPayload);
    // Save Zoho ticket ID + client email locally so clients can find their tickets
    if (result?.id && clientEmail) {
      await base44.asServiceRole.entities.SupportTicket.create({
        title: ticketPayload.subject || data.subject || "Support Ticket",
        description: ticketPayload.description || "",
        client_email: clientEmail,
        status: "open",
        priority: (ticketPayload.priority || "medium").toLowerCase(),
        zoho_ticket_id: result.id,
      });
    }
    return Response.json({ data: result });
  }

  // Update ticket
  if (action === "update_ticket" && ticketId && data) {
    const result = await deskFetch(accessToken, orgId, `/tickets/${ticketId}`, "PATCH", data);
    return Response.json({ data: result });
  }

  // Get ticket comments/threads
  if (action === "get_threads" && ticketId) {
    const result = await deskFetch(accessToken, orgId, `/tickets/${ticketId}/threads`);
    return Response.json({ data: result });
  }

  // Add comment/reply to ticket
  if (action === "add_reply" && ticketId && data) {
    const result = await deskFetch(accessToken, orgId, `/tickets/${ticketId}/sendReply`, "POST", data);
    return Response.json({ data: result });
  }

  // ── AUTO-ANALYZE TICKET ─────────────────────────────────────────────────
  // Keyword-based priority + department tag assignment, then patches the ticket
  if (action === "analyze_ticket" && ticketId) {
    const ticket = await deskFetch(accessToken, orgId, `/tickets/${ticketId}`);
    const text = `${ticket.subject || ""} ${ticket.description || ""}`.toLowerCase();

    // Priority rules (first match wins)
    let priority = ticket.priority || "Medium";
    const priorityRules = [
      { keywords: ["critical", "emergency", "down", "ransomware", "breach", "outage", "not working", "server down", "cannot access", "locked out"], priority: "High" },
      { keywords: ["slow", "intermittent", "degraded", "warning", "error", "failed", "issue", "problem"], priority: "Medium" },
      { keywords: ["question", "query", "how to", "guide", "information", "request", "change"], priority: "Low" },
    ];
    for (const rule of priorityRules) {
      if (rule.keywords.some(k => text.includes(k))) { priority = rule.priority; break; }
    }

    // Department tag classification
    let classification = "General";
    const tagRules = [
      { keywords: ["network", "wifi", "internet", "vpn", "firewall", "connectivity", "dns", "ip"], tag: "Network" },
      { keywords: ["email", "outlook", "microsoft 365", "spam", "mailbox", "calendar", "teams"], tag: "Email & M365" },
      { keywords: ["virus", "malware", "ransomware", "phishing", "breach", "security", "password", "mfa", "2fa"], tag: "Security" },
      { keywords: ["printer", "hardware", "laptop", "screen", "keyboard", "monitor", "device", "pc", "computer", "crash"], tag: "Hardware" },
      { keywords: ["software", "install", "update", "application", "app", "license", "windows", "driver"], tag: "Software" },
      { keywords: ["backup", "restore", "data", "file", "storage", "cloud", "sharepoint", "onedrive"], tag: "Data & Backup" },
    ];
    for (const rule of tagRules) {
      if (rule.keywords.some(k => text.includes(k))) { classification = rule.tag; break; }
    }

    // Patch the ticket with the determined priority
    const shouldUpdate = !ticket.priority || ticket.priority !== priority;
    if (shouldUpdate && ticket.contactId) {
      await deskFetch(accessToken, orgId, `/tickets/${ticketId}`, "PATCH", { priority });
    }

    return Response.json({ priority, classification, changed: shouldUpdate });
  }

  // ── CUSTOMER 360 ─────────────────────────────────────────────────────────
  // Fetch Action1 device info for the ticket's contact email via their team
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

    // Look up which team this email belongs to, to find the group
    const teams = await base44.asServiceRole.entities.Team.list();
    const team = teams.find(t => t.member_emails?.includes(email));

    if (!team?.action1_org_id || !team?.action1_group_id) {
      return Response.json({ devices: [], alerts: [], teamName: team?.name || null, noAction1: true });
    }

    const a1Token = await getAction1Token();

    // Fetch endpoints in this team's group
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

    // Derive alerts from device states
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