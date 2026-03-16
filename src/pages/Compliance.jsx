import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Building2, Landmark, HeartPulse, ShoppingCart, Truck } from "lucide-react";

const frameworks = [
  {
    icon: Landmark,
    title: "FCA & Financial Conduct",
    subtitle: "Financial Services",
    desc: "The Financial Conduct Authority (FCA) mandates that financial firms maintain robust IT controls, data integrity, and operational resilience. SYSC (Senior Management Arrangements) rules require firms to have appropriate systems and controls in place.",
    requirements: [
      "Operational resilience & business continuity",
      "Data integrity and audit trails",
      "Cybersecurity risk management",
      "Third-party supplier oversight",
      "Incident reporting within 72 hours",
    ],
    tag: "FCA SYSC / DORA",
  },
  {
    icon: ShieldCheck,
    title: "Cyber Essentials",
    subtitle: "UK Government Scheme",
    desc: "A UK government-backed certification scheme that helps organisations protect against common cyber threats. Required for businesses bidding for government contracts involving sensitive data.",
    requirements: [
      "Firewall & boundary controls",
      "Secure configuration of devices",
      "Access control & privilege management",
      "Malware protection & patching",
      "Annual certification maintenance",
    ],
    tag: "NCSC / Cyber Essentials",
  },
  {
    icon: HeartPulse,
    title: "NHS & Healthcare IT",
    subtitle: "Health & Social Care",
    desc: "Healthcare organisations in the UK must comply with NHS DSP Toolkit and CQC requirements, ensuring patient data is protected and IT systems are resilient enough to support care delivery.",
    requirements: [
      "NHS Data Security & Protection Toolkit",
      "IG (Information Governance) compliance",
      "CQC digital readiness standards",
      "Patient data encryption & access controls",
      "System availability SLAs for clinical tools",
    ],
    tag: "NHS DSP Toolkit / CQC",
  },
  {
    icon: Building2,
    title: "ICO & UK GDPR",
    subtitle: "Data Protection",
    desc: "The UK General Data Protection Regulation (UK GDPR), enforced by the Information Commissioner's Office (ICO), requires all organisations handling personal data to implement appropriate technical and organisational measures.",
    requirements: [
      "Data processing agreements with vendors",
      "Privacy by design implementation",
      "Breach notification within 72 hours",
      "Data retention & deletion policies",
      "Subject Access Request (SAR) workflows",
    ],
    tag: "ICO / UK GDPR",
  },
  {
    icon: ShoppingCart,
    title: "PCI DSS",
    subtitle: "Retail & E-Commerce",
    desc: "Any business that processes, stores, or transmits cardholder data must comply with PCI DSS. Non-compliance can result in significant fines and loss of card processing rights.",
    requirements: [
      "Cardholder data environment segmentation",
      "Encryption of payment data in transit",
      "Vulnerability scanning & penetration testing",
      "Access logging and monitoring",
      "Annual compliance assessment",
    ],
    tag: "PCI DSS v4.0",
  },
  {
    icon: Truck,
    title: "ISO 27001",
    subtitle: "Information Security Management",
    desc: "ISO 27001 is the internationally recognised standard for information security management systems (ISMS). Many UK boards and procurement teams now require this as a baseline supplier requirement.",
    requirements: [
      "Risk assessment & treatment plans",
      "Asset management & classification",
      "Security policies & procedures",
      "Internal audit programme",
      "Continual improvement processes",
    ],
    tag: "ISO/IEC 27001:2022",
  },
];

const boardRequirements = [
  {
    title: "Board-Level Accountability",
    desc: "UK regulators increasingly hold boards personally accountable for IT and cyber failures. We help translate technical compliance into board-ready reporting.",
  },
  {
    title: "Audit-Ready Documentation",
    desc: "We maintain up-to-date policies, risk registers, and evidence packs so you're always prepared for an audit — with zero last-minute scrambling.",
  },
  {
    title: "Gap Analysis & Remediation",
    desc: "We assess your current posture against your required frameworks and deliver a prioritised remediation roadmap with clear timelines.",
  },
  {
    title: "Ongoing Compliance Monitoring",
    desc: "Compliance isn't a one-time tick-box. We continuously monitor your environment and update controls as regulations evolve.",
  },
];

export default function Compliance() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            Compliance & Governance
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight">
            Meet Your Board's <span className="text-gradient">IT Obligations.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From FCA guidelines to UK GDPR and Cyber Essentials — we help UK businesses satisfy regulatory requirements and demonstrate IT compliance to their boards, auditors, and clients.
          </p>
        </div>
      </section>

      {/* Why Compliance Matters */}
      <section className="py-16 px-6 border-y border-border/50 bg-card/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {boardRequirements.map((item) => (
            <div key={item.title} className="flex flex-col gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Frameworks */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">UK Compliance Frameworks We Support</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">We have deep expertise across the regulatory frameworks most relevant to UK businesses.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {frameworks.map((f) => (
            <div key={f.title} className="card-hover rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{f.title}</h3>
                      <p className="text-xs text-muted-foreground">{f.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium flex-shrink-0">{f.tag}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <ul className="flex flex-col gap-1.5">
                  {f.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Warning Banner */}
      <section className="py-14 px-6 border-y border-border/50">
        <div className="max-w-4xl mx-auto rounded-2xl border border-destructive/30 bg-destructive/10 p-8 flex flex-col md:flex-row items-center gap-6">
          <AlertTriangle className="w-10 h-10 text-destructive flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">The Cost of Non-Compliance</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              ICO fines under UK GDPR can reach <strong className="text-foreground">£17.5 million or 4% of global annual turnover</strong>. FCA enforcement action can result in public censure, financial penalties, and personal liability for senior managers. Don't wait for a breach to find out your controls weren't good enough.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Not Sure Where You Stand?</h2>
          <p className="text-muted-foreground mb-8">Book a free compliance assessment and we'll map your current IT posture against the frameworks your board requires.</p>
          <Link
            to={createPageUrl("Contact")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all glow-blue text-base"
          >
            Get a Free Compliance Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}