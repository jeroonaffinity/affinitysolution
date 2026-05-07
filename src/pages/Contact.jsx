import { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react";
import CallbackForm from "@/components/CallbackForm";

const contactInfo = [

  { icon: Mail, label: "Email", value: "info@affinitysolution.com" },
  { icon: MapPin, label: "Location", value: "London, United Kingdom" },
  { icon: Clock, label: "Hours", value: "24/7 emergency support" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", employees: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-white border-b border-border">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight">
            Let's <span className="text-gradient">Talk IT.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Get a free 30-minute IT assessment. No sales pressure — just honest advice about your environment.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Whether you're ready to switch providers or just exploring options, our team is here to help — no commitment required.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card/50">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 className="font-bold mb-2 text-primary">Free IT Assessment Includes:</h3>
            <ul className="flex flex-col gap-2">
              {[
                "Security risk identification",
                "Infrastructure health check",
                "Backup & recovery review",
                "Cost optimization opportunities",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Callback Form */}
        <CallbackForm />
      </section>
    </div>
  );
}