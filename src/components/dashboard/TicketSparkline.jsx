import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { subDays, format, isAfter } from "date-fns";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-xl px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div className="font-bold text-primary">{payload[0]?.value} ticket{payload[0]?.value !== 1 ? "s" : ""}</div>
    </div>
  );
}

export default function TicketSparkline({ tickets = [] }) {
  const data = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      return {
        label: format(dayStart, "dd MMM"),
        count: tickets.filter(t => {
          const created = new Date(t.created_date);
          return created >= dayStart && created <= dayEnd;
        }).length,
      };
    });
    return days;
  }, [tickets]);

  const total14 = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="p-5 rounded-2xl border border-border/30 bg-card/30 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ticket Volume</div>
          <div className="text-2xl font-extrabold mt-0.5">{total14}</div>
          <div className="text-xs text-muted-foreground">tickets in last 14 days</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={64}>
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Area
            type="monotone" dataKey="count"
            stroke="hsl(var(--primary))" strokeWidth={2}
            fill="url(#sparkGrad)" dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}