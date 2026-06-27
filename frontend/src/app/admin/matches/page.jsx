"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Edit2, Trash2, Heart, X } from "lucide-react";

export default function MatchesPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ brideProfileId: "", groomProfileId: "", matchDate: "", status: "confirmed", notes: "" });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) { router.push("/adminlogin"); return; }
    setToken(t);
  }, [router]);

  const fetchMatches = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/matches?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setMatches(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, page, search]);

  useEffect(() => {
    const handler = setTimeout(() => fetchMatches(), 300);
    return () => clearTimeout(handler);
  }, [fetchMatches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/matches/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/matches`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setShowAddModal(false);
        setEditingId(null);
        setForm({ brideProfileId: "", groomProfileId: "", matchDate: "", status: "confirmed", notes: "" });
        fetchMatches();
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this match?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/matches/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    fetchMatches();
  };

  const openEdit = (match) => {
    setEditingId(match._id);
    setForm({
      brideProfileId: match.brideProfileId || "",
      groomProfileId: match.groomProfileId || "",
      matchDate: match.matchDate ? match.matchDate.split("T")[0] : "",
      status: match.status || "confirmed",
      notes: match.notes || "",
    });
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8" data-testid="matches-page">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} data-testid="back-btn"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F2E9DE] bg-white hover:bg-[#FBF6ED] cursor-pointer transition">
            <ArrowLeft size={18} className="text-[#6E2F2F]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2424] font-playfair">Successful Matches</h1>
            <p className="text-sm text-stone-400">Manage confirmed match pairs</p>
          </div>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ brideProfileId: "", groomProfileId: "", matchDate: "", status: "confirmed", notes: "" }); setShowAddModal(true); }}
          data-testid="add-match-btn"
          className="flex items-center gap-2 rounded-full bg-[#6E2F2F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5A2525] transition cursor-pointer">
          <Plus size={16} /> Add Match
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Search by bride or groom name..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} data-testid="matches-search"
            className="w-full rounded-full border border-[#F2E9DE] bg-white py-3 pl-11 pr-4 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450]" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#F2E9DE] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-400">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="p-10 text-center" data-testid="matches-empty">
            <Heart size={40} className="mx-auto text-stone-200 mb-3" />
            <p className="text-stone-400">No matches found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FBF6ED] text-xs uppercase tracking-wider text-[#6E2F2F]">
                  <th className="p-4">Bride</th>
                  <th className="p-4">Groom</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m._id} className="border-b border-[#F2E9DE] hover:bg-[#FDFBF7] transition" data-testid={`match-row-${m._id}`}>
                    <td className="p-4">
                      <span className="font-semibold text-[#2D2424]">{m.brideName || "Unknown"}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[#2D2424]">{m.groomName || "Unknown"}</span>
                    </td>
                    <td className="p-4 text-sm text-stone-500">
                      {m.matchDate ? new Date(m.matchDate).toLocaleDateString("en-IN") : "-"}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${m.status === "confirmed" ? "bg-green-100 text-green-700" : m.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-stone-500 max-w-[200px] truncate">{m.notes || "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(m)} data-testid={`edit-match-${m._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F2E9DE] hover:bg-[#FBF6ED] cursor-pointer transition">
                          <Edit2 size={14} className="text-[#B08B4F]" />
                        </button>
                        <button onClick={() => handleDelete(m._id)} data-testid={`delete-match-${m._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 hover:bg-red-50 cursor-pointer transition">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-t border-[#F2E9DE]">
          <p className="text-sm text-stone-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="rounded-full border border-[#F2E9DE] px-4 py-2 text-sm font-medium text-stone-600 hover:bg-[#FBF6ED] disabled:opacity-50 cursor-pointer transition">Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="rounded-full border border-[#F2E9DE] px-4 py-2 text-sm font-medium text-stone-600 hover:bg-[#FBF6ED] disabled:opacity-50 cursor-pointer transition">Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" data-testid="match-modal">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#2D2424] font-playfair">{editingId ? "Edit Match" : "Add New Match"}</h3>
              <button onClick={() => setShowAddModal(false)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Bride Profile ID</label>
                <input type="text" required value={form.brideProfileId} onChange={(e) => setForm(f => ({ ...f, brideProfileId: e.target.value }))}
                  data-testid="match-bride-input" disabled={!!editingId}
                  className="w-full rounded-xl border border-[#F2E9DE] px-4 py-2.5 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450] disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Groom Profile ID</label>
                <input type="text" required value={form.groomProfileId} onChange={(e) => setForm(f => ({ ...f, groomProfileId: e.target.value }))}
                  data-testid="match-groom-input" disabled={!!editingId}
                  className="w-full rounded-xl border border-[#F2E9DE] px-4 py-2.5 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450] disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Match Date</label>
                <input type="date" value={form.matchDate} onChange={(e) => setForm(f => ({ ...f, matchDate: e.target.value }))}
                  data-testid="match-date-input"
                  className="w-full rounded-xl border border-[#F2E9DE] px-4 py-2.5 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                  data-testid="match-status-select"
                  className="w-full rounded-xl border border-[#F2E9DE] px-4 py-2.5 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450]">
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  data-testid="match-notes-input"
                  className="w-full rounded-xl border border-[#F2E9DE] px-4 py-2.5 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450] resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-full border border-[#F2E9DE] py-2.5 text-sm font-semibold text-stone-600 hover:bg-gray-50 cursor-pointer transition">Cancel</button>
                <button type="submit" disabled={submitting} data-testid="match-submit-btn"
                  className="flex-1 rounded-full bg-[#6E2F2F] py-2.5 text-sm font-semibold text-white hover:bg-[#5A2525] disabled:opacity-50 cursor-pointer transition">
                  {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
