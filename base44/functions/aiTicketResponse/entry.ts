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

    // Get KB suggestions for this ticket
    let suggestedArticles = [];
    try {
      const kbSuggestions = await base44.functions.invoke("kbSmartSuggest", {
        action: "suggest_for_ticket",
        ticket_id,
      });
      suggestedArticles = kbSuggestions.data?.suggestions || [];
    } catch (kbError) {
      console.log("KB suggestions skipped:", kbError.message);
    }

    // Invoke LLM for AI response
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional IT support assistant. A support ticket has been raised. Your job is to provide an instant helpful response to help resolve the issue.

Ticket: ${ticketData.title}
Priority: ${ticketData.priority}
Category: ${ticketData.category}
Description: ${ticketData.description}

Previous conversation:
${threadHistory || "(No previous messages)"}

${suggestedArticles.length > 0 ? `
Related Knowledge Base Articles:
${suggestedArticles.map((a, i) => `${i + 1}. "${a.title}" (${a.category}) - ${a.summary}`).join("\n")}

Reference these articles if relevant to your response.
` : ""}

Provide a helpful, friendly response that:
1. Acknowledges the issue
2. Asks clarifying questions if needed
3. Suggests initial troubleshooting steps
4. Offers next steps for resolution

Keep it concise (2-3 short paragraphs).`,
    });

    // Build KB articles section for thread content
    const kbSection = suggestedArticles.length > 0
      ? `\n\n--- RELATED KNOWLEDGE BASE ARTICLES ---\n${suggestedArticles.map(a => `• "${a.title}" (${a.category}): ${a.summary}`).join("\n")}`
      : "";

    // Save AI response as a thread message
    const aiMessage = await base44.asServiceRole.entities.TicketThread.create({
      ticket_id,
      author_email: "ai-support@affinitysolution.com",
      author_name: "AffinitySolution AI Support",
      is_ai_response: true,
      content: aiResponse + kbSection,
      is_public: true,
      kb_article_ids: suggestedArticles.map(a => a.id),
    });

    // Build KB articles HTML for email
    const kbHtml = suggestedArticles.length > 0
      ? `<p><strong>📚 Related Resources:</strong></p>
         <ul style="margin: 10px 0; padding-left: 20px;">
           ${suggestedArticles.map(a => `<li>${a.title} <em style="color: #666;">(${a.category})</em></li>`).join("")}
         </ul>`
      : "";

    // Email skipped (external user restriction)

    return Response.json({ success: true, aiMessage });
  } catch (error) {
    console.error("AI response error:", error.message, error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});