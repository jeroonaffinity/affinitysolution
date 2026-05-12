import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";
const LOGO_URL = "https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png";
const PORTAL_URL = "https://affinitysolution.base44.app/dashboard";

const PRIORITY_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

function clientEmailHtml({ title, priority, category, ticketId }) {
  const priorityColor = PRIORITY_COLORS[priority] || "#6366f1";
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Ticket Received</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#4f46e5;border-radius:16px 16px 0 0;padding:28px 40px;">
          <p style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">AffinitySolution</p>
          <p style="color:#c4b5fd;font-size:12px;margin:4px 0 0;letter-spacing:0.5px;text-transform:uppercase;font-weight:500;">IT Support Portal</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111827;padding:40px;">
          <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">We've received your ticket ✓</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;">
            Our support team has been notified and will be in touch shortly. You can track progress anytime in your Client Portal.
          </p>

          <!-- Ticket card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #2d3748;border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Ticket Title</p>
              <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 20px;">${title}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;">
                    <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Priority</p>
                    <span style="display:inline-block;background:${priorityColor}22;color:${priorityColor};border:1px solid ${priorityColor}44;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${priorityLabel}</span>
                  </td>
                  <td width="50%" style="vertical-align:top;">
                    <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Category</p>
                    <span style="display:inline-block;background:#6366f122;color:#818cf8;border:1px solid #6366f144;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${categoryLabel}</span>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${PORTAL_URL}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.3px;">
                View in Client Portal →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0d1117;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="color:#475569;font-size:12px;margin:0 0 4px;">AffinitySolution · IT Managed Services</p>
          <p style="color:#334155;font-size:11px;margin:0;">
            <a href="mailto:${ADMIN_EMAIL}" style="color:#4f46e5;text-decoration:none;">${ADMIN_EMAIL}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminEmailHtml({ title, priority, category, clientEmail, description }) {
  const priorityColor = PRIORITY_COLORS[priority] || "#6366f1";
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Ticket Alert</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#4f46e5;border-radius:16px 16px 0 0;padding:28px 40px;">
          <p style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">AffinitySolution</p>
          <p style="color:#c4b5fd;font-size:12px;margin:4px 0 0;letter-spacing:0.5px;text-transform:uppercase;font-weight:500;">IT Support Portal</p>
        </td></tr>
        <tr><td style="background:#111827;padding:36px 40px;">
          <h2 style="color:#f1f5f9;font-size:20px;font-weight:700;margin:0 0 6px;">${title}</h2>
          <p style="color:#64748b;font-size:13px;margin:0 0 24px;">Submitted by <strong style="color:#94a3b8;">${clientEmail}</strong></p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #2d3748;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="vertical-align:top;padding-bottom:16px;">
                    <p style="color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Priority</p>
                    <span style="background:${priorityColor}22;color:${priorityColor};border:1px solid ${priorityColor}44;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${priorityLabel}</span>
                  </td>
                  <td width="33%" style="vertical-align:top;padding-bottom:16px;">
                    <p style="color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Category</p>
                    <span style="background:#6366f122;color:#818cf8;border:1px solid #6366f144;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${category}</span>
                  </td>
                  <td width="33%" style="vertical-align:top;padding-bottom:16px;">
                    <p style="color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Client</p>
                    <p style="color:#94a3b8;font-size:13px;margin:0;">${clientEmail}</p>
                  </td>
                </tr>
              </table>
              ${description ? `<div style="border-top:1px solid #2d3748;padding-top:16px;"><p style="color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Description</p><p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">${description}</p></div>` : ""}
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${PORTAL_URL.replace('/dashboard', '/admin')}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:600;">
                Open Admin Panel →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#0d1117;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="color:#475569;font-size:11px;margin:0;">AffinitySolution Admin Notification · Do not reply</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    const ticket = data;
    if (!ticket) return Response.json({ ok: true });

    const clientEmail = ticket.client_email;
    const title = ticket.title || "New Issue";
    const priority = ticket.priority || "medium";
    const category = ticket.category || "other";

    // Email to client
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: clientEmail,
        subject: `✓ Ticket Received: ${title}`,
        body: clientEmailHtml({ title, priority, category }),
      });
    } catch (emailErr) {
      console.warn(`Could not send email to client ${clientEmail}:`, emailErr?.message);
    }

    // Email to admin
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `[New Ticket] ${title} — ${priority.toUpperCase()} priority`,
        body: adminEmailHtml({ title, priority, category, clientEmail, description: ticket.description }),
      });
    } catch (adminEmailErr) {
      console.warn(`Could not send admin email:`, adminEmailErr?.message);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("onTicketCreated error:", err?.message);
    return Response.json({ error: err?.message }, { status: 500 });
  }
});