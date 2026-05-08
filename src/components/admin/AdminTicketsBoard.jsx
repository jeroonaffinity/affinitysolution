import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import Customer360Panel from "@/components/admin/Customer360Panel";
import {
  Loader2, RefreshCw, Search, Plus, ChevronDown,
  Send, X, MessageSquare,
  User, Calendar, Tag, Filter, Sparkles, Monitor
} from "lucide-react";

const ORG_ID = "20114459933";

const STATUS_CONFIG = {
  Open:        { color: "text-amber-400",  bg: "bg-amber-500/15",   border: "border-amber-500/30",   dot: "bg-amber-400"   },
  "In Progress":{ color: "text-blue-400",  bg: "bg-blue-500/15",    border: "border-blue-500/30",    dot: "bg-blue-400"    },
  "On Hold":   { color: "text-purple-400", bg: "bg-purple-500/15",  border: "border-purple-500/30",  dot: "bg-purple-400"  },
  Closed:      { color: "text-slate-400",  bg: "bg-slate-500/15",   border: "border-slate-500/30",   dot: "bg-slate-400"   },
};

const PRIORITY_CONFIG = {
  High:    { color: "text-red-400",    bg: "bg-red-500/15"    },
  Medium:  { color: "text-amber-400",  bg: "bg-amber-500/15"  },
  Low:     { color: "text-emerald-400",bg: "bg-emerald-500/15"},
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority] || { color: "text-muted-foreground", bg: "bg-muted" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>{priority}</span>
  );
}

