import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

Deno.serve(async (req) => {
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
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: clientEmail,
    subject: `Ticket Update: ${title} is now ${statusLabel}`,
    body: `Hi,

Your support ticket status has been updated.

Ticket: ${title}
New Status: ${statusLabel}
${ticket.resolution_notes ? `Resolution Notes: ${ticket.resolution_notes}\n` : ""}
If you have any further questions, please don't hesitate to raise a new ticket through your Client Portal.

Thanks,
AffinitySolution Support Team`,
  });

  // Notify admin too (if resolved or closed)
  if (newStatus === "resolved" || newStatus === "closed") {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `[Ticket ${statusLabel}] ${title}`,
      body: `Ticket marked as ${statusLabel}.

Client: ${clientEmail}
Title: ${title}
${ticket.resolution_notes ? `Resolution Notes: ${ticket.resolution_notes}` : ""}`,
    });
  }

  return Response.json({ ok: true });
});