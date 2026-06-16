import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, FileText, Download, Clock, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Calendar, PoundSterling } from "lucide-react";

const STATUS_STYLE = {
  draft:    { bg: "bg-muted", text: "text-muted-foreground", icon: FileText, label: "Draft" },
  sent:     { bg: "bg-sky-500/10", text: "text-sky-400", icon: Clock, label: "Sent" },
  paid:     { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: CheckCircle2, label: "Paid" },
  overdue:  { bg: "bg-red-500/10", text: "text-red-400", icon: AlertTriangle, label: "Overdue" },
  cancelled:{ bg: "bg-muted/50", text: "text-muted-foreground/50", icon: XCircle, label: "Cancelled" },
};

const STATUS_FILTERS = [
  { value: "all", label: "All Invoices" },
  { value: "paid", label: "Paid" },
  { value: "sent", label: "Sent" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatCurrency(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n || 0);
}

export default function InvoicesTab({ userEmail, teamId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Invoice.list("-issue_date", 100);
        setInvoices(data);
      } catch (err) {
        console.error("Invoices load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = invoices.filter(inv => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const totalDue = invoices
    .filter(i => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + (i.amount || 0), 0);

  const totalPaid = invoices
    .filter(i => i.status === "paid")
    .reduce((s, i) => s + (i.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <FileText className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={Clock}
          label="Outstanding"
          value={formatCurrency(totalDue)}
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Paid (YTD)"
          value={formatCurrency(totalPaid)}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <SummaryCard
          icon={FileText}
          label="Total Invoices"
          value={invoices.length}
          color="text-primary"
          bg="bg-primary/10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "border border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No invoices match this filter.
          </p>
        ) : (
          filtered.map(inv => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              expanded={expandedId === inv.id}
              onToggle={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg }) {
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

function InvoiceCard({ invoice, expanded, onToggle }) {
  const status = STATUS_STYLE[invoice.status] || STATUS_STYLE.draft;
  const StatusIcon = status.icon;
  const isOverdue = invoice.status === "overdue" || (invoice.status === "sent" && new Date(invoice.due_date) < new Date());

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isOverdue ? "border-red-500/25 bg-red-500/5" :
      invoice.status === "paid" ? "border-emerald-500/15 bg-emerald-500/5" :
      "border-border/20 bg-card/20"
    }`}>
      <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={onToggle}>
        <div className={`w-8 h-8 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}>
          <StatusIcon className={`w-4 h-4 ${status.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{invoice.invoice_number}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {formatDate(invoice.issue_date)} — Due {formatDate(invoice.due_date)}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-bold text-sm ${isOverdue ? "text-red-400" : ""}`}>
            {formatCurrency(invoice.amount)}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/20 pt-3 flex flex-col gap-3">
          {invoice.description && (
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</div>
              <p className="text-sm whitespace-pre-wrap">{invoice.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Issued</div>
              <div className="font-medium flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                {formatDate(invoice.issue_date)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Due Date</div>
              <div className={`font-medium ${isOverdue ? "text-red-400" : ""}`}>
                {formatDate(invoice.due_date)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Paid Date</div>
              <div className="font-medium">{formatDate(invoice.paid_date)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Amount</div>
              <div className="font-bold flex items-center gap-1">
                <PoundSterling className="w-3 h-3" />
                {formatCurrency(invoice.amount)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}