function ThreadPanel({ ticket, onClose }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority || "");
  const [activeTab, setActiveTab] = useState("thread");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    const res = await base44.functions.invoke("zohoDesk", {
      action: "get_threads", orgId: ORG_ID, ticketId: ticket.id,
    });
    setThreads(res.data?.data?.data || []);
    setLoading(false);
  }, [ticket.id]);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    const res = await base44.functions.invoke("zohoDesk", {
      action: "analyze_ticket", orgId: ORG_ID, ticketId: ticket.id,
    });
    setAnalysis(res.data);
    if (res.data?.changed) setPriority(res.data.priority);
    setAnalyzing(false);
  }, [ticket.id]);

  useEffect(() => {
    loadThreads();
    runAnalysis();
  }, [loadThreads, runAnalysis]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await base44.functions.invoke("zohoDesk", {
      action: "add_reply", orgId: ORG_ID, ticketId: ticket.id,
      data: { content: reply, isPublic: true, channel: "EMAIL" },
    });
    setReply("");
    setSending(false);
    loadThreads();
  };

  const updateTicket = async () => {
    setUpdating(true);
    const updateData = {};
    if (status !== ticket.status) updateData.status = status;
    if (priority !== ticket.priority) updateData.priority = priority;
    await base44.functions.invoke("zohoDesk", {
      action: "update_ticket", orgId: ORG_ID, ticketId: ticket.id, data: updateData,
    });
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full bg-card border-l border-border/50 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/40 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-1">#{ticket.ticketNumber}</div>
            <h2 className="font-bold text-base leading-tight">{ticket.subject}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.channel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{ticket.channel}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {analysis && (
              <span className="text-xs px-2 py-1 rounded-lg bg-primary/15 text-primary font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {analysis.classification}
              </span>
            )}
            {analyzing && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-border/30 flex-shrink-0">
          {[
            { id: "thread", label: "Thread", icon: MessageSquare },
            { id: "customer360", label: "Customer 360", icon: Monitor },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-all ${
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Ticket meta */}
        <div className="px-6 py-4 border-b border-border/30 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Contact</div>
            <div className="font-medium truncate">{ticket.contact?.firstName} {ticket.contact?.lastName || ticket.email || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Created</div>
            <div className="font-medium">{new Date(ticket.createdTime).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>

          {/* Inline controls */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Status</div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none">
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Priority</div>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none">
              <option value="">None</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="col-span-2">
            <button onClick={updateTicket} disabled={updating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
              {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </div>

        {/* Thread tab */}
        {activeTab === "thread" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No thread history yet.</div>
              ) : (
                threads.map((thread, i) => {
                  const isAgent = thread.type === "agentReply";
                  return (
                    <div key={i} className={`flex flex-col gap-1.5 ${isAgent ? "items-end" : "items-start"}`}>
                      <div className="text-xs text-muted-foreground px-1">
                        {isAgent ? "You (AffinitySolution)" : thread.author?.name || "Customer"} · {new Date(thread.createdTime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isAgent ? "bg-primary/15 text-foreground rounded-tr-sm" : "bg-card border border-border/50 rounded-tl-sm"
                      }`}>
                        <div dangerouslySetInnerHTML={{ __html: thread.content?.replace(/<[^>]*>/g, '') || thread.summary || "" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-6 py-4 border-t border-border/40 flex-shrink-0">
              <textarea
                rows={3}
                placeholder="Write a reply to the customer..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">Reply will be sent via Email</span>
                <button onClick={sendReply} disabled={sending || !reply.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send Reply
                </button>
              </div>
            </div>
          </>
        )}

        {/* Customer 360 tab */}
        {activeTab === "customer360" && (
          <div className="flex-1 overflow-y-auto">
            <Customer360Panel email={ticket.email || ticket.contact?.email} />
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ subject: "", description: "", priority: "Medium", email: "", contactId: "" });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.functions.invoke("zohoDesk", {
      action: "create_ticket", orgId: ORG_ID,
      data: {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        email: form.email,
        departmentId: "238671000000007061",
        status: "Open",
        channel: "Phone",
      },
    });
    setSaving(false);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">Create Ticket</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Client Email *</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              placeholder="client@company.com"
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Subject *</label>
            <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
              placeholder="Brief summary of the issue"
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Detailed description..."
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create Ticket
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border border-border/50 text-sm hover:bg-muted">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketRow({ ticket, onClick }) {
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG["Open"];
  return (
    <button onClick={() => onClick(ticket)}
      className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-card/60 border-b border-border/20 transition-all group">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm group-hover:text-primary transition-colors">{ticket.subject}</span>
          <span className="text-xs text-muted-foreground/60">#{ticket.ticketNumber}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {ticket.contact?.firstName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.contact.firstName} {ticket.contact.lastName || ""}</span>}
          {ticket.email && !ticket.contact?.firstName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.email}</span>}
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ticket.createdTime).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
          {ticket.channel && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{ticket.channel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
        <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground -rotate-90 transition-all" />
      </div>
    </button>
  );
}

export default function AdminTicketsBoard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const res = await base44.functions.invoke("zohoDesk", {
      action: "list_tickets", orgId: ORG_ID, limit: 100,
    });
    setTickets(res.data?.data?.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadTickets(); }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.subject?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) ||
      t.contact?.firstName?.toLowerCase().includes(q) || t.ticketNumber?.toString().includes(q);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const counts = {
    open: tickets.filter(t => t.status === "Open").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    onHold: tickets.filter(t => t.status === "On Hold").length,
    closed: tickets.filter(t => t.status === "Closed").length,
  };

  return (
    <div className="p-6 flex flex-col gap-5 max-w-6xl">
      {selectedTicket && (
        <ThreadPanel
          ticket={selectedTicket}
          onClose={() => { setSelectedTicket(null); loadTickets(); }}
        />
      )}
      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={loadTickets}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Zoho Desk Tickets
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live from Zoho Desk — all client tickets in one view.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadTickets} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" /> New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open", value: counts.open, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "In Progress", value: counts.inProgress, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "On Hold", value: counts.onHold, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Closed", value: counts.closed, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
        ].map(s => (
          <button key={s.label} onClick={() => setStatusFilter(statusFilter === s.label ? "all" : s.label)}
            className={`p-4 rounded-2xl border text-left transition-all hover:-translate-y-0.5 ${statusFilter === s.label ? "ring-1 ring-primary/40 " : ""}${s.bg}`}>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Search by subject, email, ticket #..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border/40 bg-background text-sm focus:outline-none">
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <MessageSquare className="w-8 h-8 text-primary/30" />
          <p className="text-muted-foreground text-sm">{tickets.length === 0 ? "No tickets found in Zoho Desk." : "No tickets match your filters."}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/40 bg-card/30 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
            <span>Click a ticket to view threads & reply</span>
          </div>
          {filtered.map(ticket => (
            <TicketRow key={ticket.id} ticket={ticket} onClick={setSelectedTicket} />
          ))}
        </div>
      )}
    </div>
  );
}