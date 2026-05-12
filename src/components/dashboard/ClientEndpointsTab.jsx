import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Monitor, Wifi, WifiOff, ChevronDown, ChevronUp,
  RotateCcw, Download, Terminal, CheckCircle2, XCircle, Search, RefreshCw
} from "lucide-react";
import PullToRefreshWrapper from "@/components/PullToRefreshWrapper";

const STATUS_STYLE = {
  Connected: { bg: "bg-emerald-500/15", color: "text-emerald-400", icon: Wifi },
  Disconnected: { bg: "bg-red-500/15", color: "text-red-400", icon: WifiOff },
};

function fmt(str) {
  if (!str || str === "None") return "—";
  return str.replace(/_/g, " ").replace(/(\d{4})-(\d{2})-(\d{2}).*/,"$3/$2/$1");
}

function ScriptModal({ ep, orgId, onClose }) {
  const [scriptText, setScriptText] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    const res = await base44.functions.invoke("action1Requests", {
      action: "control", orgId, controlAction: "run_script",
      endpointIds: [ep.id], scriptText,
    });
    setResult(res.data?.success ? "success" : res.data?.error || "Failed");
    setRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 shadow-2xl mx-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2"><Terminal className="w-4 h-4 text-primary" /> Run Script on {ep.name}</h3>
          <button onClick={onClose}><XCircle className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
        </div>
        <textarea rows={7} placeholder="Enter PowerShell script here..." value={scriptText}
          onChange={e => setScriptText(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background text-sm font-mono focus:outline-none resize-none" />
        {result && (
          <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl ${result === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {result === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result === "success" ? "Script queued." : `Error: ${result}`}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={handleRun} disabled={running || !scriptText.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />} Run
          </button>
          <button onClick={onClose} className="px-5 py-2 rounded-xl border border-border/50 text-sm hover:bg-card">Close</button>
        </div>
      </div>
    </div>
  );
}

function EndpointCard({ ep, orgId }) {
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [showScript, setShowScript] = useState(false);

  const status = STATUS_STYLE[ep.status] || STATUS_STYLE.Disconnected;
  const StatusIcon = status.icon;

  const handleControl = async (controlAction) => {
    if (controlAction === "reboot" && !window.confirm(`Reboot ${ep.name}?`)) return;
    if (controlAction === "deploy_updates" && !window.confirm(`Deploy all updates to ${ep.name}?`)) return;
    setActionLoading(controlAction);
    setActionResult(null);
    const res = await base44.functions.invoke("action1Requests", {
      action: "control", orgId, controlAction, endpointIds: [ep.id],
    });
    const ok = res.data?.success;
    setActionResult({ ok, msg: ok ? "Action queued." : (res.data?.error || "Failed") });
    setActionLoading(null);
    setTimeout(() => setActionResult(null), 5000);
  };

  return (
    <>
      {showScript && <ScriptModal ep={ep} orgId={orgId} onClose={() => setShowScript(false)} />}
      <div className={`rounded-xl border overflow-hidden transition-all ${expanded ? "border-primary/30 bg-card/70" : "border-border/30 bg-card/30 hover:border-border/60"}`}>
        <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
          <Monitor className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{ep.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${status.bg} ${status.color}`}>
                <StatusIcon className="w-2.5 h-2.5" />{ep.status}
              </span>
              {ep.reboot_required === "Yes" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Reboot Needed</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex gap-3 flex-wrap">
              <span>{ep.OS}</span>
              <span>{ep.address}</span>
              {ep.user && ep.user !== "None" && <span>👤 {ep.user.split("\\").pop()}</span>}
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 border-t border-border/20 pt-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">CPU</div><div className="font-medium text-xs">{ep.CPU_name || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">RAM</div><div className="font-medium text-xs">{ep.RAM || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Last Boot</div><div className="font-medium text-xs">{fmt(ep.last_boot_time)}</div></div>
              <div><div className="text-xs text-muted-foreground">Agent</div><div className="font-medium text-xs">{ep.agent_version || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">Last Seen</div><div className="font-medium text-xs">{fmt(ep.last_seen)}</div></div>
            </div>

            {ep.missing_updates && (ep.missing_updates.critical > 0 || ep.missing_updates.other > 0) && (
              <div className="flex gap-2 flex-wrap">
                {ep.missing_updates.critical > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-400">{ep.missing_updates.critical} Critical Updates</span>
                )}
                {ep.missing_updates.other > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-400">{ep.missing_updates.other} Other Updates</span>
                )}
              </div>
            )}

            <div className="border-t border-border/20 pt-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Remote Actions</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleControl("reboot")} disabled={actionLoading === "reboot"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium disabled:opacity-50 transition-all">
                  {actionLoading === "reboot" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} Reboot
                </button>
                <button onClick={() => handleControl("deploy_updates")} disabled={actionLoading === "deploy_updates"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-medium disabled:opacity-50 transition-all">
                  {actionLoading === "deploy_updates" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Deploy Updates
                </button>
                <button onClick={() => setShowScript(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-xs font-medium transition-all">
                  <Terminal className="w-3 h-3" /> Run Script
                </button>
              </div>
              {actionResult && (
                <div className={`mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${actionResult.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {actionResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {actionResult.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function ClientEndpointsTab({ userEmail }) {
  const [team, setTeam] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [noTeam, setNoTeam] = useState(false);
  const [search, setSearch] = useState("");

  const loadTeam = useCallback(async () => {
    setLoading(true);
    const teams = await base44.entities.Team.list();
    const myTeam = teams.find(t => t.member_emails?.includes(userEmail));
    if (!myTeam) { setNoTeam(true); setLoading(false); return; }
    setTeam(myTeam);
    setLoading(false);
    await loadEndpoints(myTeam);
  }, [userEmail]);

  const loadEndpoints = async (t) => {
    if (!t?.action1_org_id || !t?.action1_group_id) return;
    setLoadingEndpoints(true);
    const res = await base44.functions.invoke("action1Requests", {
      action: "fetch",
      path: `/endpoints/groups/${t.action1_org_id}/${t.action1_group_id}/contents`,
    });
    setEndpoints(res.data?.data?.items || []);
    setLoadingEndpoints(false);
  };

  useEffect(() => { loadTeam(); }, [loadTeam]);

  const filtered = endpoints.filter(ep => {
    if (!search) return true;
    const q = search.toLowerCase();
    return ep.name?.toLowerCase().includes(q) || ep.OS?.toLowerCase().includes(q) || ep.address?.toLowerCase().includes(q) || ep.user?.toLowerCase().includes(q);
  });

  const connected = endpoints.filter(e => e.status === "Connected").length;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (noTeam || !team?.action1_group_id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
          <Monitor className="w-6 h-6 text-primary/40" />
        </div>
        <div>
          <p className="font-semibold text-sm">No Endpoints Assigned</p>
          <p className="text-muted-foreground text-xs mt-1 max-w-xs">Your account hasn't been linked to an endpoint group yet. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefreshWrapper onRefresh={() => loadEndpoints(team)} className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-base flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" /> {team.action1_group_name || "Your Endpoints"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {connected} online · {endpoints.length} total
          </p>
        </div>
        <button onClick={() => loadEndpoints(team)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input placeholder="Search endpoints..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50" />
      </div>

      {loadingEndpoints ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No endpoints found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(ep => <EndpointCard key={ep.id} ep={ep} orgId={team.action1_org_id} />)}
        </div>
      )}
    </PullToRefreshWrapper>
  );
}