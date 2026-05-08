import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, RefreshCw, Monitor, Wifi, WifiOff, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronUp, Search, Building2, Shield
} from "lucide-react";

const STATUS_STYLE = {
  Connected: { bg: "bg-emerald-500/15", color: "text-emerald-400", icon: Wifi },
  Disconnected: { bg: "bg-red-500/15", color: "text-red-400", icon: WifiOff },
};

const UPDATE_STYLE = {
  OK: { bg: "bg-emerald-500/15", color: "text-emerald-400" },
  WARNING: { bg: "bg-amber-500/15", color: "text-amber-400" },
  ERROR: { bg: "bg-red-500/15", color: "text-red-400" },
};

function EndpointCard({ ep }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLE[ep.status] || STATUS_STYLE.Disconnected;
  const updateStyle = UPDATE_STYLE[ep.update_status] || UPDATE_STYLE.WARNING;
  const StatusIcon = status.icon;

  const fmt = (str) => str?.replace(/_/g, " ").replace(/(\d{4})-(\d{2})-(\d{2}).*/, "$3/$2/$1") || "—";

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${expanded ? "border-primary/30 bg-card/70" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Monitor className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-sm">{ep.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3 h-3" />{ep.status}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${updateStyle.bg} ${updateStyle.color}`}>
              {ep.update_status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>{ep.OS}</span>
            <span>{ep.address}</span>
            {ep.user && ep.user !== "None" && <span>👤 {ep.user}</span>}
            <span>Last seen: {fmt(ep.last_seen)}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Info label="Platform" value={ep.platform} />
          <Info label="Architecture" value={ep.architecture} />
          <Info label="Agent Version" value={ep.agent_version} />
          <Info label="RAM" value={ep.RAM} />
          <Info label="CPU" value={ep.CPU_name} />
          <Info label="Disk" value={ep.disk} />
          <Info label="MAC" value={ep.MAC} />
          <Info label="Serial" value={ep.serial || "—"} />
          <Info label="Manufacturer" value={ep.manufacturer} />
          <Info label="Last Boot" value={fmt(ep.last_boot_time)} />
          <Info label="Install Date" value={fmt(ep.agent_install_date)} />
          <Info label="Reboot Required" value={ep.reboot_required} highlight={ep.reboot_required === "Yes" ? "text-amber-400" : "text-emerald-400"} />
          {ep.missing_updates && (
            <div className="col-span-full">
              <div className="text-xs text-muted-foreground mb-1">Missing Updates</div>
              <div className="flex gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ep.missing_updates.critical > 0 ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {ep.missing_updates.critical} Critical
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ep.missing_updates.other > 0 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {ep.missing_updates.other} Other
                </span>
              </div>
            </div>
          )}
          {ep.group_membership?.length > 0 && (
            <div className="col-span-full">
              <div className="text-xs text-muted-foreground mb-1">Groups</div>
              <div className="flex flex-wrap gap-2">
                {ep.group_membership.map(g => (
                  <span key={g.id} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary">{g.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-sm font-medium ${highlight || ""}`}>{value || "—"}</div>
    </div>
  );
}

export default function AdminAction1Panel() {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("action1Requests", { action: "organizations" });
    const items = res.data?.data?.items || [];
    setOrgs(items);
    if (items.length > 0) {
      setSelectedOrg(items[0]);
    }
    setLoading(false);
  }, []);

  const loadEndpoints = useCallback(async (org) => {
    if (!org) return;
    setLoadingEndpoints(true);
    setError(null);
    const res = await base44.functions.invoke("action1Requests", { action: "endpoints", orgId: org.id });
    setEndpoints(res.data?.data?.items || []);
    setLoadingEndpoints(false);
  }, []);

  useEffect(() => { loadOrgs(); }, []);
  useEffect(() => { if (selectedOrg) loadEndpoints(selectedOrg); }, [selectedOrg]);

  const filtered = endpoints.filter(ep => {
    if (!search) return true;
    const q = search.toLowerCase();
    return ep.name?.toLowerCase().includes(q) ||
      ep.OS?.toLowerCase().includes(q) ||
      ep.address?.toLowerCase().includes(q) ||
      ep.user?.toLowerCase().includes(q) ||
      ep.platform?.toLowerCase().includes(q);
  });

  const connected = endpoints.filter(e => e.status === "Connected").length;
  const criticalUpdates = endpoints.reduce((s, e) => s + (e.missing_updates?.critical || 0), 0);
  const rebootRequired = endpoints.filter(e => e.reboot_required === "Yes").length;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" /> Action1 Endpoints
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Managed endpoints via Action1 RMM.</p>
        </div>
        <button
          onClick={() => loadEndpoints(selectedOrg)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Org selector */}
          {orgs.length > 1 && (
            <div className="flex items-center gap-3 flex-wrap">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2 flex-wrap">
                {orgs.map(org => (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedOrg?.id === org.id ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {org.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {endpoints.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Endpoints" value={endpoints.length} color="text-foreground" />
              <StatCard label="Connected" value={connected} color="text-emerald-400" />
              <StatCard label="Critical Updates" value={criticalUpdates} color={criticalUpdates > 0 ? "text-red-400" : "text-emerald-400"} />
              <StatCard label="Reboot Required" value={rebootRequired} color={rebootRequired > 0 ? "text-amber-400" : "text-emerald-400"} />
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search by name, OS, IP, user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Endpoints list */}
          {loadingEndpoints ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Monitor className="w-8 h-8 text-primary/30" />
              <p className="text-muted-foreground text-sm">{endpoints.length === 0 ? "No endpoints found for this organisation." : "No endpoints match your search."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map(ep => <EndpointCard key={ep.id} ep={ep} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-card/40 border border-border/30 rounded-2xl px-4 py-3 text-center">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}