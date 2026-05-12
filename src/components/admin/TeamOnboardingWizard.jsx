import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  X, ChevronRight, ChevronLeft, Check, Loader2,
  Building2, ShieldAlert, Monitor, Server, Plus, Trash2
} from "lucide-react";

const DEFAULT_ORG = "3fa05c66-f12c-4759-b991-346a4d300e42";

const STEPS = [
  { id: "team",     label: "Team Info",      icon: Building2   },
  { id: "abr",      label: "ABR Setup",      icon: ShieldAlert },
  { id: "action1",  label: "Action1 Group",  icon: Monitor     },
  { id: "services", label: "Services",       icon: Server      },
];

const EMPTY_SERVICE = { service_name: "", monthly_cost: "", users: "", endpoints: "", billing_cycle: "monthly" };

export default function TeamOnboardingWizard({ allGroups, clientUsers, onComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [createdTeamId, setCreatedTeamId] = useState(null);

  // Step 1 — Team Info
  const [teamName, setTeamName] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Step 2 — ABR
  const [abrKey, setAbrKey] = useState("");
  const [abrDc, setAbrDc] = useState("dc3");

  // Step 3 — Action1
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");

  // Step 4 — Services
  const [services, setServices] = useState([{ ...EMPTY_SERVICE }]);

  const toggleEmail = (email) => {
    setSelectedEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleGroupChange = (id) => {
    setGroupId(id);
    const g = allGroups.find(g => g.id === id);
    setGroupName(g?.name || "");
  };

  const addServiceRow = () => setServices(s => [...s, { ...EMPTY_SERVICE }]);
  const removeServiceRow = (i) => setServices(s => s.filter((_, idx) => idx !== i));
  const updateService = (i, field, val) => setServices(s => s.map((svc, idx) => idx === i ? { ...svc, [field]: val } : svc));

  const canNext = () => {
    if (step === 0) return teamName.trim().length > 0;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Create team
      const team = await base44.entities.Team.create({
        name: teamName.trim(),
        member_emails: selectedEmails,
        abr_api_key: abrKey || undefined,
        abr_datacenter: abrDc,
        action1_org_id: DEFAULT_ORG,
        action1_group_id: groupId || undefined,
        action1_group_name: groupName || undefined,
      });

      // Create services
      const validServices = services.filter(s => s.service_name.trim());
      await Promise.all(validServices.map(s =>
        base44.entities.ServiceUsage.create({
          team_id: team.id,
          service_name: s.service_name.trim(),
          monthly_cost: parseFloat(s.monthly_cost) || 0,
          users: parseInt(s.users) || 0,
          endpoints: parseInt(s.endpoints) || 0,
          billing_cycle: s.billing_cycle,
          status: "active",
        })
      ));

      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base">Onboard New Client Team</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex px-6 pt-4 gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all text-xs font-bold ${
                  done    ? "bg-emerald-500 text-white" :
                  active  ? "bg-primary text-primary-foreground" :
                            "bg-muted text-muted-foreground"
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block truncate ${active ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < step ? "bg-emerald-500/50" : "bg-border/40"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[280px]">

          {/* Step 0: Team Info */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Team / Company Name <span className="text-destructive">*</span></label>
                <input
                  autoFocus
                  placeholder="e.g. Acme Corp"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Assign Members <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
                {clientUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-border/30 rounded-xl">No client users exist yet. Invite them after creating the team.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {clientUsers.map(u => {
                      const selected = selectedEmails.includes(u.email);
                      return (
                        <button key={u.id} type="button" onClick={() => toggleEmail(u.email)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left ${selected ? "border-primary/40 bg-primary/8" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                          <span className="text-xs truncate">{u.full_name || u.email}</span>
                          {selected && <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: ABR */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-muted-foreground leading-relaxed">
                Admin By Request (ABR) allows this team to self-approve privilege elevation requests. Paste their API key below — leave blank to skip.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">ABR API Key <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
                <input
                  placeholder="Paste API key..."
                  value={abrKey}
                  onChange={e => setAbrKey(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-border/60 bg-background text-sm font-mono focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">ABR Datacenter</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["dc1","DC1 — US/Global"], ["dc2","DC2 — EU"], ["dc3","DC3 — Australia"]].map(([val, lbl]) => (
                    <button key={val} type="button" onClick={() => setAbrDc(val)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${abrDc === val ? "border-primary/60 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Action1 */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-muted-foreground leading-relaxed">
                Map this team to an Action1 endpoint group so their devices appear under Endpoints. Select from the groups fetched from your Action1 organisation.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Endpoint Group <span className="text-xs text-muted-foreground font-normal">(optional)</span></label>
                {allGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3 text-center border border-border/30 rounded-xl">No Action1 groups found.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                    <button type="button" onClick={() => handleGroupChange("")}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${!groupId ? "border-primary/40 bg-primary/8" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">No group — skip</span>
                      {!groupId && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                    </button>
                    {allGroups.map(g => (
                      <button key={g.id} type="button" onClick={() => handleGroupChange(g.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${groupId === g.id ? "border-primary/40 bg-primary/8" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
                        <Monitor className="w-4 h-4 text-primary/60" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{g.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{g.id}</div>
                        </div>
                        {groupId === g.id && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-muted-foreground leading-relaxed">
                Add the services this team subscribes to. You can always add more later. Leave blank to skip.
              </div>
              <div className="flex flex-col gap-2">
                {services.map((svc, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-border/40 bg-card/30 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <input placeholder="Service name (e.g. Microsoft 365)"
                        value={svc.service_name}
                        onChange={e => updateService(i, "service_name", e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60" />
                      {services.length > 1 && (
                        <button type="button" onClick={() => removeServiceRow(i)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" placeholder="£/mo" value={svc.monthly_cost}
                        onChange={e => updateService(i, "monthly_cost", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border/60 bg-background text-xs focus:outline-none focus:border-primary/60" />
                      <input type="number" placeholder="Users" value={svc.users}
                        onChange={e => updateService(i, "users", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border/60 bg-background text-xs focus:outline-none focus:border-primary/60" />
                      <input type="number" placeholder="Endpoints" value={svc.endpoints}
                        onChange={e => updateService(i, "endpoints", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border/60 bg-background text-xs focus:outline-none focus:border-primary/60" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addServiceRow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add another service
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {/* Step summary */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? "bg-primary w-4" : i < step ? "bg-emerald-500" : "bg-border"}`} />
            ))}
          </div>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create Team
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}