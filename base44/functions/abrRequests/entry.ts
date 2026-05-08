import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ABR_BASE = "https://dc3api.adminbyrequest.com";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = Deno.env.get("abr_key");
  if (!apiKey) {
    return Response.json({ error: "ABR API key not configured" }, { status: 500 });
  }

  const { action, requestId, status } = await req.json();

  // List requests (optionally filtered by status)
  if (action === "list") {
    const url = status
      ? `${ABR_BASE}/requests?status=${status}`
      : `${ABR_BASE}/requests`;

    const res = await fetch(url, { headers: { apikey: apiKey } });
    const rawText = await res.text();
    console.log(`ABR list [${res.status}] ${url}: ${rawText.slice(0, 300)}`);

    if (!res.ok) {
      return Response.json({ error: `ABR error ${res.status}: ${rawText}` }, { status: 502 });
    }

    let data;
    try { data = JSON.parse(rawText); } catch { data = []; }
    return Response.json({ requests: Array.isArray(data) ? data : [] });
  }

  // Approve — PUT
  if (action === "approve" && requestId) {
    const res = await fetch(`${ABR_BASE}/requests/${requestId}`, {
      method: "PUT",
      headers: { apikey: apiKey },
    });
    const rawText = await res.text();
    console.log(`ABR approve id=${requestId} [${res.status}]: ${rawText}`);
    if (!res.ok) return Response.json({ error: `ABR error ${res.status}: ${rawText}` }, { status: res.status });
    return Response.json({ success: true });
  }

  // Deny — DELETE
  if (action === "deny" && requestId) {
    const res = await fetch(`${ABR_BASE}/requests/${requestId}`, {
      method: "DELETE",
      headers: { apikey: apiKey },
    });
    const rawText = await res.text();
    console.log(`ABR deny id=${requestId} [${res.status}]: ${rawText}`);
    if (!res.ok) return Response.json({ error: `ABR error ${res.status}: ${rawText}` }, { status: res.status });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});