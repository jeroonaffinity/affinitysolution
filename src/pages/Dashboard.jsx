import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Ticket, CreditCard, MessageSquare, Loader2, LogOut,
  TicketCheck, Clock, CheckCircle2,
  ChevronDown, ChevronUp, Search, Plus, Send,
  Mail, Server, Phone, ArrowRight
} from "lucide-react";
import BillingTab from "@/components/dashboard/BillingTab";
import SupportDocsTab from "@/components/dashboard/SupportDocsTab";
import ClientABRTab from "@/components/dashboard/ClientABRTab";
import ClientEndpointsTab from "@/components/dashboard/ClientEndpointsTab";

// ─── Config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",   label: "Overview"       },
  { id: "tickets",    label: "Support Tickets" },
  { id: "billing",    label: "Billing"         },
  { id: "docs",       label: "Support Docs"    },
  { id: "enquiries",  label: "My Enquiries"    },
  { id: "abr",        label: "Admin Access"    },
  { id: "endpoints",  label: "Endpoints"       },
];



// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent = false, warning = false, onClick }) {
  return (
    <div onClick={onClick} className={`relative p-5 rounded-2xl border overflow-hidden group transition-all hover:-translate-y-0.5 ${onClick ? "cursor-pointer" : ""} ${
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

const ZOHO_ORG_ID = "20114459933";

const ZOHO_STATUS_CONFIG = {
  "Open":        { label: "Open",        color: "text-amber-400",   bg: "bg-amber-500/15",   dot: "bg-amber-400"   },
  "In Progress": { label: "In Progress", color: "text-blue-400",    bg: "bg-blue-500/15",    dot: "bg-blue-400"    },
  "On Hold":     { label: "On Hold",     color: "text-purple-400",  bg: "bg-purple-500/15",  dot: "bg-purple-400"  },
  "Closed":      { label: "Closed",      color: "text-slate-400",   bg: "bg-slate-500/15",   dot: "bg-slate-400"   },
};

function ZohoTicketRow({ t, expanded, onToggle }) {
  const status = ZOHO_STATUS_CONFIG[t.status] || ZOHO_STATUS_CONFIG["Open"];
  const priorityMap = { High: "text-red-400 bg-red-500/15", Medium: "text-amber-400 bg-amber-500/15", Low: "text-emerald-400 bg-emerald-500/15" };
  const priorityCls = priorityMap[t.priority] || "text-muted-foreground bg-muted";

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${expanded ? "border-primary/30 bg-card/70" : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50"}`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={onToggle}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="font-semibold text-sm truncate">{t.subject}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {t.priority && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityCls}`}>{t.priority}</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>#{t.ticketNumber}</span>
            <span>·</span>
            <span>{new Date(t.createdTime).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            {t.channel && <><span>·</span><span>{t.channel}</span></>}
          </div>
        </div>
        <div className="text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 pt-4 flex flex-col gap-3">
          {t.description ? (
            <p className="text-sm text-foreground/75 leading-relaxed bg-background/40 rounded-xl px-4 py-3 border border-border/20">{t.description}</p>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-background/30 rounded-xl px-4 py-3 border border-border/15">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              Our team will review this shortly and respond via email.
            </div>
          )}
          {t.dueDate && (
            <div className="text-xs text-muted-foreground">Due: {new Date(t.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
          )}
        </div>
      )}
    </div>
  );
}

function TicketsTab({ userEmail }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "Medium" });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const res = await base44.functions.invoke("zohoDesk", {
      action: "list_tickets", orgId: ZOHO_ORG_ID, limit: 100,
    });
    // Filter to tickets matching this user's email
    const all = res.data?.data?.data || [];
    setTickets(all.filter(t => t.email?.toLowerCase() === userEmail?.toLowerCase()));
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.functions.invoke("zohoDesk", {
        action: "create_ticket", orgId: ZOHO_ORG_ID,
        data: {
          subject: form.subject,
          description: form.description,
          priority: form.priority,
          email: userEmail,
          departmentId: "238671000000007061",
          status: "Open",
          channel: "Portal",
        },
      });
      setForm({ subject: "", description: "", priority: "Medium" });
      setShowForm(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
      loadTickets();
    } catch (err) {
      console.error("Failed to submit ticket:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === "all" || t.status === filter;
    const matchSearch = !search || t.subject?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    Open: tickets.filter(t => t.status === "Open").length,
    "In Progress": tickets.filter(t => t.status === "In Progress").length,
    "On Hold": tickets.filter(t => t.status === "On Hold").length,
    Closed: tickets.filter(t => t.status === "Closed").length,
  };

  return (
    <div className="flex flex-col gap-5">
      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Ticket submitted successfully! Our team will be in touch shortly.
        </div>
      )}

      {/* Status filter pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ZOHO_STATUS_CONFIG).map(([key, cfg]) => {
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(active ? "all" : key)}
              className={`p-3.5 rounded-xl border text-left transition-all ${active ? "border-primary/40 bg-primary/8" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-lg font-extrabold">{counts[key] || 0}</span>
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
          <input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all glow-blue">
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
            <input required placeholder="Briefly describe the issue..." value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors" />
            <textarea rows={3} placeholder="Give us as much detail as possible — what happened, when, and what you've tried."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none transition-colors" />
            <div className="flex flex-col gap-1 w-48">
              <label className="text-xs text-muted-foreground">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit Ticket
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-xl border border-border/50 text-sm hover:bg-card transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket list */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
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
            <ZohoTicketRow key={t.id} t={t} expanded={expandedId === t.id}
              onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)} />
          ))
        )}
      </div>
    </div>
  );
}



