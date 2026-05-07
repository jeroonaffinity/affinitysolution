import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight, Shield, Server, Cloud, Headphones, BarChart3, Lock,
  CheckCircle2, ChevronRight, AlertTriangle, PhoneCall, Clock
} from "lucide-react";

const stats = [
  { value: "99.9%", label: "Uptime Guaranteed" },
  { value: "< 1hr", label: "Response Time" },
  { value: "500+", label: "Devices Managed" },
  { value: "24/7", label: "Monitoring & Support" },
];

const painPoints = [
  {
    icon: AlertTriangle,
    title: "\"My computer is broken and I've lost a day's work.\"",
    desc: "We fix problems fast — usually within the hour — so your team isn't sitting around waiting. No more calling a mate who knows about computers.",
  },
  {
    icon: PhoneCall,
    title: "\"I don't know who to call when something goes wrong.\"",
    desc: "You get one number. One team. People who know your business, your systems, and your staff. No call centres, no being passed around.",
  },
  {
    icon: Lock,
    title: "\"I'm worried about getting hacked but don't know where to start.\"",
    desc: "We put the right protections in place so hackers can't get in — and we explain it all in plain English, not tech speak.",
  },
  {
    icon: Clock,
    title: "\"I'm spending too much time dealing with IT instead of running my business.\"",
    desc: "Hand it all over to us. We handle everything in the background so you can focus on what you're actually good at.",
  },
];

const features = [
  {
    icon: Headphones,
    title: "Someone to Call When Things Break",
    desc: "Our UK-based helpdesk answers fast and fixes problems quickly. No jargon — just helpful people getting you back on track.",
  },
  {
    icon: Shield,
    title: "Protection Against Hackers & Scams",
    desc: "We keep your business safe from viruses, ransomware, and phishing emails that try to steal your data or your money.",
  },
  {
    icon: Cloud,
    title: "Your Emails & Files, Always Working",
    desc: "We manage Microsoft 365 (Outlook, Word, Excel, Teams) and make sure everything works — on any device, anywhere.",
  },
  {
    icon: Server,
    title: "Reliable Systems That Don't Let You Down",
    desc: "We keep your computers, servers, and internet running smoothly so you're not losing money every time something goes down.",
  },
  {
    icon: BarChart3,
    title: "Monthly Reports in Plain English",
    desc: "Every month we tell you what we've done, what we've prevented, and what you should know — no confusing technical language.",
  },
  {
    icon: Lock,
    title: "Help With Rules & Regulations",
    desc: "Whether it's GDPR, FCA requirements, or Cyber Essentials — we make sure your business is legally protected and audit-ready.",
  },
];

const cyberStats = [
  { stat: "43%", label: "of cyberattacks target small businesses — not just big corporations", source: "Verizon DBIR" },
  { stat: "£3.4M", label: "average cost of a data breach in the UK — enough to close most small businesses", source: "IBM Cost of a Data Breach Report" },
  { stat: "60%", label: "of SMBs never recover and close within 6 months of a serious cyberattack", source: "National Cyber Security Alliance" },
  { stat: "300%", label: "increase in ransomware attacks since 2020 — criminals are getting bolder", source: "Cybersecurity Ventures" },
  { stat: "95%", label: "of breaches happen because of a simple human mistake — which we help prevent", source: "World Economic Forum" },
  { stat: "11 sec", label: "somewhere in the world, a business is attacked by ransomware every 11 seconds", source: "Cybersecurity Ventures" },
];

const howItWorks = [
  {
    step: "01",
    title: "We Assess Your Setup",
    desc: "We come in (or connect remotely) and take a look at what you've got. We tell you what's working, what's at risk, and what needs fixing — in plain language.",
  },
  {
    step: "02",
    title: "We Build Your IT Plan",
    desc: "We put together a simple, affordable plan that covers exactly what your business needs. No bloated packages, no paying for stuff you don't use.",
  },
  {
    step: "03",
    title: "We Handle Everything",
    desc: "Once we're set up, you can forget about IT. We monitor, maintain, and fix things — usually before you even notice there's a problem.",
  },
];

