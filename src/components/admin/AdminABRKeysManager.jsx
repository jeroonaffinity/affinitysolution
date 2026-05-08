import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Loader2, Key, Check } from "lucide-react";

const EMPTY = { client_email: "", abr_api_key: "", label: "", abr_datacenter: "dc3" };

export default function AdminABRKeysManager({ users }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ClientABRKey.list("-created_date");
    setKeys(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.ClientABRKey.create(form);
    setForm(EMPTY);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this ABR key?")) return;
    await base44.entities.ClientABRKey.delete(id);
    load();
  };

  const clientUsers = users?.filter(u => u.role === "user") || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Client ABR Keys</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Assign an Admin By Request API key to each client.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Add Key
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl border border-primary/25 bg-primary/5 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Client</label>
              {clientUsers.length > 0 ? (
                <select
                  required
                  value={form.client_email}
                  onChange={e => setForm({ ...form, client_email: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
                >
                  <option value="">Select client...</option>
                  {clientUsers.map(u => (
                    <option key={u.id} value={u.email}>{u.full_name || u.email}</option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  type="email"
                  placeholder="client@company.com"
                  value={form.client_email}
                  onChange={e => setForm({ ...form, client_email: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
                />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Label (optional)</label>
              <input
                placeholder="e.g. Acme Corp"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground">ABR API Key</label>
              <input
                required
                placeholder="Paste API key..."
                value={form.abr_api_key}
                onChange={e => setForm({ ...form, abr_api_key: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Datacenter</label>
              <select
                value={form.abr_datacenter}
                onChange={e => setForm({ ...form, abr_datacenter: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
              >
                <option value="dc1">DC1 (US/Global)</option>
                <option value="dc2">DC2 (EU)</option>
                <option value="dc3">DC3 (Australia)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border/60 text-xs hover:bg-card">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : keys.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No client keys yet. Add one above.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map(k => (
            <div key={k.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card/40">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{k.label || k.client_email}</div>
                <div className="text-xs text-muted-foreground">{k.client_email} · {k.abr_datacenter?.toUpperCase()}</div>
              </div>
              <div className="text-xs font-mono text-muted-foreground bg-background/60 px-2 py-1 rounded-lg border border-border/30 truncate max-w-[140px]">
                {k.abr_api_key.slice(0, 8)}••••••••
              </div>
              <button onClick={() => handleDelete(k.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}