import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight, Shield, Server, Cloud, Headphones, BarChart3, Lock,
  CheckCircle2, ChevronRight, AlertTriangle, PhoneCall, Clock, Monitor
} from "lucide-react";

const stats = [
  { value: "99.9%", label: "Uptime Guaranteed" },
  { value: "< 1hr", label: "Avg. Response Time" },
  { value: "500+",  label: "Devices Managed" },
  { value: "24/7",  label: "Monitoring & Support" },
];

const painPoints = [
  {
    icon: Monitor,
    title: '"My computer is broken and I\'ve lost a day\'s work."',
    desc: "We fix problems fast — usually within the hour — so your team isn't sitting around waiting.",
  },
  {
    icon: PhoneCall,
    title: '"I don\'t know who to call when something goes wrong."',
    desc: "One number. One team. People who know your business, your systems, and your staff.",
  },
  {
    icon: AlertTriangle,
    title: '"I\'m worried about getting hacked but don\'t know where to start."',
    desc: "We put the right protections in place and explain it all in plain English — not tech speak.",
  },
  {
    icon: Clock,
    title: '"I\'m spending too much time dealing with IT."',
    desc: "Hand it all over to us. We handle everything so you can focus on running your business.",
  },
];

const features = [
  { icon: Headphones, title: "Helpdesk Support", desc: "UK-based team that answers fast and fixes problems quickly. No jargon — just helpful people." },
  { icon: Shield,     title: "Cyber Protection",  desc: "Keep your business safe from viruses, ransomware, and phishing emails." },
  { icon: Cloud,      title: "Microsoft 365",      desc: "We manage Outlook, Word, Excel, and Teams — on any device, anywhere." },
  { icon: Server,     title: "Reliable Systems",   desc: "Computers, servers, and internet kept running so you're never losing money to downtime." },
  { icon: BarChart3,  title: "Monthly Reports",    desc: "Plain-English reports on what we've done, prevented, and what you should know." },
  { icon: Lock,       title: "Compliance Help",    desc: "GDPR, FCA, Cyber Essentials — we keep your business legally protected and audit-ready." },
];

const cyberStats = [
  { stat: "43%",    label: "of cyberattacks target small businesses",        source: "Verizon DBIR" },
  { stat: "£3.4M",  label: "average cost of a UK data breach",               source: "IBM" },
  { stat: "60%",    label: "of SMBs close within 6 months of an attack",     source: "NCSA" },
  { stat: "300%",   label: "increase in ransomware since 2020",              source: "Cybersecurity Ventures" },
  { stat: "95%",    label: "of breaches caused by human error",              source: "World Economic Forum" },
  { stat: "11 sec", label: "a business hit by ransomware every 11 seconds",  source: "Cybersecurity Ventures" },
];

const howItWorks = [
  { step: "01", title: "We Assess Your Setup",  desc: "We look at what you've got, tell you what's at risk, and what needs fixing — in plain language." },
  { step: "02", title: "We Build Your IT Plan", desc: "A simple, affordable plan covering exactly what your business needs. No bloated packages." },
  { step: "03", title: "We Handle Everything",  desc: "Once set up, forget about IT. We monitor, maintain, and fix — usually before you notice a problem." },
];

const included = [
  "A dedicated team who knows your business",
  "Someone to call whenever something goes wrong",
  "Computers and systems kept up to date",
  "Protection against hackers, viruses & scams",
  "Emails and files backed up safely",
  "Help staying legally compliant (GDPR, FCA etc.)",
  "Monthly plain-English IT health reports",
  "Advice on the right technology for your budget",
];

