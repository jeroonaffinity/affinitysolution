import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Ticket, CreditCard, MessageSquare, Loader2, LayoutDashboard, LogOut, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "@/components/dashboard/StatsCard";
import TicketsSection from "@/components/dashboard/TicketsSection";
import BillingSection from "@/components/dashboard/BillingSection";
import LeadsSection from "@/components/dashboard/LeadsSection";

const TABS = ["Overview", "Support Tickets", "Billing", "My Enquiries"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  const fetchData = async (currentUser) => {
    const email = currentUser.email;
    const [t, s, sub] = await Promise.all([
      base44.entities.SupportTicket.filter({ client_email: email }, "-created_date"),
      base44.entities.ServiceUsage.filter({ client_email: email }, "-created_date"),
      base44.entities.ContactSubmission.filter({ contact: email }, "-created_date"),
    ]);
    setTickets(t);
    setServices(s);
    setSubmissions(sub);
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
      await fetchData(me);
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

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const totalMonthly = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const activeServices = services.filter(s => s.status === "active").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-extrabold">Client Portal</h1>
            </div>
            <button
              onClick={() => base44.auth.logout("/")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
          <p className="text-muted-foreground text-sm">Welcome back, <span className="text-foreground font-medium">{user?.full_name || user?.email}</span></p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-card/50 border border-border/60 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard icon={Ticket} label="Open Tickets" value={openTickets} sub={`${tickets.length} total`} color={openTickets > 0 ? "yellow" : "green"} />
              <StatsCard icon={CreditCard} label="Monthly Spend" value={`£${totalMonthly}`} sub={`${activeServices} active service${activeServices !== 1 ? "s" : ""}`} color="primary" />
              <StatsCard icon={MessageSquare} label="Enquiries" value={submissions.length} sub="Contact form submissions" color="primary" />
            </div>

            {/* Quick links */}
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/my-tickets"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/8 text-primary text-sm font-semibold hover:bg-primary/15 transition-all"
              >
                <Ticket className="w-4 h-4" /> View All My Tickets
              </Link>
            </div>

            {/* Recent tickets */}
            {tickets.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Recent Tickets</h2>
                <TicketsSection tickets={tickets.slice(0, 3)} userEmail={user?.email} onRefresh={() => fetchData(user)} />
              </div>
            )}

            {/* Active services summary */}
            {services.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Active Services</h2>
                <BillingSection services={services.filter(s => s.status === "active")} />
              </div>
            )}
          </div>
        )}

        {activeTab === "Support Tickets" && (
          <div className="flex flex-col gap-4">
            <Link
              to="/my-tickets"
              className="flex items-center gap-2 self-start px-4 py-2 rounded-xl border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Open Full Ticket View
            </Link>
            <TicketsSection tickets={tickets} userEmail={user?.email} onRefresh={() => fetchData(user)} />
          </div>
        )}

        {activeTab === "Billing" && (
          <BillingSection services={services} />
        )}

        {activeTab === "My Enquiries" && (
          <LeadsSection submissions={submissions} />
        )}
      </div>
    </div>
  );
}