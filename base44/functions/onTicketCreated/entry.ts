import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";
const ADMIN_SMS_EMAIL = "07947992054@mms.ee.co.uk";
const PORTAL_URL = "https://affinitysolution.base44.app/dashboard";
const ADMIN_URL = "https://affinitysolution.base44.app/admin";

const ZOHO_CLIENT_ID = "1000.IV4T37FGQ9KIGGHR52I5S1UUGEZ6TD";
const ZOHO_CLIENT_SECRET = "d5f8654adf6d2ec14f5a3a8624e3033e5b8e4c8b41";
const ZOHO_ACCOUNTS = "https://accounts.zoho.eu/oauth/v2/token";
const DESK_BASE = "https://desk.zoho.eu/api/v1";
const ZOHO_ORG_ID = "20114459933";
const ZOHO_DEPT_ID = "238671000000007061";

const PRIORITY_COLORS = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" };
const PRIORITY_ZOHO = { critical: "High", high: "High", medium: "Medium", low: "Low" };

async function getZohoToken() {
  const res = await fetch(ZOHO_ACCOUNTS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: Deno.env.get("ZOHO_REFRESH_TOKEN"),
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { throw new Error("Zoho token parse error: " + text.slice(0,200)); }
  if (!data.access_token) throw new Error("Zoho token error: " + JSON.stringify(data));
  return data.access_token;
}

async function getOrCreateContact(token, email) {
  const searchRes = await fetch(
    DESK_BASE + "/contacts/search?email=" + encodeURIComponent(email),
    { headers: { Authorization: "Zoho-oauthtoken " + token, orgId: ZOHO_ORG_ID } }
  );
  const searchData = await searchRes.json();
  const existing = searchData?.data?.[0]?.id;
  if (existing) return existing;

  const createRes = await fetch(DESK_BASE + "/contacts", {
    method: "POST",
    headers: {
      Authorization: "Zoho-oauthtoken " + token,
      orgId: ZOHO_ORG_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, lastName: email.split("@")[0] }),
  });
  const created = await createRes.json();
  console.log("Contact create response:", JSON.stringify(created));
  return created?.id || null;
}

async function pushToZoho({ title, description, priority, category, clientEmail, ticketId }) {
  const token = await getZohoToken();
  const contactId = await getOrCreateContact(token, clientEmail);

  const ticketBody = {
    subject: title,
    description: description || "",
    priority: PRIORITY_ZOHO[priority] || "Medium",
    classification: category || "General",
    channel: "Web",
    status: "Open",
    departmentId: ZOHO_DEPT_ID,
  };
  if (contactId) ticketBody.contactId = contactId;

  console.log("Zoho ticket body:", JSON.stringify(ticketBody));

  const res = await fetch(DESK_BASE + "/tickets", {
    method: "POST",
    headers: {
      Authorization: "Zoho-oauthtoken " + token,
      orgId: ZOHO_ORG_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketBody),
  });

  const result = await res.json();
  console.log("Zoho ticket result:", JSON.stringify(result));
  if (!res.ok) throw new Error("Zoho create error: " + JSON.stringify(result));
  return result.id;
}

function buildClientEmail(title, priority, category, email, ticketId) {
  const pc = PRIORITY_COLORS[priority] || "#6366f1";
  const pl = priority.charAt(0).toUpperCase() + priority.slice(1);
  const cl = category.charAt(0).toUpperCase() + category.slice(1);
  const ref = ticketId.slice(-8).toUpperCase();
  return {
    subject: "Ticket received — " + title,
    body: "<h2>Ticket Received</h2><p>Ref: " + ref + "</p><p>Priority: " + pl + " | Category: " + cl + "</p><p>We will respond shortly. <a href='" + PORTAL_URL + "'>View your portal</a></p>",
  };
}

function buildAdminEmail(title, priority, category, email, description, ticketId, zohoTicketId) {
  const pl = priority.charAt(0).toUpperCase() + priority.slice(1);
  const ref = ticketId.slice(-8).toUpperCase();
  const isUrgent = priority === "critical" || priority === "high";
  const zohoLink = zohoTicketId
    ? "<a href='https://desk.zoho.eu/agent/affinitysolution/tickets/" + zohoTicketId + "'>View in Zoho #" + zohoTicketId + "</a>"
    : "Zoho push failed";
  return {
    subject: (isUrgent ? "URGENT " : "") + "New " + pl + " ticket — " + title,
    body: "<h2>" + title + "</h2><p>From: " + email + " | Ref: " + ref + "</p><p>" + (description || "") + "</p><p>" + zohoLink + "</p><p><a href='" + ADMIN_URL + "'>Open Admin Panel</a></p>",
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    console.log("onTicketCreated fired, ticket id:", body?.data?.id);
    const ticket = body?.data;

    if (!ticket?.id) return Response.json({ ok: true });

    const { id: ticketId, title = "New Issue", priority = "medium", category = "other", client_email, description } = ticket;

    // 1. Push to Zoho Desk
    let zohoTicketId = null;
    console.log("Starting Zoho push for:", client_email);
    try {
      zohoTicketId = await pushToZoho({ title, description, priority, category, clientEmail: client_email, ticketId });
      console.log("Zoho push success:", zohoTicketId);
    } catch (zohoErr) {
      console.error("Zoho push failed:", zohoErr.message);
    }
    console.log("Zoho push done, id:", zohoTicketId);

    // 2. Client confirmation email
    try {
      const mail = buildClientEmail(title, priority, category, client_email, ticketId);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: client_email, subject: mail.subject, body: mail.body, from_name: "AffinitySolution Support",
      });
    } catch (e) { console.error("Client email failed:", e.message); }

    // 3. Admin alert email
    try {
      const mail = buildAdminEmail(title, priority, category, client_email, description, ticketId, zohoTicketId);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_EMAIL, subject: mail.subject, body: mail.body, from_name: "AffinitySolution Portal",
      });
    } catch (e) { console.error("Admin email failed:", e.message); }

    // 4. SMS via EE email-to-SMS
    const isUrgent = priority === "critical" || priority === "high";
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_SMS_EMAIL,
        subject: "",
        body: (isUrgent ? "URGENT " : "") + "New ticket [" + priority.toUpperCase() + "]: " + title + " from " + client_email,
        from_name: "AffinitySolution",
      });
    } catch (e) { console.error("SMS failed:", e.message); }

    return Response.json({ ok: true, zohoTicketId });
  } catch (err) {
    console.error("onTicketCreated error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});