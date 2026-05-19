import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Ticket, CreditCard, Loader2, LogOut,
  Server, ArrowRight, Trash2, AlertTriangle,
  Fingerprint, ShieldOff
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import TicketsTab from "@/components/tickets/TicketsTab";
import BillingTab from "@/components/dashboard/BillingTab";
import SupportDocsTab from "@/components/dashboard/SupportDocsTab";
import ClientABRTab from "@/components/dashboard/ClientABRTab";
import ClientEndpointsTab from "@/components/dashboard/ClientEndpointsTab";
import DiagnosticsOverview from "@/components/dashboard/DiagnosticsOverview";
import BiometricLockScreen from "@/components/BiometricLockScreen";
import { useBiometricLock } from "@/hooks/useBiometricLock";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import KBSearchBar from "@/components/dashboard/KBSearchBar";

const TABS = [
  { id: "overview",  label: "Overview"        },
  { id: "tickets",   label: "Support Tickets"  },
  { id: "billing",   label: "Billing"          },
  { id: "docs",      label: "Support Docs"     },
  { id: "abr",       label: "Admin Access"     },
  { id: "endpoints", label: "Endpoints"        },
  { id: "settings",  label: "Account Settings" },
];

const ACTIVE_STATUSES = ["new", "acknowledged", "open", "in_progress", "escalated", "pending_approval"];

