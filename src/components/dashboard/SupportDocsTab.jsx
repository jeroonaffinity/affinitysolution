import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Search, Cpu, Server, Wifi, Mail, Shield, HelpCircle,
  ChevronDown, ChevronUp, BookOpen, Loader2
} from "lucide-react";

const CATEGORY_CONFIG = {
  hardware: { label: "Hardware",  icon: Cpu,       color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20" },
  software: { label: "Software",  icon: Server,    color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"   },
  network:  { label: "Network",   icon: Wifi,      color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
  email:    { label: "Email",     icon: Mail,      color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20"    },
  security: { label: "Security",  icon: Shield,    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"},
  other:    { label: "General",   icon: HelpCircle,color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20"  },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

export default function SupportDocsTab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    base44.entities.KnowledgeBase.filter({ is_published: true }, "title", 100)
      .then(data => { setArticles(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a => {
    const matchCat = activeCategory === "all" || a.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.title?.toLowerCase().includes(q) ||
      a.summary?.toLowerCase().includes(q) ||
      a.tags?.toLowerCase().includes(q) ||
      a.content?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(a => a.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search + Category filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search guides, keywords, topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "border border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Guides
          </button>
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const Icon = cfg.icon;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? "all" : cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                    : "border border-border/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary/40" />
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            {articles.length === 0
              ? "No guides published yet. Our team is adding docs — check back soon."
              : "No guides match your search."}
          </p>
        </div>
      )}

      {/* Grouped articles */}
      {Object.entries(grouped).map(([cat, items]) => {
        const cfg = CATEGORY_CONFIG[cat];
        const Icon = cfg.icon;
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{cfg.label}</span>
              <span className="text-xs text-muted-foreground/50">· {items.length} guide{items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map(a => {
                const isOpen = expandedId === a.id;
                return (
                  <div key={a.id} className={`rounded-xl border overflow-hidden transition-all ${
                    isOpen ? `${cfg.border} ${cfg.bg}` : "border-border/30 bg-card/30 hover:border-border/60"
                  }`}>
                    <button
                      className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                      onClick={() => setExpandedId(isOpen ? null : a.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{a.title}</div>
                        {a.summary && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.summary}</div>}
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-border/20">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line pt-3">
                          {a.content}
                        </p>
                        {a.tags && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {a.tags.split(",").map(tag => tag.trim()).filter(Boolean).map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}