import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Get all users signed up in the last 24 hours
  const allUsers = await base44.asServiceRole.entities.User.list("-created_date", 100);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newUsers = allUsers.filter(u => new Date(u.created_date) > oneDayAgo);

  if (newUsers.length === 0) return Response.json({ ok: true, message: "No new signups" });

  const userList = newUsers.map(u =>
    `• ${u.full_name || "Unknown"} (${u.email}) — signed up ${new Date(u.created_date).toLocaleString("en-GB")}`
  ).join("\n");

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: ADMIN_EMAIL,
    subject: `[AffinitySolution] ${newUsers.length} New Portal Signup${newUsers.length > 1 ? "s" : ""} Awaiting Approval`,
    body: `The following user${newUsers.length > 1 ? "s have" : " has"} signed up for the Client Portal in the last 24 hours:

${userList}

ACTION REQUIRED:
Contact each client to verify their details, then go to your Admin Panel → Users tab to grant them portal access.

These users currently have no access to any client data until you approve them.`,
  });

  return Response.json({ ok: true, notified: newUsers.length });
});