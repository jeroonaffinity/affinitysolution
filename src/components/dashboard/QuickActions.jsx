import { Plus, BookOpen, Monitor, ShieldAlert, MessageSquare, ExternalLink } from "lucide-react";

export default function QuickActions({ onNewTicket, onGoTo }) {
  const actions = [
    {
      icon: Plus,
      label: "New Ticket",
      desc: "Report an issue",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      onClick: onNewTicket,
    },
    {
      icon: BookOpen,
      label: "Help Docs",
      desc: "Browse guides",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      onClick: () => onGoTo("docs"),
    },
    {
      icon: Monitor,
      label: "Endpoints",
      desc: "View devices",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      onClick: () => onGoTo("endpoints"),
    },
    {
      icon: ShieldAlert,
      label: "Admin Access",
      desc: "Elevation requests",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      onClick: () => onGoTo("abr"),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map(a => (
          <button key={a.label} onClick={a.onClick}
            className={`flex flex-col items-start gap-2 p-4 rounded-xl border ${a.border} ${a.bg} hover:scale-[1.02] active:scale-[0.98] transition-all text-left group`}>
            <div className={`w-8 h-8 rounded-lg bg-background/30 flex items-center justify-center ${a.color}`}>
              <a.icon className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-sm font-semibold ${a.color}`}>{a.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}