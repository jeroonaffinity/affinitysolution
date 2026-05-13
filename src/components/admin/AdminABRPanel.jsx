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

function RequestCard({ req, onApprove, onDeny, loading }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = req.status?.toLowerCase().includes("pending");

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
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {req._source_label && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {req._source_label}
                </span>
              )}
              {req.status && (() => { const s = getStatusStyle(req.status); return (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.color}`}>
                  {req.status}
                </span>
              ); })()}
            </div>
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
        <div className="px-5 pb-5 border-t border-border/20 flex flex-col gap-4 pt-4">
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
            {req.type && (
              <div><div className="text-xs text-muted-foreground mb-0.5">Request Type</div><div className="font-medium">{req.type}</div></div>
            )}
            {req.application?.virustotalLink && (
              <div className="col-span-full">
                <a href={req.application.virustotalLink} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline">View on VirusTotal →</a>
              </div>
            )}
          </div>

          {isPending && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => onApprove(req)}
                disabled={loading === req.id}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-semibold hover:bg-emerald-500/30 disabled:opacity-50 transition-all"
              >
                {loading === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                onClick={() => onDeny(req)}
                disabled={loading === req.id}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold hover:bg-red-500/30 disabled:opacity-50 transition-all"
              >
                {loading === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Deny
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminABRPanel({ users }) {
  const [requests, setRequests] = useState([]);
  const [clientKeys, setClientKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [sourceFilter, setSourceFilter] = useState("all");

  const loadKeys = useCallback(async () => {
    const data = await base44.entities.Team.list();
    // Normalise team records to match the key shape used in handleAction
    setClientKeys(data.map(t => ({ ...t, label: t.name, client_email: null })));
  }, []);

  const fetchRequests = useCallback(async (tab = activeTab) => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("abrRequests", { action: "list", status: tab });
    if (res.data?.error && !res.data?.requests) {
      setError(res.data.error);
    } else {
      setRequests(res.data?.requests || []);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchRequests(activeTab);
    loadKeys();
  }, [activeTab]);

  const handleAction = async (req, action) => {
    setActionLoading(req.id);
    await base44.functions.invoke("abrRequests", {
      action,
      requestId: req.id,
      apiKey: req._api_key,
      dc: req._dc || "dc3",
    });
    setActionLoading(null);
    fetchRequests(activeTab);
  };

  const sources = ["all", ...new Set(requests.map(r => r._source_label).filter(Boolean))];

  const filtered = requests.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      if (!(r.application?.name?.toLowerCase().includes(q) ||
            r.user?.fullName?.toLowerCase().includes(q) ||
            r.user?.email?.toLowerCase().includes(q) ||
            r.computer?.name?.toLowerCase().includes(q) ||
            r.reason?.toLowerCase().includes(q) ||
            r._source_label?.toLowerCase().includes(q))) return false;
    }
    if (sourceFilter !== "all" && r._source_label !== sourceFilter) return false;
    return true;
  });

  const pendingCount = requests.filter(r => r.status?.toLowerCase().includes("pending")).length;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Admin By Request
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage privilege elevation requests across all clients.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchRequests(activeTab)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <>
          {/* Tabs */}
          <div className="flex gap-1 bg-card/40 border border-border/30 rounded-xl p-1 w-fit">
            {TAB_OPTIONS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "Pending" && <Clock className="w-3.5 h-3.5" />}
                {tab === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {tab === "Denied" && <XCircle className="w-3.5 h-3.5" />}
                {tab}
                {tab === "Pending" && pendingCount > 0 && activeTab !== "Pending" && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search + Source filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-44">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search by app, user, computer, client..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            {sources.length > 2 && (
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border/40 bg-background text-sm focus:outline-none"
              >
                {sources.map(s => <option key={s} value={s}>{s === "all" ? "All Clients" : s}</option>)}
              </select>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <XCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-muted-foreground max-w-xs">Failed to load: {error}</p>
              <button onClick={() => fetchRequests(activeTab)} className="text-xs text-primary hover:underline">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <ShieldAlert className="w-8 h-8 text-primary/30" />
              <p className="text-muted-foreground text-sm">
                {requests.length === 0 ? `No ${activeTab.toLowerCase()} requests across any client.` : "No requests match your filter."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map(req => (
                <RequestCard
                  key={`${req._source_label}-${req.id}`}
                  req={req}
                  onApprove={(r) => handleAction(r, "approve")}
                  onDeny={(r) => handleAction(r, "deny")}
                  loading={actionLoading}
                />
              ))}
            </div>
          )}
      </>
    </div>
  );
}