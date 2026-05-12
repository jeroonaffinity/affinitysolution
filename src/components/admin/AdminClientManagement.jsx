import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

import {
  Plus, Trash2, Loader2, Check, Users, X, Search,
  Building2, Server, Ticket, CreditCard, Pencil,
  ShieldAlert, Monitor, Mail, Shield, ShieldOff,
  Crown, AlertTriangle, UserPlus
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TeamOnboardingWizard from "./TeamOnboardingWizard";

const DEFAULT_ACTION1_ORG = "3fa05c66-f12c-4759-b991-346a4d300e42";

const EMPTY_TEAM_FORM = {
  name: "",
  member_emails: [],
  abr_api_key: "",
  abr_datacenter: "dc3",
  action1_org_id: DEFAULT_ACTION1_ORG,
  action1_group_id: "",
  action1_group_name: "",
};

const EMPTY_SERVICE_FORM = {
  service_name: "",
  monthly_cost: "",
  users: "",
  endpoints: "",
  billing_cycle: "monthly",
  status: "active",
  next_billing_date: "",
};

const TICKET_STATUS = {
  open: { color: "text-amber-400", bg: "bg-amber-500/15" },
  in_progress: { color: "text-blue-400", bg: "bg-blue-500/15" },
  resolved: { color: "text-emerald-400", bg: "bg-emerald-500/15" },
  closed: { color: "text-slate-400", bg: "bg-slate-500/15" },
};

// ─── Team Detail Slide-Over ──────────────────────────────────────────────────
function TeamDetailPanel({ team, users, allGroups, tickets, services, onSave, onDelete, onClose }) {
  const [tab, setTab] = useState("config");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(team);
  const [saving, setSaving] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);
  const [savingService, setSavingService] = useState(false);
  const [deletingService, setDeletingService] = useState(null);

  const members = users.filter(u => team.member_emails?.includes(u.email));
  const clientUsers = users.filter(u => u.role === "user");
  const teamTickets = tickets.filter(t => t.team_id === team.id || members.some(m => m.email === t.client_email));
  const teamServices = services.filter(s => s.team_id === team.id);

  const openTickets = teamTickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const monthlySpend = teamServices.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);

  const handleGroupChange = (groupId) => {
    const group = allGroups.find(g => g.id === groupId);
    setForm(f => ({ ...f, action1_group_id: groupId, action1_group_name: group?.name || "" }));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Team.update(team.id, { ...form, action1_org_id: form.action1_org_id || DEFAULT_ACTION1_ORG });
    setSaving(false);
    setEditing(false);
    onSave();
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setSavingService(true);
    await base44.entities.ServiceUsage.create({
      ...serviceForm,
      team_id: team.id,
      monthly_cost: parseFloat(serviceForm.monthly_cost) || 0,
      users: parseInt(serviceForm.users) || 0,
      endpoints: parseInt(serviceForm.endpoints) || 0,
    });
    setServiceForm(EMPTY_SERVICE_FORM);
    setShowServiceForm(false);
    setSavingService(false);
    onSave();
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Remove this service?")) return;
    setDeletingService(id);
    await base44.entities.ServiceUsage.delete(id);
    setDeletingService(null);
    onSave();
  };

  const TABS = [
    { id: "config", label: "Configuration" },
    { id: "members", label: `Members (${members.length})` },
    { id: "services", label: `Services (${teamServices.length})` },
    { id: "tickets", label: `Tickets (${teamTickets.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl h-full bg-card border-l border-border/60 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/40 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base">{team.name}</h2>
              <div className="text-xs text-muted-foreground mt-0.5 flex gap-3">
                <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
                {openTickets > 0 && <span className="text-amber-400">{openTickets} open ticket{openTickets !== 1 ? "s" : ""}</span>}
                {monthlySpend > 0 && <span className="text-emerald-400">£{monthlySpend}/mo</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (window.confirm(`Delete team "${team.name}"?`)) onDelete(team.id); }}
              className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 flex-shrink-0 border-b border-border/30">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* CONFIG */}
          {tab === "config" && (
            <div className="flex flex-col gap-5">
              {!editing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border/40 bg-background/40">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> ABR Key</div>
                      <div className="font-mono text-sm">{team.abr_api_key ? team.abr_api_key.slice(0, 10) + "••••••" : <span className="text-muted-foreground text-xs">Not set</span>}</div>
                      {team.abr_api_key && <div className="text-xs text-muted-foreground mt-1">{team.abr_datacenter?.toUpperCase()}</div>}
                    </div>
                    <div className="p-4 rounded-xl border border-border/40 bg-background/40">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Monitor className="w-3 h-3" /> Action1 Group</div>
                      <div className="font-medium text-sm">{team.action1_group_name || <span className="text-muted-foreground text-xs">Not assigned</span>}</div>
                    </div>
                  </div>
                  <button onClick={() => { setForm(team); setEditing(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground w-fit">
                    <Pencil className="w-3.5 h-3.5" /> Edit Configuration
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Team Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">Action1 Endpoint Group</label>
                      <select value={form.action1_group_id || ""} onChange={e => handleGroupChange(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none">
                        <option value="">None</option>
                        {allGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">ABR Datacenter</label>
                      <select value={form.abr_datacenter || "dc3"} onChange={e => setForm({ ...form, abr_datacenter: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none">
                        <option value="dc1">DC1 (US/Global)</option>
                        <option value="dc2">DC2 (EU)</option>
                        <option value="dc3">DC3 (Australia)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">ABR API Key</label>
                    <input placeholder="Paste API key..." value={form.abr_api_key || ""}
                      onChange={e => setForm({ ...form, abr_api_key: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none font-mono" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="px-4 py-2 rounded-lg border border-border/60 text-xs hover:bg-muted">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MEMBERS */}
          {tab === "members" && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-muted-foreground">Click to toggle membership. Changes save immediately.</div>
              {clientUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No client users yet.</p>
              ) : (
                clientUsers.map(u => {
                  const isMember = team.member_emails?.includes(u.email);
                  return (
                    <div key={u.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${isMember ? "border-primary/30 bg-primary/5" : "border-border/30 bg-card/30 hover:border-border/60"}`}
                      onClick={async () => {
                        const newEmails = isMember
                          ? team.member_emails.filter(e => e !== u.email)
                          : [...(team.member_emails || []), u.email];
                        await base44.entities.Team.update(team.id, { member_emails: newEmails });
                        onSave();
                      }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMember ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {(u.full_name || u.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{u.full_name || u.email}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isMember ? "border-primary bg-primary" : "border-border"}`}>
                        {isMember && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SERVICES */}
          {tab === "services" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                {monthlySpend > 0 && (
                  <span className="text-sm font-semibold">£{monthlySpend.toLocaleString()}/mo total</span>
                )}
                <button onClick={() => setShowServiceForm(!showServiceForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 ml-auto">
                  <Plus className="w-3 h-3" /> Add Service
                </button>
              </div>

              {showServiceForm && (
                <form onSubmit={handleAddService} className="p-4 rounded-xl border border-primary/25 bg-primary/5 grid grid-cols-2 gap-2">
                  <input required placeholder="Service name" value={serviceForm.service_name}
                    onChange={e => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                    className="col-span-2 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                  <input required type="number" placeholder="Monthly cost (£)" value={serviceForm.monthly_cost}
                    onChange={e => setServiceForm({ ...serviceForm, monthly_cost: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                  <input type="number" placeholder="No. of users" value={serviceForm.users}
                    onChange={e => setServiceForm({ ...serviceForm, users: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                  <input type="number" placeholder="No. of endpoints" value={serviceForm.endpoints}
                    onChange={e => setServiceForm({ ...serviceForm, endpoints: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                  <input type="date" value={serviceForm.next_billing_date}
                    onChange={e => setServiceForm({ ...serviceForm, next_billing_date: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
                  <div className="col-span-2 flex gap-2">
                    <button type="submit" disabled={savingService}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
                      {savingService ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Add
                    </button>
                    <button type="button" onClick={() => setShowServiceForm(false)}
                      className="px-4 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-muted">Cancel</button>
                  </div>
                </form>
              )}

              {teamServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No services assigned yet.</div>
              ) : (
                teamServices.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card/30">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Server className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{s.service_name}</div>
                      <div className="text-xs text-muted-foreground">
                        £{s.monthly_cost}/mo
                        {s.users > 0 && ` · ${s.users} users`}
                        {s.endpoints > 0 && ` · ${s.endpoints} endpoints`}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${s.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                      {s.status}
                    </span>
                    <button onClick={() => handleDeleteService(s.id)} disabled={deletingService === s.id}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all flex-shrink-0">
                      {deletingService === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TICKETS */}
          {tab === "tickets" && (
            <div className="flex flex-col gap-2.5">
              {teamTickets.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No tickets for this team.</div>
              ) : (
                teamTickets.map(t => {
                  const cfg = TICKET_STATUS[t.status] || TICKET_STATUS.open;
                  return (
                    <div key={t.id} className="p-4 rounded-xl border border-border/30 bg-card/30 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{t.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t.client_email} · {new Date(t.created_date).toLocaleDateString("en-GB")}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {t.status?.replace("_", " ")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Users sub-panel ─────────────────────────────────────────────────────────
function UsersPanel({ users, teams, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [saving, setSaving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const getUserTeam = (email) => teams?.find(t => t.member_emails?.includes(email));

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || (u.role || "user") === filterRole;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === "admin").length;
  const unassigned = users.filter(u => u.role !== "admin" && !getUserTeam(u.email)).length;

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteSuccess(true);
      setInviteEmail("");
      setTimeout(() => { setInviteSuccess(false); setShowInvite(false); }, 2500);
      onRefresh();
    } catch (err) {
      setInviteError(err?.message || "Failed to send invite.");
    }
    setInviting(false);
  };

  const setRole = async (userId, role) => {
    setSaving(userId);
    await base44.entities.User.update(userId, { role });
    setSaving(null);
    onRefresh();
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Remove ${u.full_name || u.email}? This cannot be undone.`)) return;
    setDeleting(u.id);
    await base44.entities.User.delete(u.id);
    setDeleting(null);
    onRefresh();
  };

  const initials = (u) => u.full_name ? u.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : (u.email || "?")[0].toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-border/40 bg-card/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-lg font-extrabold">{users.length}</div>
            <div className="text-xs text-muted-foreground">Total users</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-border/40 bg-card/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-lg font-extrabold">{adminCount}</div>
            <div className="text-xs text-muted-foreground">Admins</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-border/40 bg-card/40 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${unassigned > 0 ? "bg-amber-500/10" : "bg-muted"}`}>
            <AlertTriangle className={`w-4 h-4 ${unassigned > 0 ? "text-amber-400" : "text-muted-foreground"}`} />
          </div>
          <div>
            <div className={`text-lg font-extrabold ${unassigned > 0 ? "text-amber-400" : ""}`}>{unassigned}</div>
            <div className="text-xs text-muted-foreground">Unassigned</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/60" />
        </div>
        <div className="flex gap-1 p-1 bg-card border border-border/60 rounded-xl">
          {["all", "user", "admin"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRole === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r === "all" ? "All" : r === "admin" ? "Admins" : "Clients"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
          <UserPlus className="w-4 h-4" /> Invite
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5">
          <form onSubmit={handleInvite} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <input required type="email" placeholder="colleague@company.com" value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60" />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-36 rounded-xl border-border/60 bg-background text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Client (user)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
            {inviteSuccess && <div className="flex items-center gap-2 text-xs text-emerald-400"><Mail className="w-3.5 h-3.5" /> Invite sent!</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={inviting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
                {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Send Invite
              </button>
              <button type="button" onClick={() => setShowInvite(false)}
                className="px-4 py-2 rounded-xl border border-border/60 text-sm hover:bg-muted">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="flex flex-col gap-2">
        {filtered.map(u => {
          const isAdmin = u.role === "admin";
          const userTeam = getUserTeam(u.email);
          return (
            <div key={u.id} className="p-4 rounded-2xl border border-border/50 bg-card/40 flex items-center gap-4 transition-all">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isAdmin ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/15 text-primary"}`}>
                {initials(u)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{u.full_name || "—"}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? "bg-yellow-500/15 text-yellow-400" : "bg-muted text-muted-foreground"}`}>
                    {isAdmin ? "Admin" : "Client"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  {userTeam ? (
                    <span className="text-xs flex items-center gap-1 text-primary/70"><Building2 className="w-3 h-3" />{userTeam.name}</span>
                  ) : !isAdmin ? (
                    <span className="text-xs flex items-center gap-1 text-amber-400/70"><AlertTriangle className="w-3 h-3" />Unassigned</span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setRole(u.id, isAdmin ? "user" : "admin")} disabled={saving === u.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-yellow-400 hover:border-yellow-400/40 transition-all disabled:opacity-60">
                  {saving === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : isAdmin ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  {isAdmin ? "Revoke" : "Admin"}
                </button>
                <button onClick={() => handleDelete(u)} disabled={deleting === u.id}
                  className="p-1.5 rounded-xl border border-border/60 text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-all disabled:opacity-60">
                  {deleting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function AdminClientManagement({ users, tickets, services, onRefresh }) {
  const [teams, setTeams] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [search, setSearch] = useState("");
  const [topTab, setTopTab] = useState("teams"); // teams | users

  const loadTeams = async () => {
    const [teamsData, groupsRes] = await Promise.all([
      base44.entities.Team.list("-created_date"),
      base44.functions.invoke("action1Requests", { action: "fetch", path: "/endpoints/groups/3fa05c66-f12c-4759-b991-346a4d300e42" }),
    ]);
    setTeams(teamsData);
    setAllGroups(groupsRes.data?.data?.items || []);
    setLoading(false);
  };

  useEffect(() => { loadTeams(); }, []);

  const handleWizardComplete = () => {
    setShowWizard(false);
    loadTeams();
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.Team.delete(id);
    setSelectedTeam(null);
    loadTeams();
    onRefresh();
  };

  const handleSave = () => {
    loadTeams();
    onRefresh();
    if (selectedTeam) {
      base44.entities.Team.list("-created_date").then(ts => {
        const updated = ts.find(t => t.id === selectedTeam.id);
        if (updated) setSelectedTeam(updated);
        setTeams(ts);
      });
    }
  };

  const clientUsers = users.filter(u => u.role === "user");
  const filtered = teams.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
  const selectedTeamFull = selectedTeam ? teams.find(t => t.id === selectedTeam.id) || selectedTeam : null;

  return (
    <div className="p-6 max-w-5xl flex flex-col gap-6">
      {selectedTeamFull && (
        <TeamDetailPanel
          team={selectedTeamFull}
          users={users}
          allGroups={allGroups}
          tickets={tickets}
          services={services}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSelectedTeam(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Clients & Users
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage client teams, members, services and user access.</p>
        </div>
        {topTab === "teams" && (
          <button onClick={() => setShowWizard(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Onboard Team
          </button>
        )}
      </div>

      {/* Top tabs */}
      <div className="flex gap-1 bg-card/40 border border-border/30 rounded-xl p-1 w-fit">
        <button onClick={() => setTopTab("teams")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${topTab === "teams" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Teams ({teams.length})
        </button>
        <button onClick={() => setTopTab("users")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${topTab === "users" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Users ({users.length})
        </button>
      </div>

      {/* TEAMS TAB */}
      {topTab === "teams" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border/40 bg-card/40 text-center">
              <div className="text-2xl font-extrabold">{teams.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Teams</div>
            </div>
            <div className="p-4 rounded-xl border border-border/40 bg-card/40 text-center">
              <div className="text-2xl font-extrabold">{clientUsers.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Client Users</div>
            </div>
            <div className="p-4 rounded-xl border border-border/40 bg-card/40 text-center">
              <div className="text-2xl font-extrabold text-amber-400">
                {tickets.filter(t => t.status === "open" || t.status === "in_progress").length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Open Tickets</div>
            </div>
          </div>

          {showWizard && (
            <TeamOnboardingWizard
              allGroups={allGroups}
              clientUsers={clientUsers}
              onComplete={handleWizardComplete}
              onClose={() => setShowWizard(false)}
            />
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50" />
          </div>

          {/* Teams list */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {teams.length === 0 ? "No teams yet. Create one above." : "No teams match your search."}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(team => {
                const members = users.filter(u => team.member_emails?.includes(u.email));
                const teamTickets = tickets.filter(t => t.team_id === team.id || members.some(m => m.email === t.client_email));
                const teamServices = services.filter(s => s.team_id === team.id);
                const openCount = teamTickets.filter(t => t.status === "open" || t.status === "in_progress").length;
                const spend = teamServices.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);

                return (
                  <button key={team.id} onClick={() => setSelectedTeam(team)}
                    className="text-left p-5 rounded-2xl border border-border/40 bg-card/40 hover:border-primary/40 hover:bg-card/60 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-all">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">{team.name}</div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{members.length} member{members.length !== 1 ? "s" : ""}</span>
                          {openCount > 0 && <span className="flex items-center gap-1 text-amber-400"><Ticket className="w-3 h-3" />{openCount} open</span>}
                          {teamServices.length > 0 && <span className="flex items-center gap-1"><Server className="w-3 h-3" />{teamServices.length} service{teamServices.length !== 1 ? "s" : ""}</span>}
                          {spend > 0 && <span className="flex items-center gap-1 text-emerald-400"><CreditCard className="w-3 h-3" />£{spend}/mo</span>}
                          {team.action1_group_name && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{team.action1_group_name}</span>}
                          {team.abr_api_key && <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" />ABR</span>}
                        </div>
                      </div>
                      <div className="text-muted-foreground group-hover:text-foreground transition-all text-xs px-2.5 py-1 rounded-lg border border-border/40 group-hover:border-primary/30 flex-shrink-0">
                        Manage →
                      </div>
                    </div>
                    {members.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
                        {members.slice(0, 5).map(u => (
                          <span key={u.id} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {u.full_name || u.email}
                          </span>
                        ))}
                        {members.length > 5 && <span className="text-xs text-muted-foreground/60">+{members.length - 5} more</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* USERS TAB */}
      {topTab === "users" && (
        <UsersPanel users={users} teams={teams} onRefresh={() => { loadTeams(); onRefresh(); }} />
      )}
    </div>
  );
}