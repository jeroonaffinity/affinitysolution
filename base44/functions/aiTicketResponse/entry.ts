import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { ticket_id } = await req.json();
    if (!ticket_id) return Response.json({ error: "ticket_id required" }, { status: 400 });

    // Fetch the ticket and its threads
    const ticket = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticket_id });
    if (!ticket[0]) return Response.json({ error: "Ticket not found" }, { status: 404 });

    const ticketData = ticket[0];
    const threads = await base44.asServiceRole.entities.TicketThread.filter({ ticket_id }, "-created_date", 10);

    // Build context from threads
    const threadHistory = threads.map(t => `${t.author_name || t.author_email}: ${t.content}`).join("\n");

    // Invoke LLM for AI response
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional IT support assistant. A support ticket has been raised. Your job is to provide an instant helpful response to help resolve the issue.

Ticket: ${ticketData.title}
Priority: ${ticketData.priority}
Category: ${ticketData.category}
Description: ${ticketData.description}

Previous conversation:
${threadHistory || "(No previous messages)"}

Provide a helpful, friendly response that:
1. Acknowledges the issue
2. Asks clarifying questions if needed
3. Suggests initial troubleshooting steps
4. Offers next steps for resolution

Keep it concise (2-3 short paragraphs).`,
    });

    // Save AI response as a thread message
    const aiMessage = await base44.asServiceRole.entities.TicketThread.create({
      ticket_id,
      author_email: "ai-support@affinitysolution.com",
      author_name: "AffinitySolution AI Support",
      is_ai_response: true,
      content: aiResponse,
      is_public: true,
    });

    // Email the client about the AI response
    await base44.integrations.Core.SendEmail({
      to: ticketData.client_email,
      subject: `Instant Response: Ticket #${ticket_id} - ${ticketData.title}`,
      body: `<html><body style="font-family: Arial; color: #333;">
        <p>Hello,</p>
        <p>We received your support ticket and our AI support assistant has provided an instant response to help you:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p>${aiResponse.replace(/\n/g, '<br>')}</p>
        </div>
        <p><strong>Next Steps:</strong> If this doesn't resolve your issue, please reply to this email or visit your portal for updates.</p>
        <p>Best regards,<br>AffinitySolution Support Team</p>
      </body></html>`,
    });

    return Response.json({ success: true, aiMessage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});