"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Copy, Gift, Users, CheckCircle, Clock, Share2 } from "lucide-react";
import Link from "next/link";

export default function ReferralsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [referCode, setReferCode] = useState("");
  const [applyMsg, setApplyMsg] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/referrals/my-code", "private");
        if (res.success) setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const copyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode).then(() => toast.success("Code copied!"));
  };

  const shareCode = () => {
    if (!data?.referralCode) return;
    const text = `Join RVR Luxury Matrimony and find your perfect match! Use my referral code ${data.referralCode} to get 10% off your first membership plan. Sign up here: ${window.location.origin}/register`;
    if (navigator.share) {
      navigator.share({ title: "Join RVR Luxury Matrimony", text });
    } else {
      navigator.clipboard.writeText(text).then(() => toast.success("Share text copied!"));
    }
  };

  const applyReferral = async () => {
    if (!referCode.trim()) { toast.error("Enter a referral code"); return; }
    setApplying(true);
    try {
      const res = await api.post("/referrals/apply", { code: referCode.trim().toUpperCase() }, "private");
      if (res.success) {
        setApplyMsg({ type: "success", text: res.message, coupon: res.couponCode });
        toast.success(res.message);
        setReferCode("");
      } else {
        setApplyMsg({ type: "error", text: res.message });
        toast.error(res.message);
      }
    } catch (e) {
      setApplyMsg({ type: "error", text: e.message });
      toast.error(e.message || "Failed to apply code");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <p className="text-stone-400 text-sm">Loading your referral details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#2D2424]">Refer & Earn</h1>
          <p className="text-stone-500 mt-1">Invite friends and earn rewards when they join</p>
        </div>

        {/* Your Referral Code */}
        <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#2D2424] to-[#4A3030] p-6">
            <p className="text-xs text-white/60 font-medium uppercase tracking-widest mb-2">Your Referral Code</p>
            <div className="flex items-center gap-3">
              <span data-testid="my-referral-code" className="font-mono text-3xl font-bold text-[#E3B450] tracking-widest">
                {data?.referralCode || "—"}
              </span>
              <button onClick={copyCode} title="Copy code"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
                <Copy size={16} />
              </button>
            </div>
            <p className="text-white/50 text-xs mt-2">Share this code with friends. They get 10% off their first plan.</p>
          </div>
          <div className="p-5 flex gap-3">
            <button onClick={copyCode} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#F2E9DE] text-[#2D2424] text-sm font-semibold hover:bg-[#FBF6ED] transition">
              <Copy size={15} /> Copy Code
            </button>
            <button onClick={shareCode} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] text-sm font-bold hover:opacity-90 transition">
              <Share2 size={15} /> Share Invite
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-[#F2E9DE] p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#2D2424]">{data?.totalReferrals || 0}</p>
            <p className="text-xs text-stone-400 mt-0.5">Total Referred</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F2E9DE] p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{data?.rewarded || 0}</p>
            <p className="text-xs text-stone-400 mt-0.5">Rewarded</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F2E9DE] p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-amber-500">{data?.pending || 0}</p>
            <p className="text-xs text-stone-400 mt-0.5">Pending</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm p-6">
          <h2 className="font-playfair text-lg font-bold text-[#2D2424] mb-4">How it works</h2>
          <div className="space-y-3">
            {[
              { icon: Share2, text: "Share your unique referral code with friends and family." },
              { icon: Users, text: "Friend registers and applies your code during sign-up." },
              { icon: Gift, text: "They get 10% off their first membership plan." },
              { icon: CheckCircle, text: "You earn a ₹199 boost credit when they make their first purchase!" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#FBF6ED] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-[#E3B450]" />
                </div>
                <p className="text-sm text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Apply a referral code */}
        <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm p-6">
          <h2 className="font-playfair text-lg font-bold text-[#2D2424] mb-1">Have a referral code?</h2>
          <p className="text-xs text-stone-400 mb-4">Apply a friend's code to get 10% off your first membership.</p>
          <div className="flex gap-3">
            <input
              value={referCode}
              onChange={(e) => setReferCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              data-testid="apply-referral-input"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono tracking-wider uppercase text-gray-800 focus:ring-2 focus:ring-[#E3B450] outline-none"
            />
            <button onClick={applyReferral} disabled={applying} data-testid="apply-referral-btn"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#2D2424] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition">
              {applying ? "Applying..." : "Apply"}
            </button>
          </div>
          {applyMsg && (
            <div className={`mt-3 text-sm px-4 py-3 rounded-xl ${applyMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {applyMsg.text}
              {applyMsg.coupon && (
                <span className="ml-2 font-mono font-bold bg-green-100 px-2 py-0.5 rounded">
                  Coupon: {applyMsg.coupon}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Recent Referrals */}
        {data?.referrals?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#F2E9DE] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F2E9DE]">
              <h2 className="font-playfair text-lg font-bold text-[#2D2424]">Your Referrals</h2>
            </div>
            <div className="divide-y divide-[#F2E9DE]">
              {data.referrals.map((r) => (
                <div key={r._id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#2D2424]">{r.refereeEmail}</p>
                    <p className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    r.rewardGiven ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {r.rewardGiven ? "Rewarded" : r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pb-4">
          <Link href="/profile/membership" className="text-sm text-[#8B6914] hover:underline font-medium">
            View Membership Plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
