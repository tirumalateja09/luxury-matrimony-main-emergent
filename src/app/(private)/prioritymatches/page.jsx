"use client";

import MobileHeaderText from "@/app/component/MobileHeaderText";
import { api } from "@/lib/apiClient";
import { Check, Heart, Loader2, MapPin, User } from "lucide-react";
import { LuSparkles } from "react-icons/lu";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const [premiumProfiles, setPremiumProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPriorityProfiles = async () => {
      try {
        setLoading(true);
        const premiumRes = await api.post(
          "/search/advanced",
          { filterType: "premium_only", limit: 10 },
          "private",
        );

        if (premiumRes.success) {
          setPremiumProfiles(premiumRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching priority profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityProfiles();
  }, []);

  const previewMatches = useMemo(() => {
    if (premiumProfiles.length > 0) {
      return premiumProfiles.slice(0, 3).map((user) => {
        const age = user?.dob
          ? new Date().getFullYear() - new Date(user.dob).getFullYear()
          : "";
        const nameAge = `${user?.fullName || "User"}${age ? `, ${age}` : ""}`;
        const mainPhoto =
          user?.profilePhotos?.find((photo) => photo?.isMain)?.url ||
          user?.profilePhotos?.[0]?.url
        return {
          userId: user?.userId || user?._id,
          name: nameAge,
          role: user?.profession || user?.highestEducation || "Professional",
          loc: [user?.city, user?.state].filter(Boolean).join(", ") || "India",
          url: mainPhoto,
        };
      });
    }

    return [
      {
        userId: null,
        name: "Anjali Kumar, 26",
        role: "Software Engineer",
        loc: "Bangalore",
        url: "/private/home/user1.jpg",
      },
      {
        userId: null,
        name: "Deepika Reddy, 27",
        role: "Doctor",
        loc: "Chennai",
        url: "/private/home/user3.png",
      },
      {
        userId: null,
        name: "Shalini Iyer, 25",
        role: "Teacher",
        loc: "Kochi",
        url: "/private/home/user2.png",
      },
    ];
  }, [premiumProfiles]);

  return (
    <div className="max-w-7xl xl:px-16 w-full mx-auto flex flex-col lg:flex-row justify-center items-start gap-8 lg:gap-12 mb-40 sm:mb-0">
      <MobileHeaderText>
        <div className="flex items-center gap-2">
          <Heart /> Priority Matches
        </div>
      </MobileHeaderText>
      <div className="w-full flex flex-col justify-start items-start gap-8 px-4 sm:px-0">
        <div className="w-full p-6 bg-gradient-to-r from-[#E7B8A5] to-[#FFEAE1] rounded-2xl shadow-sm flex flex-col justify-start items-center gap-1">
          <div className="max-w-md flex flex-col justify-start items-center gap-2.5">
            <div className="text-center text-red-900 text-2xl font-semibold font-['Playfair_Display']">
              Increase Your Visibility
            </div>
            <div className="text-center text-stone-800 text-sm font-normal font-['Inter']">
              Boost your profile to appear higher in search results and get more
              responses from compatible matches.
            </div>
          </div>
        </div>

        <div className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
          How Priority Works
        </div>

        <div className="w-full flex flex-col justify-start items-start gap-6">
          {[
            {
              n: "1",
              t: "Higher Profile Ranking",
              d: "Your profile is ranked higher in search results and recommendations",
            },
            {
              n: "2",
              t: "Shown to Best Matches",
              d: "Displayed earlier to profiles that match your preferences perfectly",
            },
            {
              n: "3",
              t: "Better Response Chances",
              d: "Increased likelihood of receiving interests and messages",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="w-full flex justify-start items-start gap-4"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-[#429466] rounded-full shadow-md flex justify-center items-center">
                <div className="text-white text-2xl font-semibold font-['Playfair_Display']">
                  {step.n}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-start items-start gap-1">
                <div className="text-[#429466] text-lg font-semibold font-['Inter']">
                  {step.t}
                </div>
                <div className="text-stone-500 text-base font-normal font-['Inter']">
                  {step.d}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full p-4 bg-[#429466]/20 rounded-2xl border border-[#429466] flex justify-start items-center gap-4">
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg">
            <Check className="text-[#429466]" />
          </div>
          <div className="flex-1 flex flex-col justify-start items-start">
            <div className="text-[#429466] text-lg md:text-xl font-semibold font-['Playfair_Display']">
              Priority Matches Active
            </div>
            <div className="text-stone-500 text-sm md:text-base font-normal font-['Inter']">
              You&apos;re getting matched first with compatible profiles
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 xl:w-[520px] flex flex-col justify-start items-start gap-6  px-4 sm:px-0">
        <div className="text-stone-800 text-2xl font-semibold font-['Playfair_Display']">
          Priority Match Preview
        </div>

        {loading ? (
          <div className="w-full py-16 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#429466]" size={32} />
          </div>
        ) : (
          previewMatches.map((match, idx) => (
            <button
              key={`${match.userId || "fallback"}-${idx}`}
              type="button"
              disabled={!match.userId}
              onClick={() => router.push(`/user/${match.userId}`)}
              className="w-full cursor-pointer text-left relative bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 disabled:cursor-default"
            >
              <div className="w-full h-8 bg-gradient-to-r from-amber-300 via-amber-200 to-orange-400 flex justify-center items-center gap-1.5">
                <LuSparkles className=" text-[#6E2F2F]" />
                <div className="text-red-900 text-[10px] font-bold font-['Inter'] tracking-widest uppercase">
                  Priority Match
                </div>
              </div>

              <div className="p-5 flex items-center gap-4">
                {match.url ? (
                  <Image
                    className="w-14 h-14 rounded-full object-cover"
                    src={match.url}
                    alt={match.name}
                    width={56}
                    height={56}
                  />
                ) : (
                  <div className="w-14 flex justify-center items-center h-14 flex-shrink-0 bg-gradient-to-br from-rose-100 to-amber-400 rounded-full" ><User className="text-gray-500 " width="32" /></div>
                )}
                <div className="flex flex-col">
                  <div className="text-[#429466] text-lg font-semibold font-['Inter']">
                    {match.name}
                  </div>
                  <div className="text-stone-500 text-xs font-normal font-['Inter']">
                    {match.role}
                  </div>
                  <div className="flex items-center gap-1 text-stone-500 text-xs mt-1">
                    <MapPin size={12} />
                    {match.loc}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
