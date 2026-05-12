import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ticketService } from "@/lib/ticketService";
import { Loader2, Send, Paperclip, X, FileText, Image, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AITicketAssistant from "./AITicketAssistant";

export default function NewTicketForm({ userEmail, onSuccess, onCancel }) {
  const [form, setForm] = useState({ subject: "", description: "", priority: "Medium", category: "other" });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
    setAttachments(prev => [...prev, ...uploaded.map(r => r.file_url)]);
    setUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const attachmentText = attachments.length
      ? "\n\n--- Attachments ---\n" + attachments.map((url, i) => `[File ${i + 1}](${url})`).join("\n")
      : "";
    try {
      await ticketService.createTicket({
        title: form.subject,
        description: form.description + attachmentText,
        priority: form.priority,
        category: form.category,
        client_email: userEmail,
      });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAISuggestion = ({ priority, category }) => {
    setForm(f => ({
      ...f,
      priority: priority || f.priority,
      category: category || f.category,
    }));
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-primary/15 flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Raise a New Support Ticket</span>
      </div>
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
        <input
          required
          placeholder="Briefly describe the issue..."
          value={form.subject}
          onChange={e => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 transition-colors"
        />
        <textarea
          rows={3}
          placeholder="Give us as much detail as possible — what happened, when, and what you've tried."
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:border-primary/60 resize-none transition-colors"
        />

        {/* AI Assistant — appears below description as an instant reply */}
        <AITicketAssistant
          subject={form.subject}
          description={form.description}
          onApplySuggestion={handleAISuggestion}
        />

        {/* Priority + Category row */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1 min-w-36">
            <label className="text-xs text-muted-foreground">Priority</label>
            <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
              <SelectTrigger className="rounded-xl border-border/50 bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 min-w-36">
            <label className="text-xs text-muted-foreground">Category</label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger className="rounded-xl border-border/50 bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Attachments */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Attachments</label>
          <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border/60 bg-background text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-all w-fit ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
            {uploading ? "Uploading..." : "Attach files"}
            <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.txt,.log,.zip,.docx,.xlsx" />
          </label>
          {attachments.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {attachments.map((url, i) => {
                const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-3 py-1.5">
                    {isImage ? <Image className="w-3 h-3 text-primary/60" /> : <FileText className="w-3 h-3 text-primary/60" />}
                    <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary hover:underline">File {i + 1}</a>
                    <button type="button" onClick={() => setAttachments(a => a.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit Ticket
          </button>
          <button type="button" onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-border/50 text-sm hover:bg-card transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}