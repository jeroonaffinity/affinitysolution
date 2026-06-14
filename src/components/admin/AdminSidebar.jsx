import { base44 } from "@/api/base44Client";
import { LayoutDashboard, Ticket, Server, MessageSquare, LogOut, AlertCircle, ShieldAlert, Building2, Mail, BarChart2, Monitor } from "lucide-react";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "reporting", label: "Reporting", icon: BarChart2 },
  { id: "email", label: "Email Centre", icon: Mail },
  { id: "services", label: "Services", icon: Server },
  { id: "leads", label: "Leads", icon: MessageSquare },
  { id: "clients", label: "Clients & Users", icon: Building2 },
  { id: "abr", label: "ABR Requests", icon: ShieldAlert },
  { id: "action1", label: "Endpoints", icon: Monitor },
];

export default function AdminSidebar({ activeSection, setActiveSection, tickets, leads, user }) {
  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const criticalTickets = tickets.filter(t => t.priority === "critical" && (t.status === "open" || t.status === "in_progress")).length;
  const newLeads = leads.filter(l => {
    const d = new Date(l.created_date);
    return (Date.now() - d.getTime()) < 48 * 60 * 60 * 1000;
  }).length;

  const badges = {
    tickets: openTickets,
    leads: newLeads,
  };

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-card border-r border-border/60 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border/40">
        <img
          src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
          alt="AffinitySolution"
          className="h-8 w-auto"
        />
        <div className="mt-2 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Admin Console</div>
      </div>

      {/* Critical alert */}
      {criticalTickets > 0 && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs text-red-400 font-medium">{criticalTickets} critical ticket{criticalTickets > 1 ? "s" : ""} open</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeSection === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4" />
              {label}
            </div>
            {badges[id] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeSection === id ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
              }`}>
                {badges[id]}
              </span>
            )}
          </button>
        ))}


      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {(user?.full_name || user?.email || "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">{user?.full_name || "Admin"}</div>
            <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={() => base44.auth.logout("/")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}