import { useState } from "react";
import { Phone, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CallbackForm() {
  const [form, setForm] = useState({ name: "", company: "", contact: "", preferredMethod: "call", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.ContactSubmission.create({
      name: form.name,
      company: form.company,
      contact: form.contact,
      preferred_method: form.preferredMethod,
      message: form.message,
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/10 p-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold">We'll be in touch!</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Thanks {form.name}. We'll {form.preferredMethod === "call" ? "call you back" : "email you"} shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-8 flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Request a Callback</h3>
        <p className="text-sm text-muted-foreground">Leave your details and we'll get back to you — your way.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Preferred contact method */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">How would you like us to contact you?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, preferredMethod: "call" })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                form.preferredMethod === "call"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Phone className="w-4 h-4" />
              Call Me Back
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, preferredMethod: "email" })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                form.preferredMethod === "email"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Mail className="w-4 h-4" />
              Email Me
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Your Name *</label>
            <input
              required
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Company Name</label>
            <input
              type="text"
              placeholder="Acme Ltd"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="px-4 py-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {form.preferredMethod === "call" ? "Phone Number *" : "Email Address *"}
          </label>
          <input
            required
            type={form.preferredMethod === "call" ? "tel" : "email"}
            placeholder={form.preferredMethod === "call" ? "07700 900000" : "jane@acme.com"}
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="px-4 py-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Anything we should know? (optional)</label>
          <textarea
            rows={3}
            placeholder="e.g. We have 10 staff and need help with email setup..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="px-4 py-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-blue disabled:opacity-60 text-base"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <>{form.preferredMethod === "call" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {form.preferredMethod === "call" ? "Request a Call Back" : "Send My Request"}</>
          )}
        </button>
      </form>
    </div>
  );
}