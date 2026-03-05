import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Essentials",
    price: { monthly: 49, annual: 39 },
    unit: "/ user / mo",
    tagline: "For small teams getting started with managed IT.",
    highlight: false,
    features: [
      "Helpdesk support (business hours)",
      "Endpoint monitoring & management",
      "Patch management",
      "Microsoft 365 management",
      "Basic antivirus & EDR",
      "Monthly reporting",
    ],
  },
  {
    name: "Business",
    price: { monthly: 89, annual: 72 },
    unit: "/ user / mo",
    tagline: "The most popular choice for growing businesses.",
    highlight: true,
    features: [
      "Everything in Essentials",
      "24/7 helpdesk support",
      "Advanced EDR & SIEM",
      "Cloud backup & DR planning",
      "Firewall & network management",
      "Quarterly vCIO review",
      "Compliance readiness",
      "Dedicated account manager",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    unit: null,
    tagline: "Custom plans for complex, multi-site environments.",
    highlight: false,
    features: [
      "Everything in Business",
      "Multi-site management",
      "Custom SLAs & RTO/RPO",
      "On-site support included",
      "Full compliance management",
      "24/7 SOC monitoring",
      "Executive reporting & vCISO",
      "Dedicated engineering team",
    ],
  },
];

const faqs = [
  {
    q: "Is there a long-term contract?",
    a: "We offer month-to-month and annual agreements. Annual plans come with a discount and price lock.",
  },
  {
    q: "What does onboarding look like?",
    a: "Our team handles the full onboarding process — discovery, documentation, tool deployment, and a kickoff call — in under 2 weeks.",
  },
  {
    q: "Can I add services à la carte?",
    a: "Yes. Each plan can be customized with add-on services such as advanced backup, compliance packages, and more.",
  },
  {
    q: "Do you offer hardware procurement?",
    a: "Yes — hardware sourcing, configuration, and deployment are available as an add-on across all plans.",
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            No hidden fees. No surprises. Just predictable IT costs that scale with you.
          </p>
          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-card/60 border border-border/60 rounded-xl px-4 py-2">
            <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`w-12 h-6 rounded-full transition-colors relative ${annual ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual <span className="text-primary text-xs font-bold ml-1">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col border transition-all card-hover ${
                plan.highlight
                  ? "border-primary bg-primary/10 glow-blue"
                  : "border-border/60 bg-card/60"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.tagline}</p>
              </div>

              <div className="mb-8">
                {plan.price ? (
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-gradient">
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground text-sm mb-2">{plan.unit}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-extrabold text-foreground">Custom</div>
                )}
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-primary" : "text-primary/70"}`} />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={createPageUrl("Contact")}
                className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-blue"
                    : "border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground"
                }`}
              >
                {plan.price ? "Get Started" : "Contact Us"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
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
    </div>
  );
}