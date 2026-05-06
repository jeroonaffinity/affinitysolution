import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "info@affinitysolution.com";

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
        subject: `Ticket Received: ${title}`,
        body: `Hi,

We've received your support ticket and our team will be in touch shortly.

Ticket Summary:
- Title: ${title}
- Priority: ${priority}
- Category: ${category}

You can track the status of your ticket in your Client Portal at any time.

Thanks,
AffinitySolution Support Team`,
      });
    } catch (emailErr) {
      console.warn(`Could not send email to client ${clientEmail}:`, emailErr?.message);
    }

    // Email to admin
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: `[New Ticket] ${title} — ${priority.toUpperCase()} priority`,
        body: `A new support ticket has been raised.

Client: ${clientEmail}
Title: ${title}
Priority: ${priority}
Category: ${category}
Description: ${ticket.description || "No description provided"}

Log in to the Admin Panel to manage this ticket.`,
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