import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DC_BASE = {
  dc1: "https://dc1api.adminbyrequest.com",
  dc2: "https://dc2api.adminbyrequest.com",
  dc3: "https://dc3api.adminbyrequest.com",
};

async function fetchABR(apiKey, dc = "dc3", path = "/requests") {
  const base = DC_BASE[dc] || DC_BASE.dc3;
  const res = await fetch(`${base}${path}`, { headers: { apikey: apiKey } });
  const text = await res.text();
  if (!res.ok) throw new Error(`ABR ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return []; }
}

async function actionABR(apiKey, dc = "dc3", method, requestId) {
  const base = DC_BASE[dc] || DC_BASE.dc3;
  const res = await fetch(`${base}/requests/${requestId}`, {
    method,
    headers: { apikey: apiKey },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`ABR ${res.status}: ${text}`);
  return true;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { action, requestId, status, clientEmail, apiKey: payloadKey, dc: payloadDc } = await req.json();

  const isAdmin = user.role === "admin";

  // ── LIST ──────────────────────────────────────────────────────────────────
  if (action === "list") {
    if (isAdmin && !clientEmail) {
      // Merged view: fetch all client keys + the master key
      const clientKeys = await base44.asServiceRole.entities.ClientABRKey.list();
      const masterKey = Deno.env.get("abr_key");

      const sources = [...clientKeys];

      // Add master key as a special "All / Unassigned" source if set
      if (masterKey) {
        sources.unshift({ abr_api_key: masterKey, label: "Master Account", client_email: null, abr_datacenter: "dc3" });
      }

      const results = await Promise.allSettled(
        sources.map(async (src) => {
          const url = status ? `/requests?status=${status}` : "/requests";
          const data = await fetchABR(src.abr_api_key, src.abr_datacenter || "dc3", url);
          const list = Array.isArray(data) ? data : [];
          return list.map(r => ({
            ...r,
            _source_label: src.label || src.client_email || "Master Account",
            _source_email: src.client_email,
          }));
        })
      );

      const merged = results
        .filter(r => r.status === "fulfilled")
        .flatMap(r => r.value);

      return Response.json({ requests: merged });
    }

    // Fetch for a specific client (admin viewing one client, or the client themselves)
    let keyRecord = null;
    if (isAdmin && clientEmail) {
      const records = await base44.asServiceRole.entities.ClientABRKey.filter({ client_email: clientEmail });
      keyRecord = records[0];
    } else {
      // Client fetching their own
      const records = await base44.entities.ClientABRKey.filter({ client_email: user.email });
      keyRecord = records[0];
    }

    if (!keyRecord) return Response.json({ requests: [], error: "No ABR key assigned" });

    const url = status ? `/requests?status=${status}` : "/requests";
    const data = await fetchABR(keyRecord.abr_api_key, keyRecord.abr_datacenter || "dc3", url);
    return Response.json({ requests: Array.isArray(data) ? data : [] });
  }

  // ── APPROVE / DENY ────────────────────────────────────────────────────────
  if ((action === "approve" || action === "deny") && requestId) {
    if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

    // Must supply apiKey + dc when actioning from merged view
    const key = payloadKey;
    const dc = payloadDc || "dc3";

    if (!key) return Response.json({ error: "No API key provided for action" }, { status: 400 });

    const method = action === "approve" ? "PUT" : "DELETE";
    await actionABR(key, dc, method, requestId);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});