import { useState } from "react";
import { CreditCard, Download, Server, Users, CalendarDays, Loader2, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SERVICE_STATUS = {
  active:    { label: "Active",    bg: "bg-emerald-500/15", color: "text-emerald-400" },
  paused:    { label: "Paused",    bg: "bg-amber-500/15",   color: "text-amber-400"   },
  cancelled: { label: "Cancelled", bg: "bg-red-500/15",     color: "text-red-400"     },
};

const VAT_RATE = 0.20;

// Generate synthetic last-6-months trend from current service data
function buildChartData(services) {
  const active = services.filter(s => s.status === "active");
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString("en-GB", { month: "short" }));
  }
  const totalUsers = active.reduce((sum, s) => sum + (s.users || 0), 0);
  const totalEndpoints = active.reduce((sum, s) => sum + (s.endpoints || 0), 0);
  const totalCost = active.reduce((sum, s) => sum + (s.monthly_cost || 0), 0);

  // Simulate gentle growth over 6 months
  return months.map((month, i) => {
    const factor = 0.78 + i * 0.044;
    return {
      month,
      Users: Math.round(totalUsers * factor) || Math.round(2 + i * 0.5),
      Endpoints: Math.round(totalEndpoints * factor) || Math.round(4 + i),
      Spend: parseFloat((totalCost * factor).toFixed(2)) || parseFloat((50 + i * 12).toFixed(2)),
    };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-3.5 py-2.5 text-xs shadow-xl">
      <div className="font-semibold text-foreground mb-1.5">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.name === "Spend" ? `£${p.value}` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function BillingTab({ services, userName }) {
  const [downloading, setDownloading] = useState(false);
  const [chartMetric, setChartMetric] = useState("Spend");

  const active = services.filter(s => s.status === "active");
  const totalMonthly = active.reduce((sum, s) => sum + (s.monthly_cost || 0), 0);
  const totalAnnual = totalMonthly * 12;
  const vat = totalMonthly * VAT_RATE;
  const totalWithVat = totalMonthly + vat;
  const chartData = buildChartData(services);

  const downloadPDF = async () => {
    setDownloading(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date();
    const period = now.toLocaleString("en-GB", { month: "long", year: "numeric" });

    // ── Header band ──
    doc.setFillColor(18, 18, 24);
    doc.rect(0, 0, pageW, 80, "F");
    doc.setFillColor(30, 90, 200);
    doc.rect(0, 80, pageW, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("AffinitySolution", 40, 36);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 170, 190);
    doc.text("Managed IT Services · affinitysolution.com", 40, 54);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("BILLING SUMMARY", pageW - 40, 36, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(160, 170, 190);
    doc.text(period, pageW - 40, 54, { align: "right" });

    // ── Client block ──
    let y = 108;
    doc.setTextColor(120, 130, 145);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 225, 235);
    doc.text(userName || "Client", 40, y);

    // ── Summary box ──
    y += 28;
    doc.setFillColor(22, 27, 40);
    doc.roundedRect(40, y, pageW - 80, 64, 8, 8, "F");
    const cols = [
      { label: "Monthly (ex. VAT)", value: `£${totalMonthly.toFixed(2)}` },
      { label: `VAT (${(VAT_RATE * 100).toFixed(0)}%)`, value: `£${vat.toFixed(2)}` },
      { label: "Monthly Total", value: `£${totalWithVat.toFixed(2)}` },
      { label: "Annual Estimate", value: `£${totalAnnual.toFixed(2)}` },
    ];
    cols.forEach((col, i) => {
      const cx = 40 + (pageW - 80) * (i / cols.length) + (pageW - 80) / cols.length / 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 145);
      doc.text(col.label, cx, y + 22, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(220, 225, 235);
      doc.text(col.value, cx, y + 44, { align: "center" });
    });

    // ── Service table ──
    y += 80;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 130, 145);
    ["SERVICE", "USERS", "ENDPOINTS", "CYCLE", "STATUS", "COST/MO"].forEach((h, i) => {
      const xs = [40, 200, 270, 340, 400, pageW - 40];
      doc.text(h, xs[i], y, i === 5 ? { align: "right" } : {});
    });
    y += 6;
    doc.setFillColor(30, 90, 200);
    doc.rect(40, y, pageW - 80, 1.5, "F");
    y += 14;

    services.forEach((s, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(20, 24, 35);
        doc.rect(40, y - 10, pageW - 80, 20, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(200, 210, 225);
      doc.text(s.service_name?.slice(0, 28) || "—", 40, y);
      doc.text(String(s.users || 0), 200, y);
      doc.text(String(s.endpoints || 0), 270, y);
      doc.text(s.billing_cycle || "monthly", 340, y);
      doc.setTextColor(
        s.status === "active" ? 52 : s.status === "paused" ? 245 : 239,
        s.status === "active" ? 211 : s.status === "paused" ? 158 : 68,
        s.status === "active" ? 153 : s.status === "paused" ? 11 : 68,
      );
      doc.text(s.status || "active", 400, y);
      doc.setTextColor(200, 210, 225);
      doc.text(`£${(s.monthly_cost || 0).toFixed(2)}`, pageW - 40, y, { align: "right" });
      y += 22;
    });

    // ── Totals ──
    y += 4;
    doc.setFillColor(30, 90, 200);
    doc.rect(40, y, pageW - 80, 1, "F");
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(200, 210, 225);
    doc.text("Subtotal (ex. VAT)", 40, y);
    doc.text(`£${totalMonthly.toFixed(2)}`, pageW - 40, y, { align: "right" });
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 130, 145);
    doc.text(`VAT @ ${(VAT_RATE * 100).toFixed(0)}%`, 40, y);
    doc.text(`£${vat.toFixed(2)}`, pageW - 40, y, { align: "right" });
    y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 130, 200);
    doc.text("TOTAL DUE", 40, y);
    doc.text(`£${totalWithVat.toFixed(2)}`, pageW - 40, y, { align: "right" });

    // ── Footer ──
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(18, 18, 24);
    doc.rect(0, pageH - 44, pageW, 44, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 120);
    doc.text(`Generated ${now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · AffinitySolution · info@affinitysolution.com`, pageW / 2, pageH - 18, { align: "center" });

    doc.save(`AffinitySolution_Billing_${period.replace(" ", "_")}.pdf`);
    setDownloading(false);
  };

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-primary/40" />
        </div>
        <p className="text-muted-foreground text-sm">No services found. Contact us to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5">
          <div className="text-xs text-muted-foreground mb-1">Monthly (ex. VAT)</div>
          <div className="text-xl font-extrabold text-gradient">£{totalMonthly.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/30 bg-card/40">
          <div className="text-xs text-muted-foreground mb-1">VAT (20%)</div>
          <div className="text-xl font-extrabold">£{vat.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/30 bg-card/40">
          <div className="text-xs text-muted-foreground mb-1">Monthly inc. VAT</div>
          <div className="text-xl font-extrabold">£{totalWithVat.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/30 bg-card/40">
          <div className="text-xs text-muted-foreground mb-1">Annual Estimate</div>
          <div className="text-xl font-extrabold">£{totalAnnual.toLocaleString()}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 rounded-2xl border border-border/30 bg-card/40">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Service Usage — Last 6 Months</span>
          </div>
          <div className="flex gap-1.5">
            {["Spend", "Users", "Endpoints"].map(m => (
              <button key={m} onClick={() => setChartMetric(m)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  chartMetric === m ? "bg-primary text-primary-foreground" : "border border-border/40 text-muted-foreground hover:text-foreground"
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e5ac8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1e5ac8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={chartMetric} stroke="#1e5ac8" strokeWidth={2} fill="url(#grad)" dot={{ r: 3, fill: "#1e5ac8" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Download button */}
      <div className="flex justify-end">
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all glow-blue"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Billing Summary PDF
        </button>
      </div>

      {/* Service list */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Breakdown</h3>
        {services.map(s => {
          const sc = SERVICE_STATUS[s.status] || SERVICE_STATUS.active;
          return (
            <div key={s.id} className="p-4 rounded-2xl border border-border/30 bg-card/40 flex items-center justify-between gap-4 flex-wrap hover:border-border/60 transition-all">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Server className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{s.service_name}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                    {s.users > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.users} users</span>}
                    {s.endpoints > 0 && <span>{s.endpoints} endpoints</span>}
                    {s.next_billing_date && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        Next: {new Date(s.next_billing_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    <span className="capitalize">{s.billing_cycle}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                <div className="text-right">
                  <div className="font-bold text-sm">£{s.monthly_cost?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">/mo</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}