"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import { GitBranch, Gift, Users, CheckCircle, Clock } from "lucide-react";

const STATUS_COLORS = {
  registered: "bg-blue-100 text-blue-700",
  rewarded: "bg-green-100 text-green-700",
  expired: "bg-stone-100 text-stone-500",
};

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total: 0, rewarded: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get(`/referrals/admin?${params}`, "admin");
      if (res.success) {
        setReferrals(res.data);
        setTotalPages(res.totalPages || 1);
        if (res.stats) setStats(res.stats);
      }
    } catch (e) {
      console.error("Failed to load referrals", e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const FILTERS = [
    { label: "All", value: "" },
    { label: "Registered", value: "registered" },
    { label: "Rewarded", value: "rewarded" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-[#2D2424]">Referrals</h1>
          <p className="text-stone-500 mt-1">Track user referrals and reward distribution</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#F2E9DE] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBF6ED] flex items-center justify-center">
                <Users size={18} className="text-[#E3B450]" />
              </div>
              <div>
                <p className="text-xs text-stone-400 font-medium">Total Referrals</p>
                <p className="text-2xl font-bold text-[#2D2424]">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#F2E9DE] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-stone-400 font-medium">Rewarded</p>
                <p className="text-2xl font-bold text-[#2D2424]">{stats.rewarded}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#F2E9DE] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-stone-400 font-medium">Pending</p>
                <p className="text-2xl font-bold text-[#2D2424]">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${statusFilter === f.value ? "bg-[#2D2424] text-white border-[#2D2424]" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading referrals...</div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <GitBranch size={36} className="mx-auto mb-3 opacity-30" />
            <p>No referrals found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F2E9DE] bg-[#FAF8F5]">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-stone-400 uppercase tracking-wider">Referral Code</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-stone-400 uppercase tracking-wider">Referrer</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-stone-400 uppercase tracking-wider">Referee</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-stone-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-stone-400 uppercase tracking-wider">Reward Type</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-stone-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r._id} className="border-b border-[#F2E9DE] hover:bg-[#FAF8F5] transition">
                      <td className="px-5 py-4">
                        <span className="font-mono font-semibold text-[#8B6914] bg-[#FBF6ED] px-2 py-0.5 rounded-lg text-xs tracking-wider">
                          {r.referralCode}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-stone-700 text-xs">{r.referrerId?.email || "—"}</td>
                      <td className="px-5 py-4 text-stone-700 text-xs">{r.refereeEmail || r.refereeId?.email || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status] || "bg-stone-100 text-stone-500"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-stone-500 text-xs capitalize">{r.rewardType || (r.rewardGiven ? "coupon" : "—")}</td>
                      <td className="px-5 py-4 text-stone-400 text-xs">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-[#F2E9DE]">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 disabled:opacity-40 hover:bg-stone-50 transition">
                  Previous
                </button>
                <span className="text-xs text-stone-400">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 disabled:opacity-40 hover:bg-stone-50 transition">
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
