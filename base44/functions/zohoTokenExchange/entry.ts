import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const { code, redirect_uri } = await req.json();

  const body = new URLSearchParams({
    code,
    client_id: "1000.IV4T37FGQ9KIGGHR52I5S1UUGEZ6TD",
    client_secret: "d5f8654adf6d2ec14f5a3a8624e3033e5b8e4c8b41",
    redirect_uri: redirect_uri || "https://affinitysolution.base44.app/zoho-callback",
    grant_type: "authorization_code",
  });

  const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  return Response.json(data);
});