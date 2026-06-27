"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, UserCheck, UserRound, IndianRupee, Crown, Shield,
  TrendingUp, Heart, AlertTriangle, ClipboardCheck, Calendar,
  ChevronRight, ArrowUpRight, ArrowDownRight, Download,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  Legend, Area, AreaChart,
} from "recharts";

const formatNumber = (val) => new Intl.NumberFormat("en-IN").format(val || 0);
const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);

const PIE_COLORS = ["#B08B4F", "#E3B450", "#6E2F2F", "#8B5E3C", "#C69C6D"];
const GENDER_COLORS = ["#5B8DB8", "#D4769A"];

const StatCard = ({ icon: Icon, label, value, accent, onClick, subtitle, trend }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    className="group w-full cursor-pointer rounded-2xl border border-[#F2E9DE] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#D7C2A7] hover:-translate-y-0.5"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">{label}</p>
        <h3 className="mt-2 text-2xl font-bold text-[#2D2424] font-playfair truncate">{value}</h3>
        {subtitle && <p className="mt-1 text-xs text-stone-400">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}>
        <Icon size={20} className="text-[#2D2424]" />
      </div>
    </div>
    <div className="mt-3 flex items-center text-xs text-[#B08B4F] opacity-0 transition-opacity group-hover:opacity-100">
      <span>View details</span>
      <ChevronRight size={12} className="ml-0.5" />
    </div>
  </button>
);

const MiniCard = ({ label, count, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={`mini-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    className="flex cursor-pointer items-center justify-between rounded-xl border border-[#F2E9DE] bg-white px-4 py-3 transition hover:border-[#D7C2A7] hover:shadow-sm"
  >
    <div className="flex items-center gap-2.5">
      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-medium text-stone-600">{label}</span>
    </div>
    <span className="text-sm font-bold text-[#2D2424]">{formatNumber(count)}</span>
  </button>
);

const RevenueCard = ({ label, revenue, count, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={`revenue-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    className="cursor-pointer rounded-xl border border-[#F2E9DE] bg-white p-4 transition hover:border-[#D7C2A7] hover:shadow-sm text-left w-full"
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs font-medium uppercase tracking-wider text-stone-400">{label}</span>
    </div>
    <p className="text-lg font-bold text-[#2D2424] font-playfair">{formatCurrency(revenue)}</p>
    <p className="text-xs text-stone-400 mt-1">{formatNumber(count)} subscriber{count !== 1 ? "s" : ""}</p>
  </button>
);

const SectionTitle = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon size={18} className="text-[#B08B4F]" />}
    <h2 className="text-lg font-bold text-[#2D2424] font-playfair">{children}</h2>
  </div>
);

