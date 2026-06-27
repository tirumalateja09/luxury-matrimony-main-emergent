"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import {
  Crown,
  CheckCircle,
  GraduationCap,
  MapPin,
  Heart,
  MessageCircle,
  Shield,
  MessageSquare,
  Check,
  X,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const sendInterest = async (receiverId, fetchData) => {
  
  try {
    const interestRes = await api.post(
      "/interest/send",
      { receiverId: receiverId },
      "private",
    );

    // agar tumhara api wrapper direct data return karta hai
    if (interestRes.success !== undefined) {
      toast.success(interestRes.message);
      fetchData && fetchData();
      return true;
    }
    // agar axios jaisa response hai (data ke andar)
    else if (interestRes.data) {
      toast.success(interestRes.data.message);
      return true;
    }
  } catch (error) {
    // console.error("Error in interest send", error);

    // backend message show karne ke liye
    if (error?.message) {
      toast.error(error.message);
    } else {
      toast.error("Something went wrong");
    }
  }

  return false;
};

const handleRecieved = async (interestId, status) => {
  try {
    const interestRes = await api.put(
      `/interest/respond/${interestId}`,
      { status },
      "private",
    );

    // agar tumhara api wrapper direct data return karta hai
    if (interestRes.success !== undefined) {
      toast.success(interestRes.message);
    }
    // agar axios jaisa response hai (data ke andar)
    else if (interestRes.data) {
      toast.success(interestRes.data.message);
    }
  } catch (error) {
    // console.error("Error in interest send", error);

    // backend message show karne ke liye
    if (error?.message) {
      toast.error(error.message);
    } else {
      toast.error("Something went wrong");
    }
  }
};

const toggleShortlist = async (receiverId, action, fetchData) => {
  try {
    const res = await api.post(
      "/shortlist/toggle",
      {
        targetId: receiverId,
        action, // directly pass "add" or "remove"
      },
      "private",
    );

    const message = res?.message || res?.data?.message || "Shortlist updated";
    fetchData && fetchData();
    toast.success(message);
    return true;
  } catch (error) {
    console.error("Error in shortlist update", error);

    toast.error(
      error?.message || "Something went wrong while updating shortlist",
    );
  }

  return false;
};

const sendChatRequest = async (receiverId, fetchData) => {
  try {
    // Shortlist toggle API call
    const chatRes = await api.post(
      "/chat/send",
      { receiverId: receiverId },
      "private",
    );

    // API wrapper logic matching your previous style
    if (chatRes.success !== undefined) {
      toast.success(chatRes.message);
      fetchData && fetchData();
      return true;
    } else if (chatRes.data) {
      toast.success(chatRes.data.message);
      return true;
    }
  } catch (error) {
    console.error("Error in chat request", error);

    // Error handling
    if (error?.message) {
      toast.error(error.message);
    } else {
      toast.error("Something went wrong");
    }
  }

  return false;
};

