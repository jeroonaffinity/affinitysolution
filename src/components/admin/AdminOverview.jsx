import { Ticket, Server, MessageSquare, Users, TrendingUp, Clock, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { TICKET_STATUSES } from "@/lib/slaConfig";

export default function AdminOverview({ tickets, services, leads, users, setActiveSection }) {
  const closedStatuses = ["resolved", "closed"];
  const openTickets = tickets.filter(t => !closedStatuses.includes(t.status)).length;
  const inProgressTickets = tickets.filter(t => t.status === "in_progress").length;
  const resolvedToday = tickets.filter(t => {
    if (!closedStatuses.includes(t.status)) return false;
    const d = new Date(t.updated_date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const criticalOpen = tickets.filter(t => t.priority === "critical" && !closedStatuses.includes(t.status)).length;
  const breached = tickets.filter(t => t.sla_breached).length;
  const slaCompliance = tickets.length > 0 ? Math.round(((tickets.length - breached) / tickets.length) * 100) : 100;

  const activeServices = services.filter(s => s.status === "active");
  const totalMRR = activeServices.reduce((sum, s) => sum + (s.monthly_cost || 0), 0);

  const recentLeads = leads.filter(l => (Date.now() - new Date(l.created_date).getTime()) < 48 * 3600 * 1000).length;
  const activeUsers = users.filter(u => u.role === "user").length;
  const adminUsers = users.filter(u => u.role === "admin").length;

  const recentTickets = [...tickets].slice(0, 5);

  const statusColor = { open: "text-yellow-400", in_progress: "text-blue-400", resolved: "text-green-400", closed: "text-muted-foreground" };
  const priorityDot = { low: "bg-muted-foreground", medium: "bg-primary", high: "bg-orange-400", critical: "bg-red-500" };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Operations Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time status of your MSP operations</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={Ticket} label="Open Tickets" value={openTickets} sub={`${inProgressTickets} in progress`} accent="yellow" onClick={() => setActiveSection("tickets")} />
        <KpiCard icon={AlertTriangle} label="Critical Issues" value={criticalOpen} sub="Needs immediate action" accent={criticalOpen > 0 ? "red" : "green"} onClick={() => setActiveSection("tickets")} />
        <KpiCard icon={ShieldCheck} label="SLA Compliance" value={`${slaCompliance}%`} sub={`${breached} breach${breached !== 1 ? "es" : ""}`} accent={slaCompliance >= 90 ? "green" : slaCompliance >= 70 ? "yellow" : "red"} onClick={() => setActiveSection("reporting")} />
        <KpiCard icon={TrendingUp} label="Monthly Revenue" value={`£${totalMRR.toLocaleString()}`} sub={`${activeServices.length} active services`} accent="primary" onClick={() => setActiveSection("services")} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="xl:col-span-2 bg-card border border-border/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">Recent Tickets</h2>
            <button onClick={() => setActiveSection("tickets")} className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No tickets yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {recentTickets.map(t => (
                <div key={t.id} className="py-3 flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[t.priority]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.client_email}</div>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ${statusColor[t.status]}`}>{t.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <h2 className="font-bold text-base mb-4">Today's Summary</h2>
            <div className="flex flex-col gap-3">
              <StatRow label="Resolved today" value={resolvedToday} icon={CheckCircle2} iconColor="text-green-400" />
              <StatRow label="New leads (48h)" value={recentLeads} icon={MessageSquare} iconColor="text-primary" />
              <StatRow label="Total users" value={users.length} icon={Users} iconColor="text-accent" />
              <StatRow label="Active services" value={activeServices.length} icon={Server} iconColor="text-primary" />
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <h2 className="font-bold text-base mb-4">Ticket Breakdown</h2>
            <BreakdownBar tickets={tickets} />
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      {leads.length > 0 && (
        <div className="mt-6 bg-card border border-border/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">Latest Enquiries</h2>
            <button onClick={() => setActiveSection("leads")} className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {leads.slice(0, 3).map(l => (
              <div key={l.id} className="p-3 rounded-xl border border-border/40 bg-background/40">
                <div className="font-semibold text-sm">{l.name}</div>
                {l.company && <div className="text-xs text-muted-foreground">{l.company}</div>}
                <div className="text-xs text-muted-foreground mt-1">{l.contact}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                    {l.preferred_method === "call" ? "Call back" : "Email"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">{new Date(l.created_date).toLocaleDateString("en-GB")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent, onClick }) {
  const accentMap = {
    primary: "bg-primary/15 text-primary",
    yellow: "bg-yellow-500/15 text-yellow-400",
    red: "bg-red-500/15 text-red-400",
    green: "bg-green-500/15 text-green-400",
  };
  return (
    <button onClick={onClick} className="p-5 bg-card border border-border/60 rounded-2xl flex items-start gap-4 text-left hover:border-primary/40 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentMap[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs font-medium text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

function StatRow({ label, value, icon: Icon, iconColor }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        {label}
      </div>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}

function BreakdownBar({ tickets }) {
  const total = tickets.length || 1;
  const allStatuses = Object.keys(TICKET_STATUSES);
  const counts = allStatuses.reduce((acc, s) => {
    acc[s] = tickets.filter(t => t.status === s).length;
    return acc;
  }, {});
  const colors = {
    new: "bg-slate-400", acknowledged: "bg-cyan-400", open: "bg-amber-400",
    in_progress: "bg-blue-400", waiting_on_client: "bg-violet-400", waiting_on_vendor: "bg-orange-400",
    escalated: "bg-red-400", pending_approval: "bg-yellow-400", on_hold: "bg-purple-400",
    resolved: "bg-emerald-400", closed: "bg-slate-600"
  };
  const labels = Object.fromEntries(Object.entries(TICKET_STATUSES).map(([k, v]) => [k, v.label]));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {Object.entries(counts).map(([key, count]) => count > 0 && (
          <div key={key} className={`${colors[key]} rounded-full`} style={{ width: `${(count / total) * 100}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2">
        {Object.entries(counts).filter(([, c]) => c > 0).map(([key, count]) => (
          <div key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={`w-2 h-2 rounded-full shrink-0 ${colors[key]}`} />
            <span className="truncate">{labels[key]}: <span className="text-foreground font-medium">{count}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}