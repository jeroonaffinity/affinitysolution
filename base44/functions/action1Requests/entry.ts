import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE_URL = "https://app.eu.action1.com/api/3.0";

async function getToken() {
  const res = await fetch(`${BASE_URL}/oauth2/token`, {
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

async function action1Fetch(token, path, method = "GET", body = null) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`Action1 ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

// Build a one-shot policy payload targeting specific endpoint IDs
function buildPolicy(name, actionTemplate, endpointIds) {
  return {
    name,
    retry_minutes: "1",
    endpoints: endpointIds.map(id => ({ id, type: "Endpoint" })),
    actions: [actionTemplate],
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const payload = await req.json();
  const { action, orgId, path, controlAction, endpointIds, scriptId, scriptText } = payload;

  const token = await getToken();

  if (action === "organizations") {
    const data = await action1Fetch(token, "/organizations");
    return Response.json({ data });
  }

  if (action === "endpoints" && orgId) {
    const data = await action1Fetch(token, `/endpoints/managed/${orgId}?fields=*`);
    return Response.json({ data });
  }

  if (action === "groups" && orgId) {
    // Fetch all groups
    const groupsData = await action1Fetch(token, `/endpoints/groups/${orgId}`);
    const groups = groupsData?.items || [];

    // Fetch members for each group in parallel
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        try {
          const contentsData = await action1Fetch(token, `/endpoints/groups/${orgId}/${group.id}/contents`);
          return { ...group, endpoints: contentsData?.items || [] };
        } catch {
          return { ...group, endpoints: [] };
        }
      })
    );

    return Response.json({ groups: groupsWithMembers });
  }

  if (action === "fetch" && path) {
    try {
      const data = await action1Fetch(token, path);
      return Response.json({ data });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  }

  // ── ENDPOINT CONTROL ──────────────────────────────────────────────────────
  if (action === "control" && orgId && controlAction && endpointIds?.length) {
    let policyBody;

    if (controlAction === "reboot") {
      policyBody = buildPolicy(
        `Remote Reboot - ${new Date().toISOString()}`,
        {
          name: "Reboot",
          template_id: "reboot",
          params: {
            show_message: "yes",
            message_text: "Your computer will be rebooted remotely by IT. Please save your work.",
            timeout: 60,
            auto_reboot: "yes",
          },
        },
        endpointIds
      );
    } else if (controlAction === "deploy_updates") {
      policyBody = buildPolicy(
        `Deploy Updates - ${new Date().toISOString()}`,
        {
          name: "Deploy Update",
          template_id: "deploy_update",
          params: {
            scope: "All",
            update_approval: "all",
            reboot_options: { auto_reboot: "yes", show_message: "yes", timeout: 240 },
          },
        },
        endpointIds
      );
    } else if (controlAction === "run_script" && (scriptId || scriptText)) {
      const scriptParams = scriptId
        ? { script_id: scriptId }
        : { script_text: scriptText, language: "PowerShell" };

      policyBody = buildPolicy(
        `Run Script - ${new Date().toISOString()}`,
        {
          name: "Run Script",
          template_id: "run_script",
          params: scriptParams,
        },
        endpointIds
      );
    } else {
      return Response.json({ error: "Invalid controlAction or missing params" }, { status: 400 });
    }

    try {
      const data = await action1Fetch(token, `/policies/instances/${orgId}`, "POST", policyBody);
      return Response.json({ success: true, data });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});