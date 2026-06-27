"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, AlertTriangle, CheckCircle, Eye, Clock } from "lucide-react";

export default function ReportedProfilesPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) { router.push("/adminlogin"); return; }
    setToken(t);
  }, [router]);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reported-profiles?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setReports(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, page, search, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => fetchReports(), 300);
    return () => clearTimeout(handler);
  }, [fetchReports]);

  const handleStatusUpdate = async (reportId, status) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reported-profiles/${reportId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchReports();
    } catch (e) { console.error(e); }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      reviewing: "bg-blue-100 text-blue-700",
      resolved: "bg-green-100 text-green-700",
      dismissed: "bg-gray-100 text-gray-600",
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8" data-testid="reported-profiles-page">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin")} data-testid="back-btn"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F2E9DE] bg-white hover:bg-[#FBF6ED] cursor-pointer transition">
          <ArrowLeft size={18} className="text-[#6E2F2F]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2424] font-playfair">Reported Profiles</h1>
          <p className="text-sm text-stone-400">Review flagged accounts</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Search by name..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} data-testid="reports-search"
            className="w-full rounded-full border border-[#F2E9DE] bg-white py-3 pl-11 pr-4 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450]" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          data-testid="reports-status-filter"
          className="rounded-full border border-[#F2E9DE] bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450]">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <div className="rounded-2xl border border-[#F2E9DE] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-400">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center" data-testid="reports-empty">
            <CheckCircle size={40} className="mx-auto text-green-200 mb-3" />
            <p className="text-stone-400">No reported profiles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FBF6ED] text-xs uppercase tracking-wider text-[#6E2F2F]">
                  <th className="p-4">Reported User</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id} className="border-b border-[#F2E9DE] hover:bg-[#FDFBF7] transition" data-testid={`report-row-${r._id}`}>
                    <td className="p-4">
                      <span className="font-semibold text-[#2D2424]">{r.reportedName || "Unknown"}</span>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">{r.reason}</span>
                    </td>
                    <td className="p-4 text-sm text-stone-500 max-w-[200px] truncate">{r.description || "-"}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-stone-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {r.status === "pending" && (
                          <>
                            <button onClick={() => handleStatusUpdate(r._id, "reviewing")}
                              className="flex h-7 items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 text-xs font-medium text-blue-700 hover:bg-blue-100 cursor-pointer transition">
                              <Clock size={11} /> Review
                            </button>
                            <button onClick={() => handleStatusUpdate(r._id, "dismissed")}
                              className="flex h-7 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition">
                              Dismiss
                            </button>
                          </>
                        )}
                        {r.status === "reviewing" && (
                          <button onClick={() => handleStatusUpdate(r._id, "resolved")}
                            className="flex h-7 items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2 text-xs font-medium text-green-700 hover:bg-green-100 cursor-pointer transition">
                            <CheckCircle size={11} /> Resolve
                          </button>
                        )}
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
    </div>
  );
}
