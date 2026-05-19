import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Send, Paperclip, X, FileText, Image,
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2,
  Monitor, Wifi, Shield, Mail, HardDrive, HelpCircle, Zap, BookOpen, ExternalLink
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "hardware",  label: "Hardware",   icon: HardDrive, desc: "Physical device issues — computers, printers, peripherals" },
  { value: "software",  label: "Software",   icon: Monitor,   desc: "App crashes, installs, licensing, performance" },
  { value: "network",   label: "Network",    icon: Wifi,      desc: "Internet, VPN, connectivity, Wi-Fi" },
  { value: "email",     label: "Email",      icon: Mail,      desc: "Outlook, spam, calendar, email account issues" },
  { value: "security",  label: "Security",   icon: Shield,    desc: "Virus, phishing, data breach, account compromise" },
  { value: "other",     label: "Other",      icon: HelpCircle,desc: "Something else not listed above" },
];

const PRIORITIES = [
  { value: "low",      label: "Low",      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", desc: "Minor issue, no urgency" },
  { value: "medium",   label: "Medium",   color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/25",   desc: "Affects work but has a workaround" },
  { value: "high",     label: "High",     color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/25", desc: "Significantly impacting productivity" },
  { value: "critical", label: "Critical", color: "text-red-400",     bg: "bg-red-500/10 border-red-500/25",       desc: "Complete outage or security incident" },
];

// AI quick analysis shown while filling in the form
function AIAnalysisBubble({ subject, description, onSuggestion }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const lastRef = useRef("");

  const combined = `${subject} ${description}`.trim();

  useEffect(() => {
    if (combined.length < 20) { setAnalysis(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (combined === lastRef.current) return;
      lastRef.current = combined;
      setLoading(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyse this IT support request and respond in JSON:
Subject: "${subject}"
Description: "${description}"

Return JSON with:
- reply: friendly 2-3 sentence instant response with empathy and 1-2 quick tips
- category: one of hardware/software/network/email/security/other
- priority: one of low/medium/high/critical
- quick_fixes: array of 2-3 short actionable steps`,
          response_json_schema: {
            type: "object",
            properties: {
              reply: { type: "string" },
              category: { type: "string" },
              priority: { type: "string" },
              quick_fixes: { type: "array", items: { type: "string" } },
            },
          },
        });
        setAnalysis(result);
        if (onSuggestion) onSuggestion(result);
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    }, 1000);
    return () => clearTimeout(debounceRef.current);
  }, [combined]);

  if (!loading && !analysis) return null;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-primary/15 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
        <span className="text-xs font-semibold">AffinitySolution AI</span>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-primary/60 ml-auto" />}
      </div>
      {loading && !analysis && (
        <div className="px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex gap-1">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
          Analysing your issue...
        </div>
      )}
      {analysis && (
        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-foreground/90 leading-relaxed">{analysis.reply}</p>
          {analysis.quick_fixes?.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Zap className="w-3 h-3" /> Try these first
              </div>
              {analysis.quick_fixes.map((fix, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {fix}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Step indicator
function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
            i < current ? "text-emerald-400" : i === current ? "text-primary" : "text-muted-foreground/40"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              i < current ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
              i === current ? "bg-primary/20 border-primary/40 text-primary" :
              "bg-muted/20 border-border/30 text-muted-foreground/30"
            }`}>
              {i < current ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
            </div>
            <span className="hidden sm:block">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-6 ${i < current ? "bg-emerald-500/40" : "bg-border/30"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const STEPS = ["Category", "Details", "Impact", "Review"];

export default function TicketWizard({ userEmail, teamId, userName, onSuccess, onCancel }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: "",
    priority: "medium",
    subject: "",
    description: "",
    device_asset: "",
    department: "",
    location: "",
    affected_users_count: 1,
    error_message: "",
    steps_tried: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [kbSuggestions, setKbSuggestions] = useState([]);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbExpanded, setKbExpanded] = useState(null);
  const kbDebounceRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
    setAttachments(prev => [...prev, ...uploaded.map(r => r.file_url)]);
    setUploading(false);
    e.target.value = "";
  };

  // KB suggestions when subject changes
  useEffect(() => {
    if (form.subject.trim().length < 8) { setKbSuggestions([]); return; }
    if (kbDebounceRef.current) clearTimeout(kbDebounceRef.current);
    kbDebounceRef.current = setTimeout(async () => {
      setKbLoading(true);
      try {
        const res = await base44.functions.invoke("kbSmartSuggest", {
          action: "search",
          query: form.subject.trim(),
          category: form.category || undefined,
          limit: 3,
        });
        setKbSuggestions(res.data?.articles || []);
      } catch { /* silent */ }
      finally { setKbLoading(false); }
    }, 600);
    return () => clearTimeout(kbDebounceRef.current);
  }, [form.subject, form.category]);

  const handleAISuggestion = (suggestion) => {
    setAiSuggestion(suggestion);
    // Auto-apply category/priority if not yet chosen
    if (!form.category && suggestion.category) setForm(f => ({ ...f, category: suggestion.category }));
    if (suggestion.priority) setForm(f => ({ ...f, priority: suggestion.priority }));
  };

  const canProceed = () => {
    if (step === 0) return !!form.category;
    if (step === 1) return form.subject.trim().length > 5 && form.description.trim().length > 10;
    if (step === 2) return true;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const attachmentText = attachments.length
      ? "\n\n--- Attachments ---\n" + attachments.map((url, i) => `[File ${i + 1}](${url})`).join("\n")
      : "";
    const fullDesc = [
      form.description,
      form.error_message ? `\nError message: ${form.error_message}` : "",
      form.steps_tried ? `\nSteps already tried: ${form.steps_tried}` : "",
      attachmentText,
    ].join("").trim();

    await base44.entities.SupportTicket.create({
      title: form.subject,
      description: fullDesc,
      priority: form.priority,
      category: form.category,
      client_email: userEmail,
      team_id: teamId || undefined,
      status: "new",
      device_asset: form.device_asset || undefined,
      department: form.department || undefined,
      location: form.location || undefined,
      affected_users_count: Number(form.affected_users_count) || 1,
    });
    setSubmitting(false);
    onSuccess();
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-card/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 bg-primary/5">
        <div className="text-sm font-semibold mb-3">Raise a Support Ticket</div>
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* STEP 0 — Category */}
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">What type of issue are you experiencing?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const selected = form.category === cat.value;
                return (
                  <button key={cat.value} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      selected ? "border-primary/50 bg-primary/10" : "border-border/30 bg-card/30 hover:border-border/60"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary/20" : "bg-muted/40"}`}>
                      <Icon className={`w-4 h-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${selected ? "text-primary" : ""}`}>{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.desc}</div>
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1 — Details */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Issue Summary *</label>
              <input required
                placeholder="e.g. Outlook not loading, Laptop won't turn on..."
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Description *</label>
              <textarea rows={4} required
                placeholder="Describe what's happening in as much detail as possible — when it started, what you were doing, any error messages..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Error Message (if any)</label>
              <input
                placeholder="Copy and paste any error message here..."
                value={form.error_message}
                onChange={e => setForm(f => ({ ...f, error_message: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Steps Already Tried</label>
              <textarea rows={2}
                placeholder="What have you already tried? e.g. Restarted the computer, cleared cache..."
                value={form.steps_tried}
                onChange={e => setForm(f => ({ ...f, steps_tried: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none transition-colors"
              />
            </div>

            {/* AI Assistant */}
            <AIAnalysisBubble
              subject={form.subject}
              description={form.description}
              onSuggestion={handleAISuggestion}
            />

            {/* KB Suggestions */}
            {(kbLoading || kbSuggestions.length > 0) && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-amber-500/15 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">Related Knowledge Base Articles</span>
                  {kbLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-400/60 ml-auto" />}
                </div>
                {!kbLoading && kbSuggestions.length > 0 && (
                  <div className="divide-y divide-amber-500/10">
                    {kbSuggestions.map(article => (
                      <div key={article.id}>
                        <button type="button"
                          onClick={() => setKbExpanded(kbExpanded === article.id ? null : article.id)}
                          className="w-full text-left px-4 py-2.5 flex items-start gap-2.5 hover:bg-amber-500/5 transition-colors">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{article.title}</div>
                            {article.summary && <div className="text-xs text-muted-foreground mt-0.5">{article.summary}</div>}
                          </div>
                          <ExternalLink className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                        </button>
                        {kbExpanded === article.id && (
                          <div className="px-4 pb-3 text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap bg-amber-500/3 border-t border-amber-500/10 pt-2">
                            {article.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attachments */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Screenshots / Files</label>
              <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border/60 bg-background text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-all w-fit ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                {uploading ? "Uploading..." : "Attach files"}
                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.txt,.log,.zip,.docx,.xlsx" />
              </label>
              {attachments.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {attachments.map((url, i) => {
                    const isImg = /\.(png|jpe?g|gif|webp)$/i.test(url);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-3 py-1.5">
                        {isImg ? <Image className="w-3 h-3 text-primary/60" /> : <FileText className="w-3 h-3 text-primary/60" />}
                        <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary hover:underline">File {i + 1}</a>
                        <button type="button" onClick={() => setAttachments(a => a.filter((_, j) => j !== i))}>
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — Impact */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Help us understand the scope and urgency.</p>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map(p => (
                  <button key={p.value} type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                    className={`flex flex-col gap-0.5 p-3 rounded-xl border text-left transition-all ${
                      form.priority === p.value ? p.bg : "border-border/30 bg-card/30 hover:border-border/60"
                    }`}>
                    <span className={`text-sm font-semibold ${form.priority === p.value ? p.color : ""}`}>{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.desc}</span>
                  </button>
                ))}
              </div>
              {aiSuggestion?.priority && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-primary/70">
                  <Sparkles className="w-3 h-3" />
                  AI suggested: <strong className="capitalize">{aiSuggestion.priority}</strong>
                </div>
              )}
            </div>

            {/* Affected users */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">How many people are affected?</label>
              <input type="number" min={1}
                value={form.affected_users_count}
                onChange={e => setForm(f => ({ ...f, affected_users_count: e.target.value }))}
                className="w-32 px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {/* Device / Asset */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Device / Asset (optional)</label>
              <input
                placeholder="e.g. LAPTOP-JohnSmith, Printer-Floor2, Server-DC01"
                value={form.device_asset}
                onChange={e => setForm(f => ({ ...f, device_asset: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {/* Department + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Department (optional)</label>
                <input
                  placeholder="e.g. Finance, Marketing, HR"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location / Site (optional)</label>
                <input
                  placeholder="e.g. London Office, Floor 3"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Review your ticket before submitting.</p>
            <div className="rounded-xl border border-border/30 bg-background/40 divide-y divide-border/20 overflow-hidden">
              {[
                { label: "Category", value: CATEGORIES.find(c => c.value === form.category)?.label },
                { label: "Priority", value: <span className={`capitalize font-semibold ${PRIORITIES.find(p => p.value === form.priority)?.color}`}>{form.priority}</span> },
                { label: "Summary", value: form.subject },
                { label: "Description", value: <span className="whitespace-pre-wrap">{form.description}</span> },
                form.error_message && { label: "Error Message", value: form.error_message },
                form.steps_tried && { label: "Steps Tried", value: form.steps_tried },
                form.device_asset && { label: "Device", value: form.device_asset },
                form.department && { label: "Department", value: form.department },
                form.location && { label: "Location", value: form.location },
                { label: "Affected Users", value: form.affected_users_count },
                attachments.length > 0 && { label: "Attachments", value: `${attachments.length} file(s)` },
              ].filter(Boolean).map((row, i) => (
                <div key={i} className="flex gap-3 px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground w-28 flex-shrink-0 font-medium">{row.label}</span>
                  <span className="text-foreground/90 flex-1">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border/20">
          <button type="button" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all">
            <ChevronLeft className="w-4 h-4" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}