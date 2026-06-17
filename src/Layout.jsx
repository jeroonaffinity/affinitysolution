import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, ChevronLeft, ShieldCheck } from "lucide-react";
import SupportChat from "./components/SupportChat";
import MobileBottomTabs from "./components/MobileBottomTabs";

const navLinks = [
{ label: "Home", page: "Home", title: "Go to the AffinitySolution homepage" },
{ label: "About", page: "About", title: "Learn more about our company and team" },
{ label: "Services", page: "Services", title: "Explore our managed IT service offerings" },
{
  label: "Compliance",
  page: "Compliance",
  title: "View our regulatory and security compliance standards (GDPR, Cyber Essentials)",
  icon: ShieldCheck
},
{ label: "Pricing", page: "Pricing", title: "See our transparent pricing and packages" }];


const dashboardPath = "/dashboard";

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === "/" || location.pathname === "/Home";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-background/95">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center group">
            <img
              src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
              alt="AffinitySolution"
              className="h-10 w-auto" />
            
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) =>
            <Link
              key={link.page}
              to={createPageUrl(link.page)}
              title={link.title}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
              currentPageName === link.page ? "text-primary" : "text-muted-foreground"}`
              }>
              
                
                {link.label}
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to={dashboardPath}
              title="Access the AffinitySolution client portal"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              
              Client Portal
            </Link>
            <Link
              to={createPageUrl("Contact")}
              title="Get in touch for a free consultation"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow-blue">
              
              Contact Us →
            </Link>
          </div>

          {/* Mobile: back button or hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {!isRoot &&
            <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors select-none">
                <ChevronLeft className="w-5 h-5" />
              </button>
            }
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}>
              
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen &&
        <nav className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-3" aria-label="Main Navigation">
            {navLinks.map((link) =>
          <Link
            key={link.page}
            to={createPageUrl(link.page)}
            title={link.title}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
            currentPageName === link.page ? "text-primary" : "text-muted-foreground"}`
            }>
            
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
                {link.badge &&
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary leading-none">
                    {link.badge}
                  </span>
            }
              </Link>
          )}
            <div className="border-t border-border/30 pt-3 mt-1 flex flex-col gap-3">
              <Link
              to={dashboardPath}
              onClick={() => setMobileOpen(false)}
              title="Access the AffinitySolution client portal"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              
                Client Portal
              </Link>
              <Link
              to={createPageUrl("Contact")}
              onClick={() => setMobileOpen(false)}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground text-center">
              
                Contact Us →
              </Link>
            </div>
          </nav>
        }
      </header>

      {/* Page content */}
      <main className="flex-1 pt-[73px] pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      <SupportChat />
      <MobileBottomTabs />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background/95 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <img
                src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
                alt="AffinitySolution"
                className="h-8 w-auto mb-3" />
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your trusted IT &amp; cybersecurity partner for businesses across London and the UK.
              </p>
            </div>

            {/* Services nav group */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Company</h3>
              <ul className="flex flex-col gap-2.5">
                {[
                { label: "About Us", page: "About" },
                { label: "Services", page: "Services" },
                { label: "Pricing", page: "Pricing" },
                { label: "Compliance", page: "Compliance" }].
                map((l) =>
                <li key={l.page}>
                    <Link to={createPageUrl(l.page)} className="text-xs text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Client portal group */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Client Portal</h3>
              <ul className="flex flex-col gap-2.5">
                <li><Link to={dashboardPath} className="text-xs text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Get in Touch</h3>
              <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                <li><a href="mailto:info@affinitysolution.com" className="hover:text-primary transition-colors">info@affinitysolution.com</a></li>
                <li></li>
                <li className="pt-1">
                  <Link to={createPageUrl("Contact")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all">
                    Free Consultation →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} AffinitySolution Ltd. All rights reserved.
            </p>
            <p className="text-muted-foreground/50 text-xs">Registered in England &amp; Wales</p>
          </div>
        </div>
      </footer>
    </div>);

}