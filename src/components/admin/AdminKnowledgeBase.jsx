import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Edit2, Loader2, Search, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["hardware", "software", "network", "email", "security", "data", "other"];

export default function AdminKnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "other",
    summary: "",
    content: "",
    tags: "",
    is_published: true,
  });

  const loadArticles = async () => {
    setLoading(true);
    const res = await base44.entities.KnowledgeBase.list();
    setArticles(res || []);
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.content) {
      alert("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await base44.asServiceRole.entities.KnowledgeBase.update(editingId, form);
      } else {
        await base44.entities.KnowledgeBase.create(form);
      }
      loadArticles();
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this article? This cannot be undone.")) {
      await base44.entities.KnowledgeBase.delete(id);
      loadArticles();
    }
  };

  const handleEdit = (article) => {
    setForm(article);
    setEditingId(article.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "other",
      summary: "",
      content: "",
      tags: "",
      is_published: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = articles.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary?.toLowerCase().includes(search.toLowerCase()) ||
      a.tags?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || a.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Self-help articles auto-suggested with AI responses.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Article
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editingId ? "Edit Article" : "New Knowledge Base Article"}</h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., How to Reset Your Password"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Summary (One-line description)</label>
                <input
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Brief summary shown in search results"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tags (Comma-separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g., password, reset, account"
                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Content (Markdown supported) *</label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full article content with steps and instructions..."
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm focus:outline-none resize-none font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  Published (visible to AI suggestions)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.content}
                  className="flex-1"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingId ? "Update Article" : "Create Article"}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-background/60 text-sm focus:outline-none focus:border-primary/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border/40 bg-background text-sm focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Search className="w-8 h-8 text-primary/30" />
          <p className="text-muted-foreground text-sm">{articles.length === 0 ? "No articles yet. Create one to get started." : "No articles match your search."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => (
            <div key={article.id} className="border border-border/40 rounded-2xl p-4 bg-card/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{article.title}</h3>
                    {article.is_published ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  {article.summary && (
                    <p className="text-sm text-muted-foreground mb-2">{article.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {article.category}
                    </span>
                    {article.tags && (
                      <>
                        {article.tags.split(",").map((tag) => (
                          <span key={tag.trim()} className="px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground">
                            {tag.trim()}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}