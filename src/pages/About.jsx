import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Users, Headphones, Zap } from "lucide-react";

const values = [
  { icon: Shield, title: "Security First", description: "Every solution we build starts with security at its core, not as an afterthought." },
  { icon: Users, title: "People Focused", description: "We work with small businesses who deserve enterprise-grade IT without the enterprise price tag." },
  { icon: Headphones, title: "Always On", description: "Our team provides 24/7 monitoring and emergency support so you never face downtime alone." },
  { icon: Zap, title: "Fast & Reliable", description: "We resolve most issues remotely within the hour, keeping your team productive." },
];

export default function About() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            About <span className="text-gradient">AffinitySolution</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are a London-based Managed Service Provider built specifically for small and medium-sized businesses 
            that want serious IT support without serious complexity.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
          <div className="prose prose-invert max-w-none text-muted-foreground space-y-4 leading-relaxed">
            <p>
              AffinitySolution was founded with a single mission: to make world-class managed IT accessible to businesses 
              of all sizes. Too many small businesses are left to navigate cybersecurity threats, compliance requirements, 
              and infrastructure headaches without the expertise or budget that larger corporations take for granted. 
              We exist to close that gap.
            </p>
            <p>
              Our team of certified IT professionals brings decades of combined experience across cybersecurity, 
              cloud infrastructure, networking, and compliance. We partner with industry-leading vendors to deliver 
              solutions that are proven, scalable, and tailored to each client's unique environment — never a one-size-fits-all approach.
            </p>
            <p>
              Whether you're a 5-person startup or a 200-seat professional services firm, we offer the same commitment: 
              proactive monitoring, rapid response, transparent billing, and a team that genuinely understands your business. 
              Our client portal gives you real-time visibility into your IT estate, open tickets, and monthly spend — 
              because we believe you should always know exactly what you're getting.
            </p>
            <p>
              Based in London and serving clients across the UK, AffinitySolution is the IT partner that grows with you. 
              We handle the technology so you can focus on what matters most — running your business.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center mb-10">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/40 transition-all card-hover">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-base mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to work together?</h2>
        <p className="text-muted-foreground text-sm mb-6">Get a free, no-obligation IT assessment from our team.</p>
        <Link
          to={createPageUrl("Contact")}
          className="inline-block px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-blue"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
}