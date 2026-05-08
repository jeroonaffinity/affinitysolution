import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, UserPlus, Mail, Search, X, Shield, ShieldOff,
  UserCheck, Users, Crown, Trash2, Building2, AlertTriangle
} from "lucide-react";

export default function AdminUsersPanel({ users, teams, currentUserId, onRefresh }) {
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

  // Group users by team
  const getUserTeam = (email) => teams?.find(t => t.member_emails?.includes(email));

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || (u.role || "user") === filterRole;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === "admin").length;
  const clientCount = users.filter(u => u.role !== "admin").length;
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
    if (!window.confirm(`Remove ${u.full_name || u.email} from the portal? This cannot be undone.`)) return;
    setDeleting(u.id);
    await base44.entities.User.delete(u.id);
    setDeleting(null);
    onRefresh();
  };

  const initials = (u) => {
    if (u.full_name) return u.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (u.email || "?")[0].toUpperCase();
  };

  return (
    <div className="p-6 max-w-5xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Invite, manage roles, and assign users to teams.</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/40 bg-card/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-xl font-extrabold">{users.length}</div>
            <div className="text-xs text-muted-foreground">Total users</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/40 bg-card/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-xl font-extrabold">{adminCount}</div>
            <div className="text-xs text-muted-foreground">Admins</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/40 bg-card/40 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${unassigned > 0 ? "bg-amber-500/10" : "bg-muted"}`}>
            <Building2 className={`w-4 h-4 ${unassigned > 0 ? "text-amber-400" : "text-muted-foreground"}`} />
          </div>
          <div>
            <div className={`text-xl font-extrabold ${unassigned > 0 ? "text-amber-400" : ""}`}>{unassigned}</div>
            <div className="text-xs text-muted-foreground">Unassigned clients</div>
          </div>
        </div>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4" /> Invite New User</h3>
          <form onSubmit={handleInvite} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <input required type="email" placeholder="colleague@company.com"
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60" />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none">
                <option value="user">Client (user)</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
            {inviteSuccess && <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium"><Mail className="w-3.5 h-3.5" /> Invite sent!</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={inviting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
                {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Send Invite
              </button>
              <button type="button" onClick={() => setShowInvite(false)}
                className="px-5 py-2 rounded-xl border border-border/60 text-sm hover:bg-muted">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/60" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <div className="flex gap-1 p-1 bg-card border border-border/60 rounded-xl">
          {["all", "user", "admin"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRole === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r === "all" ? "All" : r === "admin" ? "Admins" : "Clients"}
            </button>
          ))}
        </div>
      </div>

      {/* Users list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No users found.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(u => {
            const isAdmin = u.role === "admin";
            const isCurrentUser = u.id === currentUserId;
            const userTeam = getUserTeam(u.email);

            return (
              <div key={u.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isCurrentUser ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/40"}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isAdmin ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/15 text-primary"}`}>
                  {initials(u)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{u.full_name || "—"}</span>
                    {isCurrentUser && <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-bold">YOU</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? "bg-yellow-500/15 text-yellow-400" : "bg-muted text-muted-foreground"}`}>
                      {isAdmin ? "Admin" : "Client"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {userTeam ? (
                      <span className="text-xs flex items-center gap-1 text-primary/70">
                        <Building2 className="w-3 h-3" /> {userTeam.name}
                      </span>
                    ) : !isAdmin ? (
                      <span className="text-xs flex items-center gap-1 text-amber-400/70">
                        <AlertTriangle className="w-3 h-3" /> Not assigned to a team
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground/50">
                      Joined {new Date(u.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!isCurrentUser && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setRole(u.id, isAdmin ? "user" : "admin")} disabled={saving === u.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all disabled:opacity-60 ${
                        isAdmin ? "border-border/60 text-muted-foreground hover:text-amber-400 hover:border-amber-400/40"
                               : "border-border/60 text-muted-foreground hover:text-yellow-400 hover:border-yellow-400/40"
                      }`}>
                      {saving === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : isAdmin ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {isAdmin ? "Revoke" : "Make Admin"}
                    </button>
                    <button onClick={() => handleDelete(u)} disabled={deleting === u.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-all disabled:opacity-60">
                      {deleting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}