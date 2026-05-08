import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, Clock,
  Monitor, User, Calendar, ChevronDown, ChevronUp, ShieldAlert, Search
} from "lucide-react";

const STATUS_CONFIG = {
  Pending:    { label: "Pending",  bg: "bg-amber-500/15",   color: "text-amber-400",   dot: "bg-amber-400"   },
  Approved:   { label: "Approved", bg: "bg-emerald-500/15", color: "text-emerald-400", dot: "bg-emerald-400" },
  Denied:     { label: "Denied",   bg: "bg-red-500/15",     color: "text-red-400",     dot: "bg-red-400"     },
};

const TAB_OPTIONS = ["Pending", "Approved", "Denied"];

function RequestCard({ req, onApprove, onDeny, loading }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = req.status?.toLowerCase() === "pending";

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
              {req.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[req.status]?.bg || "bg-muted"} ${STATUS_CONFIG[req.status]?.color || "text-muted-foreground"}`}>
                  {req.status}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {req.account?.user && (
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{req.account.user}</span>
            )}
            {req.computer?.name && (
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{req.computer.name}</span>
            )}
            {req.requesttime && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(req.requesttime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 flex flex-col gap-4 pt-4">
          {/* Details grid */}
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
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Vendor</div>
                <div className="font-medium">{req.application.vendor}</div>
              </div>
            )}
            {req.application?.version && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Version</div>
                <div className="font-medium">{req.application.version}</div>
              </div>
            )}
            {req.computer?.platform && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Platform</div>
                <div className="font-medium">{req.computer.platform}</div>
              </div>
            )}
            {req.computer?.ip && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">IP Address</div>
                <div className="font-medium font-mono text-xs">{req.computer.ip}</div>
              </div>
            )}
            {req.riskassessment?.risklevel && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Risk Level</div>
                <div className={`font-semibold ${
                  req.riskassessment.risklevel === "High" ? "text-red-400" :
                  req.riskassessment.risklevel === "Medium" ? "text-amber-400" : "text-emerald-400"
                }`}>{req.riskassessment.risklevel}</div>
              </div>
            )}
            {req.riskassessment?.appscore != null && (
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">App Score</div>
                <div className="font-medium">{req.riskassessment.appscore}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          {isPending && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => onApprove(req.id)}
                disabled={loading === req.id}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-semibold hover:bg-emerald-500/30 disabled:opacity-50 transition-all"
              >
                {loading === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                onClick={() => onDeny(req.id)}
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

export default function AdminABRPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async (tab = activeTab) => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("abrRequests", { action: "list", status: tab });
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setRequests(res.data?.requests || []);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const handleAction = async (requestId, newStatus) => {
    setActionLoading(requestId);
    await base44.functions.invoke("abrRequests", { action: "update", requestId, status: newStatus });
    setActionLoading(null);
    fetchRequests(activeTab);
  };

  const filtered = requests.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.application?.name?.toLowerCase().includes(q) ||
      r.account?.user?.toLowerCase().includes(q) ||
      r.computer?.name?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  });

  const pendingCount = requests.filter(r => r.status?.toLowerCase() === "pending").length;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Admin By Request
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and action privilege elevation requests from your endpoints.</p>
        </div>
        <button
          onClick={() => fetchRequests(activeTab)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">Failed to load requests: {error}</p>
          <button onClick={() => fetchRequests(activeTab)} className="text-xs text-primary hover:underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground text-sm">
            {requests.length === 0 ? `No ${activeTab.toLowerCase()} requests.` : "No requests match your search."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              onApprove={(id) => handleAction(id, "Approved")}
              onDeny={(id) => handleAction(id, "Denied")}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}