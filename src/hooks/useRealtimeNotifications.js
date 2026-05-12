import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  on_hold: "On Hold",
  closed: "Closed",
};

/**
 * Subscribes to real-time SupportTicket updates for the given user email
 * and shows in-app toasts when their tickets change status.
 * Also alerts on high-priority endpoint disconnections if endpoints are provided.
 */
export function useRealtimeNotifications({ userEmail, endpoints = [] }) {
  const prevEndpointsRef = useRef({});

  // ── Ticket status change notifications ──────────────────────────────────
  useEffect(() => {
    if (!userEmail) return;

    const unsubscribe = base44.entities.SupportTicket.subscribe((event) => {
      if (event.type !== "update") return;
      const ticket = event.data;
      if (!ticket) return;

      // Only notify the ticket owner
      if (ticket.client_email !== userEmail) return;

      const newStatus = ticket.zoho_status || STATUS_LABELS[ticket.status] || ticket.status;
      const title = ticket.title || "Your Ticket";

      const isClosed = ticket.status === "closed" || ticket.zoho_status === "Closed";
      const isUrgent = ticket.priority === "critical" || ticket.zoho_priority === "High";

      if (isClosed) {
        toast.success(`Ticket resolved: "${title}"`, {
          description: "Your support ticket has been closed.",
          duration: 8000,
        });
      } else if (isUrgent && ticket.status === "in_progress") {
        toast.warning(`High-priority ticket updated`, {
          description: `"${title}" is now ${newStatus}`,
          duration: 10000,
        });
      } else {
        toast.info(`Ticket status updated`, {
          description: `"${title}" → ${newStatus}`,
          duration: 6000,
        });
      }
    });

    return () => unsubscribe();
  }, [userEmail]);

  // ── Endpoint health notifications ─────────────────────────────────────
  useEffect(() => {
    if (!endpoints.length) return;

    endpoints.forEach((ep) => {
      const prev = prevEndpointsRef.current[ep.id];
      if (!prev) {
        // First time seeing this endpoint — just record it
        prevEndpointsRef.current[ep.id] = ep;
        return;
      }

      // Went offline
      if (prev.status === "Connected" && ep.status === "Disconnected") {
        toast.error(`Endpoint offline: ${ep.name}`, {
          description: "Device lost connection. Manual intervention may be required.",
          duration: 12000,
        });
      }

      // Critical updates appeared
      const prevCritical = prev.missing_updates?.critical || 0;
      const newCritical = ep.missing_updates?.critical || 0;
      if (newCritical > prevCritical) {
        toast.warning(`Critical updates on ${ep.name}`, {
          description: `${newCritical} critical update(s) require attention.`,
          duration: 10000,
        });
      }

      prevEndpointsRef.current[ep.id] = ep;
    });
  }, [endpoints]);
}