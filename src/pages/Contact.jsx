import { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, Send } from "lucide-react";

const contactInfo = [
  { icon: Phone, label: "Phone", value: "+44 7947 992054" },
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
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
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

          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/10">
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

        {/* Contact Buttons */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-8 flex flex-col justify-center gap-6">
          <h3 className="text-xl font-bold mb-2">Get in Touch</h3>
          <a
            href="mailto:info@affinitysolution.com"
            className="flex items-center justify-center gap-3 w-full py-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-blue text-lg"
          >
            <Mail className="w-6 h-6" />
            Email Us
          </a>
          <a
            href="https://wa.me/443338808496"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-5 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#1ebe5d] transition-all text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}