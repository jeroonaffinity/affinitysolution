import { base44 } from "@/api/base44Client";

/**
 * Centralized ticket service - single source of truth for all ticket operations
 * Routes all requests through the local SupportTicket entity
 */

export const ticketService = {
  /**
   * List all tickets visible to the current user
   */
  async listTickets(sort = "-updated_date", limit = 50) {
    return base44.entities.SupportTicket.list(sort, limit);
  },

  /**
   * Get a single ticket by ID
   */
  async getTicket(ticketId) {
    const results = await base44.entities.SupportTicket.filter({ id: ticketId });
    return results[0] || null;
  },

  /**
   * Create a new ticket
   */
  async createTicket(data) {
    const { title, description, priority, category, client_email, team_id } = data;
    return base44.entities.SupportTicket.create({
      title,
      description,
      priority: (priority || "medium").toLowerCase(),
      category: category || "other",
      client_email,
      team_id: team_id || undefined,
      status: "new",
    });
  },

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId, status) {
    return base44.entities.SupportTicket.update(ticketId, { status });
  },

  /**
   * Update ticket metadata (priority, category, resolution notes, etc.)
   */
  async updateTicket(ticketId, data) {
    return base44.entities.SupportTicket.update(ticketId, data);
  },

  /**
   * Get tickets for a specific user
   */
  async getUserTickets(email) {
    return base44.entities.SupportTicket.filter({ client_email: email }, "-updated_date");
  },

  /**
   * Get tickets for a team
   */
  async getTeamTickets(teamId) {
    return base44.entities.SupportTicket.filter({ team_id: teamId }, "-updated_date");
  },

  /**
   * Get tickets by status
   */
  async getTicketsByStatus(status) {
    return base44.entities.SupportTicket.filter({ status }, "-updated_date");
  },

  /**
   * Add a message/thread to a ticket
   */
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

  /**
   * Get all messages for a ticket
   */
  async getTicketMessages(ticketId, limit = 50) {
    return base44.entities.TicketThread.filter({ ticket_id: ticketId }, "-created_date", limit);
  },

  /**
   * Close a ticket with resolution notes
   */
  async closeTicket(ticketId, resolutionNotes) {
    return base44.entities.SupportTicket.update(ticketId, {
      status: "closed",
      resolution_notes: resolutionNotes,
    });
  },
};