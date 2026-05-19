import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PORTAL_URL = "https://affinitysolution.base44.app/dashboard";
const ADMIN_EMAIL = "info@affinitysolution.com";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();
    const { action, ticket_id, content, is_public = true } = payload;

    // Get threads for a ticket
    if (action === "list_threads") {
      if (!ticket_id) return Response.json({ error: "ticket_id required" }, { status: 400 });
      const threads = await base44.asServiceRole.entities.TicketThread.filter(
        { ticket_id },
        "created_date"
      );
      return Response.json({ threads: threads || [] });
    }

    // Add a new thread message
    if (action === "add_message") {
      if (!ticket_id || !content?.trim()) {
        return Response.json({ error: "ticket_id and content required" }, { status: 400 });
      }

      // Fetch the ticket
      const ticketList = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticket_id });
      const ticketData = ticketList?.[0];
      if (!ticketData) return Response.json({ error: "Ticket not found" }, { status: 404 });

      const isAdmin = user.role === "admin";
      const isClient = user.email === ticketData.client_email;

      // Check team membership
      let isTeamMember = false;
      if (!isAdmin && !isClient && ticketData.team_id) {
        const teamList = await base44.asServiceRole.entities.Team.filter({ id: ticketData.team_id });
        isTeamMember = (teamList?.[0]?.member_emails || []).includes(user.email);
      }

      if (!isAdmin && !isClient && !isTeamMember) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      // Clients can only post public messages
      const msgIsPublic = isClient ? true : is_public;

      const message = await base44.asServiceRole.entities.TicketThread.create({
        ticket_id,
        author_email: user.email,
        author_name: user.full_name || user.email,
        content: content.trim(),
        is_public: msgIsPublic,
        is_ai_response: false,
      });

      // Build notification recipient list
      const notifyEmails = new Set();

      if (isClient) {
        // Client replied — notify all admins
        const admins = await base44.asServiceRole.entities.User.list();
        admins.filter(u => u.role === "admin").forEach(u => notifyEmails.add(u.email));
        // Also notify team members if ticket has a team
        if (ticketData.team_id) {
          const teamList = await base44.asServiceRole.entities.Team.filter({ id: ticketData.team_id });
          (teamList?.[0]?.member_emails || []).forEach(e => notifyEmails.add(e));
        }
      } else {
        // Admin / team member replied — notify client
        if (ticketData.client_email) notifyEmails.add(ticketData.client_email);
      }

      // Remove sender from notification list
      notifyEmails.delete(user.email);

      const subject = `New reply on ticket: "${ticketData.title}"`;
      const emailBody = `<html><body style="font-family:Arial,sans-serif;color:#333;background:#f9f9f9;padding:20px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;padding:28px;border:1px solid #e5e7eb;">
          <p style="font-size:14px;margin:0 0 12px;">Hello,</p>
          <p style="font-size:14px;margin:0 0 16px;"><strong>${user.full_name || user.email}</strong> replied to ticket <strong>"${ticketData.title}"</strong>:</p>
          <div style="background:#f3f4f6;border-left:4px solid #4f46e5;border-radius:6px;padding:14px 16px;font-size:13px;line-height:1.6;color:#374151;white-space:pre-wrap;">${content.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <p style="margin:20px 0 0;">
            <a href="${PORTAL_URL}" style="display:inline-block;background:#4f46e5;color:#fff;padding:11px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">View Ticket →</a>
          </p>
          <p style="font-size:11px;color:#9ca3af;margin:20px 0 0;">AffinitySolution IT Support · <a href="mailto:${ADMIN_EMAIL}" style="color:#4f46e5;text-decoration:none;">${ADMIN_EMAIL}</a></p>
        </div>
      </body></html>`;

      for (const email of notifyEmails) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({ to: email, subject, body: emailBody });
        } catch (emailErr) {
          console.warn(`Email to ${email} failed:`, emailErr?.message);
        }
      }

      return Response.json({ success: true, message });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("ticketThreadManager error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});