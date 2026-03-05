import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Shield, Server, Cloud, Headphones, BarChart3, Lock,
  Wifi, Database, RefreshCw, ArrowRight
} from "lucide-react";

const services = [
  {
    icon: Headphones,
    title: "Managed Helpdesk",
    desc: "Tier 1–3 support available 24/7. Fast ticket resolution, dedicated engineers who know your environment inside-out.",
    bullets: ["Unlimited support tickets", "Remote & on-site support", "< 1hr average response time", "Dedicated account manager"],
  },
  {
    icon: Shield,
    title: "Cybersecurity & EDR",
    desc: "Protect your business from modern threats with enterprise-grade endpoint detection, SIEM, and incident response.",
    bullets: ["Endpoint Detection & Response (EDR)", "Security awareness training", "Dark web monitoring", "Incident response planning"],
  },
  {
    icon: Cloud,
    title: "Cloud Management",
    desc: "Microsoft 365, Azure, and multi-cloud environments managed, optimized, and secured by certified experts.",
    bullets: ["Microsoft 365 admin & licensing", "Azure / AWS management", "Cloud backup & recovery", "Identity & access management"],
  },
  {
    icon: Server,
    title: "Infrastructure Management",
    desc: "Your servers, switches, firewalls, and network gear — proactively monitored, patched, and maintained.",
    bullets: ["Server & network monitoring", "Patch management", "Firewall & VPN management", "Disaster recovery planning"],
  },
  {
    icon: Database,
    title: "Backup & Disaster Recovery",
    desc: "Never lose data again. Automated, tested backups with guaranteed recovery time objectives.",
    bullets: ["Automated cloud backups", "Tested recovery runbooks", "Ransomware recovery", "RTO/RPO SLAs"],
  },
  {
    icon: Lock,
    title: "Compliance & Governance",
    desc: "We keep your business compliant with HIPAA, SOC 2, NIST, and more — audit-ready at all times.",
    bullets: ["HIPAA, SOC 2, NIST", "Policy documentation", "Annual audits support", "Vulnerability assessments"],
  },
  {
    icon: Wifi,
    title: "Networking & Connectivity",
    desc: "Reliable, fast, and secure networking infrastructure. From office Wi-Fi to SD-WAN deployments.",
    bullets: ["SD-WAN deployment", "Structured cabling", "Wi-Fi design & optimization", "ISP management"],
  },
  {
    icon: BarChart3,
    title: "vCIO & Strategic Consulting",
    desc: "Get a virtual CIO to align your technology roadmap with business goals and budget.",
    bullets: ["Quarterly business reviews", "IT roadmap planning", "Vendor management", "Budget forecasting"],
  },
  {
    icon: RefreshCw,
    title: "Hardware Procurement",
    desc: "We source, configure, and deploy hardware — from workstations to server racks.",
    bullets: ["Vendor-neutral sourcing", "Device configuration", "Asset lifecycle management", "Warranty management"],
  },
];

export default function Services() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            What We Do
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight">
            Full-Stack <span className="text-gradient">Managed IT</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From helpdesk to CISO-level strategy — we handle everything so you can focus on growth.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="card-hover p-7 rounded-2xl border border-border/60 bg-card/60 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
              <ul className="flex flex-col gap-2 mt-auto pt-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Not Sure What You Need?</h2>
          <p className="text-muted-foreground mb-8">Let us do a free assessment and build the right package for your business.</p>
          <Link
            to={createPageUrl("Contact")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all glow-blue text-base"
          >
            Get a Free Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}