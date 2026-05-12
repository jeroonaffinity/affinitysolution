import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Edit2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical", "any"];
const CATEGORY_OPTIONS = ["hardware", "software", "network", "email", "security", "data", "other", "any"];
const ACTION_TYPES = ["escalate", "remind", "add_note", "assign_team", "flag"];

export default function AdminWorkflowRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    priority_trigger: "any",
    category_trigger: "any",
    action_type: "escalate",
    escalate_to_emails: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState([]);

  const loadRules = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("ticketWorkflowEngine", { action: "list_rules" });
    setRules(res.data?.rules || []);
    setLoading(false);
  };

  const loadAdmins = async () => {
    const users = await base44.entities.User.list();
    setAdmins(users.filter(u => u.role === "admin"));
  };

  useEffect(() => {
    loadRules();
    loadAdmins();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        priority_trigger: form.priority_trigger,
        category_trigger: form.category_trigger,
        action_type: form.action_type,
        escalate_to_emails: form.escalate_to_emails
          .split(",")
          .map(e => e.trim())
          .filter(Boolean),
        is_active: form.is_active,
        action_params: {
          note_text: form.note_text,
          reason: form.reason,
        },
      };

      if (editingId) {
        await base44.functions.invoke("ticketWorkflowEngine", {
          action: "update_rule",
          rule_id: editingId,
          updates: payload,
        });
      } else {
        await base44.functions.invoke("ticketWorkflowEngine", {
          action: "create_rule",
          rule_data: payload,
        });
      }
      loadRules();
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (confirm("Delete this workflow rule?")) {
      await base44.functions.invoke("ticketWorkflowEngine", {
        action: "delete_rule",
        rule_id: ruleId,
      });
      loadRules();
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      priority_trigger: "any",
      category_trigger: "any",
      action_type: "escalate",
      escalate_to_emails: "",
      is_active: true,
    });
    setEditingId(null);
    setShowCreate(false);
  };

  const handleEdit = (rule) => {
    setForm({
      ...rule,
      escalate_to_emails: (rule.escalate_to_emails || []).join(", "),
      note_text: rule.action_params?.note_text || "",
      reason: rule.action_params?.reason || "",
    });
    setEditingId(rule.id);
    setShowCreate(true);
  };

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">Workflow Rules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Automate ticket actions based on priority & category.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Rule
        </Button>
      </div>

      {/* Form Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editingId ? "Edit Rule" : "New Workflow Rule"}</h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Rule Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Escalate Critical Security Issues"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does this rule do?"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Priority Trigger</label>
                  <select
                    value={form.priority_trigger}
                    onChange={(e) => setForm({ ...form, priority_trigger: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category Trigger</label>
                  <select
                    value={form.category_trigger}
                    onChange={(e) => setForm({ ...form, category_trigger: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Action Type *</label>
                <select
                  value={form.action_type}
                  onChange={(e) => setForm({ ...form, action_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                >
                  {ACTION_TYPES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {form.action_type === "escalate" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Escalate To (Comma-separated emails)</label>
                  <input
                    value={form.escalate_to_emails}
                    onChange={(e) => setForm({ ...form, escalate_to_emails: e.target.value })}
                    placeholder="admin@example.com, lead@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                  />
                  {admins.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {admins.map((admin) => (
                        <button
                          key={admin.id}
                          onClick={() => {
                            const emails = form.escalate_to_emails.split(",").map(e => e.trim()).filter(Boolean);
                            if (emails.includes(admin.email)) {
                              setForm({ ...form, escalate_to_emails: emails.filter(e => e !== admin.email).join(", ") });
                            } else {
                              setForm({ ...form, escalate_to_emails: [...emails, admin.email].join(", ") });
                            }
                          }}
                          className={`text-xs px-2 py-1 rounded-full transition-all ${
                            form.escalate_to_emails.includes(admin.email)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {admin.full_name || admin.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {form.action_type === "add_note" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Note Text</label>
                  <textarea
                    rows={3}
                    value={form.note_text}
                    onChange={(e) => setForm({ ...form, note_text: e.target.value })}
                    placeholder="Internal note to add to matching tickets"
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none resize-none"
                  />
                </div>
              )}

              {form.action_type === "flag" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Flag Reason</label>
                  <input
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Why is this ticket flagged?"
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.action_type}
                  className="flex-1"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingId ? "Update Rule" : "Create Rule"}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-primary/30" />
          <p className="text-muted-foreground text-sm">No workflow rules yet. Create one to automate ticket actions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="border border-border/40 rounded-2xl p-4 bg-card/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    {rule.is_active ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  {rule.description && <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {rule.priority_trigger}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground">
                      {rule.category_trigger}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-accent/10 text-accent-foreground">
                      {rule.action_type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}