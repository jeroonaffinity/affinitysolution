import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { action, ticket_id, workflow_rules } = payload;

    // Process workflows on a ticket
    if (action === "process_ticket") {
      if (!ticket_id) return Response.json({ error: "ticket_id required" }, { status: 400 });

      const ticket = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticket_id });
      if (!ticket[0]) return Response.json({ error: "Ticket not found" }, { status: 404 });

      const ticketData = ticket[0];
      const rules = await base44.asServiceRole.entities.TicketWorkflow.filter({ is_active: true });
      const triggeredActions = [];

      for (const rule of rules) {
        // Check if rule triggers
        const priorityMatch = rule.priority_trigger === "any" || rule.priority_trigger === ticketData.priority;
        const categoryMatch = rule.category_trigger === "any" || rule.category_trigger === ticketData.category;

        if (!priorityMatch || !categoryMatch) continue;

        // Execute action
        let actionResult = null;
        
        if (rule.action_type === "escalate") {
          // Escalate to specific admins
          actionResult = await escalateTicket(base44, ticketData, rule.escalate_to_emails || []);
          triggeredActions.push({ rule: rule.id, action: "escalate", result: actionResult });
        }

        if (rule.action_type === "add_note") {
          // Add internal note to ticket
          const noteText = rule.action_params?.note_text || `Auto-triggered by rule: ${rule.name}`;
          await base44.asServiceRole.entities.TicketThread.create({
            ticket_id,
            author_email: "workflow-engine@affinitysolution.com",
            author_name: "Workflow Engine",
            content: noteText,
            is_public: false,
            is_ai_response: false,
          });
          triggeredActions.push({ rule: rule.id, action: "add_note", result: noteText });
        }

        if (rule.action_type === "flag") {
          // Flag ticket for urgent review
          await base44.asServiceRole.entities.SupportTicket.update(ticket_id, {
            flagged: true,
            flagged_reason: rule.action_params?.reason || `Flagged by rule: ${rule.name}`,
          });
          triggeredActions.push({ rule: rule.id, action: "flag" });
        }
      }

      return Response.json({ success: true, ticketData, triggeredActions });
    }

    // Manage workflow rules (CRUD)
    if (action === "create_rule") {
      const user = await base44.auth.me();
      if (user?.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

      const rule = await base44.asServiceRole.entities.TicketWorkflow.create(payload.rule_data);
      return Response.json({ success: true, rule });
    }

    if (action === "list_rules") {
      const user = await base44.auth.me();
      if (user?.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

      const rules = await base44.asServiceRole.entities.TicketWorkflow.list();
      return Response.json({ rules });
    }

    if (action === "update_rule") {
      const user = await base44.auth.me();
      if (user?.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

      const { rule_id, updates } = payload;
      const rule = await base44.asServiceRole.entities.TicketWorkflow.update(rule_id, updates);
      return Response.json({ success: true, rule });
    }

    if (action === "delete_rule") {
      const user = await base44.auth.me();
      if (user?.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

      const { rule_id } = payload;
      await base44.asServiceRole.entities.TicketWorkflow.delete(rule_id);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Workflow engine error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper: escalate ticket to admins
async function escalateTicket(base44, ticketData, adminEmails) {
  const escalationMsg = `🚨 CRITICAL ESCALATION: Ticket #${ticketData.id} requires immediate attention (${ticketData.priority.toUpperCase()} priority, ${ticketData.category})`;

  // Add internal note
  await base44.asServiceRole.entities.TicketThread.create({
    ticket_id: ticketData.id,
    author_email: "workflow-engine@affinitysolution.com",
    author_name: "Workflow Engine",
    content: escalationMsg,
    is_public: false,
    is_ai_response: false,
  });

  // Email escalation to admins
  if (adminEmails && adminEmails.length > 0) {
    for (const adminEmail of adminEmails) {
      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `🚨 ESCALATED: ${ticketData.title}`,
        body: `<html><body style="font-family: Arial; color: #333;">
          <p style="color: #c41e3a; font-weight: bold; font-size: 16px;">CRITICAL TICKET ESCALATION</p>
          <p><strong>Ticket:</strong> #${ticketData.id}</p>
          <p><strong>Title:</strong> ${ticketData.title}</p>
          <p><strong>Priority:</strong> <span style="color: #c41e3a; font-weight: bold;">${ticketData.priority.toUpperCase()}</span></p>
          <p><strong>Category:</strong> ${ticketData.category}</p>
          <p><strong>Client:</strong> ${ticketData.client_email}</p>
          <p><strong>Description:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #c41e3a;">
            ${ticketData.description.replace(/\n/g, '<br>')}
          </div>
          <p><a href="https://your-app.com/admin#tickets" style="display: inline-block; padding: 10px 20px; background: #c41e3a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Ticket</a></p>
        </body></html>`,
      });
    }
  }

  return { escalated: true, adminCount: adminEmails?.length || 0 };
}