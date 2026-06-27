"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, FileText, HelpCircle, BookOpen } from "lucide-react";

const TABS = [
  { id: "blog", label: "Blog Posts", icon: BookOpen },
  { id: "faq", label: "FAQs", icon: HelpCircle },
  { id: "pages", label: "Terms & Privacy", icon: FileText },
];

const PAGE_KEYS = [
  { key: "terms", label: "Terms & Conditions" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "about", label: "About Us" },
  { key: "contact", label: "Contact Info" },
];

export default function AdminContentPage() {
  const [tab, setTab] = useState("blog");
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [pageContent, setPageContent] = useState({ title: "", content: "" });
  const [selectedPageKey, setSelectedPageKey] = useState("terms");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // {type: 'blog'|'faq', data}
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchBlogs = useCallback(async () => {
    const res = await api.get("/content/blogs", "admin");
    if (res.success) setBlogs(res.data);
  }, []);

  const fetchFAQs = useCallback(async () => {
    const res = await api.get("/content/faqs", "admin");
    if (res.success) setFaqs(res.data);
  }, []);

  const fetchPage = useCallback(async (key) => {
    setLoading(true);
    const res = await api.get(`/content/pages/${key}`, "admin");
    if (res.success) setPageContent({ title: res.data.title, content: res.data.content });
    else setPageContent({ title: "", content: "" });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "blog") fetchBlogs();
    if (tab === "faq") fetchFAQs();
    if (tab === "pages") fetchPage(selectedPageKey);
  }, [tab, selectedPageKey, fetchBlogs, fetchFAQs, fetchPage]);

  // ── BLOG ──
  const openBlog = (data = null) => {
    setForm(data ? { ...data } : { title: "", content: "", excerpt: "", category: "General", tags: "", isPublished: false });
    setModal({ type: "blog", id: data?._id || null });
  };

  const saveBlog = async () => {
    if (!form.title || !form.content) { toast.error("Title and content required"); return; }
    setSaving(true);
    const payload = { ...form, tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [] };
    const res = modal.id
      ? await api.put(`/content/blogs/${modal.id}`, payload, "admin")
      : await api.post("/content/blogs", payload, "admin");
    if (res.success) { toast.success("Saved!"); setModal(null); fetchBlogs(); }
    else toast.error(res.message);
    setSaving(false);
  };

  const deleteBlog = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    const res = await api.del(`/content/blogs/${id}`, "admin");
    if (res.success) { toast.success("Deleted"); fetchBlogs(); } else toast.error("Failed");
  };

  // ── FAQ ──
  const openFAQ = (data = null) => {
    setForm(data ? { ...data } : { question: "", answer: "", category: "General", order: 0, isActive: true });
    setModal({ type: "faq", id: data?._id || null });
  };

  const saveFAQ = async () => {
    if (!form.question || !form.answer) { toast.error("Question and answer required"); return; }
    setSaving(true);
    const res = modal.id
      ? await api.put(`/content/faqs/${modal.id}`, form, "admin")
      : await api.post("/content/faqs", form, "admin");
    if (res.success) { toast.success("Saved!"); setModal(null); fetchFAQs(); }
    else toast.error(res.message);
    setSaving(false);
  };

  const deleteFAQ = async (id) => {
    if (!confirm("Delete this FAQ?")) return;
    const res = await api.del(`/content/faqs/${id}`, "admin");
    if (res.success) { toast.success("Deleted"); fetchFAQs(); } else toast.error("Failed");
  };

  // ── PAGES ──
  const savePage = async () => {
    if (!pageContent.title || !pageContent.content) { toast.error("Title and content required"); return; }
    setSaving(true);
    const res = await api.put(`/content/pages/${selectedPageKey}`, pageContent, "admin");
    if (res.success) toast.success("Page saved!");
    else toast.error(res.message);
    setSaving(false);
  };

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-playfair text-3xl font-bold text-[#2D2424] mb-6">Content Management</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#F2E9DE]">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition ${tab === t.id ? "border-[#E3B450] text-[#2D2424]" : "border-transparent text-stone-400 hover:text-stone-600"}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* BLOG TAB */}
        {tab === "blog" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => openBlog()} data-testid="add-blog-btn" className="flex items-center gap-2 bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
                <Plus size={15} /> New Post
              </button>
            </div>
            {blogs.length === 0 ? (
              <div className="text-center py-16 text-stone-400">No blog posts yet. Create your first post.</div>
            ) : (
              <div className="space-y-3">
                {blogs.map((b) => (
                  <div key={b._id} className="bg-white rounded-2xl border border-[#F2E9DE] p-5 flex items-start justify-between shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.isPublished ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>{b.isPublished ? "Published" : "Draft"}</span>
                        <span className="text-xs text-stone-400">{b.category}</span>
                      </div>
                      <h3 className="font-bold text-[#2D2424] text-sm truncate">{b.title}</h3>
                      <p className="text-xs text-stone-400 mt-0.5">{b.viewCount} views · {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => openBlog(b)} className="p-2 rounded-xl border border-[#F2E9DE] text-[#8B6914] hover:bg-[#FBF6ED] transition"><Pencil size={13} /></button>
                      <button onClick={() => deleteBlog(b._id)} className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ TAB */}
        {tab === "faq" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => openFAQ()} data-testid="add-faq-btn" className="flex items-center gap-2 bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition">
                <Plus size={15} /> New FAQ
              </button>
            </div>
            {faqs.length === 0 ? (
              <div className="text-center py-16 text-stone-400">No FAQs yet.</div>
            ) : (
              <div className="space-y-3">
                {faqs.map((f) => (
                  <div key={f._id} className="bg-white rounded-2xl border border-[#F2E9DE] p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>{f.isActive ? "Active" : "Hidden"}</span>
                          <span className="text-xs text-stone-400">{f.category}</span>
                        </div>
                        <p className="font-bold text-[#2D2424] text-sm">{f.question}</p>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">{f.answer}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => openFAQ(f)} className="p-2 rounded-xl border border-[#F2E9DE] text-[#8B6914] hover:bg-[#FBF6ED] transition"><Pencil size={13} /></button>
                        <button onClick={() => deleteFAQ(f._id)} className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAGES TAB */}
        {tab === "pages" && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {PAGE_KEYS.map((p) => (
                <button key={p.key} onClick={() => setSelectedPageKey(p.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${selectedPageKey === p.key ? "bg-[#2D2424] text-white border-[#2D2424]" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                  {p.label}
                </button>
              ))}
            </div>
            {loading ? <div className="text-center py-10 text-stone-400">Loading...</div> : (
              <div className="bg-white rounded-2xl border border-[#F2E9DE] p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Page Title</label>
                    <input value={pageContent.title} onChange={(e) => setPageContent((p) => ({ ...p, title: e.target.value }))}
                      placeholder={`${PAGE_KEYS.find(p => p.key === selectedPageKey)?.label} title`}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Content (HTML or Markdown)</label>
                    <textarea value={pageContent.content} onChange={(e) => setPageContent((p) => ({ ...p, content: e.target.value }))}
                      rows={16} placeholder="Enter page content..."
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none font-mono" />
                  </div>
                  <button onClick={savePage} disabled={saving} data-testid="save-page-btn"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                    {saving ? "Saving..." : "Save Page"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blog Modal */}
      {modal?.type === "blog" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#F2E9DE]">
              <h2 className="font-playfair text-xl font-bold text-[#2D2424]">{modal.id ? "Edit Post" : "New Blog Post"}</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Post title *" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="Category" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                <input value={form.tags || ""} onChange={(e) => set("tags", e.target.value)} placeholder="Tags (comma separated)" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              </div>
              <input value={form.excerpt || ""} onChange={(e) => set("excerpt", e.target.value)} placeholder="Short excerpt" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              <textarea value={form.content || ""} onChange={(e) => set("content", e.target.value)} rows={10} placeholder="Full content *" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none" />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="accent-[#E3B450] w-4 h-4" />
                <span className="text-sm text-stone-600">Publish immediately</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#F2E9DE]">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition">Cancel</button>
              <button onClick={saveBlog} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {modal?.type === "faq" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#F2E9DE]">
              <h2 className="font-playfair text-xl font-bold text-[#2D2424]">{modal.id ? "Edit FAQ" : "New FAQ"}</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-stone-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input value={form.question || ""} onChange={(e) => set("question", e.target.value)} placeholder="Question *" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              <textarea value={form.answer || ""} onChange={(e) => set("answer", e.target.value)} rows={4} placeholder="Answer *" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <input value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="Category" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
                <input type="number" value={form.order ?? 0} onChange={(e) => set("order", parseInt(e.target.value))} placeholder="Sort order" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="accent-[#E3B450] w-4 h-4" />
                <span className="text-sm text-stone-600">Visible to users</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#F2E9DE]">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition">Cancel</button>
              <button onClick={saveFAQ} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
