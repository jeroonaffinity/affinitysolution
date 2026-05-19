import { useState } from "react";
import { Search, Plus, RefreshCw, CheckCircle2, TicketCheck, Loader2 } from "lucide-react";
import TicketCard from "./TicketCard";
import TicketWizard from "./TicketWizard";
import PullToRefreshWrapper from "@/components/PullToRefreshWrapper";

const FILTER_GROUPS = {
  Active:   ["new", "acknowledged", "open", "in_progress", "escalated", "pending_approval"],
  Waiting:  ["waiting_on_client", "waiting_on_vendor", "on_hold"],
  Resolved: ["resolved", "closed"],
};

const GROUP_DOTS = { Active: "bg-amber-400", Waiting: "bg-purple-400", Resolved: "bg-emerald-400" };

export default function TicketsTab({ userEmail, userName, teamId, tickets, loadingTickets, reloadTickets, endpoints = [] }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSuccess = () => {
    setShowWizard(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
    reloadTickets();
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === "all" || (FILTER_GROUPS[filter] && FILTER_GROUPS[filter].includes(t.status));
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const groupCounts = {
    Active:   tickets.filter(t => FILTER_GROUPS.Active.includes(t.status)).length,
    Waiting:  tickets.filter(t => FILTER_GROUPS.Waiting.includes(t.status)).length,
    Resolved: tickets.filter(t => FILTER_GROUPS.Resolved.includes(t.status)).length,
  };

  return (
    <PullToRefreshWrapper onRefresh={reloadTickets} className="flex flex-col gap-5">
      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Ticket submitted! Our team will be in touch shortly.
        </div>
      )}

      {/* Group summary */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(groupCounts).map(([group, count]) => {
          const active = filter === group;
          return (
            <button key={group} onClick={() => setFilter(active ? "all" : group)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                active ? "border-primary/40 bg-primary/10" : "border-border/30 bg-card/30 hover:border-border/60"
              }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-2 h-2 rounded-full ${GROUP_DOTS[group]}`} />
                <span className="text-lg font-extrabold">{count}</span>
              </div>
              <div className="text-xs text-muted-foreground">{group}</div>
            </button>
          );
        })}
      </div>

      {/* Search + controls */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
        <button onClick={reloadTickets}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setShowWizard(!showWizard)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all glow-blue">
          <Plus className="w-3.5 h-3.5" /> New Ticket
        </button>
      </div>

      {showWizard && (
        <TicketWizard
          userEmail={userEmail}
          userName={userName}
          teamId={teamId}
          onSuccess={handleSuccess}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {/* Ticket list */}
      <div className="flex flex-col gap-2.5">
        {loadingTickets ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
              <TicketCheck className="w-6 h-6 text-primary/40" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              {tickets.length === 0 ? "No support tickets yet. Hit 'New Ticket' when you need help." : "No tickets match your filter."}
            </p>
          </div>
        ) : (
          filtered.map(t => (
            <TicketCard
              key={t.id}
              ticket={t}
              expanded={expandedId === t.id}
              onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
              userEmail={userEmail}
              userName={userName}
              endpoints={endpoints}
            />
          ))
        )}
      </div>
    </PullToRefreshWrapper>
  );
}