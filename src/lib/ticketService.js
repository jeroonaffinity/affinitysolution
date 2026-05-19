import { base44 } from "@/api/base44Client";

export const ticketService = {
  /** List all tickets (admin: all; client: their own via RLS) */
  async listTickets() {
    return base44.entities.SupportTicket.list("-created_date");
  },

  /** Get tickets for a specific client email */
  async getUserTickets(email) {
    return base44.entities.SupportTicket.filter({ client_email: email }, "-created_date");
  },

  /** Create a new ticket */
  async createTicket(data) {
    return base44.entities.SupportTicket.create(data);
  },

  /** Update a ticket by ID */
  async updateTicket(id, data) {
    return base44.entities.SupportTicket.update(id, data);
  },

  /** Get all thread messages for a ticket (sorted oldest-first) */
  async getTicketMessages(ticketId) {
    const msgs = await base44.entities.TicketThread.filter({ ticket_id: ticketId });
    return (msgs || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  },

  /** Add a message to a ticket thread */
  async addTicketMessage(ticketId, { author_email, author_name, content, is_public = true, is_ai_response = false }) {
    return base44.entities.TicketThread.create({
      ticket_id: ticketId,
      author_email,
      author_name,
      content,
      is_public,
      is_ai_response,
    });
  },
};