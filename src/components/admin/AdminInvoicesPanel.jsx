import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Plus, FileText, Search, Pencil, Trash2,
  CheckCircle2, Clock, AlertTriangle, XCircle, Send, RefreshCw,
  Calendar, PoundSterling, ChevronDown, ChevronUp
} from "lucide-react";

const STATUS_STYLE = {
  draft:    { bg: "bg-muted", text: "text-muted-foreground", icon: FileText, label: "Draft" },
  sent:     { bg: "bg-sky-500/10", text: "text-sky-400", icon: Clock, label: "Sent" },
  paid:     { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle2, label: "Paid" },
  overdue:  { bg: "bg-red-500/10", text: "text-red-400", icon: AlertTriangle, label: "Overdue" },
  cancelled:{ bg: "bg-muted/50", text: "text-muted-foreground/50", icon: XCircle, label: "Cancelled" },
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatCurrency(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n || 0);
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`p-4 rounded-xl border border-border/30 ${bg} flex items-start gap-3`}>
      <Icon className={`w-4 h-4 ${color} mt-0.5`} />
      <div>
        <div className="text-lg font-extrabold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function InvoiceForm({ invoice, onSave, onCancel, teams }) {
  const [form, setForm] = useState({
    invoice_number: invoice?.invoice_number || `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    client_email: invoice?.client_email || "",
    team_id: invoice?.team_id || "",
    amount: invoice?.amount || "",
    status: invoice?.status || "draft",
    issue_date: invoice?.issue_date ? invoice.issue_date.split("T")[0] : new Date().toISOString().split("T")[0],
    due_date: invoice?.due_date ? invoice.due_date.split("T")[0] : "",
    paid_date: invoice?.paid_date ? invoice.paid_date.split("T")[0] : "",
    description: invoice?.description || "",
    payment_method: invoice?.payment_method || "bank_transfer",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.invoice_number || !form.amount || !form.client_email) {
      setError("Invoice number, amount and client email are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (!payload.team_id) delete payload.team_id;
      if (invoice) {
        await base44.entities.Invoice.update(invoice.id, payload);
      } else {
        await base44.entities.Invoice.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg">{invoice ? "Edit Invoice" : "New Invoice"}</h3>
        {error && (
          <div className="text-sm px-3 py-2 rounded-xl bg-red-500/10 text-red-400">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Invoice #</span>
              <input
                value={form.invoice_number}
                onChange={e => setForm({...form, invoice_number: e.target.value})}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Amount (£)</span>
              <input
                type="number" step="0.01"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Client Email</span>
            <input
              value={form.client_email}
              onChange={e => setForm({...form, client_email: e.target.value})}
              placeholder="client@example.com"
              className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Team (optional)</span>
            <select
              value={form.team_id}
              onChange={e => setForm({...form, team_id: e.target.value})}
              className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
            >
              <option value="">No team</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Issue Date</span>
              <input
                type="date"
                value={form.issue_date}
                onChange={e => setForm({...form, issue_date: e.target.value})}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Due Date</span>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({...form, due_date: e.target.value})}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Status</span>
              <select
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
              >
                {Object.entries(STATUS_STYLE).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Paid Date</span>
              <input
                type="date"
                value={form.paid_date}
                onChange={e => setForm({...form, paid_date: e.target.value})}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {invoice ? "Save Changes" : "Create Invoice"}
            </button>
            <button type="button" onClick={onCancel}
              className="px-5 py-2 rounded-xl border border-border/50 text-sm hover:bg-card">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminInvoicesPanel() {
  const [invoices, setInvoices] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invData, teamData] = await Promise.all([
        base44.entities.Invoice.list("-issue_date", 200),
        base44.entities.Team.list(),
      ]);
      setInvoices(invData);
      setTeams(teamData);
    } catch (err) {
      console.error("Admin invoices load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete invoice ${inv.invoice_number}?`)) return;
    await base44.entities.Invoice.delete(inv.id);
    await load();
  };

  const handleStatusChange = async (inv, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === "paid") updates.paid_date = new Date().toISOString();
    await base44.entities.Invoice.update(inv.id, updates);
    await load();
  };

  const filtered = invoices.filter(inv => {
    if (filter !== "all" && inv.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.client_email?.toLowerCase().includes(q) ||
        inv.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRevenue = invoices
    .filter(i => i.status === "paid")
    .reduce((s, i) => s + (i.amount || 0), 0);
  const totalOutstanding = invoices
    .filter(i => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + (i.amount || 0), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl">
      {showForm && (
        <InvoiceForm
          invoice={editInvoice}
          teams={teams}
          onSave={() => { setShowForm(false); setEditInvoice(null); load(); }}
          onCancel={() => { setShowForm(false); setEditInvoice(null); }}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage client invoices and track payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => { setEditInvoice(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
            <Plus className="w-3.5 h-3.5" /> New Invoice
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={PoundSterling} label="Total Revenue" value={formatCurrency(totalRevenue)} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={Clock} label="Outstanding" value={formatCurrency(totalOutstanding)} color="text-amber-400" bg="bg-amber-500/10" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overdueCount} color="text-red-400" bg="bg-red-500/10" />
        <StatCard icon={FileText} label="All Invoices" value={invoices.length} color="text-primary" bg="bg-primary/10" />
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/50 text-muted-foreground hover:text-foreground"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Invoice list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No invoices found.</p>
        ) : (
          filtered.map(inv => (
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              onEdit={() => { setEditInvoice(inv); setShowForm(true); }}
              onDelete={() => handleDelete(inv)}
              onStatusChange={(s) => handleStatusChange(inv, s)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function InvoiceRow({ invoice, onEdit, onDelete, onStatusChange }) {
  const status = STATUS_STYLE[invoice.status] || STATUS_STYLE.draft;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/20 bg-card/20 hover:border-border/40 transition-all flex-wrap">
      <div className={`w-8 h-8 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}>
        <StatusIcon className={`w-3.5 h-3.5 ${status.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{invoice.invoice_number}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {invoice.client_email} · {formatDate(invoice.issue_date)} · Due {formatDate(invoice.due_date)}
        </div>
      </div>
      <div className="font-bold text-sm">{formatCurrency(invoice.amount)}</div>

      {/* Status quick actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {invoice.status === "draft" && (
          <button onClick={() => onStatusChange("sent")} title="Mark as Sent"
            className="p-1.5 rounded-lg hover:bg-sky-500/10 text-muted-foreground hover:text-sky-400 transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
        {(invoice.status === "sent" || invoice.status === "overdue") && (
          <button onClick={() => onStatusChange("paid")} title="Mark as Paid"
            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={onEdit} title="Edit"
          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} title="Delete"
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}