import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Sun, Moon } from "lucide-react";
import SupportChat from "./components/SupportChat";
import { useTheme } from "@/lib/ThemeContext";

const LIGHT_LOGO = "https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/39556fe0a_AbstractTechnologyProfileLinkedInBanner9.png";
const DARK_LOGO  = "https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/dc140f6fd_AbstractTechnologyProfileLinkedInBanner2.png";

const navLinks = [
  { label: "Home",       page: "Home"       },
  { label: "About",      page: "About"      },
  { label: "Services",   page: "Services"   },
  { label: "Compliance", page: "Compliance" },
  { label: "Pricing",    page: "Pricing"    },
  { label: "Contact",    page: "Contact"    },
];

const dashboardPath = "/dashboard";

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle } = useTheme();

  const logo = dark ? DARK_LOGO : LIGHT_LOGO;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center">
            <img
              src={logo}
              alt="AffinitySolution"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentPageName === link.page
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-foreground/60 hover:text-foreground hover:border-primary/40 transition-all"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to={dashboardPath}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Client Portal
            </Link>
            <Link
              to={createPageUrl("Contact")}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-all glow-blue"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-foreground/60 hover:text-foreground transition-all"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="text-foreground/60 hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentPageName === link.page ? "text-primary" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={createPageUrl("Contact")}
              onClick={() => setMobileOpen(false)}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-white text-center mt-1"
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 pt-[61px]">
        {children}
      </main>

      <SupportChat />

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img
              src={logo}
              alt="AffinitySolution"
              className="h-7 w-auto"
            />
          </div>
          <p className="text-foreground/50 text-sm">
            © {new Date().getFullYear()} AffinitySolution. All rights reserved.
          </p>
          <div className="flex gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className="text-xs text-foreground/50 hover:text-primary transition-colors"
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