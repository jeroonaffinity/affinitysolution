import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLIENT_ID = "1000.IV4T37FGQ9KIGGHR52I5S1UUGEZ6TD";
const CLIENT_SECRET = "d5f8654adf6d2ec14f5a3a8624e3033e5b8e4c8b41";
const ZOHO_ACCOUNTS = "https://accounts.zoho.eu/oauth/v2/token";
const DESK_BASE = "https://desk.zoho.eu/api/v1";
const ORG_ID = "20114459933";

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

async function deskFetch(accessToken, path) {
  const res = await fetch(`${DESK_BASE}${path}`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      orgId: ORG_ID,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Zoho ${res.status}: ${text}`);
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Support both scheduled (no auth) and manual admin calls
  let isScheduled = false;
  try {
    const body = await req.json().catch(() => ({}));
    isScheduled = body?.scheduled === true;
  } catch (_) {}

  if (!isScheduled) {
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const localTickets = await base44.asServiceRole.entities.SupportTicket.list();
  const withZohoId = localTickets.filter(t => t.zoho_ticket_id);

  if (!withZohoId.length) return Response.json({ synced: 0 });

  const accessToken = await getAccessToken();

  const results = await Promise.allSettled(
    withZohoId.map(async (lt) => {
      const zt = await deskFetch(accessToken, `/tickets/${lt.zoho_ticket_id}`).catch(() => null);
      if (!zt) return;
      await base44.asServiceRole.entities.SupportTicket.update(lt.id, {
        zoho_status: zt.status,
        zoho_priority: zt.priority,
        zoho_ticket_number: zt.ticketNumber ? String(zt.ticketNumber) : lt.zoho_ticket_number,
        zoho_channel: zt.channel || lt.zoho_channel,
        zoho_created_time: zt.createdTime || lt.zoho_created_time,
      });
    })
  );

  const synced = results.filter(r => r.status === "fulfilled").length;
  console.log(`Synced ${synced}/${withZohoId.length} tickets from Zoho`);
  return Response.json({ synced, total: withZohoId.length });
});