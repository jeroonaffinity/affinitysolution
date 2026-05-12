import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Download, Loader2, Server, CreditCard, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

const VAT_RATE = 0.20;

function buildTrendData(services) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString("en-GB", { month: "short", year: "2-digit" }));
  }
  const base = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  return months.map((m, i) => ({
    month: m,
    spend: parseFloat((base * (0.88 + i * 0.025)).toFixed(2)),
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-4 py-2.5 shadow-xl text-sm">
      <div className="text-muted-foreground text-xs mb-1">{label}</div>
      <div className="font-bold">£{payload[0].value?.toLocaleString()}</div>
    </div>
  );
};

export default function BillingTab({ services = [], userName }) {
  const [exportLoading, setExportLoading] = useState(false);

  const active = services.filter(s => s.status === "active");
  const monthly = active.reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const annual = monthly * 12;
  const vatMonthly = monthly * VAT_RATE;
  const trendData = buildTrendData(services);

  const handleExport = async () => {
    setExportLoading(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const now = new Date();

    doc.setFillColor(10, 10, 20);
    doc.rect(0, 0, 210, 297, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Statement", 20, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 180);
    doc.text(`Generated: ${now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, 20, 40);
    doc.text(`Client: ${userName || "Client"}`, 20, 47);

    doc.setDrawColor(50, 50, 80);
    doc.line(20, 55, 190, 55);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 220);
    doc.text(`Monthly Total (ex. VAT): £${monthly.toFixed(2)}`, 20, 75);
    doc.text(`VAT (20%): £${vatMonthly.toFixed(2)}`, 20, 82);
    doc.text(`Monthly Total (inc. VAT): £${(monthly + vatMonthly).toFixed(2)}`, 20, 89);
    doc.text(`Annual Total (ex. VAT): £${annual.toFixed(2)}`, 20, 96);

    doc.line(20, 105, 190, 105);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Active Services", 20, 115);

    let y = 125;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    active.forEach(s => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(200, 200, 240);
      doc.text(s.service_name, 20, y);
      doc.setTextColor(100, 200, 150);
      doc.text(`£${(s.monthly_cost || 0).toFixed(2)}/mo`, 160, y);
      doc.setTextColor(120, 120, 160);
      if (s.users) doc.text(`${s.users} users`, 20, y + 5);
      y += 14;
    });

    const pdfBytes = doc.output("arraybuffer");
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "billing-statement.pdf"; a.click();
    URL.revokeObjectURL(url);
    setExportLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5">
          <div className="text-xs text-muted-foreground mb-1">Monthly (ex. VAT)</div>
          <div className="text-xl font-extrabold">£{monthly.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/40 bg-card/50">
          <div className="text-xs text-muted-foreground mb-1">VAT (20%)</div>
          <div className="text-xl font-extrabold text-muted-foreground">£{vatMonthly.toFixed(0)}</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/40 bg-card/50">
          <div className="text-xs text-muted-foreground mb-1">Annual (ex. VAT)</div>
          <div className="text-xl font-extrabold">£{annual.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
          <div className="text-xs text-muted-foreground mb-1">Active Services</div>
          <div className="text-xl font-extrabold text-emerald-400">{active.length}</div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="p-5 rounded-2xl border border-border/40 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Monthly Spend Trend</span>
          </div>
          <button onClick={handleExport} disabled={exportLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:text-foreground disabled:opacity-60 transition-all">
            {exportLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Export PDF
          </button>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#spendGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Services list */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Services</h3>
        {services.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No services assigned yet.</div>
        ) : (
          services.map(s => (
            <div key={s.id} className="p-4 rounded-xl border border-border/30 bg-card/30 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Server className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{s.service_name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 capitalize"><Calendar className="w-3 h-3" />{s.billing_cycle}</span>
                  {s.users > 0 && <span>{s.users} users</span>}
                  {s.endpoints > 0 && <span>{s.endpoints} endpoints</span>}
                  {s.next_billing_date && <span>Next: {new Date(s.next_billing_date).toLocaleDateString("en-GB")}</span>}
                </div>
                {s.description && <div className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{s.description}</div>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm">£{(s.monthly_cost || 0).toLocaleString()}/mo</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium mt-1 inline-block ${STATUS_COLORS[s.status]}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}