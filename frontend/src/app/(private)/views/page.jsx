// import React from "react";
// import ViewsTrendChart from "../analytics/ViewsTrendChart";
// import { CircleCheckBig, Eye, MapPin, TrendingUp } from "lucide-react";
// import Image from "next/image";
// import MobileHeaderText from "@/app/component/MobileHeaderText";

// const page = () => {
//   return (
//     <div className="max-w-7xl mx-auto  flex flex-col gap-4 lg:gap-12 font-inter">
//       {" "}
//       {/* TOP SECTION: Views Trend & Graph */}
//       <MobileHeaderText>
//         <div className="flex items-center gap-2">
//           <Eye /> Who Viewed Your Profile{" "}
//         </div>
//       </MobileHeaderText>
//    <div  className="flex flex-col gap-12 px-4 lg:px-0">

//       <div>
//         <div className="hidden lg:flex items-baseline gap-2">
//           <span className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
//             Views Trend
//           </span>
//           <span className="text-stone-500 text-xl font-normal font-Inter">
//             (Last 7 Days)
//           </span>
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
//           {/* Total Views Card */}
//           <div className="flex flex-col gap-9">
//             <div className="w-full min-h-[256px] p-5 bg-gradient-to-b from-[#368157] to-[#065428] rounded-2xl shadow-lg flex flex-col justify-between">
//               <div className="flex justify-between items-center gap-4">
//                 <div className="flex flex-col gap-2">
//                   <div className="text-white text-xl md:text-2xl font-semibold font-['Playfair_Display']">
//                     Total Views This Week
//                   </div>
//                   <div className="text-white text-4xl font-semibold font-['Playfair_Display']">
//                     47
//                   </div>
//                 </div>
//                 <div className="w-16 h-16 flex-shrink-0 bg-gold-gradient rounded-full flex justify-center items-center shadow-inner">
//                   <span className="text-2xl">
//                     <Eye />
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 mt-8">
//                 <TrendingUp className="text-amber-300" />
//                 <span className="text-amber-300 text-xl font-semibold font-Inter">
//                   23% increase
//                 </span>
//                 <span className="text-stone-400 text-lg font-normal font-Inter">
//                   from last week
//                 </span>
//               </div>

//               <div className="pt-2 mt-1 border-t border-white/20 text-center">
//                 <p className="text-amber-300 text-sm md:text-base font-semibold font-Inter uppercase tracking-wider">
//                   Available to Gold & Premium members
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Graph Card */}
//           <div className="w-full p-4 bg-white rounded-2xl shadow-md border border-gray-50 flex flex-col justify-end min-h-[256px]">
//             <div className="flex justify-between items-end gap-2  mb-1 border-b border-gray-100 pb-2">
//               <ViewsTrendChart />{" "}
//             </div>
//             <div className="flex justify-between items-center pt-2">
//               <div className="text-stone-500 text-sm font-normal">
//                 Average Daily Views
//               </div>
//               <div className="text-red-900 text-lg font-semibold">
//                 51 views/day
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* RECENT VIEWERS SECTION */}
//       <div className="flex flex-col mb-10 gap-6">
//         <h2 className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
//           Recent Viewers
//         </h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[
//             {
//               name: "Laxmi Reddy, 26",
//               loc: "Bangalore",
//               time: "5 hours ago",
//               image: "/private/home/user1.jpg",
//             },
//             {
//               name: "Ananya Iyer, 28",
//               loc: "Kochi",
//               time: "1 hour ago",
//               image: "/private/home/user2.png",
//             },
//             {
//               name: "Priya Sharma, 27",
//               loc: "Chennai",
//               time: "2 hours ago",
//               image: "/private/home/user3.png",
//             },
//             {
//               name: "Laxmi Reddy, 26",
//               loc: "Bangalore",
//               time: "5 hours ago",
//               image: "/private/home/user1.jpg",
//             },
//           ].map((viewer, idx) => (
//             <div
//               key={idx}
//               className="
//     bg-white
//     border border-gray-50
//     shadow-md
//     rounded-2xl
//     transition-transform hover:scale-[1.02]

//     /* Mobile layout */
//     flex items-center justify-between gap-3 px-4 py-3 text-left

//     /* Desktop layout (unchanged) */
//     md:flex-col md:items-center md:text-center md:gap-4 md:p-5
//   "
//             >
//               {/* Avatar */}
//               {viewer.image ? (
//                 <Image
//                   src={viewer.image}
//                   alt="viewer"
//                   width={64}
//                   height={64}
//                   className="
//         object-cover border-2 border-white shadow-sm rounded-full

