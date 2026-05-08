import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ZohoCallback() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  // Auto-detect code from URL if redirected here
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");
    if (urlCode) setCode(urlCode);
  }, []);

  const exchange = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await base44.functions.invoke("zohoTokenExchange", { code, redirect_uri: "https://affinitysolution.base44.app/zoho-callback" });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-8 flex flex-col gap-6">
        <h1 className="text-xl font-bold">Zoho OAuth Helper</h1>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            First, <a
              href={`https://accounts.zoho.eu/oauth/v2/auth?scope=Desk.tickets.ALL,Desk.contacts.READ&client_id=1000.IV4T37FGQ9KIGGHR52I5S1UUGEZ6TD&response_type=code&redirect_uri=https://affinitysolution.base44.app/zoho-callback&access_type=offline`}
              className="text-primary underline"
              target="_self"
            >
              click here to authorise with Zoho
            </a>. You'll be redirected back here with the code filled in automatically.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Code (auto-filled after redirect)</label>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Paste code here if not auto-filled..."
            className="px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm font-mono focus:outline-none focus:border-primary/60"
          />
        </div>

        <button
          onClick={exchange}
          disabled={!code || loading}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Exchanging..." : "Get Refresh Token"}
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-3">
            {result.refresh_token ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-emerald-400 font-semibold text-sm mb-2">✅ Success! Copy your refresh token:</div>
                <div className="font-mono text-xs break-all bg-background/60 p-3 rounded-lg border border-border/40">
                  {result.refresh_token}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="text-red-400 font-semibold text-sm mb-2">Error response:</div>
                <pre className="text-xs font-mono text-red-300 break-all whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}