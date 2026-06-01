import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";
const ADMIN_SMS_EMAIL = "07947992054@mms.ee.co.uk"; // EE email-to-SMS gateway
const PORTAL_URL = "https://affinitysolution.base44.app/dashboard";
const ADMIN_URL = "https://affinitysolution.base44.app/admin";

// Zoho Desk config
const ZOHO_CLIENT_ID = "1000.IV4T37FGQ9KIGGHR52I5S1UUGEZ6TD";
const ZOHO_CLIENT_SECRET = "d5f8654adf6d2ec14f5a3a8624e3033e5b8e4c8b41";
const ZOHO_ACCOUNTS = "https://accounts.zoho.eu/oauth/v2/token";
const DESK_BASE = "https://desk.zoho.eu/api/v1";
const ZOHO_ORG_ID = "20114459933";

const PRIORITY_COLORS = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
};

const PRIORITY_ZOHO = {
  critical: "High",
  high:     "High",
  medium:   "Medium",
  low:      "Low",
};

// ── Zoho helpers ──────────────────────────────────────────────────────────────

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
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function pushToZoho({ title, description, priority, category, clientEmail, ticketId }) {
  const token = await getZohoToken();

  // Look up or create contact in Zoho by email
  const contactRes = await fetch(
    `${DESK_BASE}/contacts/search?email=${encodeURIComponent(clientEmail)}`,
    { headers: { Authorization: `Zoho-oauthtoken ${token}`, orgId: ZOHO_ORG_ID } }
  );
  const contactData = await contactRes.json();
  const contactId = contactData?.data?.[0]?.id || null;

  const body = {
    subject: title,
    description: description || "",
    priority: PRIORITY_ZOHO[priority] || "Medium",
    classification: category || "General",
    channel: "Web",
    status: "Open",
    departmentId: "238671000000007061",
    ...(contactId ? { contactId } : { email: clientEmail }),
    cf: { cf_portal_ticket_id: ticketId },
  };

  const res = await fetch(`${DESK_BASE}/tickets`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      orgId: ZOHO_ORG_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(`Zoho create ticket error: ${JSON.stringify(result)}`);
  return result.id; // Zoho ticket ID
}

// ── Email templates ───────────────────────────────────────────────────────────

function clientEmail({ title, priority, category, clientEmail: email, ticketId }) {
  const pc = PRIORITY_COLORS[priority] || "#6366f1";
  const pl = (priority || "medium").charAt(0).toUpperCase() + priority.slice(1);
  const cl = (category || "other").charAt(0).toUpperCase() + category.slice(1);
  const ref = ticketId?.slice(-8).toUpperCase() || "—";

  return {
    subject: `✅ Ticket received — ${title}`,
    body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ticket Received</title></head>
<body style="margin:0;padding:0;background:#09090f;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:48px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header bar -->
  <tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:16px 16px 0 0;padding:32px 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <p style="color:#fff;font-size:20px;font-weight:800;margin:0;letter-spacing:-0.5px;">AffinitySolution</p>
          <p style="color:#c4b5fd;font-size:11px;margin:4px 0 0;letter-spacing:1px;text-transform:uppercase;font-weight:600;">IT Managed Services</p>
        </td>
        <td align="right">
          <span style="display:inline-block;background:rgba(255,255,255,0.15);color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;">REF: ${ref}</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#111827;padding:40px;">

    <!-- Success banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#052e16;border:1px solid #166534;border-radius:12px;margin-bottom:28px;">
      <tr><td style="padding:18px 24px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:36px;vertical-align:middle;">
              <div style="width:32px;height:32px;background:#16a34a;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:18px;line-height:1;">✓</span>
              </div>
            </td>
            <td style="padding-left:12px;vertical-align:middle;">
              <p style="color:#4ade80;font-size:15px;font-weight:700;margin:0;">Ticket received successfully</p>
              <p style="color:#86efac;font-size:13px;margin:4px 0 0;">Our team has been alerted and will respond shortly.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <h2 style="color:#f1f5f9;font-size:20px;font-weight:700;margin:0 0 6px;">${title}</h2>
    <p style="color:#64748b;font-size:13px;margin:0 0 28px;">Submitted by <strong style="color:#94a3b8;">${email}</strong></p>

    <!-- Ticket meta -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #2d3748;border-radius:12px;margin-bottom:28px;">
      <tr><td style="padding:20px 24px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="vertical-align:top;padding-bottom:16px;">
              <p style="color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 6px;">Priority</p>
              <span style="display:inline-block;background:${pc}22;color:${pc};border:1px solid ${pc}55;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${pl}</span>
            </td>
            <td width="33%" style="vertical-align:top;padding-bottom:16px;">
              <p style="color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 6px;">Category</p>
              <span style="display:inline-block;background:#6366f122;color:#818cf8;border:1px solid #6366f144;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${cl}</span>
            </td>
            <td width="33%" style="vertical-align:top;padding-bottom:16px;">
              <p style="color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 6px;">Status</p>
              <span style="display:inline-block;background:#1d4ed822;color:#60a5fa;border:1px solid #1d4ed855;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">Open</span>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- SLA info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1c1a2e;border:1px solid #3730a3;border-radius:12px;margin-bottom:28px;">
      <tr><td style="padding:16px 24px;">
        <p style="color:#a5b4fc;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">⏱ Expected Response Times</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#c7d2fe;font-size:12px;padding:2px 0;">Critical / High</td>
            <td align="right" style="color:#818cf8;font-size:12px;font-weight:600;">Within 1 hour</td>
          </tr>
          <tr>
            <td style="color:#c7d2fe;font-size:12px;padding:2px 0;">Medium</td>
            <td align="right" style="color:#818cf8;font-size:12px;font-weight:600;">Within 4 hours</td>
          </tr>
          <tr>
            <td style="color:#c7d2fe;font-size:12px;padding:2px 0;">Low</td>
            <td align="right" style="color:#818cf8;font-size:12px;font-weight:600;">Next business day</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:8px;">
        <a href="${PORTAL_URL}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
          View Your Portal →
        </a>
      </td></tr>
      <tr><td align="center">
        <p style="color:#475569;font-size:12px;margin:8px 0 0;">Or reply to this email and we'll attach it to your ticket</p>
      </td></tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0d1117;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
    <p style="color:#334155;font-size:12px;margin:0 0 4px;">AffinitySolution · IT Managed Services · London, UK</p>
    <p style="color:#1e293b;font-size:11px;margin:0;">
      <a href="mailto:${ADMIN_EMAIL}" style="color:#4f46e5;text-decoration:none;">${ADMIN_EMAIL}</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
  };
}

function adminEmail({ title, priority, category, clientEmail: email, description, ticketId, zohoTicketId }) {
  const pc = PRIORITY_COLORS[priority] || "#6366f1";
  const pl = (priority || "medium").charAt(0).toUpperCase() + priority.slice(1);
  const ref = ticketId?.slice(-8).toUpperCase() || "—";
  const isUrgent = priority === "critical" || priority === "high";

  return {
    subject: `${isUrgent ? "🚨" : "🎫"} New ${pl} ticket — ${title}`,
    body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>New Ticket Alert</title></head>
<body style="margin:0;padding:0;background:#09090f;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:48px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);border-radius:16px 16px 0 0;padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <p style="color:#fff;font-size:18px;font-weight:800;margin:0;">AffinitySolution</p>
          <p style="color:#a5b4fc;font-size:11px;margin:4px 0 0;letter-spacing:1px;text-transform:uppercase;">Admin Notification</p>
        </td>
        <td align="right">
          ${isUrgent ? `<span style="display:inline-block;background:#ef444422;color:#f87171;border:1px solid #ef444455;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;">⚡ URGENT</span>` : `<span style="display:inline-block;background:rgba(255,255,255,0.1);color:#c7d2fe;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;">REF: ${ref}</span>`}
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#111827;padding:36px 40px;">

    <h2 style="color:#f1f5f9;font-size:20px;font-weight:700;margin:0 0 4px;">${title}</h2>
    <p style="color:#64748b;font-size:13px;margin:0 0 24px;">From <strong style="color:#94a3b8;">${email}</strong> · Ref: <span style="color:#6366f1;">#${ref}</span></p>

    <!-- Meta grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #2d3748;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="vertical-align:top;padding-bottom:16px;">
              <p style="color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 6px;">Priority</p>
              <span style="display:inline-block;background:${pc}22;color:${pc};border:1px solid ${pc}55;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${pl}</span>
            </td>
            <td width="33%" style="vertical-align:top;padding-bottom:16px;">
              <p style="color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 6px;">Category</p>
              <span style="display:inline-block;background:#6366f122;color:#818cf8;border:1px solid #6366f144;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${(category||"other").charAt(0).toUpperCase()+category.slice(1)}</span>
            </td>
            <td width="33%" style="vertical-align:top;padding-bottom:16px;">
              <p style="color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 6px;">Zoho</p>
              ${zohoTicketId
                ? `<span style="color:#4ade80;font-size:12px;font-weight:700;">✓ Pushed #${zohoTicketId}</span>`
                : `<span style="color:#f87171;font-size:12px;font-weight:700;">⚠ Push failed</span>`}
            </td>
          </tr>
        </table>
        ${description ? `
        <div style="border-top:1px solid #2d3748;padding-top:16px;">
          <p style="color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 8px;">Description</p>
          <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:0;white-space:pre-wrap;">${description.slice(0, 800)}${description.length > 800 ? "…" : ""}</p>
        </div>` : ""}
      </td></tr>
    </table>

    <!-- CTAs -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <a href="${ADMIN_URL}" style="display:block;text-align:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:13px 20px;border-radius:10px;font-size:13px;font-weight:700;">
            Open Admin Panel →
          </a>
        </td>
        ${zohoTicketId ? `
        <td width="50%" style="padding-left:8px;">
          <a href="https://desk.zoho.eu/agent/affinitysolution/tickets/${zohoTicketId}" style="display:block;text-align:center;background:#1e293b;color:#818cf8;border:1px solid #6366f144;text-decoration:none;padding:13px 20px;border-radius:10px;font-size:13px;font-weight:700;">
            View in Zoho Desk →
          </a>
        </td>` : ""}
      </tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0d1117;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
    <p style="color:#1e293b;font-size:11px;margin:0;">AffinitySolution Admin Alert · Do not reply to this email</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const ticket = body?.data;

    if (!ticket?.id) return Response.json({ ok: true });

    const { id: ticketId, title = "New Issue", priority = "medium", category = "other", client_email, description } = ticket;

    // 1. Push to Zoho Desk (one-way, fire-and-don't-block)
    let zohoTicketId = null;
    try {
      zohoTicketId = await pushToZoho({ title, description, priority, category, clientEmail: client_email, ticketId });
      // Store Zoho ID back on the local ticket for reference
      await base44.asServiceRole.entities.SupportTicket.update(ticketId, { zoho_ticket_id: zohoTicketId });
      console.log(`Pushed to Zoho: ${zohoTicketId}`);
    } catch (zohoErr) {
      console.error("Zoho push failed (non-fatal):", zohoErr.message);
    }

    // 2. Send confirmation email to client
    const clientMail = clientEmail({ title, priority, category, clientEmail: client_email, ticketId });
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: client_email,
      subject: clientMail.subject,
      body: clientMail.body,
      from_name: "AffinitySolution Support",
    });

    // 3. Send alert email to admin
    const adminMail = adminEmail({ title, priority, category, clientEmail: client_email, description, ticketId, zohoTicketId });
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: adminMail.subject,
      body: adminMail.body,
      from_name: "AffinitySolution Portal",
    });

    // 4. Send free SMS via EE email-to-SMS gateway
    const isUrgent = priority === "critical" || priority === "high";
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_SMS_EMAIL,
      subject: "",
      body: `${isUrgent ? "🚨 URGENT" : "🎫 New"} ticket [${priority.toUpperCase()}]: ${title} — from ${client_email}`,
      from_name: "AffinitySolution",
    });

    return Response.json({ ok: true, zohoTicketId });
  } catch (err) {
    console.error("onTicketCreated error:", err?.message);
    return Response.json({ error: err?.message }, { status: 500 });
  }
});