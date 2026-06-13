import { useState } from "react";
import { CheckCircle2, TicketCheck, Plus } from "lucide-react";
import TicketWizard from "./TicketWizard";

export default function TicketsTab({ userEmail, userName, teamId }) {
  const [showWizard, setShowWizard] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSuccess = () => {
    setShowWizard(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 8000);
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1">Ticket Submitted!</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Our team has been notified and will be in touch shortly. You'll receive a confirmation email.
          </p>
        </div>
        <button
          onClick={() => setSubmitSuccess(false)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Submit Another Ticket
        </button>
      </div>
    );
  }

  if (showWizard) {
    return (
      <TicketWizard
        userEmail={userEmail}
        userName={userName}
        teamId={teamId}
        onSuccess={handleSuccess}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <TicketCheck className="w-8 h-8 text-primary/60" />
      </div>
      <div>
        <h2 className="text-lg font-bold mb-1">Raise a Support Ticket</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Having an IT issue? Submit a ticket and our team will get back to you as quickly as possible.
        </p>
      </div>
      <button
        onClick={() => setShowWizard(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all glow-blue"
      >
        <Plus className="w-4 h-4" /> New Support Ticket
      </button>
    </div>
  );
}