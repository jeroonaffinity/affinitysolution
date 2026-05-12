import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Mail, Send, Users, ChevronDown, ChevronUp, Loader2,
  Sparkles, CheckCircle2, X, Plus, FileText, Zap
} from "lucide-react";

const PORTAL_URL = "https://affinitysolution.base44.app/dashboard";

// ─── Email Templates ─────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "maintenance",
    label: "Scheduled Maintenance",
    icon: "🔧",
    subject: "Scheduled Maintenance Window – Action Required",
    body: `Dear {name},

We wanted to give you advance notice of a scheduled maintenance window that may affect your services.

Maintenance Window:
• Date: [DATE]
• Time: [START TIME] – [END TIME] (UK)
• Expected Downtime: [DURATION]

What to expect:
• [DESCRIBE IMPACT]

No action is required on your end. Our team will be monitoring throughout and will notify you once the maintenance is complete.

If you have any urgent queries, please don't hesitate to contact us.

Kind regards,
AffinitySolution Support Team`,
  },
  {
    id: "onboarding",
    label: "Welcome / Onboarding",
    icon: "👋",
    subject: "Welcome to AffinitySolution – Getting Started",
    body: `Dear {name},

Welcome to AffinitySolution! We're delighted to have you on board.

Your client portal is now active and ready to use:
🔗 ${PORTAL_URL}

Through your portal you can:
• Raise and track support tickets
• View your active services and billing
• Access our knowledge base and support documentation
• Monitor your endpoints via Admin By Request

Your dedicated support team is here to help. Don't hesitate to raise a ticket if you need anything at all.

Kind regards,
AffinitySolution Support Team`,
  },
  {
    id: "invoice",
    label: "Invoice / Billing Notice",
    icon: "💳",
    subject: "Your AffinitySolution Invoice – [MONTH YEAR]",
    body: `Dear {name},

Please find your invoice for [MONTH YEAR] attached to this email.

Invoice Summary:
• Invoice Number: [INV-XXXXX]
• Amount Due: £[AMOUNT]
• Due Date: [DATE]
• Payment Method: [BANK TRANSFER / DIRECT DEBIT]

If you have any questions regarding this invoice, please don't hesitate to get in touch.

Kind regards,
AffinitySolution Finance Team`,
  },
  {
    id: "service_update",
    label: "Service Update",
    icon: "📢",
    subject: "Important Update to Your Services",
    body: `Dear {name},

We're writing to inform you of an important update to your managed services.

What's changing:
• [DESCRIBE CHANGE]

Why we're making this change:
• [REASON]

What you need to do:
• [ACTION REQUIRED or "No action required on your end."]

These changes will take effect from [DATE]. Please don't hesitate to reach out if you have any questions.

Kind regards,
AffinitySolution Team`,
  },
  {
    id: "security_alert",
    label: "Security Alert",
    icon: "🔐",
    subject: "Security Alert – Immediate Action Required",
    body: `Dear {name},

Our security monitoring has flagged a potential concern related to your environment that requires your attention.

What we've detected:
• [DESCRIBE ISSUE]

Immediate steps to take:
1. [STEP 1]
2. [STEP 2]
3. [STEP 3]

Our team is actively investigating and will keep you updated. If you notice anything unusual, please raise a support ticket immediately.

Kind regards,
AffinitySolution Security Team`,
  },
  {
    id: "custom",
    label: "Custom / Blank",
    icon: "✏️",
    subject: "",
    body: "",
  },
];

