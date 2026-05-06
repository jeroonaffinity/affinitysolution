import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import AdminTicketsTable from "@/components/admin/AdminTicketsTable";
import AdminServicesTable from "@/components/admin/AdminServicesTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

const TABS = ["Tickets", "Services", "Leads", "Users"];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tickets");
  const [filterEmail, setFilterEmail] = useState("");

  const fetchAll = async () => {
    const [t, s, l, u] = await Promise.all([
      base44.entities.SupportTicket.list("-created_date", 200),
      base44.entities.ServiceUsage.list("-created_date", 200),
      base44.entities.ContactSubmission.list("-created_date", 200),
      base44.entities.User.list("-created_date", 200),
    ]);
    setTickets(t);
    setServices(s);
    setLeads(l);
    setUsers(u);
  };

  useEffect(() => {
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
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

  const filtered = (arr, emailKey = "client_email") =>
    filterEmail ? arr.filter(x => (x[emailKey] || "").toLowerCase().includes(filterEmail.toLowerCase())) : arr;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">MSP Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage all client tickets, services, and enquiries.</p>
          </div>
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all flex-shrink-0"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <input
            placeholder="Filter by client email..."
            value={filterEmail}
            onChange={e => setFilterEmail(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/60 w-full max-w-sm placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-card/50 border border-border/60 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Tickets" && (
          <AdminTicketsTable tickets={filtered(tickets)} onRefresh={fetchAll} />
        )}

        {activeTab === "Services" && (
          <AdminServicesTable services={filtered(services)} onRefresh={fetchAll} />
        )}

        {activeTab === "Leads" && (
          <div className="flex flex-col gap-3">
            {filtered(leads, "contact").length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No leads found.</p>}
            {filtered(leads, "contact").map(l => (
              <div key={l.id} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-sm">{l.name} {l.company ? `· ${l.company}` : ""}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{l.preferred_method === "call" ? "Call back" : "Email"}</span>
                </div>
                <div className="text-xs text-muted-foreground">{l.contact}</div>
                {l.message && <p className="text-xs text-muted-foreground/80 mt-1">{l.message}</p>}
                <div className="text-xs text-muted-foreground/50 mt-1">{new Date(l.created_date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Users" && (
          <div>
            <AdminUsersTable
              users={filterEmail ? users.filter(u => (u.email || "").toLowerCase().includes(filterEmail.toLowerCase()) || (u.full_name || "").toLowerCase().includes(filterEmail.toLowerCase())) : users}
              currentUserId={user?.id}
              onRefresh={fetchAll}
            />
          </div>
        )}
      </div>
    </div>
  );
}