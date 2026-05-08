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

async function action1Fetch(token, path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Action1 ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return {}; }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { action, orgId, path } = await req.json();

  const token = await getToken();

  if (action === "organizations") {
    const data = await action1Fetch(token, "/organizations");
    return Response.json({ data });
  }

  if (action === "endpoints" && orgId) {
    const data = await action1Fetch(token, `/endpoints/managed/${orgId}?fields=*`);
    return Response.json({ data });
  }

  if (action === "fetch" && path) {
    const data = await action1Fetch(token, path);
    return Response.json({ data });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});