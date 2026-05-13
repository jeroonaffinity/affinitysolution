import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ticketService } from "@/lib/ticketService";
import {
  X, ChevronRight, ChevronLeft, Check, Loader2,
  Users, FileText, Tag, Settings, UserCheck, Sparkles
} from "lucide-react";

const STEPS = [
  { id: "team",     label: "Team & Contact",  icon: Users      },
  { id: "details",  label: "Ticket Details",  icon: FileText   },
  { id: "classify", label: "Classify",        icon: Tag        },
  { id: "assign",   label: "Assign & Config", icon: Settings   },
];

const CATEGORIES = ["hardware", "software", "network", "email", "security", "data", "other"];
const PRIORITIES = [
  { value: "critical", label: "Critical", desc: "System down / major outage", color: "border-red-500/60 bg-red-500/10 text-red-400" },
  { value: "high",     label: "High",     desc: "Significant impact, urgent", color: "border-orange-500/60 bg-orange-500/10 text-orange-400" },
  { value: "medium",   label: "Medium",   desc: "Normal business impact",     color: "border-yellow-500/60 bg-yellow-500/10 text-yellow-400" },
  { value: "low",      label: "Low",      desc: "Minor / informational",      color: "border-blue-500/60 bg-blue-500/10 text-blue-400" },
];

const CATEGORY_ICONS = {
  hardware: "🖥️", software: "💿", network: "🌐",
  email: "📧", security: "🔒", data: "💾", other: "📋"
};

