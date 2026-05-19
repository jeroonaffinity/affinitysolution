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

// Fetch all endpoints in a team's Action1 group to get computer names for filtering
async function getTeamEndpointNames(base44, orgId, groupId) {
  if (!orgId || !groupId) return null;
  try {
    const res = await base44.asServiceRole.functions.invoke("action1Requests", {
      action: "fetch",
      path: `/endpoints/groups/${orgId}/${groupId}/contents`,
    });
    const items = res?.data?.items || [];
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

    // If team has Action1 configured, filter requests to only those from team endpoints
    if (team?.action1_org_id && team?.action1_group_id) {
      const endpointNames = await getTeamEndpointNames(base44, team.action1_org_id, team.action1_group_id);
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