// ─── Recipient Picker ─────────────────────────────────────────────────────────
function RecipientPicker({ users, teams, selected, onChange }) {
  const [mode, setMode] = useState("manual"); // manual | users | teams
  const [manualEmail, setManualEmail] = useState("");

  const addEmail = (email) => {
    if (!email || selected.includes(email)) return;
    onChange([...selected, email]);
    setManualEmail("");
  };

  const removeEmail = (email) => onChange(selected.filter(e => e !== email));

  const addTeam = (team) => {
    const emails = team.member_emails || [];
    const newEmails = emails.filter(e => !selected.includes(e));
    if (newEmails.length) onChange([...selected, ...newEmails]);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(email => (
            <span key={email} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
              {email}
              <button onClick={() => removeEmail(email)} className="hover:text-destructive ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-card/60 border border-border/40 rounded-xl w-fit">
        {[["manual", "Manual"], ["users", "Portal Users"], ["teams", "Teams"]].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === "manual" && (
        <div className="flex gap-2">
          <input
            type="email" placeholder="Enter email address..."
            value={manualEmail} onChange={e => setManualEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addEmail(manualEmail))}
            className="flex-1 px-3 py-2 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60"
          />
          <button onClick={() => addEmail(manualEmail)} className="px-3 py-2 rounded-xl bg-primary/15 text-primary text-sm hover:bg-primary/25 border border-primary/25">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {mode === "users" && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {users.filter(u => u.role !== "admin").map(u => {
            const isSelected = selected.includes(u.email);
            return (
              <button key={u.id} onClick={() => isSelected ? removeEmail(u.email) : addEmail(u.email)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${isSelected ? "border-primary/30 bg-primary/5" : "border-border/30 hover:border-border/60"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {(u.full_name || u.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{u.full_name || u.email}</div>
                  {u.full_name && <div className="text-xs text-muted-foreground truncate">{u.email}</div>}
                </div>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
            );
          })}
          {users.filter(u => u.role !== "admin").length === 0 && (
            <p className="text-xs text-muted-foreground py-3 text-center">No client users found.</p>
          )}
        </div>
      )}

      {mode === "teams" && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {teams.map(team => {
            const count = (team.member_emails || []).length;
            return (
              <button key={team.id} onClick={() => addTeam(team)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 text-left transition-all">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {team.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{team.name}</div>
                  <div className="text-xs text-muted-foreground">{count} member{count !== 1 ? "s" : ""}</div>
                </div>
                <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
          {teams.length === 0 && (
            <p className="text-xs text-muted-foreground py-3 text-center">No teams found.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function AdminEmailPanel({ users = [], teams = [] }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null); // { count } on success
  const [aiLoading, setAiLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const applyTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleAIImprove = async () => {
    if (!body.trim()) return;
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional IT managed services copywriter for AffinitySolution. 
Improve the following client email to be more professional, clear, and concise. 
Keep the same structure and placeholders like [DATE], {name}, etc.
Return ONLY the improved email body text, no preamble.

Email:
${body}`,
    });
    setBody(typeof res === "string" ? res : res?.text || body);
    setAiLoading(false);
  };

  const handleSend = async () => {
    if (!recipients.length || !subject.trim() || !body.trim()) return;
    setSending(true);
    setSent(null);

    // Send personalized copy to each recipient
    await Promise.all(recipients.map(async (email) => {
      const recipientUser = users.find(u => u.email === email);
      const name = recipientUser?.full_name?.split(" ")[0] || "there";
      const personalizedBody = body.replace(/\{name\}/g, name);
      const personalizedSubject = subject.replace(/\{name\}/g, name);

      await base44.functions.invoke("sendAdminEmail", {
        to: email,
        subject: personalizedSubject,
        rawBody: personalizedBody,
        useTemplate: true,
      });
    }));

    setSent({ count: recipients.length });
    setSending(false);
    // Clear recipients after send
    setRecipients([]);
    setTimeout(() => setSent(null), 5000);
  };

  return (
    <div className="p-6 max-w-5xl flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" /> Email Centre
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Compose branded emails to clients with pre-built templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Templates + Recipients */}
        <div className="flex flex-col gap-5">
          {/* Templates */}
          <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">
            <button onClick={() => setShowTemplates(!showTemplates)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold hover:bg-card/60 transition-all">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Templates</div>
              {showTemplates ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showTemplates && (
              <div className="border-t border-border/30 flex flex-col">
                {TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                    className={`flex items-center gap-3 px-4 py-3 text-left text-sm transition-all border-b border-border/15 last:border-b-0 ${
                      selectedTemplate.id === tpl.id ? "bg-primary/10 text-primary" : "hover:bg-card/60 text-muted-foreground hover:text-foreground"
                    }`}>
                    <span className="text-base flex-shrink-0">{tpl.icon}</span>
                    <span className="font-medium">{tpl.label}</span>
                    {selectedTemplate.id === tpl.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recipients */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="w-4 h-4 text-primary" /> Recipients
              </div>
              {recipients.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{recipients.length}</span>
              )}
            </div>
            <RecipientPicker users={users} teams={teams} selected={recipients} onChange={setRecipients} />
          </div>
        </div>

        {/* Right: Compose */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="rounded-2xl border border-border/40 bg-card/40 flex flex-col overflow-hidden">
            {/* Subject */}
            <div className="border-b border-border/30 px-5 py-3">
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium uppercase tracking-wider">Subject</label>
              <input
                value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Body</label>
                <button onClick={handleAIImprove} disabled={aiLoading || !body.trim()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 disabled:opacity-50 transition-all font-medium">
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Improve
                </button>
              </div>
              <textarea
                rows={16}
                value={body} onChange={e => setBody(e.target.value)}
                placeholder="Write your email here... Use {name} to personalise with the recipient's first name."
                className="w-full bg-transparent text-sm leading-relaxed focus:outline-none resize-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {/* Preview hint */}
          <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            Emails are automatically wrapped in the AffinitySolution branded template. Use <code className="mx-1 px-1.5 py-0.5 rounded bg-card text-primary font-mono">{`{name}`}</code> for personalisation.
          </div>

          {/* Send bar */}
          {sent && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Successfully sent to {sent.count} recipient{sent.count !== 1 ? "s" : ""}!
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSend}
              disabled={sending || !recipients.length || !subject.trim() || !body.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? "Sending..." : `Send${recipients.length > 0 ? ` to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}` : ""}`}
            </button>
            <button onClick={() => { setBody(""); setSubject(""); setRecipients([]); setSelectedTemplate(TEMPLATES.find(t => t.id === "custom")); }}
              className="px-4 py-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}