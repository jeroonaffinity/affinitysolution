import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();
    const { action, ticket_id, content, is_public = true } = payload;

    // Get threads for a ticket
    if (action === "list_threads") {
      const threads = await base44.asServiceRole.entities.TicketThread.filter(
        { ticket_id },
        "-created_date"
      );
      return Response.json({ threads });
    }

    // Add a new thread message
    if (action === "add_message") {
      if (!ticket_id || !content) {
        return Response.json({ error: "ticket_id and content required" }, { status: 400 });
      }

      // Verify user can edit this ticket
      const ticket = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticket_id });
      if (!ticket[0]) return Response.json({ error: "Ticket not found" }, { status: 404 });

      const ticketData = ticket[0];
      const isAdmin = user.role === "admin";
      const isClient = user.email === ticketData.client_email;
      const isTeamMember = ticketData.team_id && 
        (await base44.asServiceRole.entities.Team.filter({ id: ticketData.team_id }))
          .flatMap(t => t.member_emails || [])
          .includes(user.email);

      if (!isAdmin && !isClient && !isTeamMember) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      // Create the thread message
      const message = await base44.asServiceRole.entities.TicketThread.create({
        ticket_id,
        author_email: user.email,
        author_name: user.full_name || user.email,
        content,
        is_public: isClient ? true : is_public, // Clients can only post public messages
        is_ai_response: false,
      });

      // Get ticket and all admins for notification
      const teams = await base44.asServiceRole.entities.Team.list();
      const team = ticketData.team_id ? teams.find(t => t.id === ticketData.team_id) : null;
      const admins = await base44.asServiceRole.entities.User.list();
      const adminEmails = admins.filter(u => u.role === "admin").map(u => u.email);

      // Email notification: notify the other party (admin notified when client replies, client when admin replies)
      const notifyEmails = new Set();
      if (isClient) {
        // Client replied - notify team members
        if (team?.member_emails) team.member_emails.forEach(e => notifyEmails.add(e));
        adminEmails.forEach(e => notifyEmails.add(e)); // Always notify admins
      } else if (isAdmin || isTeamMember) {
        // Admin/team replied - notify client
        notifyEmails.add(ticketData.client_email);
      }

      for (const email of notifyEmails) {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `New Reply: Ticket #${ticket_id} - ${ticketData.title}`,
          body: `<html><body style="font-family: Arial; color: #333;">
            <p>Hello,</p>
            <p><strong>${user.full_name || user.email}</strong> replied to ticket <strong>#${ticket_id}: ${ticketData.title}</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p>${content.replace(/\n/g, '<br>')}</p>
            </div>
            <p><a href="https://your-app.com/MyTickets" style="color: #1e5ac8; text-decoration: none;"><strong>View Ticket →</strong></a></p>
            <p>Best regards,<br>AffinitySolution Support</p>
          </body></html>`,
        });
      }

      return Response.json({ success: true, message });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});