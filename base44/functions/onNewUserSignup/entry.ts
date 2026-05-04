import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { data } = await req.json();

  const user = data;
  if (!user) return Response.json({ ok: true });

  const fullName = user.full_name || "Unknown";
  const email = user.email || "No email";
  const signupDate = new Date(user.created_date).toLocaleDateString("en-GB");

  // Notify admin of new signup
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: ADMIN_EMAIL,
    subject: `New Portal Signup: ${fullName}`,
    body: `A new user has signed up and is awaiting portal access.

Name: ${fullName}
Email: ${email}
Signed Up: ${signupDate}

NEXT STEPS:
1. Contact the client to verify their identity and onboarding details.
2. Once confirmed, go to the Admin Panel → Users and set their role to "user" to grant them Client Portal access.

They will not have access to any data until you manually approve them.`,
  });

  return Response.json({ ok: true });
});