function EnquiriesTab({ submissions }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Explanation banner */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex gap-3">
        <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold mb-0.5">What are enquiries?</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            These are callback or email requests you submitted via our <strong>Contact</strong> page — before or after becoming a client. Each entry shows your preferred contact method and any message you left us. Our team will follow up directly.
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground text-sm">No enquiries found. If you've contacted us via the website, it'll appear here.</p>
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
  const [services, setServices] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = async (currentUser) => {
    const email = currentUser.email;
    const [s, sub] = await Promise.all([
      base44.entities.ServiceUsage.filter({ client_email: email }, "-created_date"),
      base44.entities.ContactSubmission.filter({ contact: email }, "-created_date"),
    ]);
    setServices(s); setSubmissions(sub);
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

  const totalMonthly = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const activeServices = services.filter(s => s.status === "active").length;

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
              src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
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
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Ticket} label="Support Tickets" value="→" sub="Click to view your tickets" warning={false} onClick={() => setActiveTab("tickets")} />
              <StatCard icon={CreditCard} label="Monthly Spend" value={`£${totalMonthly.toLocaleString()}`} sub={`${activeServices} active service${activeServices !== 1 ? "s" : ""}`} accent />
              <StatCard icon={MessageSquare} label="My Enquiries" value={submissions.length} sub="Contact form submissions" />
            </div>

            {/* Quick access to tickets */}
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Support Tickets</div>
                <div className="text-xs text-muted-foreground mt-0.5">View and manage your support requests via Zoho Desk</div>
              </div>
              <button onClick={() => setActiveTab("tickets")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                View Tickets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

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
          <TicketsTab userEmail={user?.email} />
        )}

        {activeTab === "billing" && (
          <BillingTab services={services} userName={user?.full_name || user?.email} />
        )}

        {activeTab === "docs" && (
          <SupportDocsTab />
        )}

        {activeTab === "enquiries" && (
          <EnquiriesTab submissions={submissions} />
        )}

        {activeTab === "abr" && (
          <ClientABRTab />
        )}

        {activeTab === "endpoints" && (
          <ClientEndpointsTab userEmail={user?.email} />
        )}
      </div>
    </div>
  );
}