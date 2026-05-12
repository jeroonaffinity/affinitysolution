import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";
const LOGO_URL = "https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png";
const PORTAL_URL = "https://affinitysolution.base44.app/dashboard";

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  on_hold: "On Hold",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_COLORS = {
  open: { color: "#f59e0b", bg: "#f59e0b22", border: "#f59e0b44" },
  in_progress: { color: "#3b82f6", bg: "#3b82f622", border: "#3b82f644" },
  on_hold: { color: "#a855f7", bg: "#a855f722", border: "#a855f744" },
  resolved: { color: "#22c55e", bg: "#22c55e22", border: "#22c55e44" },
  closed: { color: "#94a3b8", bg: "#94a3b822", border: "#94a3b844" },
};

function statusUpdateHtml({ title, newStatus, resolutionNotes }) {
  const statusLabel = statusLabels[newStatus] || newStatus;
  const sc = STATUS_COLORS[newStatus] || STATUS_COLORS.open;

  const closingMessage = newStatus === "resolved" || newStatus === "closed"
    ? `<p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        We're glad we could help! If you ever run into another issue, our team is always here for you.
       </p>`
    : `<p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Our team is actively working on your request. We'll keep you updated as things progress.
       </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Ticket Update</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:2px solid #2d3161;">
          <img src="${LOGO_URL}" alt="AffinitySolution" style="height:40px;max-width:220px;object-fit:contain;" />
          <p style="color:#8b9cc8;font-size:13px;margin:10px 0 0;">IT Support Portal</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111827;padding:40px;">
          <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Ticket Status Updated</h1>
          ${closingMessage}

          <!-- Ticket card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #2d3748;border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Ticket</p>
              <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 20px;">${title}</p>
              <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">New Status</p>
              <span style="display:inline-block;background:${sc.bg};color:${sc.color};border:1px solid ${sc.border};padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600;">${statusLabel}</span>
              ${resolutionNotes ? `
              <div style="margin-top:20px;padding-top:20px;border-top:1px solid #2d3748;">
                <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Resolution Notes</p>
                <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">${resolutionNotes}</p>
              </div>` : ""}
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, old_data } = await req.json();

    const ticket = data;
    const oldTicket = old_data;

    if (!ticket || !oldTicket) return Response.json({ ok: true });

    const newStatus = ticket.status;
    const oldStatus = oldTicket.status;
    const clientEmail = ticket.client_email;

    if (newStatus === oldStatus) return Response.json({ ok: true });

    const statusLabel = statusLabels[newStatus] || newStatus;
    const title = ticket.title || "Your Ticket";

    // Email client about status change
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: clientEmail,
        subject: `Ticket Update: "${title}" is now ${statusLabel}`,
        body: statusUpdateHtml({ title, newStatus, resolutionNotes: ticket.resolution_notes }),
      });
    } catch (emailErr) {
      console.warn(`Could not send email to client ${clientEmail}:`, emailErr?.message);
    }

    // Notify admin if resolved or closed
    if (newStatus === "resolved" || newStatus === "closed") {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ADMIN_EMAIL,
          subject: `[Ticket ${statusLabel}] ${title}`,
          body: `<p>Ticket <strong>${title}</strong> has been marked as <strong>${statusLabel}</strong>.</p><p>Client: ${clientEmail}</p>${ticket.resolution_notes ? `<p>Notes: ${ticket.resolution_notes}</p>` : ""}`,
        });
      } catch (adminEmailErr) {
        console.warn(`Could not send admin email:`, adminEmailErr?.message);
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("onTicketUpdated error:", err?.message);
    return Response.json({ error: err?.message }, { status: 500 });
  }
});