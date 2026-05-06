import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus, Loader2, TicketCheck, ChevronDown, ChevronUp,
  Clock, Zap, AlertTriangle, CheckCircle2, XCircle,
  ArrowLeft, Filter, Search, Send, Tag, Cpu, Wifi,
  Mail, Shield, HelpCircle, LayoutDashboard
} from "lucide-react";

const STATUS_CONFIG = {
  open:        { label: "Open",        color: "text-yellow-400", bg: "bg-yellow-500/15", dot: "bg-yellow-400",  icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-500/15",   dot: "bg-blue-400",    icon: Zap },
  resolved:    { label: "Resolved",    color: "text-green-400",  bg: "bg-green-500/15",  dot: "bg-green-400",   icon: CheckCircle2 },
  closed:      { label: "Closed",      color: "text-slate-400",  bg: "bg-slate-500/15",  dot: "bg-slate-400",   icon: XCircle },
};

const PRIORITY_CONFIG = {
  low:      { label: "Low",      color: "text-slate-400",  bg: "bg-slate-500/15"  },
  medium:   { label: "Medium",   color: "text-primary",    bg: "bg-primary/15"    },
  high:     { label: "High",     color: "text-orange-400", bg: "bg-orange-500/15" },
  critical: { label: "Critical", color: "text-red-400",    bg: "bg-red-500/15"    },
};

const CATEGORY_ICONS = {
  hardware: Cpu, software: LayoutDashboard, network: Wifi,
  email: Mail, security: Shield, other: HelpCircle,
};

const FILTERS = ["all", "open", "in_progress", "resolved", "closed"];

export default function MyTickets() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", category: "other" });

  const fetchTickets = async (email) => {
    const t = await base44.entities.SupportTicket.filter({ client_email: email }, "-created_date");
    setTickets(t);
  };

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { base44.auth.redirectToLogin(window.location.href); return; }
      const me = await base44.auth.me();
      setUser(me);
      await fetchTickets(me.email);
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.SupportTicket.create({ ...form, client_email: user.email, status: "open" });
    setForm({ title: "", description: "", priority: "medium", category: "other" });
    setShowForm(false);
    setSubmitting(false);
    await fetchTickets(user.email);
  };

  const filtered = tickets.filter(t => {
    const matchesFilter = filter === "all" || t.status === filter;
    const matchesSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = tickets.filter(t => t.status === s).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-black/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <TicketCheck className="w-5 h-5 text-primary" />
              <span className="font-bold text-base">My Tickets</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all glow-blue"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* New Ticket Form */}
        {showForm && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-primary/20 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Raise a New Ticket</span>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <input
                required
                placeholder="Briefly describe the issue..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
              <textarea
                rows={4}
                placeholder="Give us as much detail as possible — what happened, when, and what you've already tried."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="network">Network</option>
                    <option value="email">Email</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl border border-border/60 text-sm hover:bg-card transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FILTERS.slice(1).map(s => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "all" : s)}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  filter === s
                    ? `border-primary/50 bg-primary/10`
                    : "border-border/40 bg-card/40 hover:border-border/70"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                  <span className="text-xl font-extrabold">{counts[s] || 0}</span>
                </div>
                <div className="text-xs text-muted-foreground">{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* Search + Filter Bar */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-card/40 text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {f === "all" ? "All" : f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TicketCheck className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                {tickets.length === 0
                  ? "You haven't raised any tickets yet. Hit 'New Ticket' when you need help."
                  : "No tickets match your current filter."}
              </p>
            </div>
          )}

          {filtered.map(t => {
            const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
            const priority = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
            const CategoryIcon = CATEGORY_ICONS[t.category] || HelpCircle;
            const isExpanded = expandedId === t.id;
            const StatusIcon = status.icon;

            return (
              <div
                key={t.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? "border-primary/30 bg-card/80"
                    : "border-border/40 bg-card/40 hover:border-border/70 hover:bg-card/60"
                }`}
              >
                {/* Ticket Header */}
                <button
                  className="w-full text-left px-5 py-4 flex items-start gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                >
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${status.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-semibold text-sm leading-snug">{t.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>
                          {priority.label}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CategoryIcon className="w-3 h-3" />
                        <span className="capitalize">{t.category}</span>
                      </div>
                      <span>·</span>
                      <span>#{t.id?.slice(-8).toUpperCase()}</span>
                      <span>·</span>
                      <span>{new Date(t.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>

                  <div className="text-muted-foreground flex-shrink-0 mt-0.5">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border/30">

                    {/* Status Timeline */}
                    <div className="pt-4 flex items-center gap-2">
                      {["open", "in_progress", "resolved", "closed"].map((s, i, arr) => {
                        const cfg = STATUS_CONFIG[s];
                        const statuses = ["open", "in_progress", "resolved", "closed"];
                        const currentIdx = statuses.indexOf(t.status);
                        const thisIdx = statuses.indexOf(s);
                        const isActive = s === t.status;
                        const isPast = thisIdx < currentIdx;
                        return (
                          <div key={s} className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                              isActive ? `${cfg.bg} ${cfg.color} ring-1 ring-current` :
                              isPast ? "bg-muted/50 text-muted-foreground/70" :
                              "bg-transparent text-muted-foreground/40"
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : isPast ? "bg-muted-foreground/50" : "bg-muted-foreground/20"}`} />
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </div>
                            {i < arr.length - 1 && (
                              <div className={`h-px flex-1 ${isPast ? "bg-border" : "bg-border/30"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Description */}
                    {t.description && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</span>
                        <p className="text-sm text-foreground/80 leading-relaxed bg-background/50 rounded-xl px-4 py-3 border border-border/30">
                          {t.description}
                        </p>
                      </div>
                    )}

                    {/* Resolution Notes */}
                    {t.resolution_notes ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-green-400 uppercase tracking-wide flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Notes
                        </span>
                        <div className="text-sm text-green-300 leading-relaxed bg-green-500/8 rounded-xl px-4 py-3 border border-green-500/20">
                          {t.resolution_notes}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/30 rounded-xl px-4 py-3 border border-border/20">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {t.status === "open"
                          ? "Our team will review this shortly and update the status."
                          : t.status === "in_progress"
                          ? "We're actively working on this — resolution notes will appear here once resolved."
                          : "No resolution notes were added for this ticket."}
                      </div>
                    )}

                    {/* Footer meta */}
                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground/60 border-t border-border/20">
                      <span>Opened {new Date(t.created_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                      {t.updated_date && t.updated_date !== t.created_date && (
                        <span>Updated {new Date(t.updated_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}