import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, Clock,
  Monitor, User, Calendar, ChevronDown, ChevronUp, ShieldAlert, Search
} from "lucide-react";

const getStatusStyle = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("pending"))  return { bg: "bg-amber-500/15",   color: "text-amber-400"   };
  if (s.includes("approved")) return { bg: "bg-emerald-500/15", color: "text-emerald-400" };
  if (s.includes("denied") || s.includes("deleted")) return { bg: "bg-red-500/15", color: "text-red-400" };
  return { bg: "bg-muted", color: "text-muted-foreground" };
};

const TAB_OPTIONS = ["Pending", "Approved", "Denied"];

function RequestCard({ req }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      expanded ? "border-primary/30 bg-card/70" : "border-border/30 bg-card/30 hover:border-border/60"
    }`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpanded(!expanded)}>
        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-amber-400" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-semibold text-sm truncate">
              {req.application?.name || req.requesttype || "Admin Request"}
            </span>
            {req.status && (() => { const s = getStatusStyle(req.status); return (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${s.bg} ${s.color}`}>
                {req.status}
              </span>
            ); })()}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {req.user?.fullName || req.user?.email ? (
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{req.user.fullName || req.user.email}</span>
            ) : null}
            {req.computer?.name && (
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{req.computer.name}</span>
            )}
            {req.requestTime && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(req.requestTime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 flex flex-col gap-3 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {req.reason && (
              <div className="col-span-full">
                <div className="text-xs text-muted-foreground mb-1">Reason</div>
                <div className="bg-background/40 rounded-xl px-4 py-3 border border-border/20 text-foreground/80 leading-relaxed">
                  {req.reason}
                </div>
              </div>
            )}
            {req.application?.vendor && (
              <div><div className="text-xs text-muted-foreground mb-0.5">Vendor</div><div className="font-medium">{req.application.vendor}</div></div>
            )}
            {req.application?.version && (
              <div><div className="text-xs text-muted-foreground mb-0.5">Version</div><div className="font-medium">{req.application.version}</div></div>
            )}
            {req.application?.scanResult && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Scan Result</div>
                <div className={`font-semibold ${req.application.scanResult === "Clean" ? "text-emerald-400" : "text-red-400"}`}>
                  {req.application.scanResult}
                </div>
              </div>
            )}
            {req.computer?.platform && (
              <div><div className="text-xs text-muted-foreground mb-0.5">Platform</div><div className="font-medium">{req.computer.platform}</div></div>
            )}
            {req.computer?.model && (
              <div><div className="text-xs text-muted-foreground mb-0.5">Device</div><div className="font-medium">{req.computer.model}</div></div>
            )}
            {req.user?.email && (
              <div><div className="text-xs text-muted-foreground mb-0.5">Email</div><div className="font-medium">{req.user.email}</div></div>
            )}
            {req.application?.virustotalLink && (
              <div className="col-span-full">
                <a href={req.application.virustotalLink} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline">View on VirusTotal →</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientABRTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [noKey, setNoKey] = useState(false);

  const fetchRequests = useCallback(async (tab = activeTab) => {
    setLoading(true);
    setError(null);
    setNoKey(false);
    try {
      const res = await base44.functions.invoke("abrRequests", { action: "list", status: tab });
      if (res.data?.error === "No ABR key assigned") {
        setNoKey(true);
      } else if (res.data?.error) {
        setError(res.data.error);
      } else {
        setRequests(res.data?.requests || []);
      }
    } catch (err) {
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchRequests(activeTab); }, [activeTab]);

  const filtered = requests.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.application?.name?.toLowerCase().includes(q) ||
      r.user?.fullName?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q) ||
      r.computer?.name?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  const pendingCount = requests.filter(r => r.status?.toLowerCase().includes("pending")).length;

  if (noKey) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-primary/40" />
        </div>
        <div>
          <p className="font-semibold text-sm">Admin Access Not Configured</p>
          <p className="text-muted-foreground text-xs mt-1 max-w-xs">
            Your account hasn't been linked to an Admin By Request account yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" /> Admin By Request
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Privilege elevation requests from your endpoints.</p>
        </div>
        <button onClick={() => fetchRequests(activeTab)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card/40 border border-border/30 rounded-xl p-1 w-fit">
        {TAB_OPTIONS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab === "Pending" && <Clock className="w-3.5 h-3.5" />}
            {tab === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
            {tab === "Denied" && <XCircle className="w-3.5 h-3.5" />}
            {tab}
            {tab === "Pending" && pendingCount > 0 && activeTab !== "Pending" && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search by app, user, computer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : error ? (
        <div className="text-center py-12 text-muted-foreground text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <ShieldAlert className="w-8 h-8 text-primary/30" />
          <p className="text-muted-foreground text-sm">
            {requests.length === 0 ? `No ${activeTab.toLowerCase()} requests.` : "No requests match your search."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(req => <RequestCard key={req.id} req={req} />)}
        </div>
      )}
    </div>
  );
}