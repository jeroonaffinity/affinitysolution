import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Ticket, CreditCard, MessageSquare, Loader2, LogOut,
  TicketCheck, Clock, Zap, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Search, Plus, Send,
  Cpu, Wifi, Mail, Shield, HelpCircle, LayoutDashboard,
  CalendarDays, Users, Server, Phone, ArrowRight
} from "lucide-react";

// ─── Config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  label: "Overview"       },
  { id: "tickets",   label: "Support Tickets" },
  { id: "billing",   label: "Billing"         },
  { id: "enquiries", label: "My Enquiries"    },
];

const STATUS_CONFIG = {
  open:        { label: "Open",        color: "text-amber-400",  bg: "bg-amber-500/15",  dot: "bg-amber-400",   icon: Clock       },
  in_progress: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-500/15",   dot: "bg-blue-400",    icon: Zap         },
  resolved:    { label: "Resolved",    color: "text-emerald-400",bg: "bg-emerald-500/15",dot: "bg-emerald-400", icon: CheckCircle2},
  closed:      { label: "Closed",      color: "text-slate-400",  bg: "bg-slate-500/15",  dot: "bg-slate-400",   icon: XCircle     },
};

const PRIORITY_CONFIG = {
  low:      { label: "Low",      color: "text-slate-400",  bg: "bg-slate-500/15"  },
  medium:   { label: "Medium",   color: "text-primary",    bg: "bg-primary/15"    },
  high:     { label: "High",     color: "text-orange-400", bg: "bg-orange-500/15" },
  critical: { label: "Critical", color: "text-red-400",    bg: "bg-red-500/15"    },
};

const CATEGORY_ICONS = {
  hardware: Cpu, software: Server, network: Wifi,
  email: Mail, security: Shield, other: HelpCircle,
};

