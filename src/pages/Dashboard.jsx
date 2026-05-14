import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Ticket, CreditCard, Loader2, LogOut,
  TicketCheck, Clock, CheckCircle2,
  ChevronDown, ChevronUp, Search, Plus, Send,
  Server, ArrowRight, MessageSquare, RefreshCw,
  FileText, Image, Trash2, AlertTriangle,
  Fingerprint, ShieldOff
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import PullToRefreshWrapper from "@/components/PullToRefreshWrapper";
import NewTicketForm from "@/components/dashboard/NewTicketForm";
import BillingTab from "@/components/dashboard/BillingTab";
import SupportDocsTab from "@/components/dashboard/SupportDocsTab";
import ClientABRTab from "@/components/dashboard/ClientABRTab";
import ClientEndpointsTab from "@/components/dashboard/ClientEndpointsTab";
import DiagnosticsOverview from "@/components/dashboard/DiagnosticsOverview";
import BiometricLockScreen from "@/components/BiometricLockScreen";
import { useBiometricLock } from "@/hooks/useBiometricLock";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

// ─── Config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",   label: "Overview"        },
  { id: "tickets",    label: "Support Tickets"  },
  { id: "billing",    label: "Billing"          },
  { id: "docs",       label: "Support Docs"     },
  { id: "abr",        label: "Admin Access"     },
  { id: "endpoints",  label: "Endpoints"        },
  { id: "settings",   label: "Account Settings" },
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

const STATUS_CONFIG = {
  "new":               { label: "New",                color: "text-sky-400",     bg: "bg-sky-500/15",     dot: "bg-sky-400"     },
  "acknowledged":      { label: "Acknowledged",       color: "text-indigo-400",  bg: "bg-indigo-500/15",  dot: "bg-indigo-400"  },
  "open":              { label: "Open",               color: "text-amber-400",   bg: "bg-amber-500/15",   dot: "bg-amber-400"   },
  "in_progress":       { label: "In Progress",        color: "text-blue-400",    bg: "bg-blue-500/15",    dot: "bg-blue-400"    },
  "waiting_on_client": { label: "Waiting on You",     color: "text-orange-400",  bg: "bg-orange-500/15",  dot: "bg-orange-400"  },
  "waiting_on_vendor": { label: "Waiting on Vendor",  color: "text-yellow-400",  bg: "bg-yellow-500/15",  dot: "bg-yellow-400"  },
  "escalated":         { label: "Escalated",          color: "text-red-400",     bg: "bg-red-500/15",     dot: "bg-red-400"     },
  "on_hold":           { label: "On Hold",            color: "text-purple-400",  bg: "bg-purple-500/15",  dot: "bg-purple-400"  },
  "pending_approval":  { label: "Pending Approval",   color: "text-violet-400",  bg: "bg-violet-500/15",  dot: "bg-violet-400"  },
  "resolved":          { label: "Resolved",           color: "text-emerald-400", bg: "bg-emerald-500/15", dot: "bg-emerald-400" },
  "closed":            { label: "Closed",             color: "text-slate-400",   bg: "bg-slate-500/15",   dot: "bg-slate-400"   },
};

// Group statuses into display buckets for the filter pills
const FILTER_GROUPS = {
  "Active":   ["new", "acknowledged", "open", "in_progress", "escalated", "pending_approval"],
  "Waiting":  ["waiting_on_client", "waiting_on_vendor", "on_hold"],
  "Resolved": ["resolved", "closed"],
};

// Map local SupportTicket record to a display-friendly object
function localToDisplay(lt) {
  return {
    id: lt.id,
    subject: lt.title,
    description: lt.description,
    status: lt.status || "new",   // use the raw entity status value directly
    priority: lt.priority ? lt.priority.charAt(0).toUpperCase() + lt.priority.slice(1) : "Medium",
    ticketNumber: lt.id?.slice(-6).toUpperCase(),
    createdTime: lt.created_date,
    assigned_to_name: lt.assigned_to_name,
  };
}

