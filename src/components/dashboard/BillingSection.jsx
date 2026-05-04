const statusColors = {
  active: "bg-green-500/15 text-green-400",
  paused: "bg-yellow-500/15 text-yellow-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function BillingSection({ services }) {
  const totalMonthly = services.filter(s => s.status === "active").reduce((sum, s) => sum + (s.monthly_cost || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Service & Billing Overview</h2>
        {services.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Monthly Total</div>
            <div className="text-xl font-extrabold text-gradient">£{totalMonthly.toLocaleString()}/mo</div>
          </div>
        )}
      </div>

      {services.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No active services found. Contact us to get started.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">{s.service_name}</div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {s.users > 0 && <span>{s.users} users</span>}
                  {s.endpoints > 0 && <span>{s.endpoints} endpoints</span>}
                  {s.next_billing_date && <span>Next billing: {new Date(s.next_billing_date).toLocaleDateString()}</span>}
                  <span className="capitalize">{s.billing_cycle}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s.status]}`}>{s.status}</span>
                <div className="text-right">
                  <div className="font-bold text-sm">£{s.monthly_cost}/mo</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}