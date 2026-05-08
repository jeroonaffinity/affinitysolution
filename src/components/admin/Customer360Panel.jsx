import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Monitor, Wifi, WifiOff, AlertTriangle,
  RotateCcw, Download, CheckCircle2, Building2
} from "lucide-react";

const ORG_ID = "20114459933";

function AlertBadge({ alert }) {
  const cfg = {
    offline: { bg: "bg-red-500/15", color: "text-red-400", icon: WifiOff },
    reboot:  { bg: "bg-amber-500/15", color: "text-amber-400", icon: RotateCcw },
    updates: { bg: "bg-orange-500/15", color: "text-orange-400", icon: Download },
  }[alert.type] || { bg: "bg-muted", color: "text-muted-foreground", icon: AlertTriangle };

  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-xl ${cfg.bg}`}>
      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
      <div>
        <div className={`text-xs font-semibold ${cfg.color}`}>{alert.device}</div>
        <div className={`text-xs ${cfg.color} opacity-80`}>{alert.msg}</div>
      </div>
    </div>
  );
}

function DeviceCard({ device }) {
  const isOnline = device.status === "Connected";
  return (
    <div className="p-3 rounded-xl border border-border/30 bg-background/40 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Monitor className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{device.name}</span>
        </div>
        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
          isOnline ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
        }`}>
          {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
          {device.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        {device.OS && <span className="truncate">{device.OS}</span>}
        {device.user && device.user !== "None" && (
          <span className="truncate">👤 {device.user.split("\\").pop()}</span>
        )}
        {device.last_seen && (
          <span className="col-span-2">
            Last seen: {new Date(device.last_seen).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {device.reboot_required === "Yes" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">Reboot needed</span>
        )}
        {(device.missing_updates?.critical || 0) > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
            {device.missing_updates.critical} critical update{device.missing_updates.critical > 1 ? "s" : ""}
          </span>
        )}
        {(device.missing_updates?.other || 0) > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-medium">
            {device.missing_updates.other} other update{device.missing_updates.other > 1 ? "s" : ""}
          </span>
        )}
        {device.update_status === "OK" && !device.reboot_required && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Up to date
          </span>
        )}
      </div>
    </div>
  );
}

export default function Customer360Panel({ email }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    base44.functions.invoke("zohoDesk", {
      action: "customer_360", orgId: ORG_ID, email,
    }).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, [email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.noAction1) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
        <Monitor className="w-8 h-8 text-primary/20" />
        <p className="text-sm font-medium text-muted-foreground">No endpoint data</p>
        <p className="text-xs text-muted-foreground/60">
          {data?.teamName
            ? `${data.teamName} has no Action1 group assigned.`
            : "This contact's email isn't linked to a client team."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {/* Team label */}
      {data.teamName && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="w-3.5 h-3.5" />
          <span>Team: <span className="font-semibold text-foreground">{data.teamName}</span></span>
          <span className="ml-auto">{data.devices.length} device{data.devices.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Active Alerts
          </div>
          {data.alerts.map((a, i) => <AlertBadge key={i} alert={a} />)}
        </div>
      )}

      {/* Devices */}
      {data.devices.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Devices</div>
          {data.devices.map(d => <DeviceCard key={d.id} device={d} />)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No devices in this team's group.</p>
      )}

      {data.alerts.length === 0 && data.devices.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> All devices healthy — no alerts.
        </div>
      )}
    </div>
  );
}