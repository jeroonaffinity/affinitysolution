import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const text = body.text || "Weekly update from AffinitySolution — your trusted IT partner.";

    // Get LinkedIn access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("linkedin");

    // Get the authenticated user's LinkedIn profile ID
    const meRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meRes.ok) {
      const errText = await meRes.text();
      return Response.json({ error: `LinkedIn profile fetch failed: ${errText}` }, { status: 500 });
    }

    const meData = await meRes.json();
    const personUrn = `urn:li:person:${meData.id}`;

    // Create post via UGC Posts API
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      return Response.json({ error: `LinkedIn post failed: ${errText}` }, { status: 500 });
    }

    const postData = await postRes.json();
    return Response.json({ success: true, postId: postData.id, text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});