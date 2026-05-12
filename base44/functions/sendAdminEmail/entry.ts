import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = "https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png";
const FROM_NAME = "AffinitySolution";

function wrapInBrandedTemplate(subject, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#4f46e5;border-radius:16px 16px 0 0;padding:28px 40px;">
          <p style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">AffinitySolution</p>
          <p style="color:#c4b5fd;font-size:12px;margin:4px 0 0;letter-spacing:0.5px;text-transform:uppercase;font-weight:500;">IT Managed Services</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#111827;padding:40px;">
          ${bodyHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0d1117;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="color:#475569;font-size:12px;margin:0 0 4px;">AffinitySolution · IT Managed Services</p>
          <p style="color:#334155;font-size:11px;margin:0;">
            <a href="mailto:info@affinitysolution.com" style="color:#4f46e5;text-decoration:none;">info@affinitysolution.com</a>
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
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { to, subject, bodyHtml, rawBody, useTemplate } = await req.json();

    if (!to || !subject) {
      return Response.json({ error: "Missing required fields: to, subject" }, { status: 400 });
    }

    const finalBody = useTemplate !== false
      ? wrapInBrandedTemplate(subject, bodyHtml || `<p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">${(rawBody || "").replace(/\n/g, "<br/>")}</p>`)
      : (bodyHtml || rawBody || "");

    const recipients = Array.isArray(to) ? to : [to];

    await Promise.all(recipients.map(recipient =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        subject,
        body: finalBody,
        from_name: FROM_NAME,
      })
    ));

    return Response.json({ ok: true, sent: recipients.length });
  } catch (err) {
    console.error("sendAdminEmail error:", err?.message);
    return Response.json({ error: err?.message }, { status: 500 });
  }
});