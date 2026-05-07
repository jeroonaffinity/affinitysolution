import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight, Shield, Server, Cloud, Headphones, BarChart3, Lock,
  CheckCircle2, ChevronRight, AlertTriangle, PhoneCall, Clock, Monitor
} from "lucide-react";

const stats = [
  { value: "99.9%", label: "Uptime Guaranteed" },
  { value: "< 1hr", label: "Response Time" },
  { value: "500+",  label: "Devices Managed" },
  { value: "24/7",  label: "Monitoring & Support" },
];

const painPoints = [
  {
    icon: Monitor,
    title: '"My computer is broken and I\'ve lost a day\'s work."',
    desc: "We fix problems fast — usually within the hour — so your team isn't sitting around waiting. No more calling a mate who knows about computers.",
  },
  {
    icon: PhoneCall,
    title: '"I don\'t know who to call when something goes wrong."',
    desc: "You get one number. One team. People who know your business, your systems, and your staff. No call centres, no being passed around.",
  },
  {
    icon: AlertTriangle,
    title: '"I\'m worried about getting hacked but don\'t know where to start."',
    desc: "We put the right protections in place so hackers can't get in — and we explain it all in plain English, not tech speak.",
  },
  {
    icon: Clock,
    title: '"I\'m spending too much time dealing with IT instead of running my business."',
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
    title: "Protection Against Scams",
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
  { stat: "43%",    label: "of cyberattacks target small businesses — not just big corporations",                       source: "Verizon DBIR" },
  { stat: "£3.4M",  label: "average cost of a data breach in the UK — enough to close most small businesses",           source: "IBM Cost of a Data Breach Report" },
  { stat: "60%",    label: "of SMBs never recover and close within 6 months of a serious cyberattack",                  source: "National Cyber Security Alliance" },
  { stat: "300%",   label: "increase in ransomware attacks since 2020 — criminals are getting bolder",                  source: "Cybersecurity Ventures" },
  { stat: "95%",    label: "of breaches happen because of a simple human mistake — which we help prevent",               source: "World Economic Forum" },
  { stat: "11 sec", label: "somewhere in the world, a business is attacked by ransomware every 11 seconds",             source: "Cybersecurity Ventures" },
];

const howItWorks = [
  { step: "01", title: "We Assess Your Setup",    desc: "We come in (or connect remotely) and take a look at what you've got. We tell you what's working, what's at risk, and what needs fixing — in plain language." },
  { step: "02", title: "We Build Your IT Plan",   desc: "We put together a simple, affordable plan that covers exactly what your business needs. No bloated packages, no paying for stuff you don't use." },
  { step: "03", title: "We Handle Everything",    desc: "Once we're set up, you can forget about IT. We monitor, maintain, and fix things — usually before you even notice there's a problem." },
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
    <div className="bg-background text-foreground">

      {/* ── Hero ── */}
      <section className="bg-white py-20 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: text */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight mb-4 text-foreground">
              Your IT,{" "}
              <span className="text-gradient">Fully Managed.</span>{" "}
              Absolutely Bulletproof.
            </h1>
            <p className="text-primary font-semibold text-base mb-3">
              London's Trusted IT Partner for Small Businesses
            </p>
            <p className="text-foreground/70 text-base leading-relaxed mb-3">
              AffinitySolution handles all the technology in your business so you can spend your time running it — not firefighting IT problems.
            </p>
            <p className="text-foreground/60 text-sm leading-relaxed mb-8">
              No jargon. No long contracts. Just reliable IT support for businesses across London and the UK.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={createPageUrl("Contact")}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all glow-blue text-sm"
              >
                Get a Free IT Check-Up
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={createPageUrl("Services")}
                className="flex items-center gap-2 px-6 py-3 border border-border text-foreground/80 font-medium rounded-lg hover:border-primary/50 hover:text-primary transition-all text-sm"
              >
                See What We Do
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="p-6 rounded-2xl border border-border bg-background">
                <div className="text-4xl font-extrabold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-foreground/60 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Sound Familiar?</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-foreground">Does Any of This Sound Like You?</h2>
            <p className="text-foreground/60 text-base max-w-xl mx-auto leading-relaxed">
              These are the most common IT headaches we hear from small business owners. If you've said any of these, we can help.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {painPoints.map((p) => (
              <div key={p.title} className="p-5 rounded-2xl border border-border bg-white hover:border-primary/30 hover:shadow-md transition-all flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-foreground leading-snug italic">{p.title}</h3>
                <p className="text-foreground/60 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works + Cyber Stats (side by side on desktop) ── */}
      <section className="py-20 px-6 bg-white border-y border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* How It Works */}
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-foreground">How It Works</h2>
            <p className="text-foreground/60 text-base mb-10 leading-relaxed">Getting started is simple. No long forms, no confusing process.</p>
            <div className="flex flex-col gap-8">
              {howItWorks.map((step) => (
                <div key={step.step} className="flex gap-5">
                  <div className="text-4xl font-extrabold text-primary/20 leading-none w-12 flex-shrink-0">{step.step}</div>
                  <div>
                    <h3 className="font-bold text-base mb-1 text-foreground">{step.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cyber Stats */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-semibold mb-5">
              ⚠ The Threat Is Real — Even for Small Businesses
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-foreground">Cybercriminals Target Small Businesses Too</h2>
            <p className="text-foreground/60 text-sm mb-8 leading-relaxed">
              Many business owners think "I'm too small to be a target." The statistics say otherwise.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {cyberStats.map((s) => (
                <div key={s.stat} className="p-4 rounded-xl border border-border bg-background flex flex-col gap-1.5">
                  <div className="text-2xl font-extrabold text-primary">{s.stat}</div>
                  <div className="text-xs text-foreground/70 leading-snug">{s.label}</div>
                  <div className="text-xs text-foreground/40 pt-1 border-t border-border mt-auto">Source: {s.source}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">What We Cover</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-foreground">Everything We Take Off Your Plate</h2>
            <p className="text-foreground/60 text-base leading-relaxed max-w-xl">
              Think of us as your full IT department — without the cost of hiring one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-border bg-white hover:border-primary/30 hover:shadow-md transition-all card-hover"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-2 text-foreground">{f.title}</h3>
                <p className="text-foreground/60 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included + Final CTA (side by side) ── */}
      <section className="py-20 px-6 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* What's Included */}
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Everything Included</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-foreground">What You Get When You Work With Us</h2>
            <p className="text-foreground/60 text-sm mb-8">A proper IT team behind your business — from day one.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground leading-tight">
              Ready to Stop Worrying{" "}
              <span className="text-gradient">About IT?</span>
            </h2>
            <p className="text-foreground/60 text-base mb-3 leading-relaxed">
              Book a free 30 minutes that with our team. We'll look at your current setup, tell us what's working and dim't toot, and give you a straightforward recommendation.
            </p>
            <p className="text-foreground/40 text-xs mb-8 italic">No sales pressure. No confusing jargon. Just honest advice.</p>
            <Link
              to={createPageUrl("Contact")}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all glow-blue text-sm w-fit"
            >
              Book Your Free IT Check-Up
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}