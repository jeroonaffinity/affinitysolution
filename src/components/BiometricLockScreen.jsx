import { Fingerprint, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function BiometricLockScreen({ unlocking, error, onUnlock, onSkip }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl">
      <div className="flex flex-col items-center gap-6 px-8 max-w-xs w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          {unlocking
            ? <Loader2 className="w-9 h-9 text-primary animate-spin" />
            : <Fingerprint className="w-9 h-9 text-primary" />
          }
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Portal Locked</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Authenticate to access your IT environment
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 w-full">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={onUnlock}
          disabled={unlocking}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all glow-blue"
        >
          {unlocking
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
            : <><ShieldCheck className="w-4 h-4" /> Unlock with Biometrics</>
          }
        </button>

        <button
          onClick={onSkip}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Use password instead
        </button>
      </div>
    </div>
  );
}