//         /* Mobile */
//         w-14 h-14

//         /* Desktop */
//         md:w-16 md:h-16
//       "
//                 />
//               ) : (
//                 <div
//                   className="
//         bg-gradient-to-br from-rose-100 to-amber-400 border-2 border-white shadow-sm rounded-full

//         /* Mobile */
//         w-14 h-14

//         /* Desktop */
//         md:w-16 md:h-16
//       "
//                 />
//               )}

//               {/* Info */}
//               <div
//                 className="
//       flex-1 flex flex-col gap-0.5

//       /* Desktop */
//       md:w-full md:items-center md:text-center md:gap-1
//     "
//               >
//                 <div className="flex items-center gap-1 md:justify-center">
//                   <span className="text-green-700 text-sm md:text-base font-semibold font-Inter truncate">
//                     {viewer.name}
//                   </span>
//                   <span className="text-green-600">
//                     <CircleCheckBig size={16} />
//                   </span>
//                 </div>

//                 <div className="text-stone-500 text-xs font-Inter flex items-center gap-1 md:justify-center">
//                   <MapPin size={13} /> {viewer.loc}
//                 </div>

//                 <div
//                   className="
//         text-red-900 font-medium font-Inter

//         /* Mobile */
//         text-[11px] text-left

//         /* Desktop */
//         md:text-[10px] md:text-center md:mt-1
//       "
//                 >
//                   Viewed {viewer.time}
//                 </div>
//               </div>

//               {/* Button */}
//               <button
//                 className="
//       cursor-pointer
//       bg-green-600 text-white font-semibold hover:bg-green-700 transition

//       /* Mobile */
//       px-5 py-2 rounded-full text-sm whitespace-nowrap

//       /* Desktop */
//       md:w-full md:py-2 md:rounded-3xl md:text-sm
//     "
//               >
//                 View
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>   </div>
//     </div>
//   );
// };

// export default page;

"use client";
import React, { useEffect, useState } from "react";
import ViewsTrendChart from "../analytics/ViewsTrendChart";
import { CircleCheckBig, Eye, MapPin, TrendingUp, Loader2 } from "lucide-react";
import Image from "next/image";
import MobileHeaderText from "@/app/component/MobileHeaderText";
import { api } from "@/lib/apiClient";
import Link from "next/link";