const included = [
  "A dedicated team who knows your business",
  "Someone to call whenever something goes wrong",
  "Your computers and systems kept up to date",
  "Protection against hackers, viruses, and scams",
  "Your emails and files backed up safely",
  "Help staying legally compliant (GDPR, FCA, etc.)",
  "Monthly plain-English reports on your IT health",
  "Advice on what technology is right for your budget",
];

export default function Home() {
  return (
    <div className="bg-background">

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/8 blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/8 text-primary text-sm font-medium mb-10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
            London's Trusted IT Partner for Small Businesses
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-7">
            Your IT,{" "}
            <span className="text-gradient">Fully Managed.</span>
            <br />
            <span className="text-foreground/90">Absolutely Bulletproof.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed font-light">
            AffinitySolution handles all the technology in your business so you can spend your time running it — not firefighting IT problems.
          </p>

          <p className="text-base text-muted-foreground/70 max-w-lg mx-auto mb-12">
            No jargon. No long contracts. Just reliable IT support for businesses across London and the UK.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={createPageUrl("Contact")}
              className="flex items-center gap-2.5 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all glow-blue-strong text-base shadow-lg"
            >
              Get a Free IT Check-Up
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={createPageUrl("Services")}
              className="flex items-center gap-2.5 px-8 py-4 border border-white/15 text-foreground font-medium rounded-xl hover:border-primary/40 hover:bg-white/4 transition-all text-base"
            >
              See What We Do
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/8 bg-white/3 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-gradient mb-1.5">{s.value}</div>
              <div className="text-sm text-muted-foreground tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Sound Familiar?</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Does Any of This Sound Like You?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              These are the most common IT headaches we hear from small business owners. If you've said any of these, we can help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {painPoints.map((p) => (
              <div key={p.title} className="group p-6 rounded-2xl border border-white/8 bg-white/3 hover:border-primary/30 hover:bg-primary/4 transition-all duration-300 flex gap-5">
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/25 transition-colors">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2 text-white/90 italic leading-snug">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 border-y border-white/8 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">Getting started is simple. No long forms, no confusing process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {howItWorks.map((step, i) => (
              <div key={step.step} className="flex flex-col items-center text-center gap-5 relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-2xl font-extrabold shadow-lg">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">What We Cover</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything We Take Off Your Plate</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Think of us as your full IT department — without the cost of hiring one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-7 rounded-2xl border border-white/8 bg-white/3 hover:border-primary/30 hover:bg-primary/4 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2.5 text-white/90">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cyber Threat Stats ── */}
      <section className="py-24 px-6 border-y border-white/8 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/8 text-red-400 text-sm font-medium mb-6">
              ⚠ The Threat Is Real — Even for Small Businesses
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Cybercriminals Target Small Businesses Too</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Many business owners think "I'm too small to be a target." The statistics say otherwise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cyberStats.map((s) => (
              <div key={s.stat} className="p-7 rounded-2xl border border-white/8 bg-white/3 flex flex-col gap-3">
                <div className="text-4xl font-extrabold text-gradient">{s.stat}</div>
                <div className="text-sm font-medium text-white/85 leading-snug flex-1">{s.label}</div>
                <div className="text-xs text-muted-foreground pt-3 border-t border-white/8">Source: {s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Everything Included</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What You Get When You Work With Us</h2>
            <p className="text-muted-foreground text-lg">A proper IT team behind your business — from day one.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-3.5 p-4 rounded-xl border border-white/8 bg-white/3 hover:border-primary/25 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-white/85">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6 border-t border-white/8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Ready to Stop Worrying<br />
            <span className="text-gradient">About IT?</span>
          </h2>
          <p className="text-muted-foreground text-xl mb-3 leading-relaxed font-light max-w-2xl mx-auto">
            Book a free 30-minute chat with our team. We'll look at your current setup, tell you what's working and what isn't, and give you a straightforward recommendation.
          </p>
          <p className="text-muted-foreground/60 text-sm mb-12 italic">No sales pressure. No confusing jargon. Just honest advice.</p>
          <Link
            to={createPageUrl("Contact")}
            className="inline-flex items-center gap-2.5 px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all glow-blue-strong text-base shadow-lg"
          >
            Book Your Free IT Check-Up
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}