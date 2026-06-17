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
    const targetCompany = body.company || "AffinitySolution";

    // Get LinkedIn access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("linkedin");

    // Find organizations the user is an admin of
    const orgsRes = await fetch(
      "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!orgsRes.ok) {
      const errText = await orgsRes.text();
      return Response.json({ error: `Organization lookup failed: ${errText}` }, { status: 500 });
    }

    const orgsData = await orgsRes.json();
    const elements = orgsData.elements || [];

    if (elements.length === 0) {
      return Response.json({ error: "No LinkedIn company pages found for your account." }, { status: 400 });
    }

    // Get each organization's details to find the target
    let targetOrgUrn = null;
    for (const element of elements) {
      const orgUrn = element.organization;
      const orgId = orgUrn.split(":").pop();

      const detailRes = await fetch(`https://api.linkedin.com/v2/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (detailRes.ok) {
        const detail = await detailRes.json();
        const name = detail.localizedName || detail.name || "";
        if (name.toLowerCase().includes(targetCompany.toLowerCase())) {
          targetOrgUrn = orgUrn;
          break;
        }
      }
    }

    if (!targetOrgUrn) {
      // Fallback: use the first organization found
      targetOrgUrn = elements[0].organization;
    }

    // Create post as the organization
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: targetOrgUrn,
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
    return Response.json({
      success: true,
      postId: postData.id,
      author: targetOrgUrn,
      text,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});