import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TICKET_STATUSES, PRIORITY_CONFIG } from "@/lib/slaConfig";
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, Users, Activity } from "lucide-react";

const STATUS_COLORS = {
  new: "#94a3b8",
  acknowledged: "#22d3ee",
  open: "#fbbf24",
  in_progress: "#60a5fa",
  waiting_on_client: "#a78bfa",
  waiting_on_vendor: "#fb923c",
  escalated: "#f87171",
  pending_approval: "#facc15",
  on_hold: "#c084fc",
  resolved: "#34d399",
  closed: "#64748b",
};

const PRIORITY_COLORS = {
  critical: "#f87171",
  high: "#fb923c",
  medium: "#fbbf24",
  low: "#94a3b8",
};

function KpiBox({ icon: Icon, label, value, sub, color = "text-primary" }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs font-medium">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      <h3 className="font-bold text-sm mb-4 text-foreground">{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AdminReporting({ tickets, users }) {
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => !["resolved", "closed"].includes(t.status)).length;
    const resolved = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;
    const critical = tickets.filter(t => t.priority === "critical" && !["resolved", "closed"].includes(t.status)).length;
    const breached = tickets.filter(t => t.sla_breached).length;
    const slaCompliance = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;

    // Avg resolution time (hours) for closed/resolved tickets
    const resolvedWithDates = tickets.filter(t =>
      ["resolved", "closed"].includes(t.status) && t.created_date && t.updated_date
    );
    const avgResolutionHours = resolvedWithDates.length > 0
      ? Math.round(resolvedWithDates.reduce((sum, t) => {
          return sum + (new Date(t.updated_date) - new Date(t.created_date)) / (1000 * 60 * 60);
        }, 0) / resolvedWithDates.length)
      : 0;

    // Assigned vs unassigned
    const assigned = tickets.filter(t => t.assigned_to_email).length;

    return { total, open, resolved, critical, breached, slaCompliance, avgResolutionHours, assigned };
  }, [tickets]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts = {};
    tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts)
      .map(([status, count]) => ({
        name: TICKET_STATUSES[status]?.label || status,
        value: count,
        color: STATUS_COLORS[status] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [tickets]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    tickets.forEach(t => { if (counts[t.priority] !== undefined) counts[t.priority]++; });
    return Object.entries(counts).map(([p, count]) => ({
      name: PRIORITY_CONFIG[p]?.label || p,
      count,
      fill: PRIORITY_COLORS[p],
    }));
  }, [tickets]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts = {};
    tickets.forEach(t => { const c = t.category || "other"; counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts)
      .map(([cat, count]) => ({ name: cat.charAt(0).toUpperCase() + cat.slice(1), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [tickets]);

  // Tickets over time (last 14 days)
  const timelineData = useMemo(() => {
    const days = 14;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const dayStr = d.toISOString().slice(0, 10);
      const created = tickets.filter(t => t.created_date?.slice(0, 10) === dayStr).length;
      const resolved = tickets.filter(t =>
        ["resolved", "closed"].includes(t.status) && t.updated_date?.slice(0, 10) === dayStr
      ).length;
      result.push({ date: dateStr, Created: created, Resolved: resolved });
    }
    return result;
  }, [tickets]);

  // Technician workload
  const technicianData = useMemo(() => {
    const counts = {};
    tickets.filter(t => t.assigned_to_email && !["resolved", "closed"].includes(t.status))
      .forEach(t => {
        const name = t.assigned_to_name || t.assigned_to_email?.split("@")[0] || "Unknown";
        counts[name] = (counts[name] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([name, open]) => ({ name, open }))
      .sort((a, b) => b.open - a.open)
      .slice(0, 8);
  }, [tickets]);

  const avgResLabel = stats.avgResolutionHours > 24
    ? `${Math.floor(stats.avgResolutionHours / 24)}d ${stats.avgResolutionHours % 24}h`
    : `${stats.avgResolutionHours}h`;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Reporting & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Performance metrics and operational insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiBox icon={TrendingUp} label="Total Tickets" value={stats.total} sub={`${stats.open} open`} color="text-primary" />
        <KpiBox icon={CheckCircle2} label="SLA Compliance" value={`${stats.slaCompliance}%`} sub={`${stats.breached} breach${stats.breached !== 1 ? "es" : ""}`} color={stats.slaCompliance >= 90 ? "text-emerald-400" : stats.slaCompliance >= 70 ? "text-amber-400" : "text-red-400"} />
        <KpiBox icon={Clock} label="Avg Resolution" value={avgResLabel} sub={`${stats.resolved} resolved total`} color="text-blue-400" />
        <KpiBox icon={AlertTriangle} label="Critical Open" value={stats.critical} sub={`${stats.assigned} assigned`} color={stats.critical > 0 ? "text-red-400" : "text-emerald-400"} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ChartCard title="Tickets Created vs Resolved (14 days)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Created" stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Resolved" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tickets by Priority">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusData.slice(0, 6).map((s, i) => (
              <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Tickets by Category">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Technician Workload (Open Tickets)">
          {technicianData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">No assigned tickets</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={technicianData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="open" fill="#60a5fa" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Ticket table summary */}
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4">SLA Breach Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border/40">
                <th className="text-left py-2 pr-4 font-medium">Ticket</th>
                <th className="text-left py-2 pr-4 font-medium">Client</th>
                <th className="text-left py-2 pr-4 font-medium">Priority</th>
                <th className="text-left py-2 pr-4 font-medium">Status</th>
                <th className="text-left py-2 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {tickets
                .filter(t => t.sla_breached || (() => {
                  if (!t.created_date) return false;
                  const hours = { critical: 2, high: 8, medium: 24, low: 72 }[t.priority] || 24;
                  return (Date.now() - new Date(t.created_date).getTime()) > hours * 3600 * 1000 * 0.75;
                })())
                .filter(t => !["resolved", "closed"].includes(t.status))
                .slice(0, 10)
                .map(t => {
                  const hours = { critical: 2, high: 8, medium: 24, low: 72 }[t.priority] || 24;
                  const ageH = (Date.now() - new Date(t.created_date).getTime()) / 3600000;
                  const breached = ageH > hours;
                  return (
                    <tr key={t.id} className="border-b border-border/20 hover:bg-white/3 transition-colors">
                      <td className="py-2.5 pr-4 max-w-[200px] truncate font-medium">{t.title}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground truncate">{t.client_email}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${PRIORITY_CONFIG[t.priority]?.bg} ${PRIORITY_CONFIG[t.priority]?.color}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded-full ${TICKET_STATUSES[t.status]?.bg} ${TICKET_STATUSES[t.status]?.color}`}>
                          {TICKET_STATUSES[t.status]?.label || t.status}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`font-semibold ${breached ? "text-red-400" : "text-amber-400"}`}>
                          {breached ? "⚠ Breached" : "⏳ Warning"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {tickets.filter(t => t.sla_breached).length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No SLA breaches or warnings detected</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}