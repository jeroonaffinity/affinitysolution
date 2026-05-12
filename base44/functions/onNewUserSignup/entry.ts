import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";
const LOGO_URL = "https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png";
const ADMIN_URL = "https://affinitysolution.base44.app/admin";

function newSignupAdminHtml({ fullName, email, signupDate }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Portal Signup</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px 16px 0 0;padding:28px 40px;border-bottom:2px solid #2d3161;">
          <img src="${LOGO_URL}" alt="AffinitySolution" style="height:36px;object-fit:contain;" />
          <span style="display:inline-block;margin-left:16px;background:#22c55e22;color:#22c55e;border:1px solid #22c55e44;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;vertical-align:middle;">NEW SIGNUP</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111827;padding:36px 40px;">
          <h2 style="color:#f1f5f9;font-size:20px;font-weight:700;margin:0 0 6px;">New Client Portal Request</h2>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">A new user has signed up and is awaiting portal access approval.</p>

          <!-- User card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #2d3748;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-bottom:16px;">
                    <p style="color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Full Name</p>
                    <p style="color:#f1f5f9;font-size:14px;font-weight:600;margin:0;">${fullName}</p>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-bottom:16px;">
                    <p style="color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Email</p>
                    <p style="color:#818cf8;font-size:14px;margin:0;">${email}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="vertical-align:top;">
                    <p style="color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Signed Up</p>
                    <p style="color:#94a3b8;font-size:14px;margin:0;">${signupDate}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Next steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #4f46e544;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="color:#818cf8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">⚡ Next Steps</p>
              <ol style="color:#94a3b8;font-size:13px;line-height:1.8;margin:0;padding-left:18px;">
                <li>Contact the client to verify their identity and onboarding details.</li>
                <li>Go to <strong style="color:#f1f5f9;">Admin Panel → Clients & Users</strong>.</li>
                <li>Set their role to <strong style="color:#f1f5f9;">"user"</strong> to grant Client Portal access.</li>
              </ol>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${ADMIN_URL}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:600;">
                Open Admin Panel →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0d1117;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="color:#475569;font-size:11px;margin:0;">AffinitySolution Admin Notification · Do not reply to this email</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { data } = await req.json();

  const user = data;
  if (!user) return Response.json({ ok: true });

  const fullName = user.full_name || "Unknown";
  const email = user.email || "No email";
  const signupDate = new Date(user.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: ADMIN_EMAIL,
    subject: `New Portal Signup: ${fullName}`,
    body: newSignupAdminHtml({ fullName, email, signupDate }),
  });

  return Response.json({ ok: true });
});