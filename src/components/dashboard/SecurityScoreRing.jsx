import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

function getScore({ tickets }) {
  let score = 100;
  const activeTickets = tickets.filter(t =>
    ["new", "open", "in_progress", "escalated"].includes(t.status)
  ).length;
  const criticalTickets = tickets.filter(t => t.priority === "critical" && ["new", "open", "in_progress"].includes(t.status)).length;

  score -= criticalTickets * 10;
  score -= activeTickets * 3;
  return Math.max(0, Math.min(100, score));
}

function getLabel(score) {
  if (score >= 85) return { label: "Healthy", color: "#34d399", text: "text-emerald-400" };
  if (score >= 60) return { label: "Fair", color: "#fbbf24", text: "text-amber-400" };
  return { label: "At Risk", color: "#f87171", text: "text-red-400" };
}

export default function SecurityScoreRing({ tickets = [] }) {
  const [displayScore, setDisplayScore] = useState(0);
  const targetScore = getScore({ tickets });
  const { label, color, text } = getLabel(targetScore);

  useEffect(() => {
    let frame;
    const animate = () => {
      setDisplayScore(prev => {
        if (prev < targetScore) { frame = requestAnimationFrame(animate); return Math.min(prev + 2, targetScore); }
        if (prev > targetScore) { frame = requestAnimationFrame(animate); return Math.max(prev - 2, targetScore); }
        return prev;
      });
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetScore]);

  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (displayScore / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-border/30 bg-card/30 gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold tracking-tight" style={{ color }}>{displayScore}</span>
        </div>
      </div>
      <div className={`text-sm font-bold ${text}`}>{label}</div>
      <div className="text-xs text-muted-foreground text-center">Security Score</div>
    </div>
  );
}