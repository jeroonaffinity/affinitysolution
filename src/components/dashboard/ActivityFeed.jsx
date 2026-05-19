import { Clock, CheckCircle2, AlertTriangle, Loader2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_META = {
  new:              { label: "New ticket opened",       color: "text-blue-400",    bg: "bg-blue-500/10"    },
  acknowledged:     { label: "Ticket acknowledged",     color: "text-sky-400",     bg: "bg-sky-500/10"     },
  open:             { label: "Ticket opened",           color: "text-primary",     bg: "bg-primary/10"     },
  in_progress:      { label: "Work started",            color: "text-amber-400",   bg: "bg-amber-500/10"   },
  waiting_on_client:{ label: "Awaiting your response",  color: "text-purple-400",  bg: "bg-purple-500/10"  },
  waiting_on_vendor:{ label: "Waiting on vendor",       color: "text-orange-400",  bg: "bg-orange-500/10"  },
  escalated:        { label: "Ticket escalated",        color: "text-red-400",     bg: "bg-red-500/10"     },
  resolved:         { label: "Ticket resolved",         color: "text-emerald-400", bg: "bg-emerald-500/10" },
  closed:           { label: "Ticket closed",           color: "text-emerald-400", bg: "bg-emerald-500/10" },
  on_hold:          { label: "Ticket on hold",          color: "text-muted-foreground", bg: "bg-muted"     },
};

function ActivityIcon({ status }) {
  if (status === "resolved" || status === "closed") return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (status === "escalated" || status === "waiting_on_client") return <AlertTriangle className="w-3.5 h-3.5" />;
  if (status === "in_progress") return <Loader2 className="w-3.5 h-3.5" />;
  return <MessageSquare className="w-3.5 h-3.5" />;
}

export default function ActivityFeed({ tickets = [] }) {
  // Sort by most recently updated and take last 6
  const recent = [...tickets]
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
        <div className="text-sm text-muted-foreground text-center py-6">No recent activity.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
      <div className="flex flex-col gap-2">
        {recent.map(ticket => {
          const meta = STATUS_META[ticket.status] || { label: ticket.status, color: "text-muted-foreground", bg: "bg-muted" };
          return (
            <div key={ticket.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border/25 bg-card/20 hover:bg-card/40 transition-all">
              <div className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <ActivityIcon status={ticket.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{ticket.title}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
                  {ticket.priority === "critical" && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold">CRITICAL</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/60 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(ticket.updated_date), { addSuffix: true })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}