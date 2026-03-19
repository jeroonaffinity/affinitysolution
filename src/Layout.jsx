import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Phone } from "lucide-react";
import SupportChat from "./components/SupportChat";

const navLinks = [
  { label: "Home", page: "Home" },
  { label: "Services", page: "Services" },
  { label: "Compliance", page: "Compliance" },
  { label: "Pricing", page: "Pricing" },
  { label: "Contact", page: "Contact" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/95">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center group">
            <img
              src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/dc140f6fd_AbstractTechnologyProfileLinkedInBanner2.png"
              alt="AffinitySolution"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentPageName === link.page ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:03338808496"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Phone className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="hidden lg:inline text-sm font-bold tracking-wide text-foreground group-hover:text-primary transition-colors">0333 880 8496</span>
            </a>
            <Link
              to={createPageUrl("Contact")}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow-blue"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentPageName === link.page ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={createPageUrl("Contact")}
              onClick={() => setMobileOpen(false)}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground text-center mt-2"
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 pt-[73px]">
        {children}
      </main>

      <SupportChat />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/95 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img
              src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/dc140f6fd_AbstractTechnologyProfileLinkedInBanner2.png"
              alt="AffinitySolution"
              className="h-7 w-auto"
            />
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AffinitySolution. All rights reserved.
          </p>
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}