export default function ProfileCard({
  user,
  status,
  matchNotshow,
  onPhotoClick,
  summary,
  fetchData,
  matchScore,
}) {
  // Mapping logic according to your Mongoose Model
  if (!user) return null;

  const [hasInterest, setHasInterest] = useState(Boolean(user.isInterest));
  const [isShortlisted, setIsShortlisted] = useState(Boolean(user.isShortlist));
  const [hasChatRequest, setHasChatRequest] = useState(Boolean(user.isChatRequest));

  useEffect(() => {
    setHasInterest(Boolean(user.isInterest));
    setIsShortlisted(Boolean(user.isShortlist));
    setHasChatRequest(Boolean(user.isChatRequest));
  }, [user._id, user.isInterest, user.isShortlist, user.isChatRequest]);

  const {
    fullName = "User",
    dob,
    height,
    community = "",
    city = "",
    state = "",
    highestEducation = "",
    degree = "",
    profession = "",
    annualIncome = "",
    profileCreatedFor = "Self",
    profilePhotos = [],
    membershipType = "Free",
    adminStatus = "pending",
  } = user;

  // Age Calculation
  const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : "";

  // CM to Feet conversion
  const heightInFeet = height
    ? `${Math.floor(height / 30.48)}'${Math.round((height % 30.48) / 2.54)}"`
    : "";

  // Photo logic from profilePhotos array
  const mainPhoto =
    profilePhotos.find((p) => p.isMain)?.url ||
    profilePhotos[0]?.url ||
    "/home/user.png";

  const isPremium = membershipType === "Gold" || membershipType === "Premium";
  const isVerified = adminStatus === "approved";

  return (
    <div className="bg-white cursor-pointer rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* 1. Image Section */}
      <div onClick={onPhotoClick} className="relative h-[300px] w-full p-2">
        <Image
          width={300}
          height={400}
          src={mainPhoto}
          alt={fullName}
          className={`w-full h-full object-cover rounded-[1.8rem]`}
        />
         {/* ${summary?.subscription == "Free" ? "blur-md" : ""
            } */}
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

        {/* Verified Badges - Now based on adminStatus === 'approved' */}
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

        {/* Match Score Badge */}
        {matchScore > 0 && (
          <div className="absolute bottom-4 right-4 group">
            <div className="flex items-center gap-1 bg-[#2D2424]/80 backdrop-blur-sm rounded-full px-2.5 py-1 border border-[#E3B450]/40">
              <span className="text-[11px] font-bold text-[#E3B450]">{matchScore}%</span>
              <span className="text-[9px] text-white/70">match</span>
            </div>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-44 bg-[#2D2424] text-white text-[10px] rounded-xl p-3 shadow-xl z-10">
              <p className="font-bold text-[#E3B450] mb-1">Compatibility Score</p>
              <p>Calculated based on your religion, community, education, income, and lifestyle preferences.</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. User Basic Info */}
      <div className="px-6 py-3 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-[#2A1D1D] font-playfair min-h-[3.5rem] flex items-center mb-1">
          {fullName}{age ? `, ${age}` : ""}
        </h3>
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-xs text-gray-500 font-medium min-h-[1rem]">
            {heightInFeet ? heightInFeet + " • " : ""}
            {city ? city + " • " : ""}
            {community ? community : ""}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {highestEducation ? highestEducation : ""} {degree && `(${degree})`}{" "}
            {annualIncome ? "• Earns " + annualIncome : ""}
          </p>
        </div>
      </div>

      {/* 3. Managed By Tag */}
      <div className="mx-6 py-2 bg-[linear-gradient(99deg,rgba(227,180,80,0.30)_2.09%,rgba(246,220,127,0.30)_40.67%,rgba(202,160,67,0.30)_92.25%)] rounded-md text-center">
        <p className="text-[10px] font-bold text-[#2A1D1D]">
          Created For • {profileCreatedFor}
        </p>
      </div>

      {/* 4. Why this match? Section */}
      {/* {status !== "received" && !matchNotshow && (
        <div className="m-4 p-2 rounded-2xl border border-gray-50 bg-[#FFFFFF] shadow-sm">
          <p className="text-[11px] font-bold text-center text-[#7B6A64] mb-4">
            Why this match?
          </p>
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 border border-gray-100 rounded-xl bg-white shadow-sm">
                <Image
                  src="/private/home/community.svg"
                  width={18}
                  height={18}
                  alt="community"
                />
              </div>
              <p className="text-[9px] text-[#7B6A64] text-center leading-tight ">
                Same community
              </p>
            </div>

            <MatchIcon Icon={GraduationCap} label="Same education" />
            <MatchIcon Icon={MapPin} label="Preferred location" />
          </div>
        </div>
      )} */}

      {/* 5. Action Buttons */}
      <div className="px-4 pb-4">
        {renderButtons(
          status,
          status === "received" ? user?.interestId : user?.userId,
          summary,
          {
            ...user,
            isInterest: hasInterest,
            isShortlist: isShortlisted,
            isChatRequest: hasChatRequest,
          },
          fetchData,
          {
            setHasInterest,
            setIsShortlisted,
            setHasChatRequest,
          },
        )}
      </div>

      {/* Gold Gradient Definition */}
      <svg width="0" height="0">
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E3B450" />
          <stop offset="50%" stopColor="#F6DC7F" />
          <stop offset="100%" stopColor="#CAA043" />
        </linearGradient>
      </svg>
    </div>
  );
}

// Helper function to keep JSX clean
function renderButtons(
  status,
  receiverId,
  summary,
  user = {},
  fetchData,
  setters = {},
) {
  const {
    isInterest = false,
    isShortlist = false,
    isChatRequest = false,
    conversationId = null,
  } = user;
  const {
    setHasInterest = () => { },
    setIsShortlisted = () => { },
    setHasChatRequest = () => { },
  } = setters;

  if (status === "accepted") {
    return conversationId ? (
      <Link href={`/messages/${conversationId}`}>
        <button className="cursor-pointer h-10 w-full justify-center flex items-center px-2 gap-2 rounded-full border border-[#6E2F2F] text-[#6E2F2F] font-medium text-sm bg-white hover:bg-gray-50 transition">
          <MessageSquare size={18} className="text-[#3A3A3A]" />
          Start Conversation!
        </button>
      </Link>
    ) : (
      <button
        onClick={async () => {
          if (isChatRequest) return;
          const success = await sendChatRequest(receiverId, fetchData);
          if (success) setHasChatRequest(true);
        }}
        disabled={isChatRequest}
        className={`h-10 w-full flex items-center justify-center rounded-full border transition ${isChatRequest
          ? "border-[#D6D2CE] text-[#A8A29E] bg-[#F8F7F5] cursor-default"
          : "cursor-pointer text-[#3A3A3A] border-[#2A1D1D] bg-white hover:bg-gray-50"
          }`}
      >
        Chat Request{" "}
        <MessageCircle
          size={18}
          className={
            isChatRequest ? " ml-2 text-[#A8A29E]" : "text-[#3A3A3A] ml-2"
          }
        />
      </button>
    );
  }

  if (status === "received") {
    return (
      <div className="w-full font-inter text-sm justify-center flex items-center gap-8 py-2">
        <div className="flex items-center gap-3 group cursor-pointer">
          <button
            className="cursor-pointer w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md border border-[#6E2F2F]"
            onClick={() => handleRecieved(receiverId, "rejected")}
          >
            <X className="w-6 h-6 text-[#6E2F2F]" strokeWidth={2.5} />
          </button>
          <span className="text-stone-800 font-medium">Decline</span>
        </div>
        <div className="flex items-center gap-3 group cursor-pointer">
          <button
            className="cursor-pointer w-11 h-11 rounded-full bg-[#4A9369] flex items-center justify-center shadow-md"
            onClick={() => handleRecieved(receiverId, "accepted")}
          >
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </button>
          <span className="text-stone-800 font-medium">Accept</span>
        </div>
      </div>
    );
  }

  if (status === "shortlisted") {
    return (
      <div className="w-full flex items-center gap-3 py-2">
        <button
          className="cursor-pointer w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md border border-[#6E2F2F]"
          onClick={async () => {
            const success = await toggleShortlist(receiverId, "remove", fetchData);
            if (success) setIsShortlisted(false);
          }}
        >
          <X className="w-6 h-6 text-[#6E2F2F]" strokeWidth={2.5} />
        </button>

        <button
          onClick={async () => {
            if (isInterest) return;
            const success = await sendInterest(receiverId, fetchData);
            if (success) setHasInterest(true);
          }}
          disabled={isInterest}
          className={`flex-1 h-11 px-4 flex items-center justify-center rounded-full text-white font-semibold text-sm shadow-md transition ${isInterest
            ? "bg-[#4A9369] opacity-70 cursor-default"
            : "cursor-pointer bg-[#4A9369] hover:opacity-95"
            }`}
        >
          {isInterest ? "Interest Sent" : "Send Interest"}
        </button>
      </div>
    );
  }

  if (status === "sent") {
    return;
  }
  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        onClick={async () => {
          if (isInterest) return;
          const success = await sendInterest(receiverId, fetchData);
          if (success) setHasInterest(true);
        }}
        disabled={isInterest}
        className={`flex-1 h-10 px-4 flex items-center justify-center rounded-full text-[#4B2A24] font-semibold text-sm shadow-sm transition ${isInterest
          ? "bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)] opacity-70 cursor-default"
          : "cursor-pointer bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)] hover:opacity-95"
          }`}
      >
        {isInterest ? "Interest Sent" : "Send Interest"}
      </button>
      <button
        onClick={async () => {
          if (isShortlist) return;
          const success = await toggleShortlist(receiverId, "add", fetchData);
          if (success) setIsShortlisted(true);
        }}
        disabled={isShortlist}
        className={`h-10 px-4 flex items-center gap-2 rounded-full border text-sm transition ${isShortlist
          ? "border-[#D6D2CE] text-[#A8A29E] bg-[#F8F7F5] font-medium cursor-default"
          : "cursor-pointer border-[#2A1D1D] text-[#3A3A3A] font-medium bg-white hover:bg-gray-50"
          }`}
      >
        <Heart
          size={18}
          className={isShortlist ? "text-[#A8A29E]" : "text-[#3A3A3A]"}
        />
        {isShortlist ? "Shortlisted" : "Shortlist"}
      </button>
      {summary?.subscription !== "Free" && (
        <button
          onClick={async () => {
            if (isChatRequest) return;
            const success = await sendChatRequest(receiverId, fetchData);
            if (success) setHasChatRequest(true);
          }}
          disabled={isChatRequest}
          className={`h-10 w-10 flex items-center justify-center rounded-full border transition ${isChatRequest
            ? "border-[#D6D2CE] bg-[#F8F7F5] cursor-default"
            : "cursor-pointer border-[#2A1D1D] bg-white hover:bg-gray-50"
            }`}
        >
          <MessageCircle
            size={18}
            className={isChatRequest ? "text-[#A8A29E]" : "text-[#3A3A3A]"}
          />
        </button>
      )}
    </div>
  );
}

function MatchIcon({ Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-2 border border-gray-100 rounded-xl bg-white shadow-sm">
        <Icon size={24} className="text-[#4B845C]" />
      </div>
      <p className="text-[9px] text-[#7B6A64] text-center leading-tight ">
        {label}
      </p>
    </div>
  );
}
