import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus, Trash2, Loader2, Key, Check, Users, ChevronDown, ChevronUp,
  Pencil, X, Monitor, ShieldAlert
} from "lucide-react";

const DEFAULT_ACTION1_ORG = "3fa05c66-f12c-4759-b991-346a4d300e42";

const EMPTY_FORM = {
  name: "",
  member_emails: [],
  abr_api_key: "",
  abr_datacenter: "dc3",
  action1_org_id: DEFAULT_ACTION1_ORG,
  action1_group_id: "",
  action1_group_name: "",
};

function TeamCard({ team, users, allGroups, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(team);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const saveData = { ...form, action1_org_id: form.action1_org_id || DEFAULT_ACTION1_ORG };
    await base44.entities.Team.update(team.id, saveData);
    setSaving(false);
    setEditing(false);
    onSave();
  };

  const toggleMember = (email) => {
    setForm(f => ({
      ...f,
      member_emails: f.member_emails?.includes(email)
        ? f.member_emails.filter(e => e !== email)
        : [...(f.member_emails || []), email],
    }));
  };

  const clientUsers = users.filter(u => u.role === "user");
  const members = users.filter(u => team.member_emails?.includes(u.email));

  // When a group is selected, also cache its name
  const handleGroupChange = (groupId) => {
    const group = allGroups.find(g => g.id === groupId);
    setForm(f => ({ ...f, action1_group_id: groupId, action1_group_name: group?.name || "" }));
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${expanded ? "border-primary/30 bg-card/70" : "border-border/30 bg-card/30"}`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => { setExpanded(!expanded); setEditing(false); }}>
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{team.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
            <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
            {team.action1_group_name && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{team.action1_group_name}</span>}
            {team.abr_api_key && <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" />ABR configured</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onDelete(team.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 pt-4 flex flex-col gap-4">
          {!editing ? (
            <>
              {/* Members */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Members</div>
                {members.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No members assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {members.map(u => (
                      <span key={u.id} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {u.full_name || u.email}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Integrations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Action1 Group</div>
                  <div className="font-medium">{team.action1_group_name || "Not assigned"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">ABR Key</div>
                  <div className="font-mono text-xs">{team.abr_api_key ? team.abr_api_key.slice(0, 8) + "••••••••" : "Not set"}</div>
                </div>
              </div>

              <button onClick={() => { setForm(team); setEditing(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground w-fit transition-all">
                <Pencil className="w-3.5 h-3.5" /> Edit Team
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Team name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Team Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
                />
              </div>

              {/* Members */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Team Members</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {clientUsers.map(u => (
                    <label key={u.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 bg-card/30 cursor-pointer hover:border-primary/40 transition-all text-sm">
                      <input
                        type="checkbox"
                        checked={form.member_emails?.includes(u.email) || false}
                        onChange={() => toggleMember(u.email)}
                        className="accent-primary"
                      />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.full_name || u.email}</div>
                        {u.full_name && <div className="text-xs text-muted-foreground truncate">{u.email}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action1 Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Action1 Endpoint Group</label>
                  {allGroups.length > 0 ? (
                    <select
                      value={form.action1_group_id || ""}
                      onChange={e => handleGroupChange(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
                    >
                      <option value="">None</option>
                      {allGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      placeholder="Group ID..."
                      value={form.action1_group_id || ""}
                      onChange={e => setForm({ ...form, action1_group_id: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">ABR Datacenter</label>
                  <select
                    value={form.abr_datacenter || "dc3"}
                    onChange={e => setForm({ ...form, abr_datacenter: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none"
                  >
                    <option value="dc1">DC1 (US/Global)</option>
                    <option value="dc2">DC2 (EU)</option>
                    <option value="dc3">DC3 (Australia)</option>
                  </select>
                </div>
              </div>

              {/* ABR Key */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">ABR API Key</label>
                <input
                  placeholder="Paste API key..."
                  value={form.abr_api_key || ""}
                  onChange={e => setForm({ ...form, abr_api_key: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save Changes
                </button>
                <button onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-lg border border-border/60 text-xs hover:bg-card">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminTeamsPanel({ users }) {
  const [teams, setTeams] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [teamsData, groupsRes] = await Promise.all([
      base44.entities.Team.list("-created_date"),
      base44.functions.invoke("action1Requests", { action: "fetch", path: "/endpoints/groups/3fa05c66-f12c-4759-b991-346a4d300e42" }),
    ]);
    setTeams(teamsData);
    setAllGroups(groupsRes.data?.data?.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Team.create({ ...form, action1_org_id: form.action1_org_id || DEFAULT_ACTION1_ORG });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team?")) return;
    await base44.entities.Team.delete(id);
    load();
  };

  const handleGroupChange = (groupId) => {
    const group = allGroups.find(g => g.id === groupId);
    setForm(f => ({ ...f, action1_group_id: groupId, action1_group_name: group?.name || "" }));
  };

  const clientUsers = users?.filter(u => u.role === "user") || [];

  const toggleMemberForm = (email) => {
    setForm(f => ({
      ...f,
      member_emails: f.member_emails?.includes(email)
        ? f.member_emails.filter(e => e !== email)
        : [...(f.member_emails || []), email],
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Teams</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Assign members, ABR keys and Action1 groups per team.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> New Team
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl border border-primary/25 bg-primary/5 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground">Team Name *</label>
              <input required placeholder="e.g. Acme Corp" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none" />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground">Members</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {clientUsers.map(u => (
                  <label key={u.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/30 bg-card/30 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.member_emails?.includes(u.email) || false}
                      onChange={() => toggleMemberForm(u.email)} className="accent-primary" />
                    {u.full_name || u.email}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Action1 Endpoint Group</label>
              <select value={form.action1_group_id} onChange={e => handleGroupChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none">
                <option value="">None</option>
                {allGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">ABR Datacenter</label>
              <select value={form.abr_datacenter} onChange={e => setForm({ ...form, abr_datacenter: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none">
                <option value="dc1">DC1 (US/Global)</option>
                <option value="dc2">DC2 (EU)</option>
                <option value="dc3">DC3 (Australia)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground">ABR API Key</label>
              <input placeholder="Paste API key..." value={form.abr_api_key}
                onChange={e => setForm({ ...form, abr_api_key: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none font-mono" />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Create Team
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border/60 text-xs hover:bg-card">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : teams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No teams yet. Create one above.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {teams.map(t => (
            <TeamCard key={t.id} team={t} users={users || []} allGroups={allGroups} onSave={load} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}