function ThreadContent({ content }) {
  const plain = content.replace(/<[^>]*>/g, "");
  const parts = plain.split(/(--- Attachments ---[\s\S]*)/);
  const bodyText = parts[0].trim();
  const attachSection = parts[1] || "";
  const links = [...attachSection.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g)].map(m => ({ label: m[1], url: m[2] }));
  const isImg = (url) => /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);
  return (
    <div className="flex flex-col gap-2">
      {bodyText && <p>{bodyText}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors">
              {isImg(l.url) ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketThreads({ ticketId }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.TicketThread.filter({ ticket_id: ticketId }, "created_date", 50)
      .then(data => {
        setThreads(data.filter(t => t.is_public !== false));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticketId]);

  if (loading) return <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>;
  if (threads.length === 0) return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/30 rounded-xl px-4 py-3 border border-border/15">
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      Our team will review this shortly and respond via email.
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <MessageSquare className="w-3 h-3" /> Conversation
      </div>
      {threads.map((thread, i) => {
        const isAgent = thread.author_email !== thread.author_email?.match(/affinitysolution/i) ? false : true;
        const isAdmin = thread.is_ai_response || thread.author_email?.includes("affinitysolution");
        return (
          <div key={i} className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
            <div className="text-xs text-muted-foreground px-1">
              {thread.author_name || thread.author_email} · {new Date(thread.created_date).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isAdmin ? "bg-primary/15 text-foreground rounded-tr-sm" : "bg-card border border-border/50 rounded-tl-sm"
            }`}>
              <ThreadContent content={thread.content || ""} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ZohoTicketRow({ t, expanded, onToggle }) {
  const status = STATUS_CONFIG[t.status] || STATUS_CONFIG["new"];
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
            {t.assigned_to_name && <><span>·</span><span className="text-primary/70">Assigned: {t.assigned_to_name}</span></>}
          </div>
        </div>
        <div className="text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 pt-4 flex flex-col gap-4">
          {t.description && (
            <p className="text-sm text-foreground/75 leading-relaxed bg-background/40 rounded-xl px-4 py-3 border border-border/20">{t.description}</p>
          )}
          <TicketThreads ticketId={t.id} />
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
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const localTickets = await base44.entities.SupportTicket.filter({ client_email: userEmail }, "-created_date");
      setTickets(localTickets.map(localToDisplay));
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleTicketSuccess = () => {
    setShowForm(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
    loadTickets();
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === "all" || (FILTER_GROUPS[filter] && FILTER_GROUPS[filter].includes(t.status));
    const matchSearch = !search || t.subject?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const groupCounts = {
    Active:   tickets.filter(t => FILTER_GROUPS.Active.includes(t.status)).length,
    Waiting:  tickets.filter(t => FILTER_GROUPS.Waiting.includes(t.status)).length,
    Resolved: tickets.filter(t => FILTER_GROUPS.Resolved.includes(t.status)).length,
  };

  const groupDots = { Active: "bg-amber-400", Waiting: "bg-purple-400", Resolved: "bg-emerald-400" };

  return (
    <PullToRefreshWrapper onRefresh={loadTickets} className="flex flex-col gap-5">
      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Ticket submitted successfully! Our team will be in touch shortly.
        </div>
      )}

      {/* Status filter pills */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(groupCounts).map(([group, count]) => {
          const active = filter === group;
          return (
            <button key={group} onClick={() => setFilter(active ? "all" : group)}
              className={`p-3.5 rounded-xl border text-left transition-all ${active ? "border-primary/40 bg-primary/10" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-2 h-2 rounded-full ${groupDots[group]}`} />
                <span className="text-lg font-extrabold">{count}</span>
              </div>
              <div className="text-xs text-muted-foreground">{group}</div>
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
        <button onClick={loadTickets} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all glow-blue">
          <Plus className="w-3.5 h-3.5" /> New Ticket
        </button>
      </div>

      {/* New ticket form with AI assistant */}
      {showForm && (
        <NewTicketForm
          userEmail={userEmail}
          onSuccess={handleTicketSuccess}
          onCancel={() => setShowForm(false)}
        />
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
    </PullToRefreshWrapper>
  );
}

// ─── Account Settings Tab ───────────────────────────────────────────────────
function AccountSettingsTab({ user, biometric }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    await base44.auth.logout("/");
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Profile info */}
      <div className="p-5 rounded-2xl border border-border/40 bg-card/50 flex flex-col gap-1.5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Profile</div>
        <div className="text-sm font-medium">{user?.full_name || "—"}</div>
        <div className="text-sm text-muted-foreground">{user?.email}</div>
        <div className="text-xs text-muted-foreground mt-1">Role: <span className="capitalize">{user?.role || "user"}</span></div>
      </div>

      {/* Biometric Security */}
      {biometric.isSupported && (
        <div className="p-5 rounded-2xl border border-border/40 bg-card/50 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Biometric Lock</span>
            {biometric.isRegistered && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 ml-auto">Active</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {biometric.isRegistered
              ? "Your portal will automatically lock after 5 minutes of inactivity and require biometric verification to unlock."
              : "Enable Face ID or fingerprint unlock to secure your portal after periods of inactivity."
            }
          </p>
          {biometric.isRegistered ? (
            <button onClick={biometric.disable}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all w-fit">
              <ShieldOff className="w-3.5 h-3.5" /> Disable Biometric Lock
            </button>
          ) : (
            <button onClick={biometric.register}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition-all w-fit">
              <Fingerprint className="w-3.5 h-3.5" /> Enable Biometric Lock
            </button>
          )}
        </div>
      )}

      {/* Danger zone */}
      <div className="p-5 rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">Danger Zone</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Deleting your account will sign you out immediately. To permanently remove your data, please contact your administrator after confirming below.
        </p>
        {!showConfirm ? (
          <button onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-all w-fit">
            <Trash2 className="w-3.5 h-3.5" /> Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-3 bg-background/50 rounded-xl p-4 border border-destructive/20">
            <p className="text-xs text-muted-foreground">Type <strong className="text-foreground">DELETE</strong> to confirm:</p>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:border-destructive/60" />
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={confirmText !== "DELETE" || deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-all">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
              <button onClick={() => { setShowConfirm(false); setConfirmText(""); }}
                className="px-4 py-2 rounded-xl border border-border/50 text-sm hover:bg-card transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [endpoints, setEndpoints] = useState([]);

  const biometric = useBiometricLock();
  useRealtimeNotifications({ userEmail: user?.email, endpoints });

  const fetchData = async (currentUser) => {
    // Load services via team membership (RLS handles access control)
    const s = await base44.entities.ServiceUsage.list("-created_date");
    setServices(s);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!me) {
          base44.auth.redirectToLogin("/dashboard");
          return;
        }
        setUser(me);
        await fetchData(me);
      } catch (error) {
        // Only redirect if genuinely unauthenticated (401), not on every error
        if (error?.status === 401 || error?.response?.status === 401) {
          base44.auth.redirectToLogin("/dashboard");
          return;
        }
        console.error("Dashboard init error:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <img
          src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
          alt="AffinitySolution"
          className="h-9 w-auto relative z-10"
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
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
      <Toaster position="top-right" richColors closeButton />

      {/* Biometric lock screen overlay */}
      {biometric.isRegistered && biometric.isLocked && (
        <BiometricLockScreen
          unlocking={biometric.unlocking}
          error={biometric.error}
          onUnlock={biometric.unlock}
          onSkip={biometric.disable}
        />
      )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard icon={Ticket} label="Support Tickets" value="→" sub="Click to view your tickets" onClick={() => setActiveTab("tickets")} />
              <StatCard icon={CreditCard} label="Monthly Spend" value={`£${totalMonthly.toLocaleString()}`} sub={`${activeServices} active service${activeServices !== 1 ? "s" : ""}`} accent />
            </div>

            {/* Quick access to tickets */}
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Support Tickets</div>
                <div className="text-xs text-muted-foreground mt-0.5">View and manage your support requests</div>
              </div>
              <button onClick={() => setActiveTab("tickets")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                View Tickets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Diagnostics / Endpoint Health */}
            <DiagnosticsOverview
              userEmail={user?.email}
              onGoToEndpoints={() => setActiveTab("endpoints")}
            />

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

        {activeTab === "tickets" && <TicketsTab userEmail={user?.email} />}
        {activeTab === "billing" && <BillingTab services={services} userName={user?.full_name || user?.email} />}
        {activeTab === "docs" && <SupportDocsTab />}
        {activeTab === "abr" && <ClientABRTab />}
        {activeTab === "endpoints" && <ClientEndpointsTab userEmail={user?.email} />}
        {activeTab === "settings" && <AccountSettingsTab user={user} biometric={biometric} />}
      </div>
    </div>
  );
}