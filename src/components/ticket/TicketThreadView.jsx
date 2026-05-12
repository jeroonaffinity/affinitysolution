import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Sparkles } from "lucide-react";

export default function TicketThreadView({ ticketId, clientEmail, onThreadUpdate }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadThreads = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("ticketThreadManager", {
      action: "list_threads",
      ticket_id: ticketId,
    });
    setThreads(res.data?.threads || []);
    setLoading(false);
  };

  useEffect(() => {
    loadThreads();
    // Subscribe to real-time updates
    const unsubscribe = base44.entities.TicketThread.subscribe((event) => {
      if (event.data?.ticket_id === ticketId) {
        loadThreads();
      }
    });
    return unsubscribe;
  }, [ticketId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await base44.functions.invoke("ticketThreadManager", {
        action: "add_message",
        ticket_id: ticketId,
        content: newMessage,
      });
      setNewMessage("");
      loadThreads();
      onThreadUpdate?.();
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {threads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No messages yet. Send one to get started.
          </div>
        ) : (
          threads.map((thread) => {
            const isAI = thread.is_ai_response;
            const isCurrentUser = thread.author_email === clientEmail;
            return (
              <div
                key={thread.id}
                className={`flex flex-col gap-1.5 ${isCurrentUser ? "items-end" : "items-start"}`}
              >
                <div className="text-xs text-muted-foreground px-1 flex items-center gap-1">
                  {isAI && <Sparkles className="w-3 h-3 text-primary" />}
                  {thread.author_name || thread.author_email} ·{" "}
                  {new Date(thread.created_date).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAI
                      ? "bg-primary/15 text-foreground rounded-tl-sm"
                      : isCurrentUser
                      ? "bg-primary/20 text-foreground rounded-tr-sm"
                      : "bg-card border border-border/50 rounded-tl-sm"
                  }`}
                >
                  {thread.content}
                </div>
                {!thread.is_public && (
                  <span className="text-xs text-muted-foreground italic">
                    (Admin note - not visible to customer)
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Message input */}
      <div className="px-6 py-4 border-t border-border/40 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
          <textarea
            rows={3}
            placeholder="Write a reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 self-end"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send Reply
          </button>
        </form>
      </div>
    </div>
  );
}