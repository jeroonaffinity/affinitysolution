import { useState } from "react";
import { Search, X, Phone, Mail, Building2, MessageSquare, Calendar } from "lucide-react";

export default function AdminLeadsPanel({ leads }) {
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name?.toLowerCase().includes(q) || l.contact?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q) || l.message?.toLowerCase().includes(q);
    const matchMethod = filterMethod === "all" || l.preferred_method === filterMethod;
    return matchSearch && matchMethod;
  });

  const newToday = leads.filter(l => {
    const d = new Date(l.created_date);
    return (Date.now() - d.getTime()) < 24 * 3600 * 1000;
  }).length;
  const callBacks = leads.filter(l => l.preferred_method === "call").length;
  const emailLeads = leads.filter(l => l.preferred_method === "email").length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold mb-1">Enquiries & Leads</h1>
        <p className="text-muted-foreground text-sm">{leads.length} total enquiries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border/60 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-primary">{newToday}</div>
          <div className="text-xs text-muted-foreground mt-0.5">New today</div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold">{callBacks}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Call backs</div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold">{emailLeads}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Email replies</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/60"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <div className="flex gap-1 p-1 bg-card border border-border/60 rounded-xl">
          {["all", "call", "email"].map(m => (
            <button
              key={m}
              onClick={() => setFilterMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMethod === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m === "all" ? "All" : m === "call" ? "📞 Call" : "📧 Email"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">No enquiries found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(l => {
          const isNew = (Date.now() - new Date(l.created_date).getTime()) < 48 * 3600 * 1000;
          return (
            <div key={l.id} className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{l.name}</span>
                    {isNew && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold tracking-wide">NEW</span>}
                  </div>
                  {l.company && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" /> {l.company}
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-xl font-semibold shrink-0 ${l.preferred_method === "call" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent-foreground"}`}>
                  {l.preferred_method === "call" ? <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Call back</span> : <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground truncate">{l.contact}</span>
              </div>

              {l.message && (
                <div className="bg-background/60 rounded-xl p-3 text-xs text-muted-foreground leading-relaxed border border-border/30">
                  <MessageSquare className="w-3 h-3 inline mr-1 opacity-60" />
                  {l.message}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mt-auto pt-1 border-t border-border/30">
                <Calendar className="w-3 h-3" />
                {new Date(l.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}