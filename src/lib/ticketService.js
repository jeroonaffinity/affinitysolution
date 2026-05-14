import { base44 } from "@/api/base44Client";

export const ticketService = {
  async getUserTickets(email) {
    return base44.entities.SupportTicket.filter({ client_email: email });
  },
};