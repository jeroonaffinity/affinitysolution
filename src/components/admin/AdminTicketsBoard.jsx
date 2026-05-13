import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ticketService } from "@/lib/ticketService";
import Customer360Panel from "@/components/admin/Customer360Panel";
import TicketKanban from "@/components/admin/TicketKanban";
import TicketCreationWizard from "@/components/admin/TicketCreationWizard";
import {
  Loader2, RefreshCw, Search, Plus,
  Send, X, MessageSquare, Check,
  Filter, Sparkles, Monitor,
  Paperclip, FileText, Image, Bot, UserCheck
} from "lucide-react";
import { TICKET_STATUSES, PRIORITY_CONFIG } from "@/lib/slaConfig";
import SlaTimer from "@/components/admin/SlaTimer";

function StatusBadge({ status }) {
  const cfg = TICKET_STATUSES[status] || { color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label || status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority] || { color: "text-muted-foreground", bg: "bg-muted" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${cfg.bg} ${cfg.color}`}>{cfg.label || priority}</span>
  );
}

function ThreadContent({ content }) {
  const plain = content.replace(/<[^>]*>/g, "");
  const parts = plain.split(/(--- Attachments ---[\s\S]*)/);
  const bodyText = parts[0].trim();
  // Extract markdown links from attachment section
  const attachSection = parts[1] || "";
  const links = [...attachSection.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g)].map(m => ({ label: m[1], url: m[2] }));
  const isImage = (url) => /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);
  return (
    <div className="flex flex-col gap-2">
      {bodyText && <p>{bodyText}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20">
              {isImage(l.url) ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadPanel({ ticket, onClose }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority || "");
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to_email || "");
  const [adminUsers, setAdminUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("thread");
  const [teams, setTeams] = useState([]);
  const clientEmail = ticket.client_email;
  const ticketTeam = teams.find(t => t.id === ticket.team_id);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list(),
      base44.entities.Team.list(),
    ]).then(([users, ts]) => {
      setAdminUsers(users.filter(u => u.role === "admin"));
      setTeams(ts);
    });
  }, []);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    const msgs = await ticketService.getTicketMessages(ticket.id);
    // Sort oldest first for display
    setThreads((msgs || []).slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    setLoading(false);
  }, [ticket.id]);

  useEffect(() => {
    loadThreads();
    const unsub = base44.entities.TicketThread.subscribe((event) => {
      if (event.data?.ticket_id === ticket.id) loadThreads();
    });
    return unsub;
  }, [loadThreads]);

  const handleAttachFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
    setAttachments(prev => [...prev, ...uploaded.map(r => r.file_url)]);
    setUploading(false);
    e.target.value = "";
  };

  const sendReply = async () => {
    if (!reply.trim() && !attachments.length) return;
    setSending(true);
    const attachmentText = attachments.length
      ? "\n\n--- Attachments ---\n" + attachments.map((url, i) => `[File ${i + 1}](${url})`).join("\n")
      : "";
    const user = await base44.auth.me();
    await ticketService.addTicketMessage(ticket.id, {
      author_email: user.email,
      author_name: user.full_name || "Support Team",
      content: reply + attachmentText,
      is_public: true,
    });
    setReply("");
    setAttachments([]);
    setSending(false);
    loadThreads();
  };

  const generateAIReply = async () => {
    setGeneratingAI(true);
    const res = await base44.functions.invoke("aiTicketResponse", { ticket_id: ticket.id, preview_only: true });
    setAiPreview(res.data?.preview || "");
    setGeneratingAI(false);
  };

  const acceptAIDraft = () => {
    setReply(aiPreview);
    setAiPreview(null);
  };

  const updateTicket = async () => {
    setUpdating(true);
    const adminUser = adminUsers.find(u => u.email === assignedTo);
    await ticketService.updateTicket(ticket.id, {
      status,
      priority,
      assigned_to_email: assignedTo || null,
      assigned_to_name: adminUser?.full_name || assignedTo || null,
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
            <div className="text-xs text-muted-foreground mb-1">#{ticket.id?.slice(0, 8)}</div>
            <h2 className="font-bold text-base leading-tight">{ticket.title}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{ticket.category}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
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

        {/* Ticket meta + description */}
        <div className="px-6 py-4 border-b border-border/30 flex flex-col gap-3 text-sm">
          {/* SLA Timer */}
          <SlaTimer ticket={ticket} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Contact</div>
              <div className="font-medium truncate">{clientEmail || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Team</div>
              <div className="font-medium truncate flex items-center gap-1">
                {ticketTeam
                  ? <><span className="w-2 h-2 rounded-full bg-primary inline-block" />{ticketTeam.name}</>
                  : <span className="text-muted-foreground text-xs">No team linked</span>
                }
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Created</div>
              <div className="font-medium">{new Date(ticket.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none">
                {Object.entries(TICKET_STATUSES).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Priority</div>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none">
                <option value="">None</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Assigned Technician</div>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none">
                <option value="">Unassigned</option>
                {adminUsers.map(u => (
                  <option key={u.id} value={u.email}>{u.full_name || u.email}</option>
                ))}
              </select>
            </div>
          </div>
          {ticket.description && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Description</div>
              <div className="text-sm bg-muted/30 rounded-lg px-3 py-2 text-foreground/80 whitespace-pre-wrap">{ticket.description}</div>
            </div>
          )}
          <button onClick={updateTicket} disabled={updating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 self-start">
            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Save Changes
          </button>
        </div>

        {/* Thread tab */}
        {activeTab === "thread" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No messages yet.</div>
              ) : (
                threads.map((thread) => {
                  const isAdmin = thread.author_email !== clientEmail;
                  const isAI = thread.is_ai_response;
                  return (
                    <div key={thread.id} className={`flex flex-col gap-1.5 ${isAdmin ? "items-end" : "items-start"}`}>
                      <div className="text-xs text-muted-foreground px-1 flex items-center gap-1">
                        {isAI && <Sparkles className="w-3 h-3 text-primary" />}
                        {thread.author_name || thread.author_email} · {new Date(thread.created_date).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isAI ? "bg-primary/15 text-foreground rounded-tr-sm" :
                        isAdmin ? "bg-primary/20 text-foreground rounded-tr-sm" :
                        "bg-card border border-border/50 rounded-tl-sm"
                      }`}>
                        {thread.content}
                      </div>
                      {!thread.is_public && (
                        <span className="text-xs text-muted-foreground italic">(Internal note)</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-6 py-4 border-t border-border/40 flex-shrink-0">
              {/* AI Preview card */}
              {aiPreview && (
                <div className="mb-3 p-3 rounded-xl border border-primary/30 bg-primary/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Draft Preview</span>
                    <button onClick={() => setAiPreview(null)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                  </div>
                  <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{aiPreview}</p>
                  <button onClick={acceptAIDraft}
                    className="self-start flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold">
                    <Check className="w-3 h-3" /> Use this draft
                  </button>
                </div>
              )}
              <textarea
                rows={3}
                placeholder="Write a reply to the customer..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none"
              />
              {attachments.length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  {attachments.map((url, i) => {
                    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-3 py-1.5">
                        {isImage ? <Image className="w-3 h-3 text-primary/60" /> : <FileText className="w-3 h-3 text-primary/60" />}
                        <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary hover:underline">File {i + 1}</a>
                        <button onClick={() => setAttachments(a => a.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button onClick={generateAIReply} disabled={generatingAI}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-60 transition-colors">
                    {generatingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                    {generatingAI ? "Generating..." : "AI Draft"}
                  </button>
                  <label className={`flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
                    {uploading ? "Uploading..." : "Attach"}
                    <input type="file" multiple className="hidden" onChange={handleAttachFiles} accept="image/*,.pdf,.txt,.log,.zip,.docx,.xlsx" />
                  </label>
                </div>
                <button onClick={sendReply} disabled={sending || (!reply.trim() && !attachments.length)}
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
            {clientEmail || ticket.team_id
              ? <Customer360Panel email={clientEmail} teamId={ticket.team_id} />
              : (
                <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
                  <Monitor className="w-8 h-8 text-primary/20" />
                  <p className="text-sm text-muted-foreground">No client email linked to this ticket.</p>
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
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
    const t = await ticketService.listTickets();
    setTickets(t || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadTickets(); }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.client_email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });



  return (
    <div className="p-6 flex flex-col gap-5 max-w-6xl">
      {selectedTicket && (
        <ThreadPanel
          ticket={selectedTicket}
          onClose={() => { setSelectedTicket(null); loadTickets(); }}
        />
      )}
      {showCreate && (
        <TicketCreationWizard
          onClose={() => setShowCreate(false)}
          onCreated={loadTickets}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Support Tickets
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">All client support tickets in one view.</p>
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
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border/40 bg-background text-sm focus:outline-none">
          <option value="all">All Statuses</option>
          {Object.entries(TICKET_STATUSES).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <MessageSquare className="w-8 h-8 text-primary/30" />
          <p className="text-muted-foreground text-sm">{tickets.length === 0 ? "No tickets yet." : "No tickets match your filters."}</p>
        </div>
      ) : (
        <div>
          <div className="px-1 py-3 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Filter className="w-3.5 h-3.5" /> {filtered.length} ticket{filtered.length !== 1 ? "s" : ""} • Drag tickets between columns to update status
          </div>
          <TicketKanban
            tickets={filtered}
            onSelect={setSelectedTicket}
            onStatusUpdate={loadTickets}
          />
        </div>
      )}
    </div>
  );
}