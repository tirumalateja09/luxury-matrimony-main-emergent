"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Crown, Zap, User } from "lucide-react";

export default function SubscribersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const planName = searchParams.get("planName") || "";
  const boostType = searchParams.get("boostType") || "";
  const membershipType = searchParams.get("membershipType") || "";

  const title = boostType
    ? `${boostType} Boost Subscribers`
    : planName
      ? `${planName} Subscribers`
      : membershipType
        ? `${membershipType} Members`
        : "All Subscribers";

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) { router.push("/adminlogin"); return; }
    setToken(t);
  }, [router]);

  const fetchSubscribers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (planName) params.set("planName", planName);
      if (boostType) params.set("boostType", boostType);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscribers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setSubscribers(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, page, search, planName, boostType]);

  useEffect(() => {
    const handler = setTimeout(() => fetchSubscribers(), 300);
    return () => clearTimeout(handler);
  }, [fetchSubscribers]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8" data-testid="subscribers-page">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin")} data-testid="back-btn"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F2E9DE] bg-white hover:bg-[#FBF6ED] cursor-pointer transition">
          <ArrowLeft size={18} className="text-[#6E2F2F]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2424] font-playfair">{title}</h1>
          <p className="text-sm text-stone-400">View subscriber details and transactions</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Search..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} data-testid="subscribers-search"
            className="w-full rounded-full border border-[#F2E9DE] bg-white py-3 pl-11 pr-4 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[#E3B450]" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#F2E9DE] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-400">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-10 text-center" data-testid="subscribers-empty">
            <User size={40} className="mx-auto text-stone-200 mb-3" />
            <p className="text-stone-400">No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FBF6ED] text-xs uppercase tracking-wider text-[#6E2F2F]">
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Plan / Boost</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((item, idx) => {
                  const sub = item.subscription || {};
                  const profile = item.profile || {};
                  const account = item.account || {};
                  return (
                    <tr key={sub._id || idx} className="border-b border-[#F2E9DE] hover:bg-[#FDFBF7] transition">
                      <td className="p-4">
                        <span className="font-semibold text-[#2D2424]">{profile?.fullName || account?.fullName || "Unknown"}</span>
                      </td>
                      <td className="p-4 text-sm text-stone-500">{account?.email || account?.phone || "-"}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5">
                          {boostType ? <Zap size={13} className="text-amber-500" /> : <Crown size={13} className="text-[#B08B4F]" />}
                          <span className="text-sm font-medium text-stone-700">{sub.planName || sub.planType || planName || boostType}</span>
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-[#2D2424]">
                        {sub.amount ? `₹${Number(sub.amount).toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="p-4 text-xs text-stone-400 font-mono">{sub.transactionId || "-"}</td>
                      <td className="p-4 text-sm text-stone-500">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("en-IN") : "-"}
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
