const methodColors = {
  call: "bg-primary/15 text-primary",
  email: "bg-accent/15 text-accent-foreground",
};

export default function LeadsSection({ submissions }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Enquiries</h2>
      {submissions.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No enquiries found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl border border-border/60 bg-card/60 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">{s.name}</div>
                  {s.company && <div className="text-xs text-muted-foreground">{s.company}</div>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${methodColors[s.preferred_method]}`}>
                  {s.preferred_method === "call" ? "Call back" : "Email"}
                </span>
              </div>
              {s.message && <p className="text-xs text-muted-foreground leading-relaxed">{s.message}</p>}
              <div className="text-xs text-muted-foreground/60">{new Date(s.created_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}