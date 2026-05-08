import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldAlert } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminTicketsBoard from "@/components/admin/AdminTicketsBoard";
import AdminServicesPanel from "@/components/admin/AdminServicesPanel";
import AdminLeadsPanel from "@/components/admin/AdminLeadsPanel";
import AdminUsersPanel from "@/components/admin/AdminUsersPanel";
import AdminABRPanel from "@/components/admin/AdminABRPanel";
import AdminAction1Panel from "@/components/admin/AdminAction1Panel";
import AdminClientManagement from "@/components/admin/AdminClientManagement";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  const fetchAll = async () => {
    const [t, s, l, u, tm] = await Promise.all([
      base44.entities.SupportTicket.list("-created_date", 200),
      base44.entities.ServiceUsage.list("-created_date", 200),
      base44.entities.ContactSubmission.list("-created_date", 200),
      base44.entities.User.list("-created_date", 200),
      base44.entities.Team.list("-created_date"),
    ]);
    setTickets(t);
    setServices(s);
    setLeads(l);
    setUsers(u);
    setTeams(tm);
  };

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { base44.auth.redirectToLogin(window.location.href); return; }
      const me = await base44.auth.me();
      setUser(me);
      await fetchAll();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground text-sm max-w-xs">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        tickets={tickets}
        leads={leads}
        user={user}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {activeSection === "overview" && (
          <AdminOverview tickets={tickets} services={services} leads={leads} users={users} setActiveSection={setActiveSection} />
        )}
        {activeSection === "tickets" && (
          <AdminTicketsBoard />
        )}
        {activeSection === "services" && (
          <AdminServicesPanel services={services} users={users} onRefresh={fetchAll} />
        )}
        {activeSection === "leads" && (
          <AdminLeadsPanel leads={leads} />
        )}
        {activeSection === "users" && (
          <AdminUsersPanel users={users} teams={teams} currentUserId={user?.id} onRefresh={fetchAll} />
        )}
        {activeSection === "clients" && (
          <AdminClientManagement users={users} tickets={tickets} services={services} onRefresh={fetchAll} />
        )}
        {activeSection === "abr" && (
          <AdminABRPanel users={users} />
        )}
        {activeSection === "action1" && (
          <AdminAction1Panel />
        )}
      </main>
    </div>
  );
}