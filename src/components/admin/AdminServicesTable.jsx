import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Loader2 } from "lucide-react";

const statusColors = {
  active: "bg-green-500/15 text-green-400",
  paused: "bg-yellow-500/15 text-yellow-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function AdminServicesTable({ services, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_email: "", service_name: "", monthly_cost: "", users: "", endpoints: "", billing_cycle: "monthly", status: "active", next_billing_date: "" });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.ServiceUsage.create({
      ...form,
      monthly_cost: parseFloat(form.monthly_cost) || 0,
      users: parseInt(form.users) || 0,
      endpoints: parseInt(form.endpoints) || 0,
    });
    setShowForm(false);
    setSaving(false);
    onRefresh();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.ServiceUsage.update(id, { status });
    onRefresh();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-5 rounded-2xl border border-primary/30 bg-primary/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="Client email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none col-span-2" />
          <input required placeholder="Service name" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input required type="number" placeholder="Monthly cost (£)" value={form.monthly_cost} onChange={e => setForm({ ...form, monthly_cost: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input type="number" placeholder="Users" value={form.users} onChange={e => setForm({ ...form, users: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <input type="number" placeholder="Endpoints" value={form.endpoints} onChange={e => setForm({ ...form, endpoints: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <select value={form.billing_cycle} onChange={e => setForm({ ...form, billing_cycle: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none">
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
          <input type="date" placeholder="Next billing date" value={form.next_billing_date} onChange={e => setForm({ ...form, next_billing_date: e.target.value })} className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none" />
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
              {saving && <Loader2 className="w-3 h-3 animate-spin" />} Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-border/60 text-sm hover:bg-card">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {services.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No services found.</p>}
        {services.map(s => (
          <div key={s.id} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-semibold text-sm">{s.service_name}</div>
              <div className="text-xs text-muted-foreground">{s.client_email} · {s.users || 0} users · {s.endpoints || 0} endpoints · {s.billing_cycle}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s.status]}`}>{s.status}</span>
              <div className="font-bold text-sm">£{s.monthly_cost}/mo</div>
              <select
                value={s.status}
                onChange={e => updateStatus(s.id, e.target.value)}
                className="px-2 py-1 rounded-lg border border-border/60 bg-background text-xs focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}