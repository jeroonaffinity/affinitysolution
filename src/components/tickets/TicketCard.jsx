import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import TicketThread from "./TicketThread";
import AIQuickActions from "./AIQuickActions";

const STATUS_CONFIG = {
  "new":               { label: "New",               color: "text-sky-400",     bg: "bg-sky-500/15",     dot: "bg-sky-400"     },
  "acknowledged":      { label: "Acknowledged",      color: "text-indigo-400",  bg: "bg-indigo-500/15",  dot: "bg-indigo-400"  },
  "open":              { label: "Open",              color: "text-amber-400",   bg: "bg-amber-500/15",   dot: "bg-amber-400"   },
  "in_progress":       { label: "In Progress",       color: "text-blue-400",    bg: "bg-blue-500/15",    dot: "bg-blue-400"    },
  "waiting_on_client": { label: "Waiting on You",    color: "text-orange-400",  bg: "bg-orange-500/15",  dot: "bg-orange-400"  },
  "waiting_on_vendor": { label: "Waiting on Vendor", color: "text-yellow-400",  bg: "bg-yellow-500/15",  dot: "bg-yellow-400"  },
  "escalated":         { label: "Escalated",         color: "text-red-400",     bg: "bg-red-500/15",     dot: "bg-red-400"     },
  "on_hold":           { label: "On Hold",           color: "text-purple-400",  bg: "bg-purple-500/15",  dot: "bg-purple-400"  },
  "pending_approval":  { label: "Pending Approval",  color: "text-violet-400",  bg: "bg-violet-500/15",  dot: "bg-violet-400"  },
  "resolved":          { label: "Resolved",          color: "text-emerald-400", bg: "bg-emerald-500/15", dot: "bg-emerald-400" },
  "closed":            { label: "Closed",            color: "text-slate-400",   bg: "bg-slate-500/15",   dot: "bg-slate-400"   },
};

const PRIORITY_CONFIG = {
  low:      "text-emerald-400 bg-emerald-500/15",
  medium:   "text-amber-400 bg-amber-500/15",
  high:     "text-orange-400 bg-orange-500/15",
  critical: "text-red-400 bg-red-500/15",
};

export default function TicketCard({ ticket, expanded, onToggle, userEmail, userName, endpoints = [] }) {
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG["new"];
  const priorityCls = PRIORITY_CONFIG[ticket.priority?.toLowerCase()] || "text-muted-foreground bg-muted";

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      expanded ? "border-primary/30 bg-card/70" : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50"
    }`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={onToggle}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate">{ticket.title}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {ticket.priority && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityCls}`}>
                  {ticket.priority}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>#{ticket.id?.slice(-6).toUpperCase()}</span>
            <span>·</span>
            <span>{new Date(ticket.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            {ticket.category && <><span>·</span><span className="capitalize">{ticket.category}</span></>}
            {ticket.assigned_to_name && <><span>·</span><span className="text-primary/70">Assigned: {ticket.assigned_to_name}</span></>}
          </div>
        </div>
        <div className="text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 pt-4 flex flex-col gap-4">
          {ticket.description && (
            <p className="text-sm text-foreground/75 leading-relaxed bg-background/40 rounded-xl px-4 py-3 border border-border/20 whitespace-pre-wrap">
              {ticket.description.split("--- Attachments ---")[0].trim()}
            </p>
          )}
          {(ticket.device_asset || ticket.department || ticket.location || ticket.affected_users_count > 1) && (
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {ticket.device_asset && <span>🖥️ {ticket.device_asset}</span>}
              {ticket.department && <span>🏢 {ticket.department}</span>}
              {ticket.location && <span>📍 {ticket.location}</span>}
              {ticket.affected_users_count > 1 && <span>👥 {ticket.affected_users_count} users affected</span>}
            </div>
          )}
          <AIQuickActions ticket={ticket} endpoints={endpoints} />
          <TicketThread ticket={ticket} userEmail={userEmail} userName={userName} />
        </div>
      )}
    </div>
  );
}