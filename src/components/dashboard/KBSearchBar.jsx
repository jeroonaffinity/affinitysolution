import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Search, BookOpen, X, Loader2, Tag, ChevronRight } from "lucide-react";

const CATEGORY_COLORS = {
  hardware: "text-orange-400 bg-orange-500/10",
  software: "text-blue-400 bg-blue-500/10",
  network:  "text-emerald-400 bg-emerald-500/10",
  email:    "text-purple-400 bg-purple-500/10",
  security: "text-red-400 bg-red-500/10",
  data:     "text-cyan-400 bg-cyan-500/10",
  other:    "text-muted-foreground bg-muted/40",
};

export default function KBSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("kbSmartSuggest", { action: "search", query: query.trim(), limit: 6 });
        setResults(res.data?.articles || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (article) => {
    setSelected(article);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs">
      {/* Search Input */}
      <div className="relative flex items-center">
        {loading
          ? <Loader2 className="absolute left-3 w-3.5 h-3.5 text-muted-foreground animate-spin" />
          : <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground" />}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search knowledge base..."
          className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="absolute right-2">
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-border/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Knowledge Base</span>
            <span className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {results.map(article => (
              <button key={article.id} onClick={() => handleSelect(article)}
                className="w-full text-left px-3 py-2.5 hover:bg-primary/5 transition-colors flex items-start gap-2.5 border-b border-border/20 last:border-0">
                <BookOpen className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{article.title}</div>
                  {article.summary && <div className="text-xs text-muted-foreground truncate mt-0.5">{article.summary}</div>}
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.other}`}>
                  {article.category}
                </span>
              </button>
            ))}
          </div>
          {results.length === 0 && query.length >= 2 && !loading && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No articles found for "{query}"</div>
          )}
        </div>
      )}

      {/* Article Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border/50 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-border/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm leading-snug">{selected.title}</h3>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-md font-medium mt-1 ${CATEGORY_COLORS[selected.category] || CATEGORY_COLORS.other}`}>
                    {selected.category}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex flex-col gap-3">
              {selected.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 italic">{selected.summary}</p>
              )}
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{selected.content}</div>
              {selected.tags && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/20">
                  {selected.tags.split(",").map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      <Tag className="w-2.5 h-2.5" />{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}