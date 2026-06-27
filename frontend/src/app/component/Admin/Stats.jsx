"use client";

import { useEffect, useState } from "react";
import { IndianRupee, UserCheck, UserRound, Users } from "lucide-react";

const statCards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    accent: "from-[#F9E8C7] to-[#F4D28A]",
  },
  {
    key: "activeUsers",
    label: "Active Users",
    icon: UserCheck,
    accent: "from-[#D8F0DF] to-[#96D3A8]",
  },
  {
    key: "paidUsers",
    label: "Paid Users",
    icon: UserRound,
    accent: "from-[#F5E1DF] to-[#E1B4AD]",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: IndianRupee,
    accent: "from-[#E7E3FA] to-[#BFB0F5]",
  },
];

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const Stats = ({ token, onUnauthorized }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    paidUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if ((res.status === 401 || res.status === 403) && onUnauthorized) {
            onUnauthorized();
          }
          throw new Error(data?.message || "Failed to fetch admin stats");
        }

        if (isMounted && data?.success) {
          setStats({
            totalUsers: data.data?.totalUsers || 0,
            activeUsers: data.data?.activeUsers || 0,
            paidUsers: data.data?.paidUsers || 0,
            totalRevenue: data.data?.totalRevenue || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [token, onUnauthorized]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {statCards.map(({ key, label, icon: Icon, accent }) => {
        const value =
          key === "totalRevenue"
            ? formatCurrency(stats[key])
            : formatNumber(stats[key]);

        return (
          <div
            key={key}
            className="rounded-[28px] border border-[#F2E9DE] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone-500">{label}</p>
                <h3 className="mt-3 text-3xl font-bold text-[#2D2424] font-playfair">
                  {loading ? "--" : value}
                </h3>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}
              >
                <Icon size={22} className="text-[#2D2424]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
