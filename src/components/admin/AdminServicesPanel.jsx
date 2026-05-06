import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2, Server, Search, X, Pencil, Trash2, Check } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  paused: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

const EMPTY_FORM = { client_email: "", service_name: "", monthly_cost: "", users: "", endpoints: "", billing_cycle: "monthly", status: "active", next_billing_date: "" };

export default function AdminServicesPanel({ services, users, onRefresh }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    return !q || s.service_name?.toLowerCase().includes(q) || s.client_email?.toLowerCase().includes(q);
  });

  const totalMRR = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const totalARR = totalMRR * 12;

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.ServiceUsage.create({
      ...form,
      monthly_cost: parseFloat(form.monthly_cost) || 0,
      users: parseInt(form.users) || 0,
      endpoints: parseInt(form.endpoints) || 0,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    onRefresh();
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ status: s.status, monthly_cost: s.monthly_cost, users: s.users, endpoints: s.endpoints, next_billing_date: s.next_billing_date || "" });
  };

  const saveEdit = async (id) => {
    setEditSaving(true);
    await base44.entities.ServiceUsage.update(id, {
      ...editForm,
      monthly_cost: parseFloat(editForm.monthly_cost) || 0,
      users: parseInt(editForm.users) || 0,
      endpoints: parseInt(editForm.endpoints) || 0,
    });
    setEditingId(null);
    setEditSaving(false);
    onRefresh();
  };

  const deleteService = async (id) => {
    if (!window.confirm("Remove this service?")) return;
    await base44.entities.ServiceUsage.delete(id);
    onRefresh();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold mb-1">Services & Billing</h1>
        <p className="text-muted-foreground text-sm">{services.filter(s => s.status === "active").length} active services across {[...new Set(services.map(s => s.client_email))].length} clients</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Monthly Recurring Revenue</div>
          <div className="text-2xl font-extrabold text-gradient">£{totalMRR.toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Annual Recurring Revenue</div>
          <div className="text-2xl font-extrabold">£{totalARR.toLocaleString()}</div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Active Clients</div>
          <div className="text-2xl font-extrabold">{[...new Set(services.filter(s=>s.status==="active").map(s => s.client_email))].length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search services or clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/60"
          />
          {search && <button onClick={() => setSearch("")}><X className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 p-5 rounded-2xl border border-primary/30 bg-primary/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input required type="email" placeholder="Client email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none sm:col-span-2 lg:col-span-1" />
          <input required placeholder="Service name" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input required type="number" placeholder="Monthly cost (£)" value={form.monthly_cost} onChange={e => setForm({ ...form, monthly_cost: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input type="number" placeholder="No. of users" value={form.users} onChange={e => setForm({ ...form, users: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input type="number" placeholder="No. of endpoints" value={form.endpoints} onChange={e => setForm({ ...form, endpoints: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <select value={form.billing_cycle} onChange={e => setForm({ ...form, billing_cycle: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none">
            <option value="monthly">Monthly billing</option>
            <option value="annual">Annual billing</option>
          </select>
          <input type="date" value={form.next_billing_date} onChange={e => setForm({ ...form, next_billing_date: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Service
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-border/60 text-sm hover:bg-card">Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border/60">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Service</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Details</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cost</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No services found.</td></tr>
            )}
            {filtered.map(s => (
              editingId === s.id ? (
                <tr key={s.id} className="bg-primary/5">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input type="number" placeholder="Cost" value={editForm.monthly_cost} onChange={e => setEditForm({ ...editForm, monthly_cost: e.target.value })} className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                      <input type="number" placeholder="Users" value={editForm.users} onChange={e => setEditForm({ ...editForm, users: e.target.value })} className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                      <input type="number" placeholder="Endpoints" value={editForm.endpoints} onChange={e => setEditForm({ ...editForm, endpoints: e.target.value })} className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                      <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none">
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <input type="date" value={editForm.next_billing_date} onChange={e => setEditForm({ ...editForm, next_billing_date: e.target.value })} className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none col-span-2" />
                      <div className="col-span-2 flex gap-2">
                        <button onClick={() => saveEdit(s.id)} disabled={editSaving} className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
                          {editSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-card">Cancel</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{s.service_name}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{s.billing_cycle}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-muted-foreground">{s.client_email}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-xs text-muted-foreground">
                      {s.users > 0 && <span>{s.users} users · </span>}
                      {s.endpoints > 0 && <span>{s.endpoints} endpoints</span>}
                      {s.next_billing_date && <div>Next: {new Date(s.next_billing_date).toLocaleDateString("en-GB")}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold">£{(s.monthly_cost || 0).toLocaleString()}/mo</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteService(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}