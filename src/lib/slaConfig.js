/**
 * SLA configuration - resolution time targets by priority (in hours)
 */
export const SLA_HOURS = {
  critical: 2,
  high: 8,
  medium: 24,
  low: 72,
};

/**
 * First response time targets by priority (in minutes)
 */
export const FIRST_RESPONSE_MINUTES = {
  critical: 15,
  high: 60,
  medium: 240,
  low: 480,
};

/**
 * Calculate SLA due date from ticket creation time and priority
 */
export function calcSlaDue(createdDate, priority) {
  const hours = SLA_HOURS[priority] || 24;
  const d = new Date(createdDate);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * Get SLA status from ticket
 * Returns: { label, color, bgColor, percentUsed, hoursLeft, isBreached, isWarning }
 */
export function getSlaSummary(ticket) {
  if (!ticket.sla_due_date && !ticket.created_date) {
    return null;
  }

  const dueDate = ticket.sla_due_date
    ? new Date(ticket.sla_due_date)
    : calcSlaDue(ticket.created_date, ticket.priority);

  const now = new Date();
  const created = new Date(ticket.created_date);
  const totalMs = dueDate - created;
  const usedMs = now - created;
  const leftMs = dueDate - now;

  const hoursLeft = leftMs / (1000 * 60 * 60);
  const percentUsed = Math.min(100, Math.max(0, (usedMs / totalMs) * 100));

  const isBreached = leftMs <= 0 || ticket.sla_breached;
  const isWarning = !isBreached && percentUsed >= 75;

  // Format time left
  let label;
  if (isBreached) {
    const overMs = Math.abs(leftMs);
    const overHours = Math.floor(overMs / (1000 * 60 * 60));
    const overMins = Math.floor((overMs % (1000 * 60 * 60)) / (1000 * 60));
    label = overHours > 0 ? `${overHours}h ${overMins}m overdue` : `${overMins}m overdue`;
  } else if (hoursLeft < 1) {
    const minsLeft = Math.floor(leftMs / (1000 * 60));
    label = `${minsLeft}m left`;
  } else if (hoursLeft < 24) {
    label = `${Math.floor(hoursLeft)}h ${Math.floor((hoursLeft % 1) * 60)}m left`;
  } else {
    const daysLeft = Math.floor(hoursLeft / 24);
    label = `${daysLeft}d left`;
  }

  return {
    label,
    percentUsed,
    hoursLeft,
    isBreached,
    isWarning,
    color: isBreached ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400",
    bgColor: isBreached ? "bg-red-500/20" : isWarning ? "bg-amber-500/20" : "bg-emerald-500/20",
    barColor: isBreached ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-emerald-400",
    dueDate,
  };
}

/**
 * All ticket statuses with display metadata
 */
export const TICKET_STATUSES = {
  new:              { label: "New",               color: "text-slate-300",   bg: "bg-slate-500/20",    dot: "bg-slate-400"   },
  acknowledged:     { label: "Acknowledged",      color: "text-cyan-400",    bg: "bg-cyan-500/20",     dot: "bg-cyan-400"    },
  open:             { label: "Open",              color: "text-amber-400",   bg: "bg-amber-500/20",    dot: "bg-amber-400"   },
  in_progress:      { label: "In Progress",       color: "text-blue-400",    bg: "bg-blue-500/20",     dot: "bg-blue-400"    },
  waiting_on_client:{ label: "Waiting on Client", color: "text-violet-400",  bg: "bg-violet-500/20",   dot: "bg-violet-400"  },
  waiting_on_vendor:{ label: "Waiting on Vendor", color: "text-orange-400",  bg: "bg-orange-500/20",   dot: "bg-orange-400"  },
  escalated:        { label: "Escalated",         color: "text-red-400",     bg: "bg-red-500/20",      dot: "bg-red-400"     },
  pending_approval: { label: "Pending Approval",  color: "text-yellow-400",  bg: "bg-yellow-500/20",   dot: "bg-yellow-400"  },
  on_hold:          { label: "On Hold",           color: "text-purple-400",  bg: "bg-purple-500/20",   dot: "bg-purple-400"  },
  resolved:         { label: "Resolved",          color: "text-emerald-400", bg: "bg-emerald-500/20",  dot: "bg-emerald-400" },
  closed:           { label: "Closed",            color: "text-slate-400",   bg: "bg-slate-500/15",    dot: "bg-slate-500"   },
};

export const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-400",    bg: "bg-red-500/15",     dot: "bg-red-400"    },
  high:     { label: "High",     color: "text-orange-400", bg: "bg-orange-500/15",  dot: "bg-orange-400" },
  medium:   { label: "Medium",   color: "text-amber-400",  bg: "bg-amber-500/15",   dot: "bg-amber-400"  },
  low:      { label: "Low",      color: "text-slate-400",  bg: "bg-slate-500/15",   dot: "bg-slate-400"  },
};