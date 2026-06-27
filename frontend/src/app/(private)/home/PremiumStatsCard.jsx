// import { CheckCircle, Crown } from 'lucide-react';
// import React from 'react'

// const PremiumStatsCard = () => {

//   return (
//     <div className="bg-[#fff6ec] border border-[#E3B450]  lg:border-[#F2E4D4] rounded-2xl p-4 lg:p-6 flex flex-wrap lg:flex-nowrap justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)] p-3 rounded-full">
//                 <Crown size={28} className="text-[#6f4e28]" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold font-playfair text-[#2a1d1d]">
//                   You&apos;re a Premium Member
//                 </h2>
//                 <p className="text-sm text-[#352a2a] flex items-center gap-1">
//                   <CheckCircle size={14} className="text-[#352a2a]" /> Fully
//                   Verified Profile
//                 </p>
//               </div>
//             </div>
//             <div className="hidden lg:block h-14 w-px bg-[#e3ded5]" />
//             <div className="flex gap-4 justify-center lg:justify-start w-full lg:w-auto lg:gap-16 border-t border-gray-200 lg:border-none mt-2 pt-2 lg:pt-0 lg:mt-0 mr-10">
//               <StatBox number="48" label="New Matches" />
//               <StatBox number="12" label="Interests" />
//               <StatBox number="5" label="Messages" />
//             </div>
//           </div>
//   )
// }

// export default PremiumStatsCard


// // Small helper components
// function StatBox({ number, label }) {
//   return (
//     <div className="text-center">
//       <p className="text-3xl font-bold text-[#2a1d1d]">{number}</p>
//       <p className="text-xs text-[#6f4e28] mt-1">{label}</p>
//     </div>
//   );
// }



"use client";

import { CheckCircle, Crown, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from "@/lib/apiClient";

const PremiumStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // API call to get dashboard summary
        const response = await api.get('/profile/dashboard-summary', 'private');
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="bg-[#fff6ec] border border-[#E3B450] rounded-2xl p-6 flex justify-center items-center h-28">
        <Loader2 className="animate-spin text-[#C79A3A]" size={32} />
      </div>
    );
  }

  // 2. Hide for Free Users
  if (!stats || stats.membershipType === "Free") {
    return null;
  }

  // Data mapping from API
  const membershipType = stats.membershipType || "Premium";
  const isAdminApproved = stats.adminStatus === "approved";

  return (
    <div className="bg-[#fff6ec] border border-[#E3B450] lg:border-[#F2E4D4] rounded-2xl p-4 lg:p-6 flex flex-wrap lg:flex-nowrap justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)] p-3 rounded-full">
          <Crown size={28} className="text-[#6f4e28]" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-playfair text-[#2a1d1d]">
            You&apos;re a {membershipType} Member
          </h2>
          <p className="text-sm text-[#352a2a] flex items-center gap-1">
            <CheckCircle size={14} className={isAdminApproved ? "text-green-600" : "text-[#352a2a]"} /> 
            {isAdminApproved ? "Fully Verified Profile" : "Verification Pending"}
          </p>
        </div>
      </div>
      <div className="hidden lg:block h-14 w-px bg-[#e3ded5]" />
      <div className="flex gap-4 justify-center lg:justify-start w-full lg:w-auto lg:gap-16 border-t border-gray-200 lg:border-none mt-2 pt-2 lg:pt-0 lg:mt-0 mr-10">
        <StatBox number={stats.newMatchesCount || 0} label="New Matches" />
        <StatBox number={stats.interestsReceivedCount || 0} label="Interests" />
        <StatBox number={stats.messagesCount || 0} label="Messages" />
      </div>
    </div>
  );
};

export default PremiumStatsCard;

// Small helper components
function StatBox({ number, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-[#2a1d1d]">{number}</p>
      <p className="text-xs text-[#6f4e28] mt-1">{label}</p>
    </div>
  );
}