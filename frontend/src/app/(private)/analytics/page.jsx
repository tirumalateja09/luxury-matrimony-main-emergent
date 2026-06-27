// import { Eye, Heart, TrendingUp, Users } from "lucide-react";
// import React from "react";
// import ViewsTrendChart from "./ViewsTrendChart";

// const page = () => {
//   return (
//     <div className="max-w-7xl  mx-auto  flex flex-col gap-8 md:gap-12">
//       {/* TOP SECTION: Overview & Views Trend */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//         {/* Overview Section */}
//         <div className="flex flex-col gap-6">
//           <div className="flex items-baseline gap-2">
//             <span className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
//               Overview
//             </span>
//             <span className="text-stone-500 text-sm font-normal font-['Inter']">
//               (Last 30 Days)
//             </span>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {[
//               {
//                 label: "Profile Views",
//                 value: "324",
//                 change: "+18%",
//                 icon: <Eye />,
//               },
//               {
//                 label: "Interests Received",
//                 value: "47",
//                 change: "+12%",
//                 icon: <Heart />,
//               },
//               {
//                 label: "Shortlists",
//                 value: "28",
//                 change: "+8%",
//                 icon: <Users />,
//               },
//               {
//                 label: "Response Rate",
//                 value: "••",
//                 change: null,
//                 locked: true,
//                 icon: <TrendingUp />,
//               },
//             ].map((stat, i) => (
//               <div
//                 key={i}
//                 className={`p-4 bg-white rounded-2xl shadow-md border border-gray-50 flex flex-col justify-between min-h-[140px] ${stat.locked ? "opacity-70" : ""}`}
//               >
//                 <div className="flex justify-between items-start">
//                   <div className="w-10 h-10 bg-red-100 rounded-full flex justify-center items-center text-green-600 text-xl">
//                     {stat.icon}
//                   </div>
//                   {stat.locked && (
//                     <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center text-[10px]">
//                       🔒
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-stone-800 text-base font-medium font-['Inter'] mt-2">
//                   {stat.label}
//                 </div>
//                 <div className="flex justify-between items-end">
//                   <div className="text-green-700 text-3xl font-bold font-['Playfair_Display']">
//                     {stat.value}
//                   </div>
//                   {stat.change && (
//                     <div className="text-orange-400 text-xs font-semibold">
//                       {stat.change}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Views Trend Section */}
//         <div className="flex flex-col gap-6">
//           <div className="flex items-baseline gap-2">
//             <span className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
//               Views Trend
//             </span>
//             <span className="text-stone-500 text-sm font-normal font-['Inter']">
//               (Last 7 Days)
//             </span>
//           </div>
//         <div className="w-full p-4 bg-white rounded-2xl shadow-md border border-gray-50 flex flex-col justify-end min-h-[280px]">
//             {/* Simple CSS Bar Chart */}
//             <div className="flex justify-between items-end gap-2  mb-1 border-b border-gray-100 pb-2">
//             <ViewsTrendChart/>  </div>
//              <div className="flex justify-between items-center pt-2">
//             <div className="text-stone-500 text-sm font-normal">
//               Average Daily Views
//             </div>
//             <div className="text-red-900 text-lg font-semibold">
//               51 views/day
//             </div>
//           </div>
//           </div>
//         </div>
//       </div>

//       {/* BOTTOM SECTION: Insights & Premium */}

