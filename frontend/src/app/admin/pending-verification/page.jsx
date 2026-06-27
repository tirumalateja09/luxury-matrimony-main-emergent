"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

export default function PendingVerificationPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) { router.push("/adminlogin"); return; }
    setToken(t);
  }, [router]);

  const fetchProfiles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pending-verification?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setProfiles(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, page, search]);

  useEffect(() => {
    const handler = setTimeout(() => fetchProfiles(), 300);
    return () => clearTimeout(handler);
  }, [fetchProfiles]);

  const handleVerify = async (profileId, status, remarks = "") => {
    setActionLoading(profileId);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/verify-profile/${profileId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks }),
      });
      fetchProfiles();
    } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8" data-testid="pending-verification-page">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin")} data-testid="back-btn"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F2E9DE] bg-white hover:bg-[#FBF6ED] cursor-pointer transition">
          <ArrowLeft size={18} className="text-[#6E2F2F]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2424] font-playfair">Pending Verification</h1>
          <p className="text-sm text-stone-400">Review and approve user profiles</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Search by name..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} data-testid="verification-search"
            className="w-full rounded-full border border-[#F2E9DE] bg-white py-3 pl-11 pr-4 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450]" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#F2E9DE] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-400">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="p-10 text-center" data-testid="verification-empty">
            <CheckCircle size={40} className="mx-auto text-green-200 mb-3" />
            <p className="text-stone-400">All profiles have been verified</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FBF6ED] text-xs uppercase tracking-wider text-[#6E2F2F]">
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((item) => {
                  const p = item.profile;
                  const u = item.account;
                  return (
                    <tr key={p?._id} className="border-b border-[#F2E9DE] hover:bg-[#FDFBF7] transition" data-testid={`verification-row-${p?._id}`}>
                      <td className="p-4">
                        <span className="font-semibold text-[#2D2424]">{p?.fullName || "No name"}</span>
                      </td>
                      <td className="p-4 text-sm text-stone-500">{u?.email || u?.phone || "-"}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p?.gender === "Male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}>
                          {p?.gender || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-stone-500">{p?.city || "-"}</td>
                      <td className="p-4 text-sm text-stone-500">{u?.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => p?._id && router.push(`/admin/user/${p._id}`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F2E9DE] hover:bg-[#FBF6ED] cursor-pointer transition" title="View">
                            <Eye size={14} className="text-[#B08B4F]" />
                          </button>
                          <button onClick={() => handleVerify(p?._id, "approved")}
                            disabled={actionLoading === p?._id}
                            data-testid={`approve-btn-${p?._id}`}
                            className="flex h-8 items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 cursor-pointer transition">
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button onClick={() => { const r = prompt("Reason for rejection:"); if (r) handleVerify(p?._id, "rejected", r); }}
                            disabled={actionLoading === p?._id}
                            data-testid={`reject-btn-${p?._id}`}
                            className="flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 cursor-pointer transition">
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
