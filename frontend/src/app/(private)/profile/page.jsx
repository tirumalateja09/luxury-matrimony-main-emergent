// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   ShieldCheck,
//   CreditCard,
//   Settings,
//   Headphones,
//   Heart,
//   LogOut,
//   ChevronRight,
//   Loader2,
// } from "lucide-react";
// import Link from "next/link";
// import ProfileModal from "@/app/component/ProfileModal";
// import { api } from "@/lib/apiClient";
// import Image from "next/image";
// import { useRouter } from "next/navigation";

// const ProfileDashboard = () => {
//   const [userData, setUserData] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // 1. Fetch own profile data on mount
//   useEffect(() => {
//     const fetchMyProfile = async () => {
//       try {
//         setLoading(true);
//         // This API returns { profile, partnerPreferences }
//         const response = await api.get("/profile/me", "private");
//         console.log(response.data);
//         if (response.success) {
//           setUserData(response.data);
//         }
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMyProfile();
//   }, []);

//   const menuItems = [
//     {
//       icon: <ShieldCheck size={20} className="text-green-600" />,
//       label: "Verification Status",
//       color: "text-stone-800",
//       href: "/profile/verification",
//     },
//     {
//       icon: <CreditCard size={20} className="text-green-600" />,
//       label: "Membership / Subscription",
//       color: "text-stone-800",
//       href: "/profile/membership",
//     },
//     // {
//     //   icon: <Settings size={20} className="text-green-600" />,
//     //   label: "Account & Settings",
//     //   color: "text-stone-800",
//     //   href: "/profile/settings",
//     // },
//     // {
//     //   icon: <Headphones size={20} className="text-green-600" />,
//     //   label: "Help & Support",
//     //   color: "text-stone-800",
//     //   href: "/profile/support",
//     // },
//     // {
//     //   icon: <Heart size={20} className="text-green-600" />,
//     //   label: "Success Stories",
//     //   color: "text-stone-800",
//     //   href: "/profile/success-stories",
//     // },
//     {
//       icon: <LogOut size={20} className="text-red-600" />,
//       label: "Logout",
//       color: "text-red-600",
//       isLogout: true,
//       href: "/login",
//     },
//   ];

//   const handleLogout = () => {
//     localStorage.removeItem("rvr_auth_data");
//     router.push("/login");
//   };

//   if (loading) {
//     return (
//       <div className="w-full h-64 flex items-center justify-center">
//         <Loader2 className="animate-spin text-amber-600" size={40} />
//       </div>
//     );
//   }

//   const profile = userData?.profile || {};
//   const mainPhoto =
//     profile.profilePhotos?.find((p) => p.isMain)?.url ||
//     profile.profilePhotos?.[0]?.url ||
//     "/private/home/user3.png";

//   return (
//     <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
//       {/* 2. Global Profile Modal */}
//       <ProfileModal
//         isOpen={isModalOpen}
//         setIsOpen={setIsModalOpen}
//         user={userData}
//         ismatch={false}
//       />

//       {/* Top Profile Header Card */}
//       <div className="w-full bg-orange-100/50 rounded-[24px] p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-orange-100">
//         <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
//           <div className="relative w-24 h-24 rounded-full border-2 border-amber-300 overflow-hidden">
//             <Image
//               src={mainPhoto}
//               alt="Profile"
//               fill
//               className="object-cover shadow-sm"
//               sizes="96px"
//               priority={false}
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <h2 className="text-stone-800 text-3xl font-bold font-playfair">
//               {profile.fullName || "User"}
//             </h2>
//             <p className="text-stone-500 text-sm font-inter">
//               ID: {profile._id?.slice(-8).toUpperCase()}
//             </p>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//           {/* 3. View My Profile Trigger */}
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="cursor-pointer flex-1 md:w-48 px-6 py-3 bg-gradient-to-br from-amber-300 via-amber-200 to-orange-400 rounded-full shadow-md text-stone-800 font-semibold text-sm hover:opacity-90 transition-all"
//           >
//             View My Profile
//           </button>

//           <Link href="/profile/edit" className="flex-1">
//             <button className="cursor-pointer w-full md:w-48 px-6 py-3 bg-white border border-stone-800 rounded-full shadow-sm text-red-900 font-semibold text-sm hover:bg-stone-50 transition-all">
//               Edit Profile
//             </button>
//           </Link>
//         </div>
//       </div>

//       {/* Menu List Container */}
//       <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//         {menuItems.map((item, index) =>
//           item.isLogout ? (
//             <button
//               key={item.label}
//               type="button"
//               onClick={handleLogout}
//               className={`w-full flex justify-between items-center px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? "border-b border-gray-200" : ""}`}
//             >
//               <div className="flex items-center gap-4">
//                 {item.icon}
//                 <span
//                   className={`text-base font-medium ${item.color} font-inter`}
//                 >
//                   {item.label}
//                 </span>
//               </div>
//               <ChevronRight size={18} className="text-red-500" />
//             </button>
//           ) : (
//             <Link href={item.href} key={item.label}>
//               <div
//                 className={`flex justify-between items-center px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? "border-b border-gray-200" : ""}`}
//               >
//                 <div className="flex items-center gap-4">
//                   {item.icon}
//                   <span
//                     className={`text-base font-medium ${item.color} font-inter`}
//                   >
//                     {item.label}
//                   </span>
//                 </div>
//                 <ChevronRight size={18} className="text-green-600" />
//               </div>
//             </Link>
//           )
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfileDashboard;

"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  LogOut,
  ChevronRight,
  Loader2,
  Sparkles,
  Eye,
  Heart,
  TrendingUp,
  Lock,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileHeaderText from "@/app/component/MobileHeaderText";
