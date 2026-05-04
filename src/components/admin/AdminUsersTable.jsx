import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, UserCheck, UserX } from "lucide-react";

export default function AdminUsersTable({ users, currentUserId, onRefresh }) {
  const [saving, setSaving] = useState(null);

  const setRole = async (userId, role) => {
    setSaving(userId);
    await base44.entities.User.update(userId, { role });
    setSaving(null);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {users.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No users found.</p>}
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
            {u.id !== currentUserId && (
              u.role === "admin" ? (
                <button
                  onClick={() => setRole(u.id, "user")}
                  disabled={saving === u.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-60"
                >
                  {saving === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                  Revoke Admin
                </button>
              ) : (
                <button
                  onClick={() => setRole(u.id, "user")}
                  disabled={saving === u.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 text-xs hover:bg-green-500/25 disabled:opacity-60"
                >
                  {saving === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                  Approve Access
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}