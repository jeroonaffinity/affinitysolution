import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2 } from "lucide-react";

const statusColors = {
  open: "bg-yellow-500/15 text-yellow-400",
  in_progress: "bg-blue-500/15 text-blue-400",
  resolved: "bg-green-500/15 text-green-400",
  closed: "bg-muted text-muted-foreground",
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/15 text-primary",
  high: "bg-orange-500/15 text-orange-400",
  critical: "bg-red-500/15 text-red-400",
};

export default function TicketsSection({ tickets, userEmail, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", category: "other" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.SupportTicket.create({ ...form, client_email: userEmail, status: "open" });
    setForm({ title: "", description: "", priority: "medium", category: "other" });
    setShowForm(false);
    setLoading(false);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Support Tickets</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col gap-3">
          <input
            required
            placeholder="Issue title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60"
          />
          <textarea
            rows={3}
            placeholder="Describe the issue..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none"
            >
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
              <option value="email">Email</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit Ticket
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-border/60 text-sm hover:bg-card transition-all">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {tickets.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No support tickets yet. Raise one above if you need help.</p>
        )}
        {tickets.map((t) => (
          <div key={t.id} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="font-semibold text-sm">{t.title}</div>
              <div className="flex gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span>
              </div>
            </div>
            {t.description && <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>}
            {t.resolution_notes && (
              <div className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2 mt-1">
                <span className="font-semibold">Resolution: </span>{t.resolution_notes}
              </div>
            )}
            <div className="text-xs text-muted-foreground/60 mt-1">
              #{t.id?.slice(-6)} · {t.category} · {new Date(t.created_date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}