import { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, Send } from "lucide-react";

const contactInfo = [
  { icon: Phone, label: "Phone", value: "+44 7947 992054" },
  { icon: Mail, label: "Email", value: "info@affinitysolution.com" },
  { icon: MapPin, label: "Location", value: "Austin, TX (remote-first)" },
  { icon: Clock, label: "Hours", value: "24/7 emergency support" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", employees: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight">
            Let's <span className="text-gradient">Talk IT.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Get a free 30-minute IT assessment. No sales pressure — just honest advice about your environment.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Whether you're ready to switch providers or just exploring options, our team is here to help — no commitment required.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card/50">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/10">
            <h3 className="font-bold mb-2 text-primary">Free IT Assessment Includes:</h3>
            <ul className="flex flex-col gap-2">
              {[
                "Security risk identification",
                "Infrastructure health check",
                "Backup & recovery review",
                "Cost optimization opportunities",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-8">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Message Sent!</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Thanks for reaching out. A member of our team will contact you within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="text-xl font-bold mb-1">Book Your Free Assessment</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Work Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Company Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Acme Corp"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Number of Employees</label>
                <select
                  value={form.employees}
                  onChange={(e) => setForm({ ...form, employees: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:border-primary/60 transition-colors text-foreground"
                >
                  <option value="" className="bg-background">Select range</option>
                  <option value="1-10" className="bg-background">1–10</option>
                  <option value="11-50" className="bg-background">11–50</option>
                  <option value="51-200" className="bg-background">51–200</option>
                  <option value="200+" className="bg-background">200+</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tell Us About Your Needs</label>
                <textarea
                  rows={4}
                  placeholder="What IT challenges are you facing? What does your current setup look like?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}