export default function DashboardStats({ token, onUnauthorized, onNavigate, role = 'admin' }) {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = role === 'super_admin';

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Always fetch stats
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.status === 401 || statsRes.status === 403) {
        onUnauthorized?.();
        return;
      }
      const statsData = await statsRes.json().catch(() => ({}));
      if (statsData?.success) setStats(statsData.data);

      // Only fetch revenue for super_admin
      if (isSuperAdmin) {
        const revenueRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/revenue`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const revData = await revenueRes.json().catch(() => ({}));
        if (revData?.success) setRevenueData(revData.data);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [token, onUnauthorized, isSuperAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !stats) {
    return (
      <div className="space-y-6 mb-8" data-testid="dashboard-loading">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-[#F2E9DE] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-[#F2E9DE] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const genderData = [
    { name: "Male", value: stats.genderRatio?.Male || 0 },
    { name: "Female", value: stats.genderRatio?.Female || 0 },
  ];

  const membershipPieData = [
    { name: "Gold", value: stats.premiumMembers?.Gold || 0 },
    { name: "Premium", value: stats.premiumMembers?.Premium || 0 },
    { name: "Free", value: stats.premiumMembers?.Free || 0 },
  ].filter(d => d.value > 0);

  const revenueBarData = [
    { name: "Gold", revenue: stats.revenueBreakdown?.byPlan?.Gold?.revenue || 0 },
    { name: "Premium", revenue: stats.revenueBreakdown?.byPlan?.Premium?.revenue || 0 },
    { name: "24h Boost", revenue: stats.revenueBreakdown?.byBoost?.["24 Hours"]?.revenue || 0 },
    { name: "3d Boost", revenue: stats.revenueBreakdown?.byBoost?.["3 Days"]?.revenue || 0 },
    { name: "7d Boost", revenue: stats.revenueBreakdown?.byBoost?.["7 Days"]?.revenue || 0 },
  ];

  const monthlyTrend = revenueData?.monthlyTrend || [];

  const handleExport = async (format) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/export/users?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv";
      a.download = `users_export.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
    }
  };

  return (
    <div className="space-y-6 mb-8" data-testid="dashboard-stats">
      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon={Users} label="Total Users" value={formatNumber(stats.totalUsers)}
          accent="from-[#F9E8C7] to-[#F4D28A]"
          onClick={() => onNavigate?.("users")}
          subtitle="All registered users"
        />
        <StatCard
          icon={UserCheck} label="Active Users" value={formatNumber(stats.activeUsers)}
          accent="from-[#D8F0DF] to-[#96D3A8]"
          onClick={() => onNavigate?.("users", { status: "active" })}
          subtitle="Active in last 30 days"
        />
        <StatCard
          icon={Calendar} label="Today's Registrations" value={formatNumber(stats.todaysRegistrations)}
          accent="from-[#E0E7FF] to-[#A5B4FC]"
          onClick={() => onNavigate?.("users", { sort: "today" })}
          subtitle="New signups today"
        />
        {isSuperAdmin && (
          <StatCard
            icon={IndianRupee} label="Total Revenue" value={formatCurrency(stats.totalRevenue)}
            accent="from-[#E7E3FA] to-[#BFB0F5]"
            onClick={() => onNavigate?.("revenue")}
            subtitle="All time revenue"
          />
        )}
        <StatCard
          icon={Heart} label="Successful Matches" value={formatNumber(stats.successfulMatches)}
          accent="from-[#FCE7F3] to-[#F9A8D4]"
          onClick={() => onNavigate?.("matches")}
          subtitle="Confirmed match pairs"
        />
      </div>

      {/* Row 2: Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={ClipboardCheck} label="Pending Verification" value={formatNumber(stats.pendingVerification)}
          accent="from-[#FEF3C7] to-[#FCD34D]"
          onClick={() => onNavigate?.("pending-verification")}
          subtitle="Awaiting approval"
        />
        <StatCard
          icon={AlertTriangle} label="Reported Profiles" value={formatNumber(stats.reportedProfiles)}
          accent="from-[#FEE2E2] to-[#FCA5A5]"
          onClick={() => onNavigate?.("reported-profiles")}
          subtitle="Needs review"
        />
        <StatCard
          icon={Crown} label="Premium Members" value={formatNumber((stats.premiumMembers?.Gold || 0) + (stats.premiumMembers?.Premium || 0))}
          accent="from-[#F5E1DF] to-[#E1B4AD]"
          onClick={() => onNavigate?.("subscribers")}
          subtitle="Gold + Premium users"
        />
      </div>

      {/* Row 3: Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Members Breakdown */}
        <div className="rounded-2xl border border-[#F2E9DE] bg-white p-6 shadow-sm" data-testid="premium-members-section">
          <SectionTitle icon={Crown}>Premium Members</SectionTitle>
          <div className="grid grid-cols-1 gap-3 mb-4">
            <MiniCard label="Gold" count={stats.premiumMembers?.Gold || 0} color="#E3B450"
              onClick={() => onNavigate?.("subscribers", { membershipType: "Gold" })} />
            <MiniCard label="Premium" count={stats.premiumMembers?.Premium || 0} color="#6E2F2F"
              onClick={() => onNavigate?.("subscribers", { membershipType: "Premium" })} />
            <MiniCard label="Free" count={stats.premiumMembers?.Free || 0} color="#94A3B8"
              onClick={() => onNavigate?.("subscribers", { membershipType: "Free" })} />
          </div>
          <div className="border-t border-[#F2E9DE] pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">Boosts</p>
            <div className="grid grid-cols-1 gap-3">
              <MiniCard label="24h Boost" count={stats.boostCounts?.["24 Hours"] || 0} color="#F59E0B"
                onClick={() => onNavigate?.("subscribers", { boostType: "24 Hours" })} />
              <MiniCard label="3 Day Boost" count={stats.boostCounts?.["3 Days"] || 0} color="#8B5CF6"
                onClick={() => onNavigate?.("subscribers", { boostType: "3 Days" })} />
              <MiniCard label="7 Day Boost" count={stats.boostCounts?.["7 Days"] || 0} color="#EC4899"
                onClick={() => onNavigate?.("subscribers", { boostType: "7 Days" })} />
            </div>
          </div>
        </div>

        {/* Gender Ratio + Membership Pie */}
        <div className="rounded-2xl border border-[#F2E9DE] bg-white p-6 shadow-sm" data-testid="gender-ratio-section">
          <SectionTitle icon={Users}>Male vs Female Ratio</SectionTitle>
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={genderData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                  {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(val) => formatNumber(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: GENDER_COLORS[0] }} />
              <span className="text-sm text-stone-600">Male: {formatNumber(stats.genderRatio?.Male || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: GENDER_COLORS[1] }} />
              <span className="text-sm text-stone-600">Female: {formatNumber(stats.genderRatio?.Female || 0)}</span>
            </div>
          </div>
          {/* Membership pie below */}
          <div className="mt-6 border-t border-[#F2E9DE] pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">Membership Distribution</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={membershipPieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35} paddingAngle={3}>
                  {membershipPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => formatNumber(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 flex-wrap">
              {membershipPieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-stone-500">{d.name}: {formatNumber(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Revenue Analytics — Super Admin Only */}
      {isSuperAdmin && (
      <div className="rounded-2xl border border-[#F2E9DE] bg-white p-6 shadow-sm" data-testid="revenue-analytics-section">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={TrendingUp}>Revenue Analytics</SectionTitle>
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport("csv")} data-testid="export-csv-btn"
              className="flex items-center gap-1.5 rounded-lg border border-[#F2E9DE] px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-[#FBF6ED] transition cursor-pointer">
              <Download size={12} /> CSV
            </button>
            <button onClick={() => handleExport("xlsx")} data-testid="export-xlsx-btn"
              className="flex items-center gap-1.5 rounded-lg border border-[#F2E9DE] px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-[#FBF6ED] transition cursor-pointer">
              <Download size={12} /> Excel
            </button>
            <button onClick={() => handleExport("pdf")} data-testid="export-pdf-btn"
              className="flex items-center gap-1.5 rounded-lg border border-[#F2E9DE] px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-[#FBF6ED] transition cursor-pointer">
              <Download size={12} /> PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <RevenueCard label="Gold" revenue={stats.revenueBreakdown?.byPlan?.Gold?.revenue || 0}
            count={stats.revenueBreakdown?.byPlan?.Gold?.count || 0} color="#E3B450"
            onClick={() => onNavigate?.("subscribers", { planName: "Gold" })} />
          <RevenueCard label="Premium" revenue={stats.revenueBreakdown?.byPlan?.Premium?.revenue || 0}
            count={stats.revenueBreakdown?.byPlan?.Premium?.count || 0} color="#6E2F2F"
            onClick={() => onNavigate?.("subscribers", { planName: "Premium" })} />
          <RevenueCard label="24h Boost" revenue={stats.revenueBreakdown?.byBoost?.["24 Hours"]?.revenue || 0}
            count={stats.revenueBreakdown?.byBoost?.["24 Hours"]?.count || 0} color="#F59E0B"
            onClick={() => onNavigate?.("subscribers", { boostType: "24 Hours" })} />
          <RevenueCard label="3 Day Boost" revenue={stats.revenueBreakdown?.byBoost?.["3 Days"]?.revenue || 0}
            count={stats.revenueBreakdown?.byBoost?.["3 Days"]?.count || 0} color="#8B5CF6"
            onClick={() => onNavigate?.("subscribers", { boostType: "3 Days" })} />
          <RevenueCard label="7 Day Boost" revenue={stats.revenueBreakdown?.byBoost?.["7 Days"]?.revenue || 0}
            count={stats.revenueBreakdown?.byBoost?.["7 Days"]?.count || 0} color="#EC4899"
            onClick={() => onNavigate?.("subscribers", { boostType: "7 Days" })} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Plan Bar Chart */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">Revenue by Category</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2E9DE" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716C" }} />
                <YAxis tick={{ fontSize: 11, fill: "#78716C" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="revenue" fill="#B08B4F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">Monthly Revenue Trend</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2E9DE" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716C" }} />
                <YAxis tick={{ fontSize: 11, fill: "#78716C" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Area type="monotone" dataKey="subscriptions" stackId="1" fill="#E3B450" stroke="#B08B4F" fillOpacity={0.4} name="Subscriptions" />
                <Area type="monotone" dataKey="boosts" stackId="1" fill="#BFB0F5" stroke="#7C3AED" fillOpacity={0.4} name="Boosts" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )} {/* end isSuperAdmin revenue section */}
    </div>
  );
}
