import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Plus, Minus, CheckCircle2 } from "lucide-react";

const userServices = [
  { id: "support", name: "Helpdesk Support", desc: "Unlimited remote & on-site support", price: 20 },
  { id: "o365", name: "Microsoft 365 Apps", desc: "Word, Excel, PowerPoint, Outlook & more", price: 10 },
  { id: "email", name: "Email Management", desc: "Mailbox setup, admin & monitoring", price: 12 },
  { id: "cloudsync", name: "Cloud File Sync & Share", desc: "Secure cloud storage management", price: 5 },
  { id: "training", name: "Security Awareness Training", desc: "Phishing simulations & staff training", price: 5 },
];

const endpointServices = [
  { id: "rmm", name: "Endpoint Monitoring + Antivirus", desc: "24/7 device monitoring & AV protection", price: 22 },
  { id: "assessment", name: "Endpoint Security Assessment", desc: "Regular vulnerability checks", price: 5 },
  { id: "threat", name: "Threat Detection & Remediation", desc: "Active threat hunting & fixing", price: 8 },
];

const domainServices = [
  { id: "domain", name: "Domain Management", desc: "DNS & renewal monitoring", price: 10 },
  { id: "website", name: "Website Monitoring", desc: "Uptime monitoring & basic support", price: 20 },
];

function Counter({ value, onChange, min = 1, max = 500 }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-lg border border-border/60 bg-card flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-xl font-bold w-10 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-lg border border-border/60 bg-card flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ServiceToggle({ service, checked, onToggle }) {
  return (
    <button
      onClick={() => onToggle(service.id)}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        checked
          ? "border-primary/60 bg-primary/10"
          : "border-border/50 bg-card/40 hover:border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${checked ? "bg-primary border-primary" : "border-border/60"}`}>
              {checked && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className="text-sm font-medium">{service.name}</span>
          </div>
          <p className="text-xs text-muted-foreground ml-6">{service.desc}</p>
        </div>
        <span className="text-sm font-bold text-gradient flex-shrink-0">£{service.price}</span>
      </div>
    </button>
  );
}

export default function PricingCalculator() {
  const [users, setUsers] = useState(5);
  const [endpoints, setEndpoints] = useState(5);
  const [domains, setDomains] = useState(1);
  const [selectedUser, setSelectedUser] = useState(new Set(["support"]));
  const [selectedEndpoint, setSelectedEndpoint] = useState(new Set(["rmm"]));
  const [selectedDomain, setSelectedDomain] = useState(new Set());

  const toggle = (setter, id) => {
    setter((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const userTotal = userServices
    .filter((s) => selectedUser.has(s.id))
    .reduce((sum, s) => sum + s.price, 0) * users;

  const endpointTotal = endpointServices
    .filter((s) => selectedEndpoint.has(s.id))
    .reduce((sum, s) => sum + s.price, 0) * endpoints;

  const domainTotal = domainServices
    .filter((s) => selectedDomain.has(s.id))
    .reduce((sum, s) => sum + s.price, 0) * domains;

  const monthlyTotal = userTotal + endpointTotal + domainTotal;
  const onboardingTotal = users * 80;

  const breakdown = [
    userTotal > 0 && { label: `User services (${users} users)`, value: userTotal },
    endpointTotal > 0 && { label: `Endpoint services (${endpoints} devices)`, value: endpointTotal },
    domainTotal > 0 && { label: `Domain/website services (${domains} domains)`, value: domainTotal },
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-primary/30 bg-card/60 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/50 bg-primary/10">
        <h3 className="text-xl font-bold mb-1">💡 Build Your Own Package</h3>
        <p className="text-sm text-muted-foreground">Toggle the services you need and adjust your team size to get an instant monthly estimate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
        {/* Left — Inputs */}
        <div className="p-6 flex flex-col gap-8">

          {/* Users */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm">Number of Staff</h4>
                <p className="text-xs text-muted-foreground">How many people in your team?</p>
              </div>
              <Counter value={users} onChange={setUsers} />
            </div>
            <div className="flex flex-col gap-2">
              {userServices.map((s) => (
                <ServiceToggle key={s.id} service={{ ...s, price: s.price }} checked={selectedUser.has(s.id)} onToggle={(id) => toggle(setSelectedUser, id)} />
              ))}
            </div>
          </div>

          {/* Endpoints */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm">Number of Devices</h4>
                <p className="text-xs text-muted-foreground">Laptops, desktops, servers</p>
              </div>
              <Counter value={endpoints} onChange={setEndpoints} />
            </div>
            <div className="flex flex-col gap-2">
              {endpointServices.map((s) => (
                <ServiceToggle key={s.id} service={s} checked={selectedEndpoint.has(s.id)} onToggle={(id) => toggle(setSelectedEndpoint, id)} />
              ))}
            </div>
          </div>

          {/* Domains */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm">Domains / Websites</h4>
                <p className="text-xs text-muted-foreground">How many websites do you have?</p>
              </div>
              <Counter value={domains} onChange={setDomains} min={0} />
            </div>
            <div className="flex flex-col gap-2">
              {domainServices.map((s) => (
                <ServiceToggle key={s.id} service={s} checked={selectedDomain.has(s.id)} onToggle={(id) => toggle(setSelectedDomain, id)} />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Summary */}
        <div className="p-6 flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <div>
            <h4 className="font-bold text-lg mb-4">Your Estimate</h4>

            {breakdown.length === 0 ? (
              <p className="text-muted-foreground text-sm">Select at least one service to see your estimate.</p>
            ) : (
              <div className="flex flex-col gap-3 mb-6">
                {breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold">£{row.value.toLocaleString()}/mo</span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 flex flex-col gap-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Monthly Total</div>
              <div className="text-4xl font-extrabold text-gradient">
                £{monthlyTotal.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground"> / mo</span>
              </div>
              {monthlyTotal > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  + One-time onboarding: £{onboardingTotal.toLocaleString()} (£80 per user)
                </div>
              )}
            </div>
          </div>

          {breakdown.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card/40 p-4 flex flex-col gap-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What's included:</div>
              {[...selectedUser].map((id) => {
                const s = userServices.find((x) => x.id === id);
                return s ? <div key={id} className="flex items-center gap-2 text-xs text-foreground/80"><CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />{s.name}</div> : null;
              })}
              {[...selectedEndpoint].map((id) => {
                const s = endpointServices.find((x) => x.id === id);
                return s ? <div key={id} className="flex items-center gap-2 text-xs text-foreground/80"><CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />{s.name}</div> : null;
              })}
              {[...selectedDomain].map((id) => {
                const s = domainServices.find((x) => x.id === id);
                return s ? <div key={id} className="flex items-center gap-2 text-xs text-foreground/80"><CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />{s.name}</div> : null;
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            This is an estimate based on your selections. Final pricing may vary — get in touch for a tailored quote with no obligation.
          </p>

          <Link
            to={createPageUrl("Contact")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all glow-blue text-sm"
          >
            Get a Formal Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}