import toast from "react-hot-toast";

const ProfileDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/profile/me", "private");
        if (response.success) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, []);

  const menuItems = [
    {
      icon: <ShieldCheck size={20} className="text-green-600" />,
      label: "Verification Status",
      color: "text-stone-800",
      href: "/profile/verification",
    },
    {
      icon: <CreditCard size={20} className="text-green-600" />,
      label: "Membership / Subscription",
      color: "text-stone-800",
      href: "/profile/membership",
    },
        {
      icon: <Settings size={20} className="text-green-600" />,
      label: "Settings",
      color: "text-stone-800",
      isLogout: false,
      href: "/profile/settings",
    },
    {
      icon: <LogOut size={20} className="text-red-600" />,
      label: "Logout",
      color: "text-red-600",
      isLogout: true,
      href: "/login",
    },

  ];

  const handleLogout = () => {
    localStorage.removeItem("rvr_auth_data");
    router.push("/login");
  };

  const handleViewMyProfile = () => {
    const selfUserId =
      userData?.profile?.userId?._id ||
      userData?.profile?.userId ||
      userData?.userId?._id ||
      userData?.userId;

    if (!selfUserId) {
      toast.error("Unable to open your profile right now.");
      return;
    }

    router.push(`/user/${selfUserId}?self=1`);
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" size={40} />
      </div>
    );
  }

  const profile = userData?.profile || {};
  const isFreeMembership = profile?.membershipType === "Free";
  const mainPhoto =
    profile.profilePhotos?.find((p) => p.isMain)?.url ||
    profile.profilePhotos?.[0]?.url ||
    "/home/user.png";

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6  mb-20 sm:mb-0">
      <MobileHeaderText>
        <div className="flex items-center gap-2">Profile</div>
      </MobileHeaderText>

      {/* Top Profile Header Card */}
      <div className="w-full bg-[#FFF9F3] rounded-[32px] p-3 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-orange-50">
        <div className="flex w-full flex-row items-center gap-5  text-left">
          <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
            <Image
              src={mainPhoto}
              alt="Profile"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-stone-800 text-3xl font-bold">
              {profile.fullName || "Rajesh K."}
            </h2>
            <p className="text-stone-500 text-sm">
              ID: {profile._id?.slice(-8).toUpperCase() || "UDGKSC1566"}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleViewMyProfile}
            className="flex-1 cursor-pointer md:w-48 px-6 py-3 bg-gold-gradient rounded-full shadow-sm text-stone-800 font-bold text-sm"
          >
            View My Profile
          </button>

          <Link href="/profile/edit" className="flex-1">
            <button className="w-full cursor-pointer md:w-48 px-6 py-3 bg-white border border-stone-800 rounded-full shadow-sm text-stone-800 font-bold text-sm">
              Edit Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Premium Tools Section - MOBILE ONLY (as requested) */}
      <div className="flex flex-col gap-4 md:hidden p-4 md:p-0">
        <h3 className="text-xl font-bold text-stone-800 px-1">Premium Tools</h3>

        {/* Profile Boost Card */}
        <Link href="/boostprofile">
          <div className="bg-gold-gradient p-5 rounded-2xl flex items-center justify-between shadow-md text-stone-900">
            <div className="flex items-center gap-4">
              <div className="bg-[#429466] p-2 rounded-full">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <p className="font-bold text-lg">Profile Boost</p>
                <p className="text-sm opacity-80">Get 3x more visibility</p>
              </div>
            </div>
            <ChevronRight size={20} />
          </div>
        </Link>

        {/* Other Premium Cards */}
        {[
          {
            icon: <Eye className="text-[#429466]" />,
            label: "See Who Viewed You",
            sub: "24 people this week",
            url: "/views",
            isViewsCard: true,
          },
          {
            icon: <Heart className="text-[#429466]" />,
            label: "Priority Matches",
            sub: "Get matched first",
            url: "/prioritymatches",
          },
          {
            icon: <TrendingUp className="text-[#429466]" />,
            label: "Profile Analytics",
            sub: "Track your visibility",
            url: "/analytics",
          },
        ].map((item, i) => {
          const isLockedViewsCard = item.isViewsCard && isFreeMembership;

          const cardContent = (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between shadow-sm border ${
                isLockedViewsCard
                  ? "bg-[#F8F8F8] border-gray-200"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-[#F3DED3]  p-3 rounded-full">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-stone-800">{item.label}</p>
                  <p className="text-xs text-stone-400">
                    {isLockedViewsCard
                      ? "Upgrade to a Premium membership"
                      : item.sub}
                  </p>
                </div>
              </div>
              {isLockedViewsCard ? (
                <div className="w-7 h-7 rounded-md  flex items-center justify-center">
                  <Lock size={14} className="text-red-500" />
                </div>
              ) : (
                <ChevronRight size={18} className="text-green-600" />
              )}
            </div>
          );

          if (isLockedViewsCard) {
            return (
              <div key={i} className="cursor-not-allowed">
                {cardContent}
              </div>
            );
          }

          return (
            <Link href={item.url} key={i}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Existing Menu List Container */}
      <div className="w-full bg-white rounded-2xl p-4 md:p-0 shadow-sm border border-gray-100 overflow-hidden mb-10">
        {menuItems.map((item, index) =>
          item.isLogout ? (
            <button
              key={item.label}
              type="button"
              onClick={handleLogout}
              className={`w-full flex cursor-pointer justify-between items-center px-6 py-5 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className={`text-base font-semibold ${item.color}`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ) : (
            <Link href={item.href} key={item.label}>
              <div
                className={`flex justify-between items-center px-6 py-5 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className={`text-base font-semibold ${item.color}`}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={18} className="text-green-600" />
              </div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard;
