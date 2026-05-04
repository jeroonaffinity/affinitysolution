import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

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

export default function AdminTicketsTable({ tickets, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const startEdit = (t) => {
    setEditing(t.id);
    setForm({ status: t.status, resolution_notes: t.resolution_notes || "" });
  };

  const save = async (id) => {
    setSaving(true);
    await base44.entities.SupportTicket.update(id, form);
    setEditing(null);
    setSaving(false);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {tickets.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No tickets found.</p>}
      {tickets.map((t) => (
        <div key={t.id} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-semibold text-sm">{t.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.client_email} · {t.category} · {new Date(t.created_date).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[t.status]}`}>{t.status.replace("_", " ")}</span>
            </div>
          </div>

          {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}

          {editing === t.id ? (
            <div className="flex flex-col gap-2 mt-1">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <textarea
                rows={2}
                placeholder="Resolution notes..."
                value={form.resolution_notes}
                onChange={(e) => setForm({ ...form, resolution_notes: e.target.value })}
                className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => save(t.id)} disabled={saving} className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />} Save
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-card">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              {t.resolution_notes
                ? <span className="text-xs text-green-400">Note: {t.resolution_notes}</span>
                : <span />}
              <button onClick={() => startEdit(t)} className="text-xs text-primary hover:underline">Update</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}