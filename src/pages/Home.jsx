import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Shield, Server, Cloud, Headphones, BarChart3, Lock, CheckCircle2, ChevronRight, Wifi, AlertTriangle, PhoneCall, Clock } from "lucide-react";

const stats = [
{ value: "99.9%", label: "Uptime Guaranteed" },
{ value: "< 1hr", label: "We Pick Up the Phone" },
{ value: "500+", label: "Devices We Look After" },
{ value: "24/7", label: "Always Watching" }];


const painPoints = [
{
  icon: AlertTriangle,
  title: "\"My computer is broken and I've lost a day's work.\"",
  desc: "We fix problems fast — usually within the hour — so your team isn't sitting around waiting. No more calling a mate who knows about computers."
},
{
  icon: PhoneCall,
  title: "\"I don't know who to call when something goes wrong.\"",
  desc: "You get one number. One team. People who know your business, your systems, and your staff. No call centres, no being passed around."
},
{
  icon: Lock,
  title: "\"I'm worried about getting hacked but don't know where to start.\"",
  desc: "We put the right protections in place so hackers can't get in — and we explain it all in plain English, not tech speak."
},
{
  icon: Clock,
  title: "\"I'm spending too much time dealing with IT instead of running my business.\"",
  desc: "Hand it all over to us. We handle everything in the background so you can focus on what you're actually good at."
}];


const features = [
{
  icon: Headphones,
  title: "Someone to Call When Things Break",
  desc: "Our friendly UK-based helpdesk answers fast and fixes problems quickly. No jargon, no condescension — just helpful people getting you back on track."
},
{
  icon: Shield,
  title: "Protection Against Hackers & Scams",
  desc: "We keep your business safe from viruses, ransomware, and phishing emails that try to steal your data or your money."
},
{
  icon: Cloud,
  title: "Your Emails & Files, Always Working",
  desc: "We manage Microsoft 365 (Outlook, Word, Excel, Teams) and make sure everything works — on any device, anywhere."
},
{
  icon: Server,
  title: "Reliable Systems That Don't Let You Down",
  desc: "We keep your computers, servers, and internet running smoothly so you're not losing money every time something goes down."
},
{
  icon: BarChart3,
  title: "Monthly Reports in Plain English",
  desc: "Every month we tell you what we've done, what we've prevented, and what you should know — without the confusing technical language."
},
{
  icon: Lock,
  title: "Help With Rules & Regulations",
  desc: "Whether it's GDPR, FCA requirements, or Cyber Essentials — we make sure your business is legally protected and audit-ready."
}];


const cyberStats = [
{
  stat: "43%",
  label: "of cyberattacks target small businesses — not just big corporations",
  source: "Verizon DBIR"
},
{
  stat: "£3.4M",
  label: "average cost of a data breach in the UK — enough to close most small businesses",
  source: "IBM Cost of a Data Breach Report"
},
{
  stat: "60%",
  label: "of SMBs never recover and close within 6 months of a serious cyberattack",
  source: "National Cyber Security Alliance"
},
{
  stat: "300%",
  label: "increase in ransomware attacks since 2020 — criminals are getting bolder",
  source: "Cybersecurity Ventures"
},
{
  stat: "95%",
  label: "of breaches happen because of a simple human mistake — which we help prevent",
  source: "World Economic Forum"
},
{
  stat: "11 sec",
  label: "somewhere in the world, a business is attacked by ransomware every 11 seconds",
  source: "Cybersecurity Ventures"
}];


const howItWorks = [
{
  step: "1",
  title: "We Assess Your Setup",
  desc: "We come in (or connect remotely) and take a look at what you've got. We tell you what's working, what's at risk, and what needs fixing — all in plain language."
},
{
  step: "2",
  title: "We Build Your IT Plan",
  desc: "We put together a simple, affordable plan that covers exactly what your business needs. No bloated packages, no paying for stuff you don't use."
},
{
  step: "3",
  title: "We Handle Everything",
  desc: "Once we're set up, you can forget about IT. We monitor, maintain, and fix things — usually before you even notice there's a problem."
}];


export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-grid">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            London's Trusted IT Partner for Small Businesses
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-3 tracking-tight">
            Your IT, <span className="text-gradient">Fully Managed.</span>
            <br />Absolutely Bulletproof.
          </h1>
          <p className="text-base md:text-lg font-semibold text-primary/80 tracking-wide mb-6 uppercase hidden">
            AffinitySolution — Your Trusted IT &amp; Cybersecurity Partner
          </p>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            We look after all the technology in your business — computers, emails, security, and more — so you can focus on what you do best: running your business.
          </p>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-8">
            No technical jargon. No confusing contracts. Just reliable, affordable IT support for businesses across London and the UK.
          </p>
          <div className="mb-10">
            <Link
              to={createPageUrl("Contact")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-all hidden">
              
              Get a Free Consultation
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

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
          {stats.map((s) =>
          <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-gradient mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          )}
        </div>
      </section>

      {/* Pain Points — "Does This Sound Like You?" */}
      <section className="py-24 px-6 bg-card/20 border-b border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Does Any of This Sound Familiar?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              These are the most common IT headaches we hear from small business owners. If you've said any of these, we can help.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {painPoints.map((p) =>
            <div key={p.title} className="p-6 rounded-2xl border border-border/60 bg-card/60 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-primary/90 italic">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Getting started is simple. No long forms, no confusing process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) =>
            <div key={step.step} className="text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xl font-extrabold">
                  {step.step}
                </div>
                <h3 className="font-bold text-base">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-card/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything We Take Off Your Plate</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Think of us as your full IT department — without the cost of hiring one.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) =>
            <div
              key={f.title}
              className="card-hover p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm group">
              
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cyber Threat Stats */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-destructive/40 bg-destructive/10 text-destructive text-sm font-medium mb-5">
              ⚠ The Threat Is Real — Even for Small Businesses
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cybercriminals Target Small Businesses Too</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Many business owners think "I'm too small to be a target." The statistics say otherwise. Here's what's actually happening out there.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cyberStats.map((s) =>
            <div key={s.stat} className="p-7 rounded-2xl border border-border/60 bg-card/70 flex flex-col gap-2">
                <div className="text-4xl font-extrabold text-gradient">{s.stat}</div>
                <div className="text-sm font-medium text-foreground leading-snug">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border/40">Source: {s.source}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What's Included Summary */}
      <section className="py-16 px-6 bg-card/20 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">What You Get When You Work With Us</h2>
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
            "Advice on what technology is right for your budget"].
            map((item) =>
            <div key={item} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            Ready to Stop Worrying About IT?
          </h2>
          <p className="text-muted-foreground text-lg mb-4">
            Book a free 30-minute chat with our team. We'll look at your current setup, tell you what's working and what isn't, and give you a straightforward recommendation — with no obligation to sign up.
          </p>
          <p className="text-muted-foreground text-sm mb-10 italic">No sales pressure. No confusing jargon. Just honest advice.</p>
          <Link
            to={createPageUrl("Contact")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all glow-blue-strong text-base">
            
            Book Your Free IT Check-Up
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>);

}