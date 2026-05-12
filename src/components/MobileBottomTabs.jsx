import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Mail } from "lucide-react";
import { createPageUrl } from "@/utils";

const tabs = [
  { label: "Home",      icon: Home,            to: createPageUrl("Home")    },
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard"             },
  { label: "Contact",   icon: Mail,            to: createPageUrl("Contact") },
];

export default function MobileBottomTabs() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 backdrop-blur-xl flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(({ label, icon: Icon, to }) => {
        const active = pathname === to || (to !== "/" && pathname.startsWith(to));
        return (
          <Link key={label} to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-medium transition-colors select-none ${
              active ? "text-primary" : "text-muted-foreground"
            }`}>
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}