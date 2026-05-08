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
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const payload = await req.json();
  const { action, orgId, ticketId, data } = payload;

  const accessToken = await getAccessToken();

  // Get organisations (use this first to find orgId)
  if (action === "organizations") {
    const result = await deskFetch(accessToken, "", "/organizations");
    return Response.json({ data: result });
  }

  if (!orgId) return Response.json({ error: "orgId required" }, { status: 400 });

  // List tickets
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

  // Create ticket
  if (action === "create_ticket" && data) {
    const result = await deskFetch(accessToken, orgId, "/tickets", "POST", data);
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

  return Response.json({ error: "Invalid action" }, { status: 400 });
});