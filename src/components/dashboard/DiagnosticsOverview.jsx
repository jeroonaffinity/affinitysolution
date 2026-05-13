import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Monitor, Wifi, WifiOff, AlertTriangle, CheckCircle2,
  RefreshCw, Loader2, RotateCcw, Download, ArrowRight
} from "lucide-react";

function MetricBar({ value, max = 100, warning = 80, danger = 90 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = pct >= danger ? "bg-red-400" : pct >= warning ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function HealthSummaryCard({ label, value, sub, icon: Icon, color = "text-primary", bg = "bg-primary/10" }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border border-border/30 bg-card/30`}>
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-extrabold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function EndpointHealthRow({ ep }) {
  const isOnline = ep.status === "Connected";
  const criticalUpdates = ep.missing_updates?.critical || 0;
  const otherUpdates = ep.missing_updates?.other || 0;
  const needsReboot = ep.reboot_required === "Yes";
  const hasIssues = !isOnline || criticalUpdates > 0 || needsReboot;

  return (
    <div className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${
      hasIssues ? "border-amber-500/25 bg-amber-500/5" : "border-border/25 bg-card/20"
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? "bg-emerald-400" : "bg-red-400"}`} />
        <span className="font-medium text-sm flex-1 truncate">{ep.name}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {needsReboot && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Reboot</span>
          )}
          {criticalUpdates > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">{criticalUpdates} Critical</span>
          )}
          {otherUpdates > 0 && !criticalUpdates && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{otherUpdates} Updates</span>
          )}
          {!hasIssues && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
      </div>
      <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
        <span>{ep.OS || "—"}</span>
        {ep.RAM && <span>RAM: {ep.RAM}</span>}
        {ep.user && ep.user !== "None" && <span>👤 {ep.user.split("\\").pop()}</span>}
      </div>
    </div>
  );
}

export default function DiagnosticsOverview({ userEmail, onGoToEndpoints }) {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noConfig, setNoConfig] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const teams = await base44.entities.Team.list();
    const myTeam = teams.find(t => t.member_emails?.includes(userEmail));

    if (!myTeam?.action1_org_id || !myTeam?.action1_group_id) {
      setNoConfig(true);
      setLoading(false);
      return;
    }

    const res = await base44.functions.invoke("action1Requests", {
      action: "fetch",
      path: `/endpoints/groups/${myTeam.action1_org_id}/${myTeam.action1_group_id}/contents`,
    });

    setEndpoints(res.data?.data?.items || []);
    setLastUpdated(new Date());
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { load(); }, [load]);

  if (noConfig) return null; // Don't show section if not configured

  // Aggregate metrics
  const total = endpoints.length;
  const online = endpoints.filter(e => e.status === "Connected").length;
  const offline = total - online;
  const needReboot = endpoints.filter(e => e.reboot_required === "Yes").length;
  const totalCritical = endpoints.reduce((s, e) => s + (e.missing_updates?.critical || 0), 0);
  const totalOther = endpoints.reduce((s, e) => s + (e.missing_updates?.other || 0), 0);
  const hasAlerts = offline > 0 || needReboot > 0 || totalCritical > 0;

  // Show worst endpoints first (offline, reboot needed, then critical updates)
  const sorted = [...endpoints].sort((a, b) => {
    const scoreOf = e => {
      let s = 0;
      if (e.status !== "Connected") s += 100;
      if (e.reboot_required === "Yes") s += 50;
      s += (e.missing_updates?.critical || 0) * 10;
      s += (e.missing_updates?.other || 0);
      return s;
    };
    return scoreOf(b) - scoreOf(a);
  });

  const preview = sorted.slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Endpoint Health</h2>
          {lastUpdated && !loading && (
            <span className="text-xs text-muted-foreground/50">
              · {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HealthSummaryCard
              icon={Wifi}
              label="Online"
              value={online}
              sub={`of ${total} endpoints`}
              color="text-emerald-400"
              bg="bg-emerald-500/10"
            />
            <HealthSummaryCard
              icon={WifiOff}
              label="Offline"
              value={offline}
              sub={offline > 0 ? "Need attention" : "All connected"}
              color={offline > 0 ? "text-red-400" : "text-muted-foreground"}
              bg={offline > 0 ? "bg-red-500/10" : "bg-muted"}
            />
            <HealthSummaryCard
              icon={RotateCcw}
              label="Reboot Needed"
              value={needReboot}
              sub={needReboot > 0 ? "Pending restart" : "All up to date"}
              color={needReboot > 0 ? "text-amber-400" : "text-muted-foreground"}
              bg={needReboot > 0 ? "bg-amber-500/10" : "bg-muted"}
            />
            <HealthSummaryCard
              icon={Download}
              label="Pending Updates"
              value={totalCritical + totalOther}
              sub={totalCritical > 0 ? `${totalCritical} critical` : ""}
              color={totalCritical > 0 ? "text-red-400" : totalOther > 0 ? "text-amber-400" : "text-muted-foreground"}
              bg={totalCritical > 0 ? "bg-red-500/10" : totalOther > 0 ? "bg-amber-500/10" : "bg-muted"}
            />
          </div>

          {/* Alert banner */}
          {hasAlerts && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-300/80 leading-relaxed">
                {[
                  offline > 0 && `${offline} endpoint${offline > 1 ? "s are" : " is"} offline`,
                  needReboot > 0 && `${needReboot} device${needReboot > 1 ? "s require" : " requires"} a reboot`,
                  totalCritical > 0 && `${totalCritical} critical update${totalCritical > 1 ? "s" : ""} pending`,
                ].filter(Boolean).join(" · ")}
              </div>
            </div>
          )}

          {/* Endpoint rows preview */}
          {preview.length > 0 && (
            <div className="flex flex-col gap-2">
              {preview.map(ep => <EndpointHealthRow key={ep.id} ep={ep} />)}
            </div>
          )}

          {/* Show all link */}
          {total > 0 && (
            <button onClick={onGoToEndpoints}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors self-start">
              View all {total} endpoints <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </>
      )}
    </div>
  );
}