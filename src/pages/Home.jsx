import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Shield, Server, Cloud, Headphones, BarChart3, Lock, CheckCircle2, ChevronRight, AlertTriangle, PhoneCall, Clock } from "lucide-react";

const stats = [
  { value: "99.9%", label: "Uptime Guaranteed" },
  { value: "< 1hr", label: "We Pick Up the Phone" },
  { value: "500+", label: "Devices We Look After" },
  { value: "24/7", label: "Always Watching" },
];

const painPoints = [
  {
    icon: AlertTriangle,
    title: "\"My computer is broken and I've lost a day's work.\"",
    desc: "We fix problems fast — usually within the hour — so your team isn't sitting around waiting.",
  },
  {
    icon: PhoneCall,
    title: "\"I don't know who to call when something goes wrong.\"",
    desc: "You get one number. One team. People who know your business and your systems.",
  },
  {
    icon: Lock,
    title: "\"I'm worried about getting hacked but don't know where to start.\"",
    desc: "We put the right protections in place — and explain it all in plain English, not tech speak.",
  },
  {
    icon: Clock,
    title: "\"I'm spending too much time dealing with IT.\"",
    desc: "Hand it all over to us. We handle everything so you can focus on running your business.",
  },
];

const features = [
  { icon: Headphones, title: "Helpdesk Support", desc: "UK-based helpdesk that answers fast and fixes problems quickly. No jargon, just helpful people." },
  { icon: Shield, title: "Cybersecurity", desc: "Protection against viruses, ransomware, and phishing emails that try to steal your data or money." },
  { icon: Cloud, title: "Microsoft 365", desc: "We manage Outlook, Word, Excel, and Teams — on any device, anywhere." },
  { icon: Server, title: "Reliable Infrastructure", desc: "We keep your computers, servers, and internet running smoothly." },
  { icon: BarChart3, title: "Monthly Reports", desc: "Plain-English reports on what we've done and what you should know." },
  { icon: Lock, title: "Compliance", desc: "GDPR, FCA, Cyber Essentials — we make sure your business is legally protected." },
];

const howItWorks = [
  { step: "1", title: "We Assess Your Setup", desc: "We look at what you've got and tell you what's working, what's at risk, and what needs fixing." },
  { step: "2", title: "We Build Your Plan", desc: "A simple, affordable plan covering exactly what your business needs. No bloated packages." },
  { step: "3", title: "We Handle Everything", desc: "Once set up, forget about IT. We monitor, maintain, and fix things — usually before you notice." },
];

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-grid">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            London's Trusted IT Partner for Small Businesses
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 tracking-tight">
            Your IT, <span className="text-gradient">Fully Managed.</span>
            <br />Absolutely Bulletproof.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            We look after all the technology in your business so you can focus on what you do best. No jargon. No confusing contracts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={createPageUrl("Contact")}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all glow-blue-strong text-base">
              Get a Free IT Check-Up
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={createPageUrl("Services")}
              className="flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-base">
              See What We Do
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/30 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-gradient mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-6 bg-card/20 border-b border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Does Any of This Sound Familiar?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              The most common IT headaches we hear from business owners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {painPoints.map((p) => (
              <div key={p.title} className="p-6 rounded-2xl border border-border/60 bg-card/60 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1.5 text-primary/90 italic">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Getting started is simple.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xl font-extrabold">
                  {step.step}
                </div>
                <h3 className="font-bold text-base">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything We Take Off Your Plate</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Your full IT department — without the cost of hiring one.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card-hover p-6 rounded-2xl border border-border/60 bg-card/60 group">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">What You Get</h2>
            <p className="text-muted-foreground">A proper IT team behind your business — from day one.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "A dedicated team who knows your business",
              "Someone to call whenever something goes wrong",
              "Your computers and systems kept up to date",
              "Protection against hackers, viruses, and scams",
              "Your emails and files backed up safely",
              "Help staying legally compliant (GDPR, FCA, etc.)",
              "Monthly plain-English reports on your IT health",
              "Advice on the right technology for your budget",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-card/20 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Stop Worrying About IT?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Book a free 30-minute chat. We'll look at your setup and give you honest advice — no obligation.
          </p>
          <Link
            to={createPageUrl("Contact")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all glow-blue-strong text-base">
            Book Your Free IT Check-Up
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}