import { base44 } from "@/api/base44Client";
import { ShieldAlert, ArrowLeft, Mail } from "lucide-react";

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center gap-6">
        {/* Logo */}
        <img
          src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
          alt="AffinitySolution"
          className="h-9 w-auto mb-2"
        />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-amber-400" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Access Restricted</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your account isn't registered for this portal yet. Contact AffinitySolution to request access.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <a
            href="mailto:support@affinitysolution.co.uk"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all glow-blue"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </a>
          <button
            onClick={() => base44.auth.logout("/")}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Homepage
          </button>
        </div>

        <p className="text-xs text-muted-foreground/50">
          Already have access? Try{" "}
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="underline hover:text-muted-foreground transition-colors">
            signing in again
          </button>
        </p>
      </div>
    </div>
  );
}