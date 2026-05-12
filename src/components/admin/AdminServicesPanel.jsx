import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2, Server, Search, X, Pencil, Trash2, Check, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_COLORS = {
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  paused: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

const EMPTY_FORM = {
  team_id: "",
  service_name: "",
  monthly_cost: "",
  users: "",
  endpoints: "",
  billing_cycle: "monthly",
  status: "active",
  next_billing_date: "",
  description: "",
};

export default function AdminServicesPanel({ services, teams = [], onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || teamId || "—";

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    const teamName = getTeamName(s.team_id).toLowerCase();
    const matchSearch = !q || s.service_name?.toLowerCase().includes(q) || teamName.includes(q);
    const matchTeam = filterTeam === "all" || s.team_id === filterTeam;
    return matchSearch && matchTeam;
  });

  const totalMRR = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const totalARR = totalMRR * 12;
  const activeTeams = [...new Set(services.filter(s => s.status === "active").map(s => s.team_id).filter(Boolean))].length;

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
    setEditForm({
      status: s.status,
      monthly_cost: s.monthly_cost,
      users: s.users,
      endpoints: s.endpoints,
      next_billing_date: s.next_billing_date || "",
      description: s.description || "",
      team_id: s.team_id || "",
    });
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
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold mb-1">Services & Billing</h1>
        <p className="text-muted-foreground text-sm">
          {services.filter(s => s.status === "active").length} active services across {activeTeams} teams
        </p>
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
          <div className="text-xs text-muted-foreground mb-1">Active Teams</div>
          <div className="text-2xl font-extrabold">{activeTeams}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search services or teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/60"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {teams.length > 0 && (
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-44 rounded-xl border-border/60 bg-card text-sm">
              <SelectValue placeholder="All teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 p-5 rounded-2xl border border-primary/30 bg-primary/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Team selector */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Select value={form.team_id} onValueChange={v => setForm({ ...form, team_id: v })}>
              <SelectTrigger className="rounded-xl border-border/60 bg-background text-sm">
                <SelectValue placeholder="Select team *" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <input required placeholder="Service name" value={form.service_name}
            onChange={e => setForm({ ...form, service_name: e.target.value })}
            className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input required type="number" placeholder="Monthly cost (£)" value={form.monthly_cost}
            onChange={e => setForm({ ...form, monthly_cost: e.target.value })}
            className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input type="number" placeholder="No. of users" value={form.users}
            onChange={e => setForm({ ...form, users: e.target.value })}
            className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input type="number" placeholder="No. of endpoints" value={form.endpoints}
            onChange={e => setForm({ ...form, endpoints: e.target.value })}
            className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <Select value={form.billing_cycle} onValueChange={v => setForm({ ...form, billing_cycle: v })}>
            <SelectTrigger className="rounded-xl border-border/60 bg-background text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly billing</SelectItem>
              <SelectItem value="annual">Annual billing</SelectItem>
            </SelectContent>
          </Select>
          <input type="date" value={form.next_billing_date}
            onChange={e => setForm({ ...form, next_billing_date: e.target.value })}
            className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <textarea placeholder="Description (optional)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none resize-none sm:col-span-2 lg:col-span-3" />
          <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
            <button type="submit" disabled={saving || !form.team_id}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Service
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl border border-border/60 text-sm hover:bg-card">Cancel</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border/60">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Service</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Team</th>
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
                      <div className="col-span-2 sm:col-span-2">
                        <Select value={editForm.team_id} onValueChange={v => setEditForm({ ...editForm, team_id: v })}>
                          <SelectTrigger className="rounded-lg border-border/60 bg-background text-sm h-8">
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <input type="number" placeholder="Cost" value={editForm.monthly_cost}
                        onChange={e => setEditForm({ ...editForm, monthly_cost: e.target.value })}
                        className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                      <input type="number" placeholder="Users" value={editForm.users}
                        onChange={e => setEditForm({ ...editForm, users: e.target.value })}
                        className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                      <input type="number" placeholder="Endpoints" value={editForm.endpoints}
                        onChange={e => setEditForm({ ...editForm, endpoints: e.target.value })}
                        className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                      <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                        <SelectTrigger className="rounded-lg border-border/60 bg-background text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="date" value={editForm.next_billing_date}
                        onChange={e => setEditForm({ ...editForm, next_billing_date: e.target.value })}
                        className="px-2 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none col-span-2" />
                      <div className="col-span-2 flex gap-2 mt-1">
                        <button onClick={() => saveEdit(s.id)} disabled={editSaving}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
                          {editSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-card">Cancel</button>
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
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="w-3 h-3 shrink-0" />
                      {getTeamName(s.team_id)}
                    </div>
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
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => startEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteService(s.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all">
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