function StatCard({ icon: Icon, label, value, sub, accent = false, onClick }) {
  return (
    <div onClick={onClick} className={`relative p-5 rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 ${onClick ? "cursor-pointer" : ""} ${accent ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card/50"}`}>
      <div className="relative">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${accent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold tracking-tight mb-0.5">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/60 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function AccountSettingsTab({ user, biometric }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="p-5 rounded-2xl border border-border/40 bg-card/50 flex flex-col gap-1.5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Profile</div>
        <div className="text-sm font-medium">{user?.full_name || "—"}</div>
        <div className="text-sm text-muted-foreground">{user?.email}</div>
        <div className="text-xs text-muted-foreground mt-1">Role: <span className="capitalize">{user?.role || "user"}</span></div>
      </div>

      {biometric.isSupported && (
        <div className="p-5 rounded-2xl border border-border/40 bg-card/50 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Biometric Lock</span>
            {biometric.isRegistered && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 ml-auto">Active</span>}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {biometric.isRegistered
              ? "Your portal will automatically lock after 5 minutes of inactivity."
              : "Enable Face ID or fingerprint unlock to secure your portal."}
          </p>
          {biometric.isRegistered ? (
            <button onClick={biometric.disable} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-all w-fit">
              <ShieldOff className="w-3.5 h-3.5" /> Disable Biometric Lock
            </button>
          ) : (
            <button onClick={biometric.register} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition-all w-fit">
              <Fingerprint className="w-3.5 h-3.5" /> Enable Biometric Lock
            </button>
          )}
        </div>
      )}

      <div className="p-5 rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">Danger Zone</span>
        </div>
        {!showConfirm ? (
          <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-all w-fit">
            <Trash2 className="w-3.5 h-3.5" /> Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-3 bg-background/50 rounded-xl p-4 border border-destructive/20">
            <p className="text-xs text-muted-foreground">Type <strong className="text-foreground">DELETE</strong> to confirm:</p>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Type DELETE here"
              className="px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:border-destructive/60" />
            <div className="flex gap-2">
              <button onClick={async () => { if (confirmText !== "DELETE") return; setDeleting(true); await base44.auth.logout("/"); }}
                disabled={confirmText !== "DELETE" || deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold disabled:opacity-50 transition-all">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Confirm Delete
              </button>
              <button onClick={() => { setShowConfirm(false); setConfirmText(""); }} className="px-4 py-2 rounded-xl border border-border/50 text-sm hover:bg-card transition-all">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [services, setServices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [endpoints, setEndpoints] = useState([]);

  const biometric = useBiometricLock();
  useRealtimeNotifications({ userEmail: user?.email, endpoints });

  const reloadTickets = async (email) => {
    const targetEmail = email || user?.email;
    if (!targetEmail) return;
    setLoadingTickets(true);
    try {
      const data = await base44.entities.SupportTicket.filter({ client_email: targetEmail });
      setTickets(data);
    } catch (err) {
      console.error("Failed to reload tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me) { base44.auth.redirectToLogin("/dashboard"); return; }
        setUser(me);

        const [ticketData, serviceData, teamData] = await Promise.all([
          base44.entities.SupportTicket.filter({ client_email: me.email }).catch(() => []),
          base44.entities.ServiceUsage.list().catch(() => []),
          base44.entities.Team.list().catch(() => []),
        ]);

        setTickets(ticketData);
        setServices(serviceData);
        const userTeam = teamData.find(t => t.member_emails?.includes(me.email)) || null;
        setTeam(userTeam);
      } catch (error) {
        if (error?.status === 401 || error?.response?.status === 401) {
          base44.auth.redirectToLogin("/dashboard");
          return;
        }
        console.error("Dashboard init error:", error);
      } finally {
        setLoadingPage(false);
      }
    })();

    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event.type === "create") setTickets(prev => [event.data, ...prev]);
      else if (event.type === "update") setTickets(prev => prev.map(t => t.id === event.id ? event.data : t));
      else if (event.type === "delete") setTickets(prev => prev.filter(t => t.id !== event.id));
    });

    return () => unsub();
  }, []);

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5">
        <img src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png" alt="AffinitySolution" className="h-9 w-auto" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  const totalMonthly = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const activeServices = services.filter(s => s.status === "active").length;
  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors closeButton />

      {biometric.isRegistered && biometric.isLocked && (
        <BiometricLockScreen unlocking={biometric.unlocking} error={biometric.error} onUnlock={biometric.unlock} onSkip={biometric.disable} />
      )}

      <div className="sticky top-0 z-30 border-b border-white/6 bg-black/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png" alt="AffinitySolution" className="h-7 w-auto" />
            <div className="hidden sm:block w-px h-4 bg-border/60" />
            <span className="hidden sm:block text-sm font-medium text-muted-foreground">Client Portal</span>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <KBSearchBar />
            <div className="hidden sm:flex items-center gap-2.5 text-sm flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
              <span className="text-muted-foreground font-medium truncate max-w-[120px]">{user?.full_name || user?.email}</span>
            </div>
            <button onClick={() => base44.auth.logout("/")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            <span className="text-gradient">{user?.full_name?.split(" ")[0] || "there"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's a live view of your IT environment.</p>
        </div>

        <div className="flex gap-1 bg-card/40 border border-border/30 rounded-xl p-1 w-fit flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard icon={Ticket} label="Support Tickets" value={tickets.length}
                sub={`${tickets.filter(t => ACTIVE_STATUSES.includes(t.status)).length} active`}
                onClick={() => setActiveTab("tickets")} />
              <StatCard icon={CreditCard} label="Monthly Spend" value={`£${totalMonthly.toLocaleString()}`}
                sub={`${activeServices} active service${activeServices !== 1 ? "s" : ""}`} accent />
            </div>

            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Support Tickets</div>
                <div className="text-xs text-muted-foreground mt-0.5">View and manage your support requests</div>
              </div>
              <button onClick={() => setActiveTab("tickets")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                View Tickets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <DiagnosticsOverview userEmail={user?.email} onGoToEndpoints={() => setActiveTab("endpoints")} />

            {activeServices > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Services</h2>
                  <button onClick={() => setActiveTab("billing")} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    View billing <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.filter(s => s.status === "active").map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card/30">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Server className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.service_name}</div>
                        <div className="text-xs text-muted-foreground">£{s.monthly_cost}/mo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <TicketsTab
            userEmail={user.email}
            userName={user.full_name || user.email}
            teamId={team?.id}
            tickets={tickets}
            loadingTickets={loadingTickets}
            reloadTickets={() => reloadTickets(user.email)}
          />
        )}
        {activeTab === "billing" && <BillingTab services={services} userName={user?.full_name || user?.email} />}
        {activeTab === "docs" && <SupportDocsTab />}
        {activeTab === "abr" && <ClientABRTab />}
        {activeTab === "endpoints" && <ClientEndpointsTab userEmail={user?.email} />}
        {activeTab === "settings" && <AccountSettingsTab user={user} biometric={biometric} />}
      </div>
    </div>
  );
}