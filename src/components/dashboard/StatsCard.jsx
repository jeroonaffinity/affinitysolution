export default function StatsCard({ icon: Icon, label, value, sub, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/15 text-primary",
    green: "bg-green-500/15 text-green-400",
    yellow: "bg-yellow-500/15 text-yellow-400",
    red: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="p-5 rounded-2xl border border-border/60 bg-card/60 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/70 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}