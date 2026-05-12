import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Ticket, CreditCard, Loader2, LogOut,
  TicketCheck, Clock, CheckCircle2,
  ChevronDown, ChevronUp, Search, Plus, Send,
  Server, ArrowRight, MessageSquare, RefreshCw,
  Paperclip, X, FileText, Image, Trash2, AlertTriangle,
  Fingerprint, ShieldOff
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import PullToRefreshWrapper from "@/components/PullToRefreshWrapper";
import BillingTab from "@/components/dashboard/BillingTab";
import SupportDocsTab from "@/components/dashboard/SupportDocsTab";
import ClientABRTab from "@/components/dashboard/ClientABRTab";
import ClientEndpointsTab from "@/components/dashboard/ClientEndpointsTab";
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

const ORG_ID = "20114459933";

const STATUS_CONFIG = {
  "Open":        { label: "Open",        color: "text-amber-400",   bg: "bg-amber-500/15",   dot: "bg-amber-400"   },
  "In Progress": { label: "In Progress", color: "text-blue-400",    bg: "bg-blue-500/15",    dot: "bg-blue-400"    },
  "On Hold":     { label: "On Hold",     color: "text-purple-400",  bg: "bg-purple-500/15",  dot: "bg-purple-400"  },
  "Closed":      { label: "Closed",      color: "text-slate-400",   bg: "bg-slate-500/15",   dot: "bg-slate-400"   },
};

// Map local SupportTicket record to a display-friendly object
function localToDisplay(lt) {
  return {
    id: lt.zoho_ticket_id || lt.id,
    _localId: lt.id,
    subject: lt.title,
    description: lt.description,
    status: lt.zoho_status || (lt.status === "open" ? "Open" : lt.status === "in_progress" ? "In Progress" : lt.status === "on_hold" ? "On Hold" : "Closed"),
    priority: lt.zoho_priority || (lt.priority ? lt.priority.charAt(0).toUpperCase() + lt.priority.slice(1) : "Medium"),
    ticketNumber: lt.zoho_ticket_number,
    channel: lt.zoho_channel,
    createdTime: lt.zoho_created_time || lt.created_date,
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
    base44.functions.invoke("zohoDesk", {
      action: "get_threads", orgId: ORG_ID, ticketId,
    }).then(res => {
      setThreads(res.data?.data?.data || []);
      setLoading(false);
    });
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
        const isAgent = thread.type === "agentReply";
        return (
          <div key={i} className={`flex flex-col gap-1 ${isAgent ? "items-end" : "items-start"}`}>
            <div className="text-xs text-muted-foreground px-1">
              {isAgent ? "AffinitySolution" : "You"} · {new Date(thread.createdTime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isAgent ? "bg-primary/15 text-foreground rounded-tr-sm" : "bg-card border border-border/50 rounded-tl-sm"
            }`}>
              <ThreadContent content={thread.content || thread.summary || ""} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ZohoTicketRow({ t, expanded, onToggle }) {
  const status = STATUS_CONFIG[t.status] || STATUS_CONFIG["Open"];
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
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "Medium" });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    // Find the user's team, then load all tickets for that team
    const teams = await base44.entities.Team.list();
    const myTeam = teams.find(t => t.member_emails?.includes(userEmail));
    let localTickets = [];
    if (myTeam) {
      localTickets = await base44.entities.SupportTicket.filter({ team_id: myTeam.id }, "-created_date");
    } else {
      // Fallback: load by email if not in a team
      localTickets = await base44.entities.SupportTicket.filter({ client_email: userEmail }, "-created_date");
    }
    setTickets(localTickets.map(localToDisplay));
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(
      files.map(f => base44.integrations.Core.UploadFile({ file: f }))
    );
    setAttachments(prev => [...prev, ...uploaded.map(r => r.file_url)]);
    setUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const attachmentText = attachments.length
        ? "\n\n--- Attachments ---\n" + attachments.map((url, i) => `[File ${i + 1}](${url})`).join("\n")
        : "";
      await base44.functions.invoke("zohoDesk", {
        action: "create_ticket", orgId: ORG_ID,
        data: {
          subject: form.subject,
          description: form.description + attachmentText,
          priority: form.priority,
          email: userEmail,
          clientEmail: userEmail,
          departmentId: "238671000000007061",
          status: "Open",
          channel: "Portal",
        },
      });
      setForm({ subject: "", description: "", priority: "Medium" });
      setAttachments([]);
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
    <PullToRefreshWrapper onRefresh={loadTickets} className="flex flex-col gap-5">
      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Ticket submitted successfully! Our team will be in touch shortly.
        </div>
      )}

      {/* Status filter pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
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
        <button onClick={loadTickets} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
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
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger className="rounded-xl border-border/50 bg-background text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Attachments */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">Attachments</label>
              <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border/60 bg-background text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-all w-fit ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                {uploading ? "Uploading..." : "Attach files"}
                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.txt,.log,.zip,.docx,.xlsx" />
              </label>
              {attachments.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {attachments.map((url, i) => {
                    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-3 py-1.5">
                        {isImage ? <Image className="w-3 h-3 text-primary/60" /> : <FileText className="w-3 h-3 text-primary/60" />}
                        <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary hover:underline">File {i + 1}</a>
                        <button type="button" onClick={() => setAttachments(a => a.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
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
    const email = currentUser.email;
    const s = await base44.entities.ServiceUsage.filter({ client_email: email }, "-created_date");
    setServices(s);
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