const SERVICE_STATUS = {
  active:    { label: "Active",    bg: "bg-emerald-500/15", color: "text-emerald-400" },
  paused:    { label: "Paused",    bg: "bg-amber-500/15",   color: "text-amber-400"   },
  cancelled: { label: "Cancelled", bg: "bg-red-500/15",     color: "text-red-400"     },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent = false, warning = false }) {
  return (
    <div className={`relative p-5 rounded-2xl border overflow-hidden group transition-all hover:-translate-y-0.5 ${
      warning ? "border-amber-500/30 bg-amber-500/5" :
      accent  ? "border-primary/30 bg-primary/5" :
                "border-border/40 bg-card/50"
    }`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(30,90,200,0.06) 0%, transparent 70%)" }} />
      <div className="relative">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
          warning ? "bg-amber-500/20 text-amber-400" :
          accent  ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold tracking-tight mb-0.5">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/60 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function TicketRow({ t, expanded, onToggle }) {
  const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
  const priority = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
  const CatIcon = CATEGORY_ICONS[t.category] || HelpCircle;
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      expanded ? "border-primary/30 bg-card/70" : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50"
    }`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={onToggle}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="font-semibold text-sm truncate">{t.title}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>{priority.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CatIcon className="w-3 h-3" />
            <span className="capitalize">{t.category}</span>
            <span>·</span>
            <span>#{t.id?.slice(-6).toUpperCase()}</span>
            <span>·</span>
            <span>{new Date(t.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
        <div className="text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border/20">
          {/* Timeline */}
          <div className="pt-4 flex items-center">
            {["open", "in_progress", "resolved", "closed"].map((s, i, arr) => {
              const cfg = STATUS_CONFIG[s];
              const statuses = arr;
              const currentIdx = statuses.indexOf(t.status);
              const thisIdx = statuses.indexOf(s);
              const isActive = s === t.status;
              const isPast = thisIdx < currentIdx;
              return (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive ? `${cfg.bg} ${cfg.color} ring-1 ring-current` :
                    isPast   ? "bg-muted/40 text-muted-foreground/60" :
                               "text-muted-foreground/25"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : isPast ? "bg-muted-foreground/40" : "bg-muted-foreground/15"}`} />
                    <span className="hidden md:inline">{cfg.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`h-px flex-1 mx-1 ${isPast ? "bg-border/60" : "bg-border/20"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {t.description && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</div>
              <p className="text-sm text-foreground/75 leading-relaxed bg-background/40 rounded-xl px-4 py-3 border border-border/20">
                {t.description}
              </p>
            </div>
          )}

          {t.resolution_notes ? (
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Resolution
              </div>
              <div className="text-sm text-emerald-300/90 leading-relaxed bg-emerald-500/8 rounded-xl px-4 py-3 border border-emerald-500/20">
                {t.resolution_notes}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-background/30 rounded-xl px-4 py-3 border border-border/15">
              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/60" />
              {t.status === "open" ? "Our team will review this shortly." :
               t.status === "in_progress" ? "We're actively working on this — resolution notes will appear here once resolved." :
               "No resolution notes were added for this ticket."}
            </div>
          )}

          <div className="flex justify-between text-xs text-muted-foreground/50 border-t border-border/15 pt-2">
            <span>Opened {new Date(t.created_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
            {t.updated_date !== t.created_date && (
              <span>Updated {new Date(t.updated_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TicketsTab({ tickets, userEmail, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", category: "other" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.SupportTicket.create({ ...form, client_email: userEmail, status: "open" });
    setForm({ title: "", description: "", priority: "medium", category: "other" });
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === "all" || t.status === filter;
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  tickets.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });

  return (
    <div className="flex flex-col gap-5">
      {/* Stat mini-pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(active ? "all" : key)}
              className={`p-3.5 rounded-xl border text-left transition-all ${active ? "border-primary/40 bg-primary/8" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                <span className="text-lg font-extrabold">{counts[key]}</span>
              </div>
              <div className="text-xs text-muted-foreground">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Actions row */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all glow-blue"
        >
          <Plus className="w-3.5 h-3.5" /> New Ticket
        </button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-primary/15 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Raise a New Support Ticket</span>
          </div>
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <input
              required
              placeholder="Briefly describe the issue..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
            <textarea
              rows={3}
              placeholder="Give us as much detail as possible — what happened, when, and what you've already tried."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none transition-colors"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none">
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="email">Email</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit Ticket
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-xl border border-border/50 text-sm hover:bg-card transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket list */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
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
            <TicketRow key={t.id} t={t} expanded={expandedId === t.id} onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function BillingTab({ services }) {
  const active = services.filter(s => s.status === "active");
  const totalMonthly = active.reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const totalAnnual = totalMonthly * 12;

  return (
    <div className="flex flex-col gap-5">
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground text-sm">No services found. Contact us to get started.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5">
              <div className="text-xs text-muted-foreground mb-1">Monthly Total</div>
              <div className="text-2xl font-extrabold text-gradient">£{totalMonthly.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">per month</div>
            </div>
            <div className="p-4 rounded-2xl border border-border/30 bg-card/40">
              <div className="text-xs text-muted-foreground mb-1">Annual Estimate</div>
              <div className="text-2xl font-extrabold">£{totalAnnual.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">per year</div>
            </div>
            <div className="p-4 rounded-2xl border border-border/30 bg-card/40">
              <div className="text-xs text-muted-foreground mb-1">Active Services</div>
              <div className="text-2xl font-extrabold">{active.length}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">of {services.length} total</div>
            </div>
          </div>

          {/* Service list */}
          <div className="flex flex-col gap-2.5">
            {services.map(s => {
              const sc = SERVICE_STATUS[s.status] || SERVICE_STATUS.active;
              return (
                <div key={s.id} className="p-4 rounded-2xl border border-border/30 bg-card/40 flex items-center justify-between gap-4 flex-wrap hover:border-border/60 transition-all">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Server className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{s.service_name}</div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                        {s.users > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.users} users</span>}
                        {s.endpoints > 0 && <span>{s.endpoints} endpoints</span>}
                        {s.next_billing_date && (
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Next: {new Date(s.next_billing_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        )}
                        <span className="capitalize">{s.billing_cycle}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    <div className="text-right">
                      <div className="font-bold text-sm">£{s.monthly_cost?.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">/mo</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EnquiriesTab({ submissions }) {
  return (
    <div className="flex flex-col gap-3">
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground text-sm">No enquiries found.</p>
        </div>
      ) : (
        submissions.map(s => (
          <div key={s.id} className="p-4 rounded-2xl border border-border/30 bg-card/40 flex flex-col gap-2.5 hover:border-border/60 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-sm">{s.name}</div>
                {s.company && <div className="text-xs text-muted-foreground mt-0.5">{s.company}</div>}
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 flex items-center gap-1 ${
                s.preferred_method === "call" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent-foreground"
              }`}>
                {s.preferred_method === "call" ? <Phone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                {s.preferred_method === "call" ? "Call back" : "Email"}
              </span>
            </div>
            {s.message && <p className="text-sm text-muted-foreground leading-relaxed">{s.message}</p>}
            <div className="text-xs text-muted-foreground/50">
              {new Date(s.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = async (currentUser) => {
    const email = currentUser.email;
    const [t, s, sub] = await Promise.all([
      base44.entities.SupportTicket.filter({ client_email: email }, "-created_date"),
      base44.entities.ServiceUsage.filter({ client_email: email }, "-created_date"),
      base44.entities.ContactSubmission.filter({ contact: email }, "-created_date"),
    ]);
    setTickets(t); setServices(s); setSubmissions(sub);
  };

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { base44.auth.redirectToLogin(window.location.href); return; }
      const me = await base44.auth.me();
      setUser(me);
      await fetchData(me);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const totalMonthly = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const activeServices = services.filter(s => s.status === "active").length;
  const recentTickets = tickets.slice(0, 4);

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <div className="sticky top-0 z-30 border-b border-white/6 bg-black/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/dc140f6fd_AbstractTechnologyProfileLinkedInBanner2.png"
              alt="AffinitySolution"
              className="h-7 w-auto"
            />
            <div className="hidden sm:block w-px h-4 bg-border/60" />
            <span className="hidden sm:block text-sm font-medium text-muted-foreground">Client Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
              <span className="text-muted-foreground font-medium">{user?.full_name || user?.email}</span>
            </div>
            <button
              onClick={() => base44.auth.logout("/")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            <span className="text-gradient">{user?.full_name?.split(" ")[0] || "there"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's a live view of your IT environment.</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-card/40 border border-border/30 rounded-xl p-1 w-fit flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id === "tickets" && openTickets > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">{openTickets}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Ticket} label="Open Tickets" value={openTickets} sub={`${tickets.length} total tickets`} warning={openTickets > 0} />
              <StatCard icon={CreditCard} label="Monthly Spend" value={`£${totalMonthly.toLocaleString()}`} sub={`${activeServices} active service${activeServices !== 1 ? "s" : ""}`} accent />
              <StatCard icon={MessageSquare} label="My Enquiries" value={submissions.length} sub="Contact form submissions" />
            </div>

            {/* Recent Tickets */}
            {tickets.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Tickets</h2>
                  <button onClick={() => setActiveTab("tickets")} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {recentTickets.map(t => {
                    const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                    const priority = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
                    return (
                      <div key={t.id} onClick={() => setActiveTab("tickets")}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50 transition-all cursor-pointer">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                        <span className="text-sm font-medium flex-1 truncate">{t.title}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>{priority.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Services */}
            {services.filter(s => s.status === "active").length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Services</h2>
                  <button onClick={() => setActiveTab("billing")} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    View billing <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.filter(s => s.status === "active").map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card/30">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Server className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.service_name}</div>
                        <div className="text-xs text-muted-foreground">£{s.monthly_cost}/mo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <TicketsTab tickets={tickets} userEmail={user?.email} onRefresh={() => fetchData(user)} />
        )}

        {activeTab === "billing" && (
          <BillingTab services={services} />
        )}

        {activeTab === "enquiries" && (
          <EnquiriesTab submissions={submissions} />
        )}
      </div>
    </div>
  );
}