export default function TicketCreationWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Data
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  // Step 0 — Team & Contact
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Step 1 — Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 — Classify
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("other");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [aiSuggested, setAiSuggested] = useState(null);
  const [affectedUsers, setAffectedUsers] = useState(1);
  const [deviceAsset, setDeviceAsset] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");

  // Step 3 — Assign & Config
  const [assignedTo, setAssignedTo] = useState("");
  const [slaOverride, setSlaOverride] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Team.list(),
      base44.entities.User.list(),
    ]).then(([t, u]) => {
      setTeams(t);
      setUsers(u);
      setAdminUsers(u.filter(x => x.role === "admin"));
    });
  }, []);

  const teamMembers = selectedTeam
    ? users.filter(u => selectedTeam.member_emails?.includes(u.email))
    : [];

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setSelectedUser(null);
  };

  const handleAISuggest = async () => {
    if (!title && !description) return;
    setAnalyzing(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this IT support ticket and suggest: priority (critical/high/medium/low), category (hardware/software/network/email/security/data/other), and up to 3 relevant tags.\n\nTitle: ${title}\nDescription: ${description}\n\nRespond with JSON only.`,
      response_json_schema: {
        type: "object",
        properties: {
          priority: { type: "string" },
          category: { type: "string" },
          tags: { type: "array", items: { type: "string" } }
        }
      }
    });
    setAiSuggested(res);
    if (res.priority) setPriority(res.priority);
    if (res.category) setCategory(res.category);
    if (res.tags?.length) setTags(res.tags);
    setAnalyzing(false);
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags(t => [...new Set([...t, tagInput.trim().toLowerCase()])]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => setTags(t => t.filter(x => x !== tag));

  const canNext = () => {
    if (step === 0) return !!selectedTeam && !!selectedUser;
    if (step === 1) return title.trim().length > 2;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    const adminUser = adminUsers.find(u => u.email === assignedTo);
    await ticketService.createTicket({
      title: title.trim(),
      description: description.trim(),
      client_email: selectedUser.email,
      team_id: selectedTeam.id,
      priority,
      category,
      tags,
      affected_users_count: affectedUsers,
      device_asset: deviceAsset || undefined,
      department: department || undefined,
      location: location || undefined,
      assigned_to_email: assignedTo || undefined,
      assigned_to_name: adminUser?.full_name || assignedTo || undefined,
    });
    setSaving(false);
    onCreated();
    onClose();
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border/40 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold text-base">Create Support Ticket</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex px-6 pt-4 gap-2 flex-shrink-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? "bg-emerald-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block truncate ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < step ? "bg-emerald-500/50" : "bg-border/40"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[320px]">

          {/* Step 0: Team & Contact */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Select Team <span className="text-destructive">*</span></label>
                {teams.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-border/30 rounded-xl">No teams yet. Create a team first.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {teams.map(t => {
                      const active = selectedTeam?.id === t.id;
                      return (
                        <button key={t.id} type="button" onClick={() => handleTeamSelect(t)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${active ? "border-primary/50 bg-primary/10" : "border-border/30 hover:border-border/70 bg-card/30"}`}>
                          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {t.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.member_emails?.length || 0} member{t.member_emails?.length !== 1 ? "s" : ""}</div>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedTeam && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Point of Contact <span className="text-destructive">*</span></label>
                  {teamMembers.length === 0 ? (
                    <div className="py-4 text-center border border-border/30 rounded-xl text-sm text-muted-foreground">No members in this team.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {teamMembers.map(u => {
                        const active = selectedUser?.id === u.id;
                        return (
                          <button key={u.id} type="button" onClick={() => setSelectedUser(u)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${active ? "border-primary/50 bg-primary/10" : "border-border/30 hover:border-border/70 bg-card/30"}`}>
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {(u.full_name || u.email)[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium truncate">{u.full_name || u.email}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                            </div>
                            {active && <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Ticket Details */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Subject / Title <span className="text-destructive">*</span></label>
                <input
                  autoFocus
                  placeholder="Brief summary of the issue..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Description</label>
                <textarea
                  rows={5}
                  placeholder="Full description of the issue, steps to reproduce, impact..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Affected Users</label>
                  <input type="number" min={1} value={affectedUsers} onChange={e => setAffectedUsers(parseInt(e.target.value) || 1)}
                    className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Department</label>
                  <input placeholder="e.g. Finance" value={department} onChange={e => setDepartment(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Location / Site</label>
                  <input placeholder="e.g. London HQ" value={location} onChange={e => setLocation(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Device / Asset (optional)</label>
                <input placeholder="e.g. LAPTOP-001 or Serial No." value={deviceAsset} onChange={e => setDeviceAsset(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60" />
              </div>
            </div>
          )}

          {/* Step 2: Classify */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              {/* AI suggest */}
              <button type="button" onClick={handleAISuggest} disabled={analyzing || (!title && !description)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 disabled:opacity-50 transition-all self-start">
                {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {analyzing ? "Analysing ticket..." : "AI Auto-Classify"}
              </button>
              {aiSuggested && (
                <div className="px-3 py-2 rounded-xl bg-primary/8 border border-primary/20 text-xs text-primary">
                  AI suggested: <strong>{aiSuggested.priority}</strong> priority · <strong>{aiSuggested.category}</strong> · tags: {aiSuggested.tags?.join(", ") || "none"}
                </div>
              )}

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                      className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl border-2 text-left transition-all ${priority === p.value ? p.color : "border-border/30 text-muted-foreground hover:border-border/60 bg-card/30"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{p.label}</span>
                        {priority === p.value && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs opacity-80">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-center transition-all capitalize ${category === cat ? "border-primary/60 bg-primary/10 text-primary" : "border-border/30 text-muted-foreground hover:border-border/60"}`}>
                      <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-[10px] font-medium">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Tags <span className="text-xs font-normal text-muted-foreground">(press Enter to add)</span></label>
                <input
                  placeholder="Type a tag and press Enter..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  className="px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Assign & Config */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {/* Assign technician */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-primary" /> Assign Technician</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  <button type="button" onClick={() => setAssignedTo("")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${!assignedTo ? "border-primary/50 bg-primary/10" : "border-border/30 hover:border-border/60"}`}>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">—</div>
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                    {!assignedTo && <Check className="w-3 h-3 text-primary ml-auto" />}
                  </button>
                  {adminUsers.map(u => {
                    const active = assignedTo === u.email;
                    return (
                      <button key={u.id} type="button" onClick={() => setAssignedTo(u.email)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${active ? "border-primary/50 bg-primary/10" : "border-border/30 hover:border-border/60 bg-card/30"}`}>
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {(u.full_name || u.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{u.full_name || u.email}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                        </div>
                        {active && <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary card */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 flex flex-col gap-2 text-sm">
                <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Ticket Summary</div>
                <div className="flex items-start gap-2"><span className="text-muted-foreground w-24 shrink-0">Team:</span><span className="font-medium">{selectedTeam?.name}</span></div>
                <div className="flex items-start gap-2"><span className="text-muted-foreground w-24 shrink-0">Contact:</span><span className="font-medium truncate">{selectedUser?.email}</span></div>
                <div className="flex items-start gap-2"><span className="text-muted-foreground w-24 shrink-0">Title:</span><span className="font-medium line-clamp-1">{title}</span></div>
                <div className="flex items-start gap-2"><span className="text-muted-foreground w-24 shrink-0">Priority:</span><span className="font-medium capitalize">{priority}</span></div>
                <div className="flex items-start gap-2"><span className="text-muted-foreground w-24 shrink-0">Category:</span><span className="font-medium capitalize">{category}</span></div>
                {assignedTo && <div className="flex items-start gap-2"><span className="text-muted-foreground w-24 shrink-0">Assigned:</span><span className="font-medium">{adminUsers.find(u => u.email === assignedTo)?.full_name || assignedTo}</span></div>}
                {tags.length > 0 && <div className="flex items-start gap-2"><span className="text-muted-foreground w-24 shrink-0">Tags:</span><span className="font-medium">{tags.join(", ")}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between gap-3 flex-shrink-0">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-all">
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "bg-primary w-4" : i < step ? "bg-emerald-500 w-1.5" : "bg-border w-1.5"}`} />
            ))}
          </div>

          {isLastStep ? (
            <button type="button" onClick={handleFinish} disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60 transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create Ticket
            </button>
          ) : (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}