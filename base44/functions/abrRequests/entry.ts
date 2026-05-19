import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DC_BASE = {
  dc1: "https://dc1api.adminbyrequest.com",
  dc2: "https://dc2api.adminbyrequest.com",
  dc3: "https://dc3api.adminbyrequest.com",
};

const ACTION1_BASE = "https://app.eu.action1.com/api/3.0";

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

async function getAction1Token() {
  const res = await fetch(`${ACTION1_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("ACTION1_CLIENT_ID"),
      client_secret: Deno.env.get("ACTION1_CLIENT_SECRET"),
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get Action1 token");
  return data.access_token;
}

// Fetch endpoint names from Action1 group directly (no cross-function call)
async function getTeamEndpointNames(orgId, groupId) {
  if (!orgId || !groupId) return null;
  try {
    const token = await getAction1Token();
    const res = await fetch(
      `${ACTION1_BASE}/endpoints/managed/${orgId}?endpoint_group_id=${groupId}&fields=name`,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.items || [];
    return new Set(items.map(e => (e.name || "").toLowerCase().trim()));
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { action, requestId, status, clientEmail, apiKey: payloadKey, dc: payloadDc } = await req.json();

  const isAdmin = user.role === "admin";

  // ── LIST ──────────────────────────────────────────────────────────────────
  if (action === "list") {

    // ── ADMIN: merged view across all teams ──────────────────────────────────
    if (isAdmin && !clientEmail) {
      const teams = await base44.asServiceRole.entities.Team.list();
      const masterKey = Deno.env.get("abr_key");

      const sources = teams
        .filter(t => t.abr_api_key)
        .map(t => ({ abr_api_key: t.abr_api_key, abr_datacenter: t.abr_datacenter || "dc3", label: t.name }));

      if (masterKey) {
        sources.unshift({ abr_api_key: masterKey, label: "Master Account", abr_datacenter: "dc3" });
      }

      const results = await Promise.allSettled(
        sources.map(async (src) => {
          const url = status ? `/requests?status=${status}` : "/requests";
          const data = await fetchABR(src.abr_api_key, src.abr_datacenter || "dc3", url);
          const list = Array.isArray(data) ? data : [];
          return list.map(r => ({
            ...r,
            _source_label: src.label,
            _api_key: src.abr_api_key,
            _dc: src.abr_datacenter || "dc3",
          }));
        })
      );

      const merged = results
        .filter(r => r.status === "fulfilled")
        .flatMap(r => r.value);

      return Response.json({ requests: merged });
    }

    // ── ADMIN: viewing a specific client ─────────────────────────────────────
    if (isAdmin && clientEmail) {
      const allTeams = await base44.asServiceRole.entities.Team.list();
      const team = allTeams.find(t => t.member_emails?.includes(clientEmail));
      if (!team?.abr_api_key) return Response.json({ requests: [], error: "No ABR key assigned" });
      const url = status ? `/requests?status=${status}` : "/requests";
      const data = await fetchABR(team.abr_api_key, team.abr_datacenter || "dc3", url);
      return Response.json({ requests: Array.isArray(data) ? data : [] });
    }

    // ── CLIENT: fetch own team's ABR requests, filtered by their endpoints ────
    const allTeams = await base44.entities.Team.list();
    const team = allTeams.find(t => t.member_emails?.includes(user.email));

    // Use master key if team has no dedicated ABR key
    const abrKey = team?.abr_api_key || Deno.env.get("abr_key");
    const abrDc = team?.abr_datacenter || "dc3";

    if (!abrKey) return Response.json({ requests: [], error: "No ABR key assigned" });

    const url = status ? `/requests?status=${status}` : "/requests";
    const data = await fetchABR(abrKey, abrDc, url);
    const allRequests = Array.isArray(data) ? data : [];

    // If team has Action1 configured, filter ABR requests to only those from team's endpoints
    if (team?.action1_org_id && team?.action1_group_id) {
      const endpointNames = await getTeamEndpointNames(team.action1_org_id, team.action1_group_id);
      if (endpointNames && endpointNames.size > 0) {
        const filtered = allRequests.filter(r => {
          const computerName = (r.computer?.name || "").toLowerCase().trim();
          return computerName && endpointNames.has(computerName);
        });
        return Response.json({ requests: filtered });
      }
    }

    return Response.json({ requests: allRequests });
  }

  // ── APPROVE / DENY ────────────────────────────────────────────────────────
  if ((action === "approve" || action === "deny") && requestId) {
    if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

    const key = payloadKey;
    const dc = payloadDc || "dc3";
    if (!key) return Response.json({ error: "No API key provided for action" }, { status: 400 });

    const method = action === "approve" ? "PUT" : "DELETE";
    await actionABR(key, dc, method, requestId);
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});