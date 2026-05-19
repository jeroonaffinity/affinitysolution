import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { differenceInHours, differenceInMinutes, isPast } from "date-fns";

function SLAItem({ ticket }) {
  const due = ticket.sla_due_date ? new Date(ticket.sla_due_date) : null;
  if (!due) return null;

  const breached = ticket.sla_breached || isPast(due);
  const hoursLeft = differenceInHours(due, new Date());
  const minutesLeft = differenceInMinutes(due, new Date()) % 60;
  const urgent = !breached && hoursLeft < 4;

  let timeLabel;
  if (breached) timeLabel = "SLA breached";
  else if (hoursLeft < 1) timeLabel = `${minutesLeft}m left`;
  else timeLabel = `${hoursLeft}h ${minutesLeft}m left`;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
      breached ? "border-red-500/30 bg-red-500/5" :
      urgent ? "border-amber-500/30 bg-amber-500/5" :
      "border-border/25 bg-card/20"
    }`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${breached ? "bg-red-400" : urgent ? "bg-amber-400" : "bg-emerald-400"}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{ticket.title}</div>
        <div className="text-xs text-muted-foreground capitalize">{ticket.priority} · {ticket.status?.replace(/_/g, " ")}</div>
      </div>
      <div className={`text-xs font-semibold flex-shrink-0 ${breached ? "text-red-400" : urgent ? "text-amber-400" : "text-muted-foreground"}`}>
        {timeLabel}
      </div>
    </div>
  );
}

export default function SLAWidget({ tickets = [], onViewAll }) {
  const slaTickets = tickets
    .filter(t => t.sla_due_date && !["resolved", "closed"].includes(t.status))
    .sort((a, b) => {
      if (a.sla_breached && !b.sla_breached) return -1;
      if (!a.sla_breached && b.sla_breached) return 1;
      return new Date(a.sla_due_date) - new Date(b.sla_due_date);
    })
    .slice(0, 4);

  const breachedCount = tickets.filter(t => t.sla_breached || (t.sla_due_date && isPast(new Date(t.sla_due_date)) && !["resolved","closed"].includes(t.status))).length;

  if (slaTickets.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SLA Status</h2>
          {breachedCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold">{breachedCount} breached</span>
          )}
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
          All tickets <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {slaTickets.map(t => <SLAItem key={t.id} ticket={t} />)}
      </div>
    </div>
  );
}