const Page = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Manual Time Ago Logic (No date-fns)
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 3600);
    if (interval >= 24) return Math.floor(interval / 24) + " days ago";
    if (interval >= 1) return interval + " hours ago";
    return "Just now";
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // API call to get dynamic analytics data
        const response = await api.get("/views/my-views", "private");
        if (response.success) {
          setAnalyticsData(response.data);
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
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  const viewsTrend = analyticsData?.viewsTrend || {};
  const recentViewers = analyticsData?.recentViewers || [];
  const isPremium =
    analyticsData?.membershipType === "Gold" ||
    analyticsData?.membershipType === "Premium";
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-12 font-inter">
      <MobileHeaderText>
        <div className="flex items-center gap-2">
          <Eye /> Who Viewed Your Profile
        </div>
      </MobileHeaderText>
      {isPremium ? (
        <div className="flex flex-col gap-12 px-4 lg:px-0">
          {/* TOP SECTION: Views Trend & Graph */}
          <div>
            <div className="hidden lg:flex items-baseline gap-2">
              <span className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
                Views Trend
              </span>
              <span className="text-stone-500 text-xl font-normal font-Inter">
                (Last 7 Days)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
              {/* Total Views Card */}
              <div className="flex flex-col gap-9">
                <div className="w-full min-h-[256px] p-5 bg-gradient-to-b from-[#368157] to-[#065428] rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-white text-xl md:text-2xl font-semibold font-['Playfair_Display']">
                        Total Views This Week
                      </div>
                      <div className="text-white text-4xl font-semibold font-['Playfair_Display']">
                        {viewsTrend.totalThisWeek || 0} {/* Dynamic Total */}
                      </div>
                    </div>
                    <div className="w-16 h-16 flex-shrink-0 bg-gold-gradient rounded-full flex justify-center items-center shadow-inner">
                      <span className="text-2xl">
                        <Eye />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-8">
                    <TrendingUp className="text-amber-300" />
                    <span className="text-amber-300 text-xl font-semibold font-Inter">
                      23% increase{" "}
                      {/* Isay bhi logic se dynamic kar sakte hain agar pichla data ho */}
                    </span>
                    <span className="text-stone-400 text-lg font-normal font-Inter">
                      from last week
                    </span>
                  </div>

                  <div className="pt-2 mt-1 border-t border-white/20 text-center">
                    <p className="text-amber-300 text-sm md:text-base font-semibold font-Inter uppercase tracking-wider">
                      Available to Gold & Premium members
                    </p>
                  </div>
                </div>
              </div>

              {/* Graph Card */}
              <div className="w-full p-4 bg-white rounded-2xl shadow-md border border-gray-50 flex flex-col justify-end min-h-[256px]">
                <div className="flex justify-between items-end gap-2 mb-1 border-b border-gray-100 pb-2">
                  {/* Passing dynamic chart data to graph component */}
                  <ViewsTrendChart data={viewsTrend.chartData} />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="text-stone-500 text-sm font-normal">
                    Average Daily Views
                  </div>
                  <div className="text-red-900 text-lg font-semibold">
                    {viewsTrend.averageDaily || 0} views/day{" "}
                    {/* Dynamic Average */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT VIEWERS SECTION */}
          <div className="flex flex-col mb-10 gap-6">
            <h2 className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
              Recent Viewers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {recentViewers.map((viewer) => (
                <div
                  key={viewer._id}
                  className="bg-white border border-gray-50 shadow-md rounded-2xl transition-transform hover:scale-[1.02] flex items-center justify-between gap-3 px-4 py-3 text-left md:flex-col md:items-center md:text-center md:gap-4 md:p-5"
                >
                  {/* Avatar */}
                  {viewer.photo ? (
                    <Image
                      src={viewer.photo}
                      alt="viewer"
                      width={64}
                      height={64}
                      className="object-cover border-2 border-white shadow-sm rounded-full w-14 h-14 md:w-16 md:h-16"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-rose-100 to-amber-400 border-2 border-white shadow-sm rounded-full w-14 h-14 md:w-16 md:h-16" />
                  )}

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-0.5 md:w-full md:items-center md:text-center md:gap-1">
                    <div className="flex items-center gap-1 md:justify-center">
                      <span className="text-green-700 text-sm md:text-base font-semibold font-Inter truncate">
                        {viewer.fullName}
                      </span>
                      {viewer.isVerified && (
                        <span className="text-green-600">
                          <CircleCheckBig size={16} />
                        </span>
                      )}
                    </div>

                    <div className="text-stone-500 text-xs font-Inter flex items-center gap-1 md:justify-center">
                      <MapPin size={13} /> {viewer.city || "Location N/A"}
                    </div>

                    <div className="text-red-900 font-medium font-Inter text-[11px] text-left md:text-[10px] md:text-center md:mt-1">
                      Viewed {getTimeAgo(viewer.viewedAt)}{" "}
                      {/* Manual Time logic */}
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <button
                    className="cursor-pointer bg-green-600 text-white font-semibold hover:bg-green-700 transition px-5 py-2 rounded-full text-sm whitespace-nowrap md:w-full md:py-2 md:rounded-3xl md:text-sm"
                    onClick={() =>
                      (window.location.href = `/profile/${viewer._id}`)
                    }
                  >
                    View
                  </button>
                </div>
              ))}
            </div>

            {recentViewers.length === 0 && (
              <div className="text-center py-10 text-stone-400 font-Inter italic">
                No recent profile viewers to show.
              </div>
            )}
          </div>
        </div>
      ) : (
<div className="p-6 mx-4 sm:mx-0 bg-gradient-to-br from-[#1F5C3A] to-[#41C27A] rounded-2xl shadow-lg flex flex-col items-center text-center gap-4 max-w-[500px]">

  {/* Icon */}
  <div className="w-12 h-12 text-[#6E2F2F] bg-gold-gradient rounded-full flex items-center justify-center text-xl shadow-inner">
    <TrendingUp />
  </div>

  {/* Title */}
  <div className="text-white text-xl font-semibold font-playfair">
    View Analytics Locked
  </div>

  {/* Description */}
  <p className="text-white/80 text-sm font-inter">
    Upgrade to Premium to see your profile performance including total weekly
    views, daily average views, profile trend, and recent viewers.
  </p>

  {/* Feature List (Exact Analytics Data) */}
  <ul className="w-full flex flex-col gap-2">
    {[
      "Total Views This Week",
      "Average Daily Views",
      "Profile Views Trend (Last 7 Days)",
      "Recent Profile Viewers",
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

  {/* Button */}
  <Link href="/profile/membership" className="w-full">
    <button className="w-full py-3 cursor-pointer bg-gold-gradient rounded-full text-red-900 font-bold text-base hover:brightness-110 transition">
      Unlock Full Analytics
    </button>
  </Link>
</div>

      )}
    </div>
  );
};

export default Page;
