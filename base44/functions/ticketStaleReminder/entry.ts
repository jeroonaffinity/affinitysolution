import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all open/in-progress tickets
    const tickets = await base44.asServiceRole.entities.SupportTicket.filter({
      status: { "$in": ["open", "in_progress"] }
    });

    const now = new Date();
    const STALE_HOURS = 24;
    const staleThreshold = new Date(now.getTime() - STALE_HOURS * 60 * 60 * 1000);

    const staleBatch = tickets.filter(t => {
      const lastUpdate = new Date(t.updated_date);
      return lastUpdate < staleThreshold;
    });

    if (staleBatch.length === 0) {
      return Response.json({ checked: tickets.length, stale: 0 });
    }

    // Get admins and teams
    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });
    const teams = await base44.asServiceRole.entities.Team.list();

    let emailsSent = 0;

    for (const ticket of staleBatch) {
      // Find team responsible
      const team = teams.find(t => t.id === ticket.team_id);
      const teamEmails = team?.member_emails || [];
      const allResponsible = [...teamEmails, ...admins.map(a => a.email)];

      // Add stale note to ticket
      await base44.asServiceRole.entities.TicketThread.create({
        ticket_id: ticket.id,
        author_email: "reminder-engine@affinitysolution.com",
        author_name: "Reminder System",
        content: `⏰ This ticket hasn't been updated for ${STALE_HOURS} hours. Please provide an update or close if resolved.`,
        is_public: false,
        is_ai_response: false,
      });

      // Send reminder emails
      for (const email of allResponsible) {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `⏰ REMINDER: Stale Ticket #${ticket.id} - ${ticket.title}`,
          body: `<html><body style="font-family: Arial; color: #333;">
            <p>Hello,</p>
            <p>This is a reminder that ticket <strong>#${ticket.id}</strong> hasn't been updated for <strong>${STALE_HOURS} hours</strong>.</p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p><strong>${ticket.title}</strong></p>
              <p><small>${ticket.description?.substring(0, 200) || "No description"}...</small></p>
            </div>
            <p><strong>Priority:</strong> ${ticket.priority} | <strong>Category:</strong> ${ticket.category}</p>
            <p><strong>Client:</strong> ${ticket.client_email}</p>
            <p style="margin-top: 20px;">
              <a href="https://your-app.com/admin#tickets" style="display: inline-block; padding: 10px 20px; background: #ffc107; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Ticket →</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated reminder from AffinitySolution Support.</p>
          </body></html>`,
        });
        emailsSent++;
      }
    }

    return Response.json({
      checked: tickets.length,
      stale: staleBatch.length,
      emailsSent,
    });
  } catch (error) {
    console.error("Stale reminder error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});