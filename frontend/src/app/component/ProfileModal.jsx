"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Briefcase,
  GraduationCap,
  Users,
  Image as ImageIcon,
  X,
  Share2,
  EllipsisVertical,
  Shield,
  CircleCheckBig,
  Ruler,
  MapPin,
  Languages,
  WalletMinimal,
  BookOpen,
  Vegan,
  Cake,
  Star,
  MessageCircle,
  Heart,
  ChevronRight,
  ChevronLeft,
  WholeWord,
  Utensils,
  Wine,
  Cigarette,
  PawPrint,
  Home,
  Car,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UsersFour } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/apiClient";
import PhotoModal from "./Private/PhotoModal";
import KundliMatchModal from "./KundliMatchModal";
import toast from "react-hot-toast";

export default function ProfileModal({
  ismatch,
  isOpen,
  setIsOpen,
  user,
  summary,
}) {
  const router = useRouter();
  // Mapping based on your API response structure
  const profile = user?.profile || {};
  const userAccount = user?.user || {};
  const bio = user?.profile?.bio || "";
  const describeMe = user?.profile?.describeMe || "";
  const preference = user?.partnerPreferences || {};
  const toBoolean = (value) =>
    value === true || value === 1 || value === "1" || value === "true";

  const fullName = profile.fullName || "User";
  const dob = profile.dob;
  const age = dob
    ? new Date().getFullYear() - new Date(dob).getFullYear()
    : "-";
  const heightCm = profile.height ? `${profile.height} cm` : "-";
  const location =
    [profile.city, profile.state, profile.country].filter(Boolean).join(", ") ||
    "-";
  const communityText =
    [profile.community, profile.subCommunity].filter(Boolean).join(" - ") ||
    "-";
  const motherTongue = profile.motherTongue || "-";
  const maritalStatus = profile.maritalStatus || "-";
  const annualIncome = profile.annualIncome || "-";
  const profession = profile.profession || "-";
  const company = profile.companyName || "";
  const aboutCareer = profile.aboutCareer || "";
  const highestEducation = profile.highestEducation || "-";
  const degree = profile.degree || "";
  const managedBy = profile.profileCreatedBy || "Self";
  const isVerified = profile.adminStatus === "approved";
  const profileId = profile._id || "-";
  const isFreePlan = summary?.subscription == "Free";
  const isPremiumPlan = summary?.subscription === "Premium";
  const isGoldPlan = summary?.subscription === "Gold";
  const canViewContact = isPremiumPlan || isGoldPlan;
  const phoneNumber =
    userAccount?.phone || profile?.userId?.phone || "-";

  const [hasInterest, setHasInterest] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [hasChatRequest, setHasChatRequest] = useState(false);

  useEffect(() => {
    setHasInterest(toBoolean(profile.isInterest));
    setIsShortlisted(toBoolean(profile.isShortlist));
    setHasChatRequest(toBoolean(profile.isChatRequest));
  }, [
    profile._id,
    profile.isInterest,
    profile.isShortlist,
    profile.isChatRequest,
  ]);
  // Photos logic
  const imageList = Array.isArray(profile.profilePhotos)
    ? profile.profilePhotos.map((p) => p.url).filter(Boolean)
    : [];
  const images = imageList.length > 0 ? imageList : ["/home/user.png"];

  // 1. Pehle 'isMain: true' waali saari photos ki list nikal lo
  const allMainPhotos =
    profile?.profilePhotos?.filter((p) => p.isMain === true) || [];

  // 2. Variable define karein: Priority order -> Last Main Photo > First Photo > Dummy
  const profilePhoto =
    allMainPhotos.length > 0
      ? allMainPhotos[allMainPhotos.length - 1].url // Sabse latest main photo
      : profile?.profilePhotos?.[0]?.url || // Agar main nahi hai toh pehli photo
        "/home/user.png"; // Fallback dummy
  // Formatting helpers
  const formatRange = (range, suffix) => {
    if (!range) return "-";
    if (range.min != null && range.max != null) {
      return `${range.min}-${range.max}${suffix || ""}`;
    }
    return "-";
  };

  const normalizeValue = (value) => {
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-";
    return value || "-";
  };
  const formatHabit = (value) => {
    if (!value) return "-";
    const text = String(value);
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  const formatBoolean = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return toBoolean(value) ? "Yes" : "No";
  };
  const formatSiblings = (brothers, sisters, marriedSiblings) => {
    const b = Number.isFinite(Number(brothers)) ? Number(brothers) : 0;
    const s = Number.isFinite(Number(sisters)) ? Number(sisters) : 0;
    const married = Number.isFinite(Number(marriedSiblings))
      ? Number(marriedSiblings)
      : 0;
    if (!b && !s) return "-";
    const parts = [];
    if (b) parts.push(`${b} Brother${b > 1 ? "s" : ""}`);
    if (s) parts.push(`${s} Sister${s > 1 ? "s" : ""}`);
    const base = parts.join(" & ");
    return married ? `${base} (${married} Married)` : base;
  };

  const getBlurredPhone = (value) => {
    if (!value || value === "-") return "XXXXXXXXXX";
    const digits = String(value).replace(/\D/g, "");
    if (digits.length <= 4) return "XXXXXXXXXX";
    return `${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
  };

  const handleShare = async (id) => {
    try {
      const url = `${window.location.origin}/home?id=${id}`;
      await navigator.clipboard.writeText(url);

      toast.success("Profile link copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const [activeTab, setActiveTab] = useState("About");
  const scrollContainerRef = useRef(null);

  const tabs = [
    { id: "About", label: "About" },
    { id: "Career", label: "Career" },
    { id: "Education", label: "Education" },
    { id: "Family", label: "Family" },
    { id: "Lifestyle", label: "Lifestyle" },
    { id: "Horoscope", label: "Horoscope" },
    { id: "Photos", label: "Photos" },
    { id: "LookingFor", label: "Looking For" },
  ];

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: element.offsetTop - 300,
        behavior: "smooth",
      });
    }
  };

  const sendInterest = async (receiverId) => {
    if (hasInterest) return;
   
    try {
      const interestRes = await api.post(
        "/interest/send",
        { receiverId: receiverId },
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
      setHasInterest(true);
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

  const toggleShortlist = async (receiverId, action) => {
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
      toast.success(message);
      setIsShortlisted(action === "add");
    } catch (error) {
      console.error("Error in shortlist update", error);

      toast.error(
        error?.message || "Something went wrong while updating shortlist",
      );
    }
  };

  const sendChatRequest = async (receiverId) => {
    if (hasChatRequest) return;
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
      } else if (chatRes.data) {
        toast.success(chatRes.data.message);
      }
      setHasChatRequest(true);
    } catch (error) {
      console.error("Error in chat request", error);

      // Error handling
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const [[page, direction], setPage] = useState([0, 0]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isKundliModalOpen, setIsKundliModalOpen] = useState(false);
  const imageIndex = Math.abs(page % images.length);

  useEffect(() => {
    if (!isOpen) {
      setIsKundliModalOpen(false);
    }
  }, [isOpen]);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-screen w-screen bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500"
          >
            {/* 1. Header with Cover Photo */}
            <div className="relative shrink-0 w-full h-72 sm:h-64">
             

              <div className="relative shrink-0 w-full h-72 sm:h-64 bg-gray-200">
                <Image
                  src={profilePhoto}
                  fill
                  className={`object-contain`}
                  //  ${
                  //   summary?.subscription == "Free" ? "blur-md" : ""
                  // }
                  alt="Profile Cover"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="flex w-full absolute top-0 justify-between p-4 z-20">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white cursor-pointer transition-all"
                >
                  <X size={24} />
                </button>
                <div className="space-x-2">
                  <button
                    className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white cursor-pointer transition-all"
                    onClick={() => handleShare(user.profile.userId._id)}
                  >
                    <Share2 size={24} />
                  </button>
                  {/* <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white cursor-pointer transition-all">
                    <EllipsisVertical size={24} />
                  </button> */}
                </div>
              </div>

              <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center text-white z-10">
                <h2 className="text-2xl font-bold font-playfair">
                  {fullName}, {age}
                </h2>
                <div className="flex gap-2 mt-2">
                  {isVerified && (
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/30">
                      Verified
                    </span>
                  )}
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/30">
                    ID: {profileId.slice(-6)}
                  </span>
                </div>

                <div className="mt-3 w-full relative">
                  {/* Background gradient layer */}
                  <div className="absolute inset-0 bg-gold-gradient opacity-30"></div>

                  {/* Content layer */}
                  <div className="relative flex justify-between items-center gap-2 px-4 py-1.5 border border-[#E3B450]/40">
                    <div></div>{" "}
                    <span className="text-[11px] font-inter font-medium text-white  ">
                      Managed by: {managedBy}
                    </span>
                    <div className="flex gap-1">
                      <div className="bg-gold-gradient rounded-full p-1">
                        <CircleCheckBig size={12} className="text-[#6E2F2F]" />
                      </div>
                      <div className="bg-gold-gradient rounded-full p-1">
                        <Shield size={12} className="text-[#6E2F2F]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Tabs */}
            <div className="shrink-0 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
              <div className="flex px-4 pt-2 whitespace-nowrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`cursor-pointer py-2 px-3 text-sm transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "border-stone-800 text-stone-800"
                        : "border-transparent text-stone-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Content Body */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/30"
            >
              {/* ABOUT SECTION */}
              <section id="About" className="space-y-4">
                <div>
                  {bio && (
                    <p className="text-zinc-900 text-base font-light font-inter leading-6">
                      {bio}
                    </p>
                  )}
                  {describeMe && (
                    <div className="mt-2 flex flex-col">
                      <h3 className="text-[#2A1D1D] text-xl font-playfair font-semibold">
                        I would describe myself in 5 words as:
                      </h3>
                      <p className="text-stone-700">{describeMe}</p>
                    </div>
                  )}{" "}
                </div>
                <div className="bg-white text-zinc-900 text-base font-light font-inter leading-6 p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-3">
                  <InfoRow
                    icon={<Ruler size={18} />}
                    label="Height"
                    value={heightCm}
                  />
                  <InfoRow
                    icon={<MapPin size={18} />}
                    label="Lives in"
                    value={location}
                  />
                  <InfoRow icon="ring" label="Status" value={maritalStatus} />
                  <InfoRow
                    icon={<BookOpen size={18} />}
                    label="Community"
                    value={communityText}
                  />
                  <InfoRow
                    icon={<Languages size={18} />}
                    label="Language"
                    value={profile.language || "-"}
                  />
                  <InfoRow
                    icon={<WholeWord size={18} />}
                    label="Mother Tongue"
                    value={profile.motherTongue || "-"}
                  />

                  <div className="pt-2">
                    <span className="px-5 py-2 bg-orange-50 text-stone-800 rounded-full text-sm font-medium border border-orange-100 flex items-center w-fit gap-2">
                      <Vegan size={18} className="text-amber-900" />{" "}
                      {profile.diet || "Veg"}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-4">
                  <SectionHeader title="Contact Details" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <Phone size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-stone-400 text-xs">Phone</span>
                      <span
                        className={`font-semibold ${
                          canViewContact
                            ? "text-zinc-900"
                            : "select-none text-zinc-900/50 blur-[4px]"
                        }`}
                      >
                        {canViewContact
                          ? phoneNumber
                          : getBlurredPhone(phoneNumber)}
                      </span>
                    </div>
                  </div>
                  {!canViewContact && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/profile/membership");
                      }}
                      className="w-full cursor-pointer rounded-full bg-gold-gradient px-5 py-3 text-sm font-semibold text-[#4B2A24] shadow-lg transition hover:scale-[1.02]"
                    >
                      Upgrade To View
                    </button>
                  )}
                </div>
              </section>

              {/* FAMILY SECTION */}
              <section id="Family" className="space-y-4">
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-4">
                  <SectionHeader title="Family" />
                  {profile.aboutFamily && (
                    <p className="text-stone-600 text-sm leading-6">
                      {profile.aboutFamily}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                      <Users size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-stone-900 font-semibold">
                        {profile.familyType || "-"}
                      </span>
                      <span className="text-stone-400 text-xs">
                        Family Type
                      </span>
                    </div>
                  </div>

                  <div className="relative pl-3 space-y-4">
                    <div className="absolute left-4 top-1 bottom-1 border-l border-dashed border-stone-300" />
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full border border-stone-400 bg-white" />
                      <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-500">
                        Mother
                      </span>
                      <span className="text-stone-800 font-medium">
                        {profile.mothersOccupation || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full border border-stone-400 bg-white" />
                      <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-500">
                        Father
                      </span>
                      <span className="text-stone-800 font-medium">
                        {profile.fathersOccupation || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full border border-stone-400 bg-white" />
                      <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-500">
                        Siblings
                      </span>
                      <span className="text-stone-800 font-medium">
                        {formatSiblings(
                          profile.brothers,
                          profile.sisters,
                          profile.marriedSiblings,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <WalletMinimal size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-stone-900 font-semibold">
                        {profile.familyIncomeRange || "-"}
                      </span>
                      <span className="text-stone-400 text-xs">
                        Family Income
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* LIFESTYLE SECTION */}
              <section id="Lifestyle" className="space-y-4">
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-2">
                  <SectionHeader title="Lifestyle" />
                  <InfoRow
                    icon={<Utensils size={18} />}
                    label="Dietary Habits"
                    value={normalizeValue(profile.diet)}
                    border
                  />
                  <InfoRow
                    icon={<Wine size={18} />}
                    label="Drinking Habit"
                    value={formatHabit(profile.drinkingHabits)}
                    border
                  />
                  <InfoRow
                    icon={<Cigarette size={18} />}
                    label="Smoking Habit"
                    value={formatHabit(profile.smokingHabits)}
                    border
                  />
                  <InfoRow
                    icon={<PawPrint size={18} />}
                    label="Open to Pets"
                    value={formatBoolean(profile.openToPets)}
                    border
                  />
                  <InfoRow
                    icon={<Home size={18} />}
                    label="Own a House"
                    value={formatBoolean(profile.ownHouse)}
                    border
                  />
                  <InfoRow
                    icon={<Car size={18} />}
                    label="Own a Car"
                    value={formatBoolean(profile.ownCar)}
                    border
                  />
                  <InfoRow
                    icon={<Heart size={18} />}
                    label="Hobbies"
                    value={normalizeValue(profile.hobbies)}
                    border
                  />
                  <InfoRow
                    icon={<Star size={18} />}
                    label="Interests"
                    value={normalizeValue(profile.interests)}
                  />
                </div>
              </section>

              <MatchCard
                title="Why this match?"
                items={[
                  {
                    text: "Same community",
                    icon: <UsersFour size={18} className="text-green-600" />,
                  },
                  {
                    text: "Same education",
                    icon: (
                      <GraduationCap size={18} className="text-green-600" />
                    ),
                  },
                  {
                    text: "Preferred location",
                    icon: <MapPin size={18} className="text-green-600" />,
                  },
                ]}
              />

              {/* CAREER SECTION */}
              <section id="Career" className="space-y-4">
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-4">
                  <SectionHeader title="Career" />
                  {aboutCareer && (
                    <p className="text-stone-600 text-sm mt-2">{aboutCareer}</p>
                  )}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <Briefcase size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-900 font-semibold">
                        {profession}
                      </span>
                      {company && (
                        <span className="text-stone-500 text-sm italic">
                          at {company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <WalletMinimal size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-900 font-semibold">
                        {annualIncome}
                      </span>
                      <span className="text-stone-500 text-xs uppercase tracking-wider">
                        Annual Income
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* EDUCATION SECTION */}
              <section id="Education" className="space-y-4">
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-4">
                  <SectionHeader title="Education" />
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <GraduationCap size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-900 font-semibold">
                        {highestEducation}
                      </span>
                      {degree && (
                        <span className="text-stone-500 text-sm">{degree}</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* HOROSCOPE SECTION */}
              <section id="Horoscope" className="space-y-4">
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-2">
                  <SectionHeader title="Horoscope" />
                  <InfoRow
                    icon={<Star size={18} />}
                    label="Rashi"
                    value={profile.rashi}
                  />
                  <InfoRow label="Nakshatra" value={profile.nakshatra} />
                  <InfoRow label="Gothram" value={profile.gothram} />
                  <InfoRow label="Manglik" value={profile.manglik} />
                  <button
                    type="button"
                    onClick={() =>
                      isPremiumPlan
                        ? setIsKundliModalOpen(true)
                        : router.push("/profile/membership")
                    }
                    className="mt-4 w-full cursor-pointer rounded-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] px-5 py-3 text-sm font-semibold text-[#2A1D1D] shadow-lg transition hover:shadow-xl"
                  >
                    {isPremiumPlan
                      ? "Horoscope Match"
                      : "Upgrade to Match Horoscope"}
                  </button>
                </div>
              </section>

              {/* PHOTOS SECTION */}
              <section id="Photos" className="space-y-4">
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-stone-800 text-xl font-bold">Photos</h2>
                    <span className="text-stone-500 text-sm">
                      {images.length} Photos
                    </span>
                  </div>
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden group">
                    <div className={isFreePlan ? "pointer-events-none blur-md scale-105" : ""}>
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.img
                          key={page}
                          src={images[imageIndex]}
                          custom={direction}
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </AnimatePresence>
                      <button
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white"
                        onClick={() => paginate(-1)}
                        disabled={isFreePlan}
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white"
                        onClick={() => paginate(1)}
                        disabled={isFreePlan}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                    {isFreePlan && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/profile/membership");
                          }}
                          className="rounded-full cursor-pointer bg-gold-gradient px-6 py-3 text-sm font-semibold text-[#4B2A24] shadow-lg transition hover:scale-[1.02]"
                        >
                          Upgrade To View Profile
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      isFreePlan
                        ? router.push("/profile/membership")
                        : setIsGalleryOpen(true)
                    }
                    className="w-full py-2 cursor-pointer rounded-full border border-amber-900 text-amber-900 font-bold text-sm"
                  >
                    {isFreePlan ? "Upgrade To View Profile" : "View Gallery"}
                  </button>
                  {!isFreePlan && (
                    <PhotoModal
                      isOpen={isGalleryOpen}
                      onClose={() => setIsGalleryOpen(false)}
                      images={images}
                    />
                  )}
                </div>
              </section>

              {/* LOOKING FOR (PARTNER PREFERENCES) */}
              <section id="LookingFor" className="space-y-6 pb-20">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold font-playfair text-stone-800">
                    Looking for
                  </h3>
                  <p className="text-stone-500 text-sm">
                    Preferred partner requirements
                  </p>
                </div>

                <PreferenceSection
                  title="Basic Preferences"
                  items={[
                    {
                      label: "Age Range",
                      value: formatRange(preference.prefAgeRange, " Years"),
                      matched: true,
                    },
                    {
                      label: "Height Range",
                      value: formatRange(preference.prefHeightRange, " cm"),
                      matched: true,
                    },
                    {
                      label: "Marital Status",
                      value: normalizeValue(preference.prefMaritalStatus),
                      matched: true,
                    },
                    {
                      label: "Community",
                      value: normalizeValue(preference.prefCommunities),
                      matched: true,
                    },
                    {
                      label: "Language",
                      value: normalizeValue(preference.prefLanguages),
                      matched: true,
                    },
                  ]}
                />

                <PreferenceSection
                  title="Education & Profession"
                  items={[
                    {
                      label: "Min Education",
                      value: normalizeValue(preference.minEducation),
                      matched: true,
                    },
                    {
                      label: "Profession",
                      value: normalizeValue(preference.preferredProfession),
                      matched: true,
                    },
                    {
                      label: "Income Range",
                      value: normalizeValue(preference.annualIncomeRange),
                      matched: true,
                    },
                  ]}
                />

                <PreferenceSection
                  title="Others"
                  items={[
                    {
                      label: "Location",
                      value: preference.prefLocation || "Anywhere",
                      matched: true,
                    },
                    {
                      label: "Relocate",
                      value: preference.willingToRelocate ? "Yes" : "No",
                      matched: true,
                    },
                    {
                      label: "Horoscope Match",
                      value: preference.horoscopeMatch
                        ? "Required"
                        : "Not Required",
                      matched: preference.horoscopeMatch,
                    },
                  ]}
                />
              </section>
            </div>

            {/* Footer Actions */}
            {ismatch && (
              <div className="shrink-0 bg-white p-4 border-t border-gray-100 flex items-center mb-20 sm:mb-0 gap-3">
                <button
                  disabled={hasInterest}
                  className={`flex-1 h-12 rounded-full font-bold ${
                    hasInterest
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-white cursor-pointer"
                  }`}
                  onClick={() => sendInterest(profile?.userId?._id)}
                >
                  {hasInterest ? "Interest Sent" : "Send Interest"}
                </button>
                <button
                  className={`w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer ${
                    isShortlisted
                      ? "border-rose-200 bg-rose-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() =>
                    toggleShortlist(
                      profile?.userId?._id,
                      isShortlisted ? "remove" : "add",
                    )
                  }
                  title={
                    isShortlisted ? "Remove from shortlist" : "Add to shortlist"
                  }
                >
                  <Heart
                    className={
                      isShortlisted ? "text-rose-500" : "text-gray-400"
                    }
                    fill={isShortlisted ? "currentColor" : "none"}
                  />
                </button>
                <button
                  disabled={hasChatRequest}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                    hasChatRequest
                      ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                      : "border-gray-200 bg-white cursor-pointer"
                  }`}
                  onClick={() => sendChatRequest(profile?.userId?._id)}
                  title={
                    hasChatRequest ? "Chat request sent" : "Send chat request"
                  }
                >
                  <MessageCircle
                    className={
                      hasChatRequest ? "text-green-600" : "text-gray-400"
                    }
                    fill={hasChatRequest ? "currentColor" : "none"}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {isPremiumPlan && (
        <KundliMatchModal
          isOpen={isKundliModalOpen}
          onClose={() => setIsKundliModalOpen(false)}
          summary={summary}
          viewedProfile={profile}
        />
      )}
    </>
  );
}

/* Sub-components remains same with minor cleanup */
function SectionHeader({ title }) {
  return (
    <h3 className="text-lg font-bold font-playfair text-stone-800 mb-2">
      {title}
    </h3>
  );
}

function InfoRow({ icon, label, value, border }) {
  return (
    <div
      className={`flex items-center gap-4 py-2 ${border ? "border-b border-gray-50" : ""}`}
    >
      {icon === "ring" ? (
        <Users size={18} className="text-green-600" />
      ) : icon ? (
        <div className="text-green-600">{icon}</div>
      ) : (
        <div className="w-5" />
      )}
      <div className="flex text-sm gap-2">
        <span className="text-stone-400 font-normal">{label}:</span>
        <span className="text-stone-800 font-medium">{value || "-"}</span>
      </div>
    </div>
  );
}

function PreferenceSection({ title, items }) {
  return (
    <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 bg-stone-50/50 border-b border-stone-100 font-bold text-stone-800">
        {title}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex justify-between items-center px-6 py-3 border-b border-gray-50 last:border-0"
        >
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-tighter">
              {item.label}
            </span>
            <span className="text-sm text-stone-800 font-medium">
              {item.value}
            </span>
          </div>
          {item.matched ? (
            <Check size={18} className="text-green-600" />
          ) : (
            <X size={18} className="text-red-400" />
          )}
        </div>
      ))}
    </div>
  );
}

function MatchCard({ title, items }) {
  return (
    <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 text-center">
      <h4 className="text-stone-400 text-sm font-bold  mb-6">{title}</h4>
      <div className="flex  justify-between items-start px-16">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 max-w-[120px]"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-md border border-gray-50 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-[10px] font-bold text-stone-500 ">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
