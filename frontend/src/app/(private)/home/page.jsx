"use client";
import AutoCarousel from "@/app/component/Home/AutoCarousel";
import MobileHeader from "@/app/component/MobileHeader";
import ProfileCard from "@/app/component/Private/Home/ProfileCard";
import {
  Sparkles,
  Loader2,
} from "lucide-react";
import SuccessStories from "./SuccessStories";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FIndMatch from "./FIndMatch";
import HomeCarousel from "./HomeCarousel";
export const userData = [
  {
    id: 1,
    name: "Priya Ramachandran",
    age: 26,
    height: "5'4\"",
    city: "Chennai",
    community: "Iyer Brahmin",
    education: "MBA, Working in IT",
    income: "8-15 Lacs p.a.",
    managedBy: "Self",
    image: "/private/home/user1.jpg",
    isPremium: true,
  },
  {
    id: 2,
    name: "Aishwarya K.",
    age: 25,
    height: "5'3\"",
    city: "Chennai",
    community: "Iyer Brahmin",
    education: "MBA, Working in IT",
    income: "8-15 Lacs p.a.",
    managedBy: "Self",
    image: "/private/home/user2.png",
    isPremium: true,
  },
  {
    id: 3,
    name: "Divya M.",
    age: 27,
    height: "5'6\"",
    city: "Bangalore",
    community: "Naidu",
    education: "B.Tech, Software Engineer",
    income: "10-18 Lacs p.a.",
    managedBy: "Self",
    image: "/private/home/user3.png",
    isPremium: true,
  },
];

const Page = () => {
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [premiumProfiles, setPremiumProfiles] = useState([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const router = useRouter();

  useEffect(() => {
    sessionStorage.removeItem("registerData");
    localStorage.removeItem("registerData");
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Recently Added Profiles (Limit 10)
        const recentRes = await api.get(
          "/search/just-joined-preview?limit=10",
          "private",
        );
        if (recentRes.success) {
          setRecentlyAdded(recentRes.data);
        }

        // 2. Fetch Premium Profiles for you (filterType: premium_only, limit: 10)
        const premiumRes = await api.post(
          "/search/advanced",
          { filterType: "premium_only", limit: 10 },
          "private",
        );
        if (premiumRes.success) {
          setPremiumProfiles(premiumRes.data);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
    handleMyData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [recentRes, premiumRes, suggestedRes] = await Promise.all([
        api.get("/search/just-joined-preview?limit=10", "private"),
        api.post("/search/advanced", { filterType: "premium_only", limit: 10 }, "private"),
        api.get("/search/suggested", "private"),
      ]);
      if (recentRes.success) setRecentlyAdded(recentRes.data);
      if (premiumRes.success) setPremiumProfiles(premiumRes.data);
      if (suggestedRes.success) setSuggestedProfiles(suggestedRes.data || []);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMyData = async () => {
    const res = await api.get(`/profile/summary`, "private");
    if (res.success) {
      setSummary(res.data);
    }
  };
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-green-700" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto  flex flex-col gap-3 lg:gap-8 font-inter mb-40 sm:mb-0">
      <MobileHeader isRead={true} />

      {(summary?.adminStatus === "pending" ||
        summary?.adminStatus === "rejected") && (
        <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center gap-2 sm:gap-3">
          <div
            className="text-center text-stone-800 font-semibold 
      text-base sm:text-lg md:text-xl 
      font-['Playfair_Display']"
          >
            {summary?.adminStatus === "rejected"
              ? "Profile Rejected – Please Update Your Profile"
              : "Profile Under Verification"}
          </div>

          <Image
            src="/home/verify.png"
            alt="Verification"
            width={112}
            height={96}
            className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-24 object-contain"
            priority
          />

          <div
            className="text-center text-stone-500 font-normal 
      text-xs sm:text-sm md:text-base 
      font-['Inter'] leading-relaxed"
          >
            {summary?.adminStatus === "rejected"
              ? "Your profile was rejected due to incomplete or incorrect information. Please update your profile and resubmit for verification."
              : "Your profile is being reviewed to ensure authenticity. You can complete your profile meanwhile."}
          </div>
        </div>
      )}<div className="px-4 sm:px-0">

    
   <HomeCarousel />  </div>
      <div>
        <div className="rounded-3xl border lg:border-none border-[#E3B450] py-5 lg:py-0 flex flex-col gap-8 px-4 lg:px-0">
          {/*  Suggested For You Section (Gold/Premium) */}
          {suggestedProfiles.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl lg:text-2xl font-playfair font-semibold lg:font-bold text-[#2A1D1D] lg:text-[#6e2f2f]">
                    Suggested For You
                  </h2>
                  <p className="text-sm text-[#7b6a64]">Based on your preferences & compatibility</p>
                </div>
                <Link href="/matches?filterType=topmatch">
                  <button className="bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)] text-[#2A1D1D] font-semibold cursor-pointer flex items-center gap-2 px-3 lg:px-6 py-1.5 lg:py-2.5 rounded-full transition-colors">
                    <Sparkles size={16} /> View All
                  </button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {suggestedProfiles.map((user, id) => (
                  <div key={id}>
                    <ProfileCard
                      summary={summary}
                      onPhotoClick={() => router.push(`/user/${user?.userId}`)}
                      user={user}
                      matchScore={user.matchScore}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/*  Premium Profiles Section */}
          <section>
            <div className="flex  justify-between items-center mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-playfair font-semibold lg:font-bold text-[#2A1D1D] lg:text-[#6e2f2f]">
                  Premium profiles for you
                </h2>
                <p className="text-sm text-[#7b6a64]">
                  Handpicked by our experts
                </p>
              </div>
              <Link href="/matches?filterType=premium_only">
                <button
                  className="bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)]
     text-[#2A1D1D] lg:text-[#4B2A24]
      font-semibold cursor-pointer flex items-center gap-2 px-3 lg:px-6 py-1.5 lg:py-2.5  rounded-full  transition-colors"
                >
                  <Sparkles size={16} /> View All
                </button>{" "}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {premiumProfiles.map((user, id) => (
                <div key={id}>
                  <ProfileCard
                    summary={summary}
                    onPhotoClick={() => router.push(`/user/${user?.userId}`)}
                    user={user}
                  />
                </div>
              ))}
            </div>
          </section>
          <SuccessStories />
        </div>
      </div>

      <FIndMatch />
    </div>
  );
};
export default Page;
