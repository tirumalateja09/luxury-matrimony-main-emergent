"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { Crown, CheckCircle, Shield, User } from "lucide-react";
import Image from "next/image";

export const getCreatedByText = (profileCreatedFor) => {
  if (!profileCreatedFor) return "Self";

  const mapping = {
    Myself: "Self",
    Daughter: "Parents",
    Son: "Parents",
    Sister: "Family",
    Brother: "Family",
    Relative: "Relative",
    Friend: "Friend",
  };

  return mapping[profileCreatedFor] || "Self";
};

const Page = () => {
  const [userData, setUserData] = useState(null);
  // Stages: 'fetching' -> 'waiting' -> 'showCard' -> 'showText' -> 'redirecting'
  const [stage, setStage] = useState("fetching");
  const router = useRouter();

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await api.get("/profile/me", "private");

        // Based on your JSON, the actual profile is in response.data.profile
        if (response.success && response.data?.profile) {
          setUserData(response.data.profile);

          // Data fetched. Start the sequence.
          setStage("waiting");

          // 1. Wait 2 seconds before showing the card
          setTimeout(() => {
            setStage("showCard");
          }, 2000);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Handle error (optional: redirect to login or error page)
      }
    };
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (stage === "showCard") {
      const timer = setTimeout(() => {
        setStage("showText");
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (stage === "showText") {
      const timer = setTimeout(() => {
        const isSubscribed = localStorage.getItem("subscription") === "true";
        const storedRedirect = localStorage.getItem("postAuthRedirect");

        if (isSubscribed) {
          router.push("/profile/membership");
        } else {
          if (storedRedirect) {
            localStorage.removeItem("postAuthRedirect");
            router.replace(storedRedirect);
            return;
          }
          router.replace("/home");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [stage, router]);

  // Loading view while fetching or in the initial 2s wait
  if (stage === "fetching" || stage === "waiting") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-t from-white to-[#F3DED3]"></div>
    );
  }

  // If no data found after logic runs
  if (!userData) return null;

  // Destructuring Data based on your JSON structure
  const {
    fullName = "User",
    dob,
    height,
    city = "N/A",
    degree = "",
    highestEducation = "N/A",
    annualIncome = "N/A",
    profileCreatedFor = "Self",
    language = "English",
    religion = "N/A",
    profilePhotos = [],
    membershipType = "Free",
    adminStatus = "pending",
  } = userData;

  // Derived Logic
  const age = dob
    ? new Date().getFullYear() - new Date(dob).getFullYear()
    : "N/A";

  const heightInFeet = height
    ? `${Math.floor(height / 30.48)}'${Math.round((height % 30.48) / 2.54)}"`
    : "N/A";

  const mainPhoto =
    profilePhotos.find((p) => p.isMain)?.url ||
    profilePhotos[0]?.url ||
    "/placeholder-user.png";

  const isPremium = membershipType === "Gold" || membershipType === "Premium";
  const isVerified = adminStatus === "approved";

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-t from-white to-[#F3DED3] p-4 transition-all duration-500 z-1000">
      {/* CARD SECTION - Visible when stage is showCard or showText */}
      <div
        className={`bg-white w-full max-w-md rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-700 transform 
        ${stage === "showCard" || stage === "showText" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* 1. Image Section */}
        <div className="relative h-[400px] w-full p-2">
          {mainPhoto && mainPhoto !== "/placeholder-user.png" ? (
            <Image
              width={400}
              height={500}
              src={mainPhoto}
              alt={fullName}
              className="w-full h-full object-cover rounded-[1.8rem]"
            />
          ) : (
            <div className="w-full h-full bg-[#FAEDEB] rounded-[1.8rem] flex items-center justify-center">
              <User size={120} className="text-[#E7B8A5]" strokeWidth={1} />
            </div>
          )}

          {/* Premium Tag */}
          {isPremium && (
            <div className="absolute top-5 left-5">
              <span className="bg-[#368157] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                <Crown
                  size={12}
                  className="text-[#F6DC7F]"
                  fill="url(#gold-gradient)"
                />
                <span className="text-[10px] font-bold text-transparent bg-clip-text bg-[linear-gradient(135deg,#E3B450_0%,#F6DC7F_50%,#CAA043_100%)]">
                  {membershipType.toUpperCase()}
                </span>
              </span>
            </div>
          )}

          {/* Verified Badges */}
          {isVerified && (
            <div className="absolute top-5 right-5 flex gap-2">
              <CheckCircle
                size={22}
                className="text-[#6E2F2F] bg-[linear-gradient(135deg,#E3B450_0%,#F6DC7F_50%,#CAA043_100%)] rounded-full p-1"
              />
              <Shield
                size={22}
                className="text-[#6E2F2F] bg-[linear-gradient(135deg,#E3B450_0%,#F6DE86_52%,#C79A3A_100%)] rounded-full p-1"
              />
            </div>
          )}
        </div>

        {/* 2. User Basic Info */}
        <div className="px-6 py-3">
          <h3 className="text-xl font-bold text-[#2A1D1D] font-playfair">
            {fullName}, {age}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {heightInFeet} • {city} • {religion}, {language}
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-1">
            {highestEducation} {degree && `(${degree})`} • Earns {annualIncome}
          </p>
        </div>

        {/* 3. Managed By Tag */}
        <div className="mx-6 py-2 mb-6 bg-[#F7EFE2] rounded-md text-center">
          <p className="text-[10px] font-bold text-[#2A1D1D]">
            Managed by: {getCreatedByText(profileCreatedFor)}
          </p>
        </div>

        {/* Gold Gradient Definition */}
        <svg width="0" height="0">
          <linearGradient
            id="gold-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#E3B450" />
            <stop offset="50%" stopColor="#F6DC7F" />
            <stop offset="100%" stopColor="#CAA043" />
          </linearGradient>
        </svg>
      </div>

      {/* TEXT SECTION - Visible only when stage is showText */}
      <div
        className={`mt-8 text-center transition-all duration-700 transform ${stage === "showText" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <h2 className=" font-inter font-medium text-[#2A1D1D]">
          Journey to find the one Begins here..
        </h2>
        <h3 className=" font-playfair text-[#429466] font-semibold text-xl">
          All The Best..
        </h3>
      </div>
    </div>
  );
};

export default Page;
