import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Filter, ChevronDown, X, Clock, Zap, CheckCircle2, Archive } from "lucide-react";

const COLUMNS = [
  { id: "open", label: "Open", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { id: "in_progress", label: "In Progress", icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { id: "resolved", label: "Resolved", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  { id: "closed", label: "Closed", icon: Archive, color: "text-muted-foreground", bg: "bg-muted/30 border-border/40" },
];

const PRIORITY_COLORS = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/20 text-primary",
  high: "bg-orange-500/20 text-orange-400",
  critical: "bg-red-500/20 text-red-400",
};

const PRIORITY_DOT = {
  low: "bg-muted-foreground",
  medium: "bg-primary",
  high: "bg-orange-400",
  critical: "bg-red-500",
};

const CATEGORY_ICONS = {
  hardware: "🖥️", software: "💾", network: "🌐", email: "📧", security: "🔒", other: "📋",
};

export default function AdminTicketsBoard({ tickets, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.client_email?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchCategory = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchPriority && matchCategory;
  });

  const moveTicket = async (ticket, newStatus) => {
    await base44.entities.SupportTicket.update(ticket.id, { status: newStatus });
    onRefresh();
  };

  const openEdit = (t) => {
    setEditing(t.id);
    setEditForm({ status: t.status, priority: t.priority, resolution_notes: t.resolution_notes || "" });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    await base44.entities.SupportTicket.update(id, editForm);
    setEditing(null);
    setSaving(false);
    onRefresh();
  };

  return (
    <div className="p-6 flex flex-col h-full min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold mb-1">Support Tickets</h1>
        <p className="text-muted-foreground text-sm">{tickets.length} total · {tickets.filter(t => t.status === "open" || t.status === "in_progress").length} active</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search tickets, clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/60"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none">
          <option value="all">All Categories</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="network">Network</option>
          <option value="email">Email</option>
          <option value="security">Security</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {COLUMNS.map(col => {
          const colTickets = filtered.filter(t => t.status === col.id);
          const ColIcon = col.icon;
          return (
            <div key={col.id} className={`rounded-2xl border p-4 flex flex-col gap-3 ${col.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <ColIcon className={`w-4 h-4 ${col.color}`} />
                <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                <span className="ml-auto text-xs font-bold bg-background/40 px-2 py-0.5 rounded-full">{colTickets.length}</span>
              </div>

              {colTickets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground/50 text-xs">No tickets</div>
              )}

              {colTickets.map(t => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  editing={editing === t.id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onEdit={openEdit}
                  onSave={saveEdit}
                  onCancel={() => setEditing(null)}
                  saving={saving}
                  onMove={moveTicket}
                  columns={COLUMNS}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TicketCard({ ticket: t, editing, editForm, setEditForm, onEdit, onSave, onCancel, saving, onMove, columns }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border/60 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
      <div className="flex items-start gap-2">
        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{t.title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.client_email}</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium">
          {CATEGORY_ICONS[t.category]} {t.category}
        </span>
        <span className="text-[10px] text-muted-foreground/60 ml-auto">{new Date(t.created_date).toLocaleDateString("en-GB")}</span>
      </div>

      {t.description && (
        <div>
          <p className={`text-[11px] text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>{t.description}</p>
          {t.description.length > 80 && (
            <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-primary mt-0.5">
              {expanded ? "less" : "more"}
            </button>
          )}
        </div>
      )}

      {t.resolution_notes && (
        <div className="text-[11px] bg-green-500/10 text-green-400 rounded-lg px-2 py-1.5">
          ✓ {t.resolution_notes}
        </div>
      )}

      {editing ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
          <select
            value={editForm.status}
            onChange={e => setEditForm({ ...editForm, status: e.target.value })}
            className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none w-full"
          >
            {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select
            value={editForm.priority}
            onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
            className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none w-full"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <textarea
            rows={2}
            placeholder="Resolution notes..."
            value={editForm.resolution_notes}
            onChange={e => setEditForm({ ...editForm, resolution_notes: e.target.value })}
            className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-xs focus:outline-none resize-none w-full"
          />
          <div className="flex gap-1.5">
            <button onClick={() => onSave(t.id)} disabled={saving} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Save
            </button>
            <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-background">✕</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5 pt-1 border-t border-border/30">
          <button onClick={() => onEdit(t)} className="flex-1 py-1 rounded-lg text-[11px] text-primary hover:bg-primary/10 transition-all font-medium">Edit</button>
          <div className="flex gap-1">
            {columns.filter(c => c.id !== t.status).map(c => {
              const Icon = c.icon;
              return (
                <button key={c.id} onClick={() => onMove(t, c.id)} title={`Move to ${c.label}`} className={`p-1.5 rounded-lg hover:bg-background transition-all ${c.color}`}>
                  <Icon className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}