//       {/* Insights & Tips */}
//       <div className="flex flex-col gap-6">
//         <div className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
//           Insights & Tips
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//           <div className="flex flex-col gap-4">
//             {/* Weekend Tip */}
//             <div className="p-5 bg-orange-50 rounded-2xl border border-amber-300 flex gap-4">
//               <div className="text-green-600 text-2xl flex-shrink-0">💡</div>
//               <div className="flex flex-col gap-1">
//                 <div className="text-green-600 text-xl font-semibold font-['Playfair_Display']">
//                   Weekend Performance
//                 </div>
//                 <p className="text-stone-500 text-sm md:text-base">
//                   Your profile gets 40% more views on weekends. Consider
//                   boosting on Fridays.
//                 </p>
//               </div>
//             </div>
//             {/* Boost Banner */}
//             <div className="p-6 bg-green-600/10 rounded-2xl border border-green-600 flex flex-col gap-4">
//               <div>
//                 <div className="text-stone-800 text-lg font-semibold">
//                   Want to improve visibility?
//                 </div>
//                 <p className="text-stone-700 text-sm">
//                   Boost your profile to appear higher in search results and get
//                   up to 3× more views.
//                 </p>
//               </div>
//               <button className="w-full py-3 bg-green-600 text-white rounded-full font-semibold text-sm hover:bg-green-700 transition">
//                 Boost Profile Now
//               </button>
//             </div>
//           </div>
//           <div className="p-4 bg-gradient-to-br from-[#1F5C3A] to-[#41C27A] rounded-2xl shadow-lg flex flex-col items-center text-center gap-4">
//             <div className="w-12 h-12 text-[#6E2F2F] bg-gold-gradient rounded-full flex items-center justify-center text-xl shadow-inner">
//               <TrendingUp />
//             </div>
//             <div className="text-white text-xl font-semibold font-['Playfair_Display']">
//               Unlock Detailed Analytics
//             </div>
//             <p className="text-white/80 text-sm  font-inter ">
//               Upgrade to Premium to access advanced insights, response rate
//               tracking, and personalized recommendations.
//             </p>

//             <ul className="w-full flex flex-col gap-2">
//               {[
//                 "Detailed response rate analytics",
//                 "Advanced engagement insights",
//                 "Personalized recommendations",
//               ].map((item, i) => (
//                 <li
//                   key={i}
//                   className="flex items-center gap-2 text-white/90 text-xs font-inter text-left"
//                 >
//                   <div className="w-1.5 h-1.5  bg-gold-gradient rounded-full" />
//                   {item}
//                 </li>
//               ))}
//             </ul>

//             <button className="w-full py-3  bg-gold-gradient rounded-full text-red-900 font-bold text-base hover:brightness-110 transition">
//               Upgrade to Premium
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default page;

"use client";
import React, { useEffect, useState } from "react";
import { Eye, Heart, TrendingUp, Users, Loader2 } from "lucide-react";
import ViewsTrendChart from "./ViewsTrendChart";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import MobileHeaderText from "@/app/component/MobileHeaderText";

const Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetching integrated analytics data
        const response = await api.get("/views/my-views", "private");
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  const isPremium =
    data?.membershipType === "Gold" || data?.membershipType === "Premium";
  const isBoosted = data.isBoosted;
  const stats = data?.stats || {};
  const viewsTrend = data?.viewsTrend || {};

  const overviewStats = [
    {
      label: "Profile Views",
      value: viewsTrend.totalThisWeek || "0",
      change: "+18%",
      icon: <Eye />,
      locked: false,
    },
    {
      label: "Interests Received",
      value: stats.interests || "0",
      change: "+12%",
      icon: <Heart />,
      locked: false,
    },
    {
      label: "Shortlists",
      value: stats.shortlists || "0",
      change: "+8%",
      icon: <Users />,
      locked: false,
    },
    {
      label: "Response Rate",
      value: isPremium ? stats.responseRate : "••",
      change: null,
      locked: !isPremium, // Lock if not premium
      icon: <TrendingUp />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 md:gap-12 mb-20 sm:mb-0">
      <MobileHeaderText>
        <div className="flex items-center gap-2">
          <TrendingUp /> Profile Analytics
        </div>
      </MobileHeaderText>
      {/* TOP SECTION: Overview & Views Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 px-4 lg:px-0">
        {/* Overview Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-stone-800 text-2xl font-semibold font-playfair">
              Overview
            </span>
            <span className="text-stone-800 text-base font-normal font-inter">
              (Last 30 Days)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {overviewStats.map((stat, i) => (
              <div
                key={i}
                className={`p-4 bg-white rounded-2xl shadow-md border border-gray-50 flex flex-col justify-between min-h-[140px] ${stat.locked ? "opacity-80" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-[#F3DED3] rounded-full flex justify-center items-center text-green-600">
                    {stat.icon}
                  </div>
                  {stat.locked && (
                    <div className="px-2 py-1 bg-amber-100 rounded-full text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <span>🔒</span> PREMIUM
                    </div>
                  )}
                </div>
                <div className="text-stone-800 text-base font-medium font-inter mt-2">
                  {stat.label}
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-green-700 text-3xl font-bold font-playfair">
                    {stat.value}
                  </div>
                  {/* {stat.change && !stat.locked && (
                    <div className="text-orange-400 text-xs font-semibold">{stat.change}</div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Views Trend Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-stone-800 text-2xl font-semibold font-playfair">
              Views Trend
            </span>
            <span className="text-stone-800 text-base font-normal font-inter">
              (Last 7 Days)
            </span>
          </div>
          <div className="w-full p-4 bg-white rounded-2xl shadow-md border border-gray-50 flex flex-col justify-end min-h-[280px]">
            <ViewsTrendChart data={viewsTrend.chartData} />
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
              <div className="text-stone-500 text-sm font-normal">
                Average Daily Views
              </div>
              <div className="text-red-900 text-lg font-semibold">
                {viewsTrend.averageDaily || 0} views/day
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Insights & Premium */}
      <div className="flex flex-col gap-6 px-4 lg:px-0 mb-10">
        <div className="text-stone-800 text-2xl font-semibold font-playfair">
          Insights & Tips
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col gap-4">
            {/* Weekend Tip Card */}
            {viewsTrend.percentageChange ? (
              <div className="p-5 bg-orange-50 rounded-2xl border border-amber-300 flex gap-4">
                <div className="text-green-600 text-2xl flex-shrink-0">💡</div>
                <div className="flex flex-col gap-1">
                  <div className="text-green-600 text-xl font-semibold font-playfair">
                    Weekend Performance
                  </div>
                  <p className="text-stone-500 text-sm md:text-base">
                    Your profile gets {viewsTrend.percentageChange}% more views
                    on weekends. Consider boosting on Fridays.
                  </p>
                </div>
              </div>
            ) : (
              ""
            )}

            {/* Boost Banner */}
            {!isBoosted && (
              <div className="p-6 bg-[#42946640] rounded-2xl border border-green-600 flex flex-col gap-4">
                <div>
                  <div className="text-stone-800 text-lg font-semibold">
                    Want to improve visibility?
                  </div>
                  <p className="text-stone-700 text-sm">
                    Boost your profile to appear higher in search results and
                    get up to 3× more views.
                  </p>
                </div>
                <Link href="/boostprofile">
                  <button className="w-full py-3 cursor-pointer bg-green-600 text-white rounded-full font-semibold text-sm hover:bg-green-700 transition">
                    Boost Profile Now
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Upgrade Card: Only show if user is Free */}
          {!isPremium && (
            <div className="p-6 bg-gradient-to-br from-[#1F5C3A] to-[#41C27A] rounded-2xl shadow-lg flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 text-[#6E2F2F] bg-gold-gradient rounded-full flex items-center justify-center text-xl shadow-inner">
                <TrendingUp />
              </div>
              <div className="text-white text-xl font-semibold font-playfair">
                Unlock Detailed Analytics
              </div>
              <p className="text-white/80 text-sm font-inter">
                Upgrade to Premium to access advanced insights, response rate
                tracking, and personalized recommendations.
              </p>
              <ul className="w-full flex flex-col gap-2">
                {[
                  "Detailed response rate analytics",
                  "Advanced engagement insights",
                  "Personalized recommendations",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-white/90 text-xs font-inter text-left"
                  >
                    <div className="w-1.5 h-1.5 bg-gold-gradient rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/profile/membership" className="w-full">
                <button className="w-full py-3 cursor-pointer bg-gold-gradient rounded-full text-red-900 font-bold text-base hover:brightness-110 transition">
                  Upgrade to Premium
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
