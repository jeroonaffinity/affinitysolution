import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, UserX, UserPlus, Mail } from "lucide-react";

export default function AdminUsersTable({ users, currentUserId, onRefresh }) {
  const [saving, setSaving] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteSuccess(true);
      setInviteEmail("");
      setTimeout(() => {
        setInviteSuccess(false);
        setShowInvite(false);
      }, 2500);
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

  return (
    <div className="flex flex-col gap-4">
      {/* Invite Section */}
      <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">Invite a Client</h3>
            <p className="text-xs text-muted-foreground mt-0.5">They'll receive a magic link to set up their account.</p>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite User
          </button>
        </div>

        {showInvite && (
          <form onSubmit={handleInvite} className="flex flex-col gap-3 pt-3 border-t border-border/40">
            <div className="flex gap-3 flex-wrap">
              <input
                required
                type="email"
                placeholder="client@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none"
              >
                <option value="user">Client (user)</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
            {inviteSuccess && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Mail className="w-3.5 h-3.5" /> Invite sent successfully!
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={inviting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60"
              >
                {inviting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                Send Invite
              </button>
              <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg border border-border/60 text-xs hover:bg-card">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Users List */}
      {users.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No users yet. Invite your first client above.</p>}
      {users.map(u => (
        <div key={u.id} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-semibold text-sm">{u.full_name || "—"}</div>
            <div className="text-xs text-muted-foreground">{u.email}</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">Joined {new Date(u.created_date).toLocaleDateString("en-GB")}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {u.role || "user"}
            </span>
            {u.id !== currentUserId && u.role === "admin" && (
              <button
                onClick={() => setRole(u.id, "user")}
                disabled={saving === u.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-60"
              >
                {saving === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                Revoke Admin
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}