export default function Home() {
  return (
    <div className="bg-background text-foreground">

      {/* ── Hero ── */}
      <section className="bg-white py-16 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 border border-primary/20">
              London's Trusted IT Partner for SMBs
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 text-foreground">
              Your IT, <span className="text-gradient">Fully Managed.</span> Absolutely Bulletproof.
            </h1>
            <p className="text-foreground/65 text-base leading-relaxed mb-6">
              AffinitySolution handles all the technology in your business so you can spend your time running it — not firefighting IT problems. No jargon. No long contracts.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={createPageUrl("Contact")}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all glow-blue text-sm"
              >
                Get a Free IT Check-Up <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={createPageUrl("Services")}
                className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground/70 font-medium rounded-lg hover:border-primary/40 hover:text-primary transition-all text-sm"
              >
                See What We Do <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="p-5 rounded-2xl border border-border bg-background text-center">
                <div className="text-3xl font-extrabold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-foreground/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="py-14 px-6 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Sound Familiar?</p>
            <h2 className="text-3xl font-extrabold mb-2">Does Any of This Sound Like You?</h2>
            <p className="text-foreground/55 text-sm max-w-lg mx-auto">These are the most common IT headaches we hear from small business owners. If you've said any of these, we can help.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {painPoints.map((p) => (
              <div key={p.title} className="p-5 rounded-2xl border border-border bg-white hover:border-primary/30 hover:shadow-sm transition-all flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm leading-snug italic text-foreground">{p.title}</h3>
                <p className="text-foreground/55 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works + Cyber Stats ── */}
      <section className="py-14 px-6 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* How It Works */}
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl font-extrabold mb-1">How It Works</h2>
            <p className="text-foreground/55 text-sm mb-8">Getting started is simple. No long forms, no confusing process.</p>
            <div className="flex flex-col gap-7">
              {howItWorks.map((step) => (
                <div key={step.step} className="flex gap-5 items-start">
                  <div className="text-3xl font-extrabold text-primary/20 leading-none w-10 flex-shrink-0 pt-0.5">{step.step}</div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                    <p className="text-foreground/55 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cyber Stats */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-semibold mb-4">
              ⚠ The Threat Is Real — Even for Small Businesses
            </div>
            <h2 className="text-3xl font-extrabold mb-2">Cybercriminals Target Small Businesses Too</h2>
            <p className="text-foreground/55 text-sm mb-6">Many owners think "I'm too small to be a target." The stats say otherwise.</p>
            <div className="grid grid-cols-3 gap-3">
              {cyberStats.map((s) => (
                <div key={s.stat} className="p-4 rounded-xl border border-border bg-background flex flex-col gap-1.5">
                  <div className="text-xl font-extrabold text-primary">{s.stat}</div>
                  <div className="text-xs text-foreground/65 leading-snug">{s.label}</div>
                  <div className="text-[10px] text-foreground/35 pt-1 border-t border-border mt-auto">Source: {s.source}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-14 px-6 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">What We Cover</p>
            <h2 className="text-3xl font-extrabold mb-2">Everything We Take Off Your Plate</h2>
            <p className="text-foreground/55 text-sm max-w-md">Think of us as your full IT department — without the cost of hiring one.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="p-5 rounded-2xl border border-border bg-white hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{f.title}</h3>
                <p className="text-foreground/55 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included + CTA ── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* What's Included */}
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Everything Included</p>
            <h2 className="text-2xl font-extrabold mb-1">What You Get When You Work With Us</h2>
            <p className="text-foreground/55 text-sm mb-6">A proper IT team behind your business — from day one.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-background">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground/75">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              Ready to Stop Worrying <span className="text-gradient">About IT?</span>
            </h2>
            <p className="text-foreground/60 text-sm mb-2 leading-relaxed">
              Book a free 30-minute call with our team. We'll review your current setup, tell you what's working and what isn't, and give you a straightforward recommendation.
            </p>
            <p className="text-foreground/35 text-xs mb-7 italic">No sales pressure. No confusing jargon. Just honest advice.</p>
            <Link
              to={createPageUrl("Contact")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all glow-blue text-sm w-fit"
            >
              Book Your Free IT Check-Up <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}