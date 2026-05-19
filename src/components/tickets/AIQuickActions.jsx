import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles, Loader2, RotateCcw, Download, Terminal,
  Stethoscope, Wifi, Shield, Wrench, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, Zap, Copy, Check
} from "lucide-react";

const TYPE_CONFIG = {
  reboot:      { icon: RotateCcw,    color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/25" },
  update:      { icon: Download,     color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/25"  },
  script:      { icon: Terminal,     color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25"},
  diagnostic:  { icon: Stethoscope, color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/25"  },
  network:     { icon: Wifi,         color: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/25"   },
  security:    { icon: Shield,       color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/25"   },
  maintenance: { icon: Wrench,       color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/25"},
};

const URGENCY_CONFIG = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high:     "text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function ActionCard({ action }) {
  const cfg = TYPE_CONFIG[action.type] || TYPE_CONFIG.diagnostic;
  const Icon = cfg.icon;
  const urgencyCls = URGENCY_CONFIG[action.urgency] || URGENCY_CONFIG.medium;
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!action.command) return;
    navigator.clipboard.writeText(action.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-xl border ${cfg.border} ${cfg.bg} transition-all`}>
      <div className="flex items-start gap-2.5">
        <div className={`w-7 h-7 rounded-lg bg-background/40 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{action.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${urgencyCls}`}>
              {action.urgency}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
        </div>
      </div>
      {action.command && (
        <div className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-1.5 border border-border/20">
          <code className="text-xs text-muted-foreground flex-1 truncate font-mono">{action.command}</code>
          <button onClick={handleCopy} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AIQuickActions({ ticket, endpoints = [] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (result) { setOpen(!open); return; }
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("aiTicketActions", {
        ticketId: ticket.id,
        endpointContext: endpoints,
      });
      setResult(res.data);
    } catch (err) {
      setError("Could not generate suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (e) => {
    e.stopPropagation();
    setResult(null);
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("aiTicketActions", {
        ticketId: ticket.id,
        endpointContext: endpoints,
      });
      setResult(res.data);
    } catch {
      setError("Could not generate suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header button */}
      <button
        onClick={analyze}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-primary/10 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-primary">AI Quick Actions</div>
          <div className="text-xs text-muted-foreground">
            {result ? result.summary : "Analyse ticket & endpoint health for recommendations"}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {result && !loading && (
            <button onClick={refresh} className="p-1 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
            : open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-primary/15 pt-3">
          {loading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analysing ticket history and endpoint health...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-destructive py-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </div>
          ) : result?.actions?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.actions.map(action => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> AI-generated — verify before executing in production
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No specific actions recommended — ticket looks straightforward.
            </div>
          )}
        </div>
      )}
    </div>
  );
}