import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle2, User, Monitor, Globe, Zap } from "lucide-react";

const perUserServices = [
  { name: "Unlimited On-site & Remote Support", price: 20, note: "Unlimited tickets, remote & on-site" },
  { name: "Office 365 Desktop Apps License", price: 10, note: "Word, Excel, PowerPoint, Outlook & more" },
  { name: "Email Management + Google Workspace Basic", price: 12, note: "Mailbox + admin support included" },
  { name: "Cloud File Sync & Share Management", price: 5, note: "Secure cloud storage management" },
  { name: "Security Awareness Training", price: 5, note: "Regular training & phishing simulations" },
];

const perEndpointServices = [
  { name: "Endpoint Monitoring + Antivirus (RMM)", price: 22, note: "24/7 monitoring & AV protection" },
  { name: "Endpoint Security Assessment", price: 5, note: "Regular vulnerability assessments" },
  { name: "Security Threat Detection & Remediation", price: 8, note: "Active threat hunting & remediation" },
];

const perDomainServices = [
  { name: "Domain Management", price: 10, note: "DNS management + renewal monitoring" },
  { name: "Website Handling", price: 20, note: "Uptime monitoring + basic support" },
];

const oneTimeServices = [
  { name: "Onboarding & Initial Setup", price: 80, note: "Per user, one-time fee" },
];

const faqs = [
  {
    q: "How does per-user vs per-endpoint pricing work?",
    a: "Per-user services are billed based on the number of staff in your organisation. Per-endpoint services are billed per device (laptops, desktops, servers). You only pay for what you need.",
  },
  {
    q: "Is there a minimum contract length?",
    a: "We offer flexible monthly rolling agreements and discounted annual contracts. Get in touch to discuss what suits your business.",
  },
  {
    q: "Can I mix and match services?",
    a: "Absolutely. Every service is available à la carte. We'll build a tailored package that fits your exact needs and budget.",
  },
  {
    q: "What does onboarding involve?",
    a: "Our team handles full discovery, tool deployment, documentation, and a kickoff call — typically completed within 1–2 weeks.",
  },
];

function ServiceTable({ icon: Icon, title, services, unit }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-base">{title}</h3>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors">
            <div>
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.note}</div>
            </div>
            <div className="text-right flex-shrink-0 ml-6">
              <span className="text-xl font-extrabold text-gradient">£{s.price}</span>
              <div className="text-xs text-muted-foreground">{unit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            Transparent Pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight">
            Simple, <span className="text-gradient">Pay-As-You-Need</span> Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No bundles, no bloat. Mix and match exactly the services your business needs — and only pay for those.
          </p>
        </div>
      </section>

      {/* Tables */}
      <section className="px-6 pb-16 max-w-5xl mx-auto flex flex-col gap-8">
        <ServiceTable
          icon={User}
          title="Per User Services"
          unit="/ user / month"
          color=""
          services={perUserServices}
        />
        <ServiceTable
          icon={Monitor}
          title="Per Endpoint Services"
          unit="/ endpoint / month"
          color=""
          services={perEndpointServices}
        />
        <ServiceTable
          icon={Globe}
          title="Per Domain / Website Services"
          unit="/ month"
          color=""
          services={perDomainServices}
        />

        {/* One-time */}
        <div className="rounded-2xl border border-primary/40 bg-primary/10 overflow-hidden glow-blue">
          <div className="px-6 py-4 border-b border-primary/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base">One-Time Fees</h3>
              <p className="text-xs text-muted-foreground">Charged once at the start</p>
            </div>
          </div>
          {oneTimeServices.map((s) => (
            <div key={s.name} className="flex items-center justify-between px-6 py-5">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.note}</div>
              </div>
              <div className="text-right ml-6">
                <span className="text-2xl font-extrabold text-gradient">£{oneTimeServices[0].price}</span>
                <div className="text-xs text-muted-foreground">one-time / user</div>
              </div>
            </div>
          ))}
        </div>

        {/* Example estimate banner */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 md:p-8">
          <h3 className="font-bold text-lg mb-2">Example: 10-User Business</h3>
          <p className="text-muted-foreground text-sm mb-5">A typical small business taking core services:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {[
              { label: "Support (10 users × £20)", val: "£200/mo" },
              { label: "Endpoint Monitoring (10 × £22)", val: "£220/mo" },
              { label: "Office 365 (10 × £10)", val: "£100/mo" },
              { label: "Security Awareness (10 × £5)", val: "£50/mo" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground/80 flex-1">{row.label}</span>
                <span className="font-semibold">{row.val}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <span className="font-bold">Monthly Total</span>
            <span className="text-2xl font-extrabold text-gradient">£570 / mo</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl border border-border/60 bg-card/50">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Want a Custom Quote?</h2>
          <p className="text-muted-foreground mb-8">Tell us about your team and we'll put together a tailored proposal — free, no obligation.</p>
          <Link
            to={createPageUrl("Contact")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all glow-blue text-base"
          >
            Get a Free Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}