import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, BookOpen, ChevronDown, ChevronUp, CheckCircle2, Zap } from "lucide-react";

const CATEGORY_ICONS = {
  hardware: "🖥️", software: "💻", network: "🌐",
  email: "📧", security: "🛡️", other: "❓",
};

// Typing animation — renders text character by character
function TypedText({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
}

export default function AITicketAssistant({ description, subject, onApplySuggestion }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [applied, setApplied] = useState(false);
  const debounceRef = useRef(null);
  const lastAnalyzedRef = useRef("");

  const combined = `${subject} ${description}`.trim();

  useEffect(() => {
    if (combined.length < 20) {
      setAnalysis(null);
      setApplied(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (combined === lastAnalyzedRef.current) return;
      lastAnalyzedRef.current = combined;
      setLoading(true);
      setApplied(false);
      try {
        // Fetch knowledge base articles to include as context
        const articles = await base44.entities.KnowledgeBase.filter({ is_published: true }, "title", 50);
        const articleSummaries = articles.map(a =>
          `[${a.category}] ${a.title}: ${a.summary || a.content?.slice(0, 150)}`
        ).join("\n");

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are AffinitySolution's IT support AI. Analyse this support request and respond helpfully.

Support request subject: "${subject}"
Support request description: "${description}"

Knowledge base articles available:
${articleSummaries || "No articles available"}

Respond with a JSON object containing:
- "reply": A friendly, instant first-response message (2-4 sentences). Start with empathy, then give 1-2 quick actionable steps the user can try right now. Reference relevant KB articles by title if applicable. Sound human and warm, not robotic.
- "category": Best matching category from: hardware, software, network, email, security, other
- "priority": Suggested priority: Low, Medium, or High (High = system down / security issue / data loss)
- "quick_fixes": Array of 2-3 short actionable steps (strings) the user can try immediately
- "matched_articles": Array of relevant KB article titles (strings) from the list above, max 2`,
          response_json_schema: {
            type: "object",
            properties: {
              reply: { type: "string" },
              category: { type: "string" },
              priority: { type: "string" },
              quick_fixes: { type: "array", items: { type: "string" } },
              matched_articles: { type: "array", items: { type: "string" } },
            },
          },
        });
        setAnalysis(result);
      } catch (e) {
        console.error("AI analysis failed", e);
      } finally {
        setLoading(false);
      }
    }, 900);

    return () => clearTimeout(debounceRef.current);
  }, [combined]);

  const handleApply = () => {
    if (!analysis) return;
    onApplySuggestion({ priority: analysis.priority, category: analysis.category });
    setApplied(true);
  };

  if (!loading && !analysis) return null;

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 overflow-hidden">
      {/* Header — looks like a support agent reply */}
      <div className="px-4 py-3 border-b border-primary/15 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-foreground">AffinitySolution AI</div>
          <div className="text-xs text-muted-foreground">Support Assistant · Just now</div>
        </div>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/60" />}
      </div>

      {loading && !analysis && (
        <div className="px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          <span>Analysing your issue...</span>
        </div>
      )}

      {analysis && (
        <div className="p-4 flex flex-col gap-4">
          {/* AI Reply bubble */}
          <div className="text-sm text-foreground/90 leading-relaxed bg-primary/8 rounded-xl rounded-tl-sm px-4 py-3 border border-primary/15">
            <TypedText text={analysis.reply} />
          </div>

          {/* Quick fixes */}
          {analysis.quick_fixes?.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Zap className="w-3 h-3" /> Quick steps to try
              </div>
              <div className="flex flex-col gap-1.5">
                {analysis.quick_fixes.map((fix, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {fix}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched KB articles */}
          {analysis.matched_articles?.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setShowDocs(!showDocs)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors w-fit"
              >
                <BookOpen className="w-3 h-3" />
                {analysis.matched_articles.length} related guide{analysis.matched_articles.length !== 1 ? "s" : ""} found
                {showDocs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showDocs && (
                <div className="flex flex-col gap-1">
                  {analysis.matched_articles.map((title, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-1.5 border border-border/30">
                      <BookOpen className="w-3 h-3 text-primary/50 flex-shrink-0" />
                      {title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Apply suggestions */}
          <div className="flex items-center gap-3 pt-1 border-t border-primary/10">
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-1 flex-wrap">
              <span>Suggested:&nbsp;
                <span className="font-semibold text-foreground capitalize">
                  {CATEGORY_ICONS[analysis.category]} {analysis.category}
                </span>
              </span>
              <span className="text-border">·</span>
              <span>Priority:&nbsp;
                <span className={`font-semibold ${
                  analysis.priority === "High" ? "text-red-400" :
                  analysis.priority === "Medium" ? "text-amber-400" : "text-emerald-400"
                }`}>{analysis.priority}</span>
              </span>
            </div>
            {applied ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Applied
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/25 transition-all"
              >
                <Sparkles className="w-3 h-3" /> Apply suggestions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}