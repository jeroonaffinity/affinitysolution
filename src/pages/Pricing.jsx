import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import PricingCalculator from "@/components/PricingCalculator";

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

      {/* Interactive Calculator */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Calculate Your Monthly Cost</h2>
          <p className="text-muted-foreground text-sm">Pick exactly what you need — see the price update in real time.</p>
        </div>
        <PricingCalculator />
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