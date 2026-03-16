import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Shield, Server, Cloud, Headphones, BarChart3, Lock, CheckCircle2, ChevronRight } from "lucide-react";

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 1hr", label: "Avg Response" },
  { value: "500+", label: "Endpoints Managed" },
  { value: "24/7", label: "Monitoring" },
];

const features = [
  {
    icon: Shield,
    title: "Cybersecurity",
    desc: "Enterprise-grade protection with EDR, SIEM, and zero-trust frameworks.",
  },
  {
    icon: Server,
    title: "Infrastructure",
    desc: "Fully managed servers, networking, and on-prem to cloud migrations.",
  },
  {
    icon: Cloud,
    title: "Cloud Services",
    desc: "Microsoft 365, Azure, and hybrid cloud management done right.",
  },
  {
    icon: Headphones,
    title: "Helpdesk Support",
    desc: "Responsive tier 1–3 support with a dedicated team that knows your stack.",
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    desc: "Full visibility into your IT environment with monthly executive reports.",
  },
  {
    icon: Lock,
    title: "Compliance",
    desc: "HIPAA, SOC 2, and NIST frameworks — we keep you audit-ready.",
  },
];

const cyberStats = [
  {
    stat: "43%",
    label: "of cyberattacks target small businesses",
    source: "Verizon DBIR",
  },
  {
    stat: "£3.4M",
    label: "average cost of a data breach in the UK",
    source: "IBM Cost of a Data Breach Report",
  },
  {
    stat: "60%",
    label: "of SMBs close within 6 months of a cyberattack",
    source: "National Cyber Security Alliance",
  },
  {
    stat: "300%",
    label: "increase in ransomware attacks since 2020",
    source: "Cybersecurity Ventures",
  },
  {
    stat: "95%",
    label: "of breaches are caused by human error",
    source: "World Economic Forum",
  },
  {
    stat: "11 sec",
    label: "a business is hit by a ransomware attack every 11 seconds",
    source: "Cybersecurity Ventures",
  },
];

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-grid">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            AffinitySolution – Managed IT Services
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Your IT, <span className="text-gradient">Fully Managed.</span>
            <br />Absolutely Bulletproof.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            We handle every layer of your technology stack so your team can focus on what moves the business forward — not on IT fires.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={createPageUrl("Contact")}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all glow-blue-strong text-base"
            >
              Get a Free Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={createPageUrl("Services")}
              className="flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-base"
            >
              View Services
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

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything Your Business Needs</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              One partner. Every layer of your IT covered.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-hover p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-card/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Growing Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-7 rounded-2xl border border-border/60 bg-card/70 flex flex-col gap-4">
                <p className="text-foreground/80 text-sm leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            Ready to Stop Worrying About IT?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Get a free 30-minute IT assessment and discover exactly what's at risk in your environment.
          </p>
          <Link
            to={createPageUrl("Contact")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all glow-blue-strong text-base"
          >
            Book Your Free Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}