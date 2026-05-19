import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Send, MessageSquare, Sparkles,
  FileText, Image, Clock
} from "lucide-react";

function ThreadContent({ content }) {
  if (!content) return null;
  const plain = content.replace(/<[^>]*>/g, "");
  const parts = plain.split(/(--- Attachments ---[\s\S]*)/);
  const bodyText = parts[0].trim();
  const attachSection = parts[1] || "";
  const links = [...attachSection.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g)].map(m => ({ label: m[1], url: m[2] }));
  const isImg = (url) => /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);

  return (
    <div className="flex flex-col gap-2">
      {bodyText && <p className="whitespace-pre-wrap leading-relaxed">{bodyText}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors">
              {isImg(l.url) ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TicketThread({ ticket, userEmail, userName }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const bottomRef = useRef(null);

  const isClosed = ["closed", "resolved"].includes(ticket.status);

  const loadThreads = async () => {
    setLoading(true);
    const data = await base44.entities.TicketThread.filter({ ticket_id: ticket.id });
    // Show only public messages to clients, sorted oldest-first
    const sorted = (data || [])
      .filter(t => t.is_public !== false)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    setThreads(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadThreads();
    const unsub = base44.entities.TicketThread.subscribe((event) => {
      if (!event.data || event.data.ticket_id !== ticket.id) return;
      if (event.type === "create") {
        // Only add if public
        if (event.data.is_public !== false) {
          setThreads(prev => {
            // Avoid duplicates
            if (prev.some(t => t.id === event.data.id)) return prev;
            return [...prev, event.data].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
          });
        }
      } else if (event.type === "update") {
        setThreads(prev =>
          prev.map(t => t.id === event.id ? { ...t, ...event.data } : t)
              .filter(t => t.is_public !== false)
        );
      } else if (event.type === "delete") {
        setThreads(prev => prev.filter(t => t.id !== event.id));
      }
    });
    return () => unsub();
  }, [ticket.id]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || sending) return;
    setSending(true);
    await base44.entities.TicketThread.create({
      ticket_id: ticket.id,
      author_email: userEmail,
      author_name: userName || userEmail,
      content: text,
      is_public: true,
      is_ai_response: false,
    });
    setReply("");
    setSending(false);
  };

  const requestAIResponse = async () => {
    setAiLoading(true);
    try {
      await base44.functions.invoke("aiTicketResponse", { ticket_id: ticket.id });
    } catch {
      // AI response failures are non-critical
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendReply();
    }
  };

  if (loading) return (
    <div className="flex justify-center py-4">
      <Loader2 className="w-4 h-4 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <MessageSquare className="w-3 h-3" /> Conversation
      </div>

      {threads.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/30 rounded-xl px-4 py-3 border border-border/15">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          Our team will review this shortly. You'll receive updates via email and here.
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {threads.map((t) => {
            const isSupport = t.is_ai_response || (t.author_email && !t.author_email.endsWith(userEmail?.split("@")[1] || "__never__") && t.author_email !== userEmail);
            return (
              <div key={t.id} className={`flex flex-col gap-1 ${isSupport ? "items-end" : "items-start"}`}>
                <div className="text-xs text-muted-foreground px-1 flex items-center gap-1.5">
                  {t.is_ai_response && <Sparkles className="w-2.5 h-2.5 text-primary/60" />}
                  {t.author_name || t.author_email}
                  <span>·</span>
                  {new Date(t.created_date).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm ${
                  isSupport ? "bg-primary/15 text-foreground rounded-tr-sm" : "bg-card border border-border/50 rounded-tl-sm"
                }`}>
                  <ThreadContent content={t.content} />
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Reply area — hidden for closed/resolved tickets */}
      {!isClosed && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/20">
          <textarea
            rows={2}
            placeholder="Add a reply or more information… (Ctrl+Enter to send)"
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2.5 rounded-xl border border-border/40 bg-background text-sm focus:outline-none focus:border-primary/50 resize-none transition-colors"
          />
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={requestAIResponse} disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors disabled:opacity-50">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Request AI response
            </button>
            <button type="button" onClick={sendReply} disabled={!reply.trim() || sending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Send
            </button>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="text-xs text-muted-foreground text-center py-2 border-t border-border/20 mt-1">
          This ticket is {ticket.status}. Replies are disabled.
        </div>
      )}
    </div>
  );
}