import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ABR_BASE = "https://dc1api.adminbyrequest.com";

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

  // GET pending (or all with optional status filter)
  if (action === "list") {
    const queryStatus = status || "pending";
    const res = await fetch(`${ABR_BASE}/requests?status=${queryStatus}`, {
      headers: { apikey: apiKey },
    });
    const data = await res.json();
    return Response.json({ requests: Array.isArray(data) ? data : [] });
  }

  // PUT approve or deny
  if (action === "update" && requestId) {
    const newStatus = status === "Approved" ? "Approved" : "Denied";
    const res = await fetch(`${ABR_BASE}/requests/${requestId}`, {
      method: "PUT",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: res.status });
    }
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
});