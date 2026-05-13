import { useEffect, useState } from "react";
import { getSlaSummary } from "@/lib/slaConfig";
import { Clock } from "lucide-react";

export default function SlaTimer({ ticket, compact = false }) {
  const [sla, setSla] = useState(() => getSlaSummary(ticket));

  // Refresh every 30 seconds
  useEffect(() => {
    setSla(getSlaSummary(ticket));
    const id = setInterval(() => setSla(getSlaSummary(ticket)), 30_000);
    return () => clearInterval(id);
  }, [ticket]);

  if (!sla) return null;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sla.bgColor} ${sla.color}`}>
        <Clock className="w-2.5 h-2.5" />
        {sla.label}
      </span>
    );
  }

  return (
    <div className={`rounded-xl px-4 py-3 ${sla.bgColor} border ${sla.isBreached ? "border-red-500/30" : sla.isWarning ? "border-amber-500/30" : "border-emerald-500/30"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> SLA Timer
        </span>
        <span className={`text-sm font-bold ${sla.color}`}>{sla.label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${sla.barColor}`}
          style={{ width: `${sla.percentUsed}%` }}
        />
      </div>
      <div className="mt-1.5 text-[10px] text-muted-foreground">
        Due: {sla.dueDate?.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}