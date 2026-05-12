import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, query, category, limit = 5, ticket_id } = await req.json();

    // Search KB articles
    if (action === "search") {
      if (!query || query.trim().length === 0) {
        return Response.json({ articles: [] });
      }

      const allArticles = await base44.asServiceRole.entities.KnowledgeBase.filter({
        is_published: true,
      });

      // Score articles based on relevance
      const scored = allArticles.map(article => {
        let score = 0;
        const q = query.toLowerCase();
        const title = article.title.toLowerCase();
        const summary = (article.summary || "").toLowerCase();
        const tags = (article.tags || "").toLowerCase();
        const content = article.content.toLowerCase();

        // Exact title match (highest)
        if (title === q) score += 100;
        // Title contains query
        if (title.includes(q)) score += 50;
        // Summary contains query
        if (summary.includes(q)) score += 30;
        // Tags match
        if (tags.includes(q)) score += 25;
        // Content match (per occurrence)
        const contentMatches = (content.match(new RegExp(q, 'g')) || []).length;
        score += contentMatches * 5;

        // Category bonus if provided
        if (category && article.category === category) score += 15;

        return { ...article, relevance_score: score };
      });

      // Filter, sort, and limit results
      const results = scored
        .filter(a => a.relevance_score > 0)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, limit);

      return Response.json({ articles: results });
    }

    // Get suggestions for a ticket (used during creation)
    if (action === "suggest_for_ticket") {
      if (!ticket_id) return Response.json({ error: "ticket_id required" }, { status: 400 });

      const ticket = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticket_id });
      if (!ticket[0]) return Response.json({ error: "Ticket not found" }, { status: 404 });

      const t = ticket[0];
      // Combine title, description, and category for better search
      const searchQuery = `${t.title} ${t.description || ""} ${t.category || ""}`;

      const allArticles = await base44.asServiceRole.entities.KnowledgeBase.filter({
        is_published: true,
      });

      const scored = allArticles.map(article => {
        let score = 0;
        const words = searchQuery.toLowerCase().split(/\s+/);

        words.forEach(word => {
          if (word.length < 3) return; // Skip short words
          const w = word.toLowerCase();
          if (article.title.toLowerCase().includes(w)) score += 20;
          if ((article.summary || "").toLowerCase().includes(w)) score += 10;
          if ((article.tags || "").toLowerCase().includes(w)) score += 8;
          if (article.content.toLowerCase().includes(w)) score += 3;
        });

        // Category exact match bonus
        if (t.category && article.category === t.category) score += 25;

        return { ...article, relevance_score: score };
      });

      const suggestions = scored
        .filter(a => a.relevance_score > 0)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 3); // Top 3 suggestions

      return Response.json({
        ticket_id,
        suggestions: suggestions.map(s => ({
          id: s.id,
          title: s.title,
          category: s.category,
          summary: s.summary,
          relevance_score: Math.round(s.relevance_score),
        })),
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("KB smart suggest error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});