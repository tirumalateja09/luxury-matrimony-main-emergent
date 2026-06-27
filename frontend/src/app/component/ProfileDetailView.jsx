"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Briefcase,
  GraduationCap,
  Users,
  ArrowLeft,
  Share2,
  CircleCheckBig,
  Ruler,
  MapPin,
  Languages,
  WalletMinimal,
  BookOpen,
  Vegan,
  Star,
  MessageCircle,
  Heart,
  ChevronLeft,
  WholeWord,
  Utensils,
  Wine,
  Cigarette,
  PawPrint,
  Home,
  Car,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "@/lib/apiClient";
import PhotoModal from "./Private/PhotoModal";
import KundliMatchModal from "./KundliMatchModal";

const NOT_SHARED_TEXT = "Not Shared Yet";

export default function ProfileDetailView({
  ismatch,
  user,
  summary,
  onBack,
}) {
  const router = useRouter();

  const profile = user?.profile || {};
  const userAccount = user?.user || {};
  const preference = user?.partnerPreferences || {};

  const bio = profile.bio || "";
  const describeMe = profile.describeMe || "";

  const fullName = profile.fullName || "User";
  const age = profile?.dob
    ? new Date().getFullYear() -
      new Date(profile.dob).getFullYear()
    : null;

  const location =
    [profile.city, profile.state, profile.country]
      .filter(Boolean)
      .join(", ") || null;

  const communityText =
    [profile.community, profile.subCommunity]
      .filter(Boolean)
      .join(" • ") || null;

  const managedBy =
    profile.profileCreatedBy || "Self";

  const isVerified =
    profile.adminStatus === "approved";

  const profileId = profile._id || null;

  const isFreePlan =
    summary?.subscription === "Free";
  const isPremiumPlan =
    summary?.subscription === "Premium";
  const isGoldPlan =
    summary?.subscription === "Gold";
  
  // Check if logged-in user is viewing their own profile
  const isOwnProfile =
    summary?.userId === userAccount?._id;
  
  const canViewContact =
    isOwnProfile || isPremiumPlan || isGoldPlan;
  const canViewHoroscope =
    isOwnProfile ||
    isPremiumPlan ||
    isGoldPlan;
  const phoneNumber =
    userAccount?.phone ||
    profile?.userId?.phone ||
    null;

  const targetUserId =
    profile?.userId?._id ||
    profile?.userId ||
    user?.userId?._id ||
    user?.userId;

  const toBoolean = (value) =>
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true";

  const [hasInterest, setHasInterest] =
    useState(false);

  const [isShortlisted, setIsShortlisted] =
    useState(false);

  const [hasChatRequest, setHasChatRequest] =
    useState(false);

  useEffect(() => {
    setHasInterest(toBoolean(profile.isInterest));

    setIsShortlisted(
      toBoolean(profile.isShortlist)
    );

    setHasChatRequest(
      toBoolean(profile.isChatRequest)
    );
  }, [
    profile.isInterest,
    profile.isShortlist,
    profile.isChatRequest,
  ]);

  const imageList = Array.isArray(
    profile.profilePhotos
  )
    ? profile.profilePhotos
        .map((photo) => photo.url)
        .filter(Boolean)
    : [];

  const images =
    imageList.length > 0
      ? imageList
      : ["/home/user.png"];

  const allMainPhotos =
    profile?.profilePhotos?.filter(
      (photo) => photo.isMain === true
    ) || [];

  const profilePhoto =
    allMainPhotos.length > 0
      ? allMainPhotos[
          allMainPhotos.length - 1
        ].url
      : profile?.profilePhotos?.[0]?.url ||
        "/home/user.png";

  const sectionRefs = useRef({});

  const [activeTab, setActiveTab] =
    useState("About");

  const [isGalleryOpen, setIsGalleryOpen] =
    useState(false);
  const [isKundliModalOpen, setIsKundliModalOpen] =
    useState(false);

  const [[page, direction], setPage] =
    useState([0, 0]);

  const imageIndex = Math.abs(
    page % images.length
  );

  const tabs = [
    "About",
    "Career",
    "Education",
    "Family",
    "Lifestyle",
    "Horoscope",
    "Photos",
    "LookingFor",
  ];

  const paginate = (newDirection) => {
    setPage([
      page + newDirection,
      newDirection,
    ]);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),

    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },

    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const scrollToSection = (id) => {
    setActiveTab(id);

    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleShare = async (id) => {
    try {
      const url = `${window.location.origin}/user/${id}`;

      await navigator.clipboard.writeText(
        url
      );

      toast.success(
        "Profile link copied!"
      );
    } catch (error) {
      toast.error("Unable to copy link");
    }
  };

  const sendInterest = async (
    receiverId
  ) => {
    if (hasInterest) return;

    try {
      const res = await api.post(
        "/interest/send",
        { receiverId },
        "private"
      );

      toast.success(
        res?.message ||
          res?.data?.message ||
          "Interest sent"
      );

      setHasInterest(true);
    } catch (error) {
      toast.error(
        error?.message ||
          "Something went wrong"
      );
    }
  };

  const toggleShortlist = async (
    receiverId,
    action
  ) => {
    try {
      const res = await api.post(
        "/shortlist/toggle",
        {
          targetId: receiverId,
          action,
        },
        "private"
      );

      toast.success(
        res?.message ||
          res?.data?.message ||
          "Updated"
      );

      setIsShortlisted(
        action === "add"
      );
    } catch (error) {
      toast.error(
        error?.message || "Error"
      );
    }
  };

  const sendChatRequest = async (
    receiverId
  ) => {
    if (hasChatRequest) return;

    try {
      const res = await api.post(
        "/chat/send",
        { receiverId },
        "private"
      );

      toast.success(
        res?.message ||
          res?.data?.message ||
          "Chat request sent"
      );

      setHasChatRequest(true);
    } catch (error) {
      toast.error(
        error?.message || "Error"
      );
    }
  };

  const formatValue = (value) => {
    if (!value) return null;

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return value;
  };

  const formatBoolean = (value) => {
    if (
      value === undefined ||
      value === null
    )
      return null;

    return value ? "Yes" : "No";
  };

  const getBlurredPhone = (value) => {
    if (!value) return "XXXXXXXXXX";
    const digits = String(value).replace(/\D/g, "");
    if (digits.length <= 4) return "XXXXXXXXXX";
    return `${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100">
      {/* HERO */}
      <div className="relative h-[520px] md:h-[650px] overflow-hidden">
        <Image
          src={profilePhoto}
          fill
          priority
          alt="Profile"
          className="object-contain scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5">
          <button
            onClick={
              onBack ||
              (() => router.back())
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            onClick={() =>
              handleShare(targetUserId)
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* HERO CONTENT */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10">
          <div className="mx-auto max-w-7xl">
            <h1 className="flex items-center gap-2 text-4xl font-bold tracking-tight text-white md:text-6xl">
              <span>{fullName},</span>
              {age ? (
                <span>{age}</span>
              ) : (
                <span className="text-2xl font-medium text-white/70 md:text-4xl">
                  {NOT_SHARED_TEXT}
                </span>
              )}
            </h1>

            <p className="mt-3 text-sm text-white/80 md:text-base">
              {location ? (
                location
              ) : (
                <span className="text-white/70">{NOT_SHARED_TEXT}</span>
              )}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {isVerified && (
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-sm text-white backdrop-blur-xl">
                  <CircleCheckBig size={16} />
                  Verified
                </div>
              )}

              <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-xl">
                <span>ID:</span>
                {profileId ? (
                  <span>{profileId.slice(-6)}</span>
                ) : (
                  <span className="text-white/70">{NOT_SHARED_TEXT}</span>
                )}
              </div>

              <div className="rounded-full border border-amber-400/30 bg-amber-500/20 px-4 py-2 text-sm text-white backdrop-blur-xl">
                Managed by {managedBy}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-3 overflow-x-auto py-3 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  scrollToSection(tab)
                }
                className={`whitespace-nowrap cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-stone-900 text-white shadow-lg"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-2 py-4 ">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {/* ABOUT */}
            <SectionWrapper
              title="About"
              sectionKey="About"
              refs={sectionRefs}
            >
              {bio && (
                <p className="leading-7 text-stone-600">
                  {bio}
                </p>
              )}

              {describeMe && (
                <div className="mt-6">
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">
                    I would describe myself as
                  </h3>

                  <p className="text-stone-600">
                    {describeMe}
                  </p>
                </div>
              )}

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <InfoCard
                  icon={<Ruler size={18} />}
                  label="Height"
                  value={profile.height ? `${profile.height} cm` : null}
                />

                <InfoCard
                  icon={<MapPin size={18} />}
                  label="Location"
                  value={location}
                />

                <InfoCard
                  icon={<BookOpen size={18} />}
                  label="Community"
                  value={communityText}
                />

                <InfoCard
                  icon={<Languages size={18} />}
                  label="Language"
                  value={profile.language}
                />

                <InfoCard
                  icon={<WholeWord size={18} />}
                  label="Mother Tongue"
                  value={
                    profile.motherTongue
                  }
                />

                <InfoCard
                  icon={<Vegan size={18} />}
                  label="Diet"
                  value={profile.diet}
                />
              </div>
            </SectionWrapper>

            {/* CAREER */}
            <SectionWrapper
              title="Career"
              sectionKey="Career"
              refs={sectionRefs}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={
                    <Briefcase size={18} />
                  }
                  label="Profession"
                  value={
                    profile.profession
                  }
                />

                <InfoCard
                  icon={
                    <WalletMinimal size={18} />
                  }
                  label="Income"
                  value={
                    profile.annualIncome
                  }
                />

                <InfoCard
                  icon={
                    <Briefcase size={18} />
                  }
                  label="Company"
                  value={
                    profile.companyName
                  }
                />
              </div>
            </SectionWrapper>

            {/* EDUCATION */}
            <SectionWrapper
              title="Education"
              sectionKey="Education"
              refs={sectionRefs}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={
                    <GraduationCap size={18} />
                  }
                  label="Education"
                  value={
                    profile.highestEducation
                  }
                />

                <InfoCard
                  icon={<BookOpen size={18} />}
                  label="Degree"
                  value={profile.degree}
                />
              </div>
            </SectionWrapper>

            {/* FAMILY */}
            <SectionWrapper
              title="Family"
              sectionKey="Family"
              refs={sectionRefs}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<Users size={18} />}
                  label="Family Type"
                  value={
                    profile.familyType
                  }
                />

                <InfoCard
                  icon={
                    <WalletMinimal size={18} />
                  }
                  label="Family Income"
                  value={
                    profile.familyIncomeRange
                  }
                />

                <InfoCard
                  icon={<Users size={18} />}
                  label="Father"
                  value={
                    profile.fathersOccupation
                  }
                />

                <InfoCard
                  icon={<Users size={18} />}
                  label="Mother"
                  value={
                    profile.mothersOccupation
                  }
                />
              </div>
            </SectionWrapper>

            {/* LIFESTYLE */}
            <SectionWrapper
              title="Lifestyle"
              sectionKey="Lifestyle"
              refs={sectionRefs}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={
                    <Utensils size={18} />
                  }
                  label="Diet"
                  value={formatValue(
                    profile.diet
                  )}
                />

                <InfoCard
                  icon={<Wine size={18} />}
                  label="Drinking"
                  value={formatValue(
                    profile.drinkingHabits
                  )}
                />

                <InfoCard
                  icon={
                    <Cigarette size={18} />
                  }
                  label="Smoking"
                  value={formatValue(
                    profile.smokingHabits
                  )}
                />

                <InfoCard
                  icon={
                    <PawPrint size={18} />
                  }
                  label="Pets"
                  value={formatBoolean(
                    profile.openToPets
                  )}
                />

                <InfoCard
                  icon={<Home size={18} />}
                  label="Own House"
                  value={formatBoolean(
                    profile.ownHouse
                  )}
                />

                <InfoCard
                  icon={<Car size={18} />}
                  label="Own Car"
                  value={formatBoolean(
                    profile.ownCar
                  )}
                />
              </div>
            </SectionWrapper>

            {/* HOROSCOPE */}
            <SectionWrapper
              title="Horoscope"
              sectionKey="Horoscope"
              refs={sectionRefs}
              headerAction={
                !isOwnProfile && (
                  <button
                    type="button"
                    onClick={() =>
                      isPremiumPlan
                        ? setIsKundliModalOpen(true)
                        : router.push("/profile/membership")
                    }
                    className="h-11 cursor-pointer rounded-2xl bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] px-5 text-sm font-semibold text-[#2A1D1D] shadow-lg transition hover:shadow-xl"
                  >
                    {isPremiumPlan
                      ? "Horoscope Match"
                      : "Upgrade to Match Horoscope"}
                  </button>
                )
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<Star size={18} />}
                  label="Rashi"
                  value={profile.rashi}
                  isLocked={!canViewHoroscope}
                  onClick={() =>
                    router.push("/profile/membership")
                  }
                />

                <InfoCard
                  icon={<Star size={18} />}
                  label="Nakshatra"
                  value={
                    profile.nakshatra
                  }
                  isLocked={!canViewHoroscope}
                  onClick={() =>
                    router.push("/profile/membership")
                  }
                />

                <InfoCard
                  icon={<Star size={18} />}
                  label="Manglik"
                  value={profile.manglik}
                  isLocked={!canViewHoroscope}
                  onClick={() =>
                    router.push("/profile/membership")
                  }
                />
              </div>
            </SectionWrapper>

            {/* PHOTOS */}
            <SectionWrapper
              title="Photos"
              sectionKey="Photos"
              refs={sectionRefs}
            >
              <div className="group relative h-[420px] overflow-hidden rounded-3xl">
                <div
                  className={
                    !canViewContact
                      ? "pointer-events-none scale-105 blur-md"
                      : ""
                  }
                >
                  <AnimatePresence
                    initial={false}
                    custom={direction}
                  >
                    <motion.img
                      key={page}
                      src={
                        images[imageIndex]
                      }
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        duration: 0.4,
                      }}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  </AnimatePresence>

                  <button
                    onClick={() =>
                      paginate(-1)
                    }
                    className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full  cursor-pointer border border-white/20 bg-green-600/10 text-green-600 backdrop-blur-xl"
                  >
                    <ChevronLeft />
                  </button>

                  <button
                    onClick={() =>
                      paginate(1)
                    }
                    className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full cursor-pointer border border-white/20 bg-green-600/10 text-green-600 backdrop-blur-xl"
                  >
                    <ChevronRight />
                  </button>
                </div>

                {!canViewContact && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center">
                    <button
                      onClick={() =>
                        router.push(
                          "/profile/membership"
                        )
                      }
                      className="rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-xl"
                    >
                      Upgrade To View
                      Photos
                    </button>
                  </div>
                )}
              </div>

              {canViewContact && (
                <button
                  onClick={() =>
                    setIsGalleryOpen(true)
                  }
                  className="mt-5 cursor-pointer h-14 w-full rounded-2xl border border-stone-200 bg-white font-semibold text-stone-800 transition-all hover:bg-stone-50"
                >
                  Open Gallery
                </button>
              )}

              {canViewContact && (
                <PhotoModal
                  isOpen={
                    isGalleryOpen
                  }
                  onClose={() =>
                    setIsGalleryOpen(false)
                  }
                  images={images}
                />
              )}
            </SectionWrapper>

            {/* LOOKING FOR */}
            <SectionWrapper
              title="Looking For"
              sectionKey="LookingFor"
              refs={sectionRefs}
            >
              <div className="space-y-4">
                <PreferenceItem
                  label="Age Range"
                  value={
                    preference?.prefAgeRange?.min &&
                    preference?.prefAgeRange?.max
                      ? `${preference.prefAgeRange.min} - ${preference.prefAgeRange.max} Years`
                      : null
                  }
                />

                <PreferenceItem
                  label="Height"
                  value={
                    preference?.prefHeightRange?.min &&
                    preference?.prefHeightRange?.max
                      ? `${preference.prefHeightRange.min} - ${preference.prefHeightRange.max} cm`
                      : null
                  }
                />

                <PreferenceItem
                  label="Marital Status"
                  value={formatValue(
                    preference.prefMaritalStatus
                  )}
                />

                <PreferenceItem
                  label="Languages"
                  value={formatValue(
                    preference.prefLanguages
                  )}
                />

                <PreferenceItem
                  label="Profession"
                  value={formatValue(
                    preference.preferredProfession
                  )}
                />
              </div>
            </SectionWrapper>

            {/* PREMIUM ACTION SECTION */}
          {ismatch && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
    className="rounded-3xl pb-20 border border-stone-200/60 bg-white/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-8"
  >
    <div className="flex flex-col gap-8  xl:items-center xl:justify-between">
      {/* LEFT CONTENT */}
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Interested In This Profile
        </span>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Start Your Connection Journey
        </h2>

        <p className="mt-4 max-w-xl text-base leading-8 text-stone-600">
          Send interest, shortlist this profile, or begin a conversation to
          take the next step forward.
        </p>
      </div>

      {/* BUTTONS */}
      <div className="grid w-full gap-4 sm:grid-cols-3 ">
        {/* INTEREST */}
        <button
          disabled={hasInterest}
          onClick={() => sendInterest(targetUserId)}
          className={`flex cursor-pointer h-14 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold transition-all duration-300 ${
            hasInterest
              ? "cursor-not-allowed bg-stone-200 text-stone-500"
              : "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white shadow-lg hover:scale-[1.02]"
          }`}
        >
          <Heart
            size={18}
            fill={hasInterest ? "currentColor" : "none"}
          />

          {hasInterest ? "Interest Sent" : "Send Interest"}
        </button>

        {/* SHORTLIST */}
        <button
          onClick={() =>
            toggleShortlist(
              targetUserId,
              isShortlisted ? "remove" : "add"
            )
          }
          className={`flex cursor-pointer  h-14 items-center justify-center gap-2 rounded-2xl border px-6 text-sm font-semibold transition-all duration-300 ${
            isShortlisted
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Heart
            size={18}
            fill={isShortlisted ? "currentColor" : "none"}
          />

          {isShortlisted ? "Shortlisted" : "Shortlist"}
        </button>

        {/* CHAT */}
        <button
          disabled={hasChatRequest}
          onClick={() => sendChatRequest(targetUserId)}
          className={`flex cursor-pointer h-14 items-center justify-center gap-2 rounded-2xl border px-6 text-sm font-semibold transition-all duration-300 ${
            hasChatRequest
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          <MessageCircle
            size={18}
            fill={hasChatRequest ? "currentColor" : "none"}
          />

          {hasChatRequest ? "Request Sent" : "Chat Request"}
        </button>
      </div>
    </div>
  </motion.div>
)}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="block pb-20 sm:pb-0">
            <div className="sticky top-16 space-y-6">
              <div className="rounded-[32px] border border-stone-200/60 bg-white/95 p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                <h3 className="text-2xl font-bold tracking-tight text-stone-900">
                  Quick Overview
                </h3>

                <div className="mt-6 grid gap-2">
                  <QuickInfoItem
                    icon={
                      <Briefcase size={18} />
                    }
                    label="Profession"
                    value={
                      profile.profession
                    }
                  />

                  <QuickInfoItem
                    icon={
                      <GraduationCap size={18} />
                    }
                    label="Education"
                    value={
                      profile.highestEducation
                    }
                  />

                  <QuickInfoItem
                    icon={<MapPin size={18} />}
                    label="Location"
                    value={location}
                  />

                  <QuickInfoItem
                    icon={<Users size={18} />}
                    label="Community"
                    value={
                      communityText
                    }
                  />
                </div>
              </div>

              <div className="rounded-[32px] border border-stone-200/60 bg-white/95 p-4 shadow-[0_15px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                <h3 className="text-2xl font-bold tracking-tight text-stone-900">
                  Contact Details
                </h3>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-4 rounded-2xl border border-stone-100 bg-stone-50/80 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                      <Phone size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider text-stone-400">
                        Phone
                      </span>
                      <span
                        className={`text-sm font-semibold md:text-base ${
                          canViewContact
                            ? "text-stone-800"
                            : "select-none text-stone-800/50 blur-[4px]"
                        }`}
                      >
                        {canViewContact
                          ? phoneNumber || "-"
                          : getBlurredPhone(phoneNumber)}
                      </span>
                    </div>
                  </div>

                  {isOwnProfile && userAccount?.email && (
                    <div className="flex items-start gap-4 rounded-2xl border border-stone-100 bg-stone-50/80 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                        <Mail size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-stone-400">
                          Email
                        </span>
                        <span className="text-sm font-semibold md:text-base text-stone-800">
                          {userAccount.email}
                        </span>
                      </div>
                    </div>
                  )}

                  {!canViewContact && !isOwnProfile && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/profile/membership")
                      }
                      className="w-full cursor-pointer rounded-full bg-gold-gradient px-5 py-3 text-sm font-semibold text-[#4B2A24] shadow-lg transition hover:scale-[1.02]"
                    >
                      Upgrade To View
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isPremiumPlan && (
        <KundliMatchModal
          isOpen={isKundliModalOpen}
          onClose={() =>
            setIsKundliModalOpen(false)
          }
          summary={summary}
          viewedProfile={profile}
        />
      )}
    </div>
  );
}

/* COMPONENTS */

function SectionWrapper({
  title,
  children,
  sectionKey,
  refs,
  headerAction,
}) {
  return (
    <motion.section
      ref={(element) => {
        refs.current[
          sectionKey
        ] = element;
      }}
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      viewport={{
        once: true,
      }}
      className="scroll-mt-28 rounded-3xl border border-stone-200/60 bg-white/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl "
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          {title}
        </h2>
        {headerAction || null}
      </div>

      {children}
    </motion.section>
  );
}

function InfoCard({
  icon,
  label,
  value,
  isLocked = false,
  onClick,
}) {
  const isMissing = !value || value === "-";
  const isClickable =
    isLocked && typeof onClick === "function";

  return (
    <div
      onClick={
        isClickable ? onClick : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex items-start gap-4 rounded-2xl border border-stone-100 bg-stone-50/80 p-4 ${
        isClickable
          ? "cursor-pointer transition hover:border-amber-300 hover:bg-amber-50/60"
          : ""
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
        {icon}
      </div>

      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-stone-400">
          {label}
        </span>

        {isMissing ? (
          <span className="text-sm font-semibold text-stone-500 md:text-base">
            {NOT_SHARED_TEXT}
          </span>
        ) : (
          <span
            className={`text-sm font-semibold md:text-base ${
              isLocked
                ? "select-none text-stone-800/70 blur-[5px]"
                : "text-stone-800"
            }`}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

function PreferenceItem({
  label,
  value,
}) {
  const isMissing = !value || value === "-";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50 p-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-stone-400">
          {label}
        </p>

        {isMissing ? (
          <p className="mt-1 font-semibold text-stone-500">
            {NOT_SHARED_TEXT}
          </p>
        ) : (
          <p className="mt-1 font-semibold text-stone-800">
            {value}
          </p>
        )}
      </div>

      <Check
        size={18}
        className="text-emerald-600"
      />
    </div>
  );
}

function QuickInfoItem({
  icon,
  label,
  value,
}) {
  const isMissing = !value || value === "-";

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-stone-100 bg-stone-50/80 p-2 transition-all hover:bg-white hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-stone-100 bg-white text-amber-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-stone-400">
          {label}
        </p>

        {isMissing ? (
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-stone-500">
            {NOT_SHARED_TEXT}
          </p>
        ) : (
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-stone-800">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import {
//   Check,
//   Briefcase,
//   GraduationCap,
//   Users,
//   ArrowLeft,
//   X,
//   Share2,
//   Shield,
//   CircleCheckBig,
//   Ruler,
//   MapPin,
//   Languages,
//   WalletMinimal,
//   BookOpen,
//   Vegan,
//   Star,
//   MessageCircle,
//   Heart,
//   ChevronLeft,
//   WholeWord,
//   Utensils,
//   Wine,
//   Cigarette,
//   PawPrint,
//   Home,
//   Car,
//   ChevronRight
// } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { UsersFour } from "@phosphor-icons/react";
// import { AnimatePresence, motion } from "framer-motion";
// import { api } from "@/lib/apiClient";
// import PhotoModal from "./Private/PhotoModal";
// import toast from "react-hot-toast";

// export default function ProfileDetailView({ ismatch, user, summary, onBack }) {
//   const router = useRouter();
//   const profile = user?.profile || {};
//   const bio = user?.profile?.bio || "";
//   const describeMe = user?.profile?.describeMe || "";
//   const preference = user?.partnerPreferences || {};
//   const toBoolean = (value) =>
//     value === true || value === 1 || value === "1" || value === "true";

//   const fullName = profile.fullName || "User";
//   const dob = profile.dob;
//   const age = dob
//     ? new Date().getFullYear() - new Date(dob).getFullYear()
//     : "-";
//   const heightCm = profile.height ? `${profile.height} cm` : "-";
//   const location =
//     [profile.city, profile.state, profile.country].filter(Boolean).join(", ") ||
//     "-";
//   const communityText =
//     [profile.community, profile.subCommunity].filter(Boolean).join(" - ") ||
//     "-";
//   const managedBy = profile.profileCreatedBy || "Self";
//   const isVerified = profile.adminStatus === "approved";
//   const profileId = profile._id || "-";
//   const isFreePlan = summary?.subscription === "Free";
//   const targetUserId =
//     profile?.userId?._id ||
//     profile?.userId ||
//     user?.userId?._id ||
//     user?.userId;

//   const [hasInterest, setHasInterest] = useState(false);
//   const [isShortlisted, setIsShortlisted] = useState(false);
//   const [hasChatRequest, setHasChatRequest] = useState(false);

//   useEffect(() => {
//     setHasInterest(toBoolean(profile.isInterest));
//     setIsShortlisted(toBoolean(profile.isShortlist));
//     setHasChatRequest(toBoolean(profile.isChatRequest));
//   }, [
//     profile._id,
//     profile.isInterest,
//     profile.isShortlist,
//     profile.isChatRequest,
//   ]);

//   const imageList = Array.isArray(profile.profilePhotos)
//     ? profile.profilePhotos.map((photo) => photo.url).filter(Boolean)
//     : [];
//   const images = imageList.length > 0 ? imageList : ["/home/user.png"];
//   const allMainPhotos =
//     profile?.profilePhotos?.filter((photo) => photo.isMain === true) || [];
//   const profilePhoto =
//     allMainPhotos.length > 0
//       ? allMainPhotos[allMainPhotos.length - 1].url
//       : profile?.profilePhotos?.[0]?.url || "/home/user.png";

//   const formatRange = (range, suffix) => {
//     if (!range) return "-";
//     if (range.min != null && range.max != null) {
//       return `${range.min}-${range.max}${suffix || ""}`;
//     }
//     return "-";
//   };

//   const normalizeValue = (value) => {
//     if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-";
//     return value || "-";
//   };

//   const formatHabit = (value) => {
//     if (!value) return "-";
//     const text = String(value);
//     return text.charAt(0).toUpperCase() + text.slice(1);
//   };

//   const formatBoolean = (value) => {
//     if (value === null || value === undefined || value === "") return "-";
//     return toBoolean(value) ? "Yes" : "No";
//   };

//   const formatSiblings = (brothers, sisters, marriedSiblings) => {
//     const b = Number.isFinite(Number(brothers)) ? Number(brothers) : 0;
//     const s = Number.isFinite(Number(sisters)) ? Number(sisters) : 0;
//     const married = Number.isFinite(Number(marriedSiblings))
//       ? Number(marriedSiblings)
//       : 0;
//     if (!b && !s) return "-";
//     const parts = [];
//     if (b) parts.push(`${b} Brother${b > 1 ? "s" : ""}`);
//     if (s) parts.push(`${s} Sister${s > 1 ? "s" : ""}`);
//     const base = parts.join(" & ");
//     return married ? `${base} (${married} Married)` : base;
//   };

//   const handleShare = async (id) => {
//     if (!id) {
//       toast.error("Profile link is unavailable right now.");
//       return;
//     }

//     try {
//       const url = `${window.location.origin}/user/${id}`;
//       await navigator.clipboard.writeText(url);
//       toast.success("Profile link copied!");
//     } catch (error) {
//       console.error("Failed to copy:", error);
//     }
//   };

//   const [activeTab, setActiveTab] = useState("About");
//   const sectionRefs = useRef({});
//   const [isGalleryOpen, setIsGalleryOpen] = useState(false);
//   const [[page, direction], setPage] = useState([0, 0]);
//   const imageIndex = Math.abs(page % images.length);

//   const tabs = [
//     { id: "About", label: "About" },
//     { id: "Career", label: "Career" },
//     { id: "Education", label: "Education" },
//     { id: "Family", label: "Family" },
//     { id: "Lifestyle", label: "Lifestyle" },
//     { id: "Horoscope", label: "Horoscope" },
//     { id: "Photos", label: "Photos" },
//     { id: "LookingFor", label: "Looking For" },
//   ];

//   const scrollToSection = (id) => {
//     setActiveTab(id);
//     sectionRefs.current[id]?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   };

//   const sendInterest = async (receiverId) => {
//     if (hasInterest) return;

//     try {
//       const interestRes = await api.post(
//         "/interest/send",
//         { receiverId },
//         "private",
//       );
//       if (interestRes.success !== undefined) {
//         toast.success(interestRes.message);
//       } else if (interestRes.data) {
//         toast.success(interestRes.data.message);
//       }
//       setHasInterest(true);
//     } catch (error) {
//       toast.error(error?.message || "Something went wrong");
//     }
//   };

//   const toggleShortlist = async (receiverId, action) => {
//     try {
//       const res = await api.post(
//         "/shortlist/toggle",
//         { targetId: receiverId, action },
//         "private",
//       );
//       toast.success(res?.message || res?.data?.message || "Shortlist updated");
//       setIsShortlisted(action === "add");
//     } catch (error) {
//       toast.error(
//         error?.message || "Something went wrong while updating shortlist",
//       );
//     }
//   };

//   const sendChatRequest = async (receiverId) => {
//     if (hasChatRequest) return;
//     try {
//       const chatRes = await api.post("/chat/send", { receiverId }, "private");
//       if (chatRes.success !== undefined) {
//         toast.success(chatRes.message);
//       } else if (chatRes.data) {
//         toast.success(chatRes.data.message);
//       }
//       setHasChatRequest(true);
//     } catch (error) {
//       toast.error(error?.message || "Something went wrong");
//     }
//   };

//   const paginate = (newDirection) => {
//     setPage([page + newDirection, newDirection]);
//   };

//   const variants = {
//     enter: (newDirection) => ({
//       x: newDirection > 0 ? 300 : -300,
//       opacity: 0,
//     }),
//     center: { zIndex: 1, x: 0, opacity: 1 },
//     exit: (newDirection) => ({
//       zIndex: 0,
//       x: newDirection < 0 ? 300 : -300,
//       opacity: 0,
//     }),
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col">
//       <div className="relative shrink-0 w-full h-72 sm:h-64 bg-gray-200">
//         <Image
//           src={profilePhoto}
//           fill
//           className="object-contain"
//           alt="Profile Cover"
//           priority
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

//         <div className="flex w-full absolute top-0 justify-between p-4 z-20">
//           <button
//             onClick={onBack || (() => router.back())}
//             className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white cursor-pointer transition-all"
//           >
//             <ArrowLeft size={24} />
//           </button>
//           <button
//             className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white cursor-pointer transition-all"
//             onClick={() => handleShare(targetUserId)}
//           >
//             <Share2 size={24} />
//           </button>
//         </div>

//         <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center text-white z-10">
//           <h2 className="text-2xl font-bold font-playfair">
//             {fullName}, {age}
//           </h2>
//           <div className="flex gap-2 mt-2">
//             {isVerified && (
//               <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/30">
//                 Verified
//               </span>
//             )}
//             <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/30">
//               ID: {profileId.slice(-6)}
//             </span>
//           </div>

//           <div className="mt-3 w-full relative">
//             <div className="absolute inset-0 bg-gold-gradient opacity-30" />
//             <div className="relative flex justify-between items-center gap-2 px-4 py-1.5 border border-[#E3B450]/40">
//               <div />
//               <span className="text-[11px] font-inter font-medium text-white">
//                 Managed by: {managedBy}
//               </span>
//               <div className="flex gap-1">
//                 <div className="bg-gold-gradient rounded-full p-1">
//                   <CircleCheckBig size={12} className="text-[#6E2F2F]" />
//                 </div>
//                 <div className="bg-gold-gradient rounded-full p-1">
//                   <Shield size={12} className="text-[#6E2F2F]" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 overflow-x-auto no-scrollbar shadow-sm">
//         <div className="flex px-4 pt-2 whitespace-nowrap">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => scrollToSection(tab.id)}
//               className={`cursor-pointer py-2 px-3 text-sm transition-all border-b-2 ${
//                 activeTab === tab.id
//                   ? "border-stone-800 text-stone-800"
//                   : "border-transparent text-stone-400"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="p-6 space-y-8 bg-stone-50/30">
//         <section
//           id="About"
//           ref={(element) => {
//             sectionRefs.current.About = element;
//           }}
//           className="space-y-4 scroll-mt-24"
//         >
//           <div>
//             {bio && (
//               <p className="text-zinc-900 text-base font-light font-inter leading-6">
//                 {bio}
//               </p>
//             )}
//             {describeMe && (
//               <div className="mt-2 flex flex-col">
//                 <h3 className="text-[#2A1D1D] text-xl font-playfair font-semibold">
//                   I would describe myself in 5 words as:
//                 </h3>
//                 <p className="text-stone-700">{describeMe}</p>
//               </div>
//             )}
//           </div>
//           <div className="bg-white text-zinc-900 text-base font-light font-inter leading-6 p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-3">
//             <InfoRow icon={<Ruler size={18} />} label="Height" value={heightCm} />
//             <InfoRow icon={<MapPin size={18} />} label="Lives in" value={location} />
//             <InfoRow icon="ring" label="Status" value={profile.maritalStatus || "-"} />
//             <InfoRow
//               icon={<BookOpen size={18} />}
//               label="Community"
//               value={communityText}
//             />
//             <InfoRow
//               icon={<Languages size={18} />}
//               label="Language"
//               value={profile.language || "-"}
//             />
//             <InfoRow
//               icon={<WholeWord size={18} />}
//               label="Mother Tongue"
//               value={profile.motherTongue || "-"}
//             />

//             <div className="pt-2">
//               <span className="px-5 py-2 bg-orange-50 text-stone-800 rounded-full text-sm font-medium border border-orange-100 flex items-center w-fit gap-2">
//                 <Vegan size={18} className="text-amber-900" />
//                 {profile.diet || "Veg"}
//               </span>
//             </div>
//           </div>
//         </section>

//         <section
//           id="Family"
//           ref={(element) => {
//             sectionRefs.current.Family = element;
//           }}
//           className="space-y-4 scroll-mt-24"
//         >
//           <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-4">
//             <SectionHeader title="Family" />
//             {profile.aboutFamily && (
//               <p className="text-stone-600 text-sm leading-6">
//                 {profile.aboutFamily}
//               </p>
//             )}
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
//                 <Users size={22} />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-stone-900 font-semibold">
//                   {profile.familyType || "-"}
//                 </span>
//                 <span className="text-stone-400 text-xs">Family Type</span>
//               </div>
//             </div>

//             <div className="relative pl-3 space-y-4">
//               <div className="absolute left-4 top-1 bottom-1 border-l border-dashed border-stone-300" />
//               <FamilyMember label="Mother" value={profile.mothersOccupation || "-"} />
//               <FamilyMember label="Father" value={profile.fathersOccupation || "-"} />
//               <FamilyMember
//                 label="Siblings"
//                 value={formatSiblings(
//                   profile.brothers,
//                   profile.sisters,
//                   profile.marriedSiblings,
//                 )}
//               />
//             </div>

//             <div className="flex items-center gap-4 pt-2">
//               <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
//                 <WalletMinimal size={20} />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-stone-900 font-semibold">
//                   {profile.familyIncomeRange || "-"}
//                 </span>
//                 <span className="text-stone-400 text-xs">Family Income</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section
//           id="Lifestyle"
//           ref={(element) => {
//             sectionRefs.current.Lifestyle = element;
//           }}
//           className="space-y-4 scroll-mt-24"
//         >
//           <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-2">
//             <SectionHeader title="Lifestyle" />
//             <InfoRow icon={<Utensils size={18} />} label="Dietary Habits" value={normalizeValue(profile.diet)} border />
//             <InfoRow icon={<Wine size={18} />} label="Drinking Habit" value={formatHabit(profile.drinkingHabits)} border />
//             <InfoRow icon={<Cigarette size={18} />} label="Smoking Habit" value={formatHabit(profile.smokingHabits)} border />
//             <InfoRow icon={<PawPrint size={18} />} label="Open to Pets" value={formatBoolean(profile.openToPets)} border />
//             <InfoRow icon={<Home size={18} />} label="Own a House" value={formatBoolean(profile.ownHouse)} border />
//             <InfoRow icon={<Car size={18} />} label="Own a Car" value={formatBoolean(profile.ownCar)} border />
//             <InfoRow icon={<Heart size={18} />} label="Hobbies" value={normalizeValue(profile.hobbies)} border />
//             <InfoRow icon={<Star size={18} />} label="Interests" value={normalizeValue(profile.interests)} />
//           </div>
//         </section>

//         <section
//           id="Career"
//           ref={(element) => {
//             sectionRefs.current.Career = element;
//           }}
//           className="space-y-4 scroll-mt-24"
//         >
//           <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-4">
//             <SectionHeader title="Career" />
//             {profile.aboutCareer && (
//               <p className="text-stone-600 text-sm mt-2">{profile.aboutCareer}</p>
//             )}
//             <div className="flex gap-4">
//               <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
//                 <Briefcase size={20} />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-zinc-900 font-semibold">
//                   {profile.profession || "-"}
//                 </span>
//                 {profile.companyName && (
//                   <span className="text-stone-500 text-sm italic">
//                     at {profile.companyName}
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
//                 <WalletMinimal size={20} />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-zinc-900 font-semibold">
//                   {profile.annualIncome || "-"}
//                 </span>
//                 <span className="text-stone-500 text-xs uppercase tracking-wider">
//                   Annual Income
//                 </span>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section
//           id="Education"
//           ref={(element) => {
//             sectionRefs.current.Education = element;
//           }}
//           className="space-y-4 scroll-mt-24"
//         >
//           <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-4">
//             <SectionHeader title="Education" />
//             <div className="flex gap-4">
//               <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
//                 <GraduationCap size={20} />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-zinc-900 font-semibold">
//                   {profile.highestEducation || "-"}
//                 </span>
//                 {profile.degree && (
//                   <span className="text-stone-500 text-sm">{profile.degree}</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section
//           id="Horoscope"
//           ref={(element) => {
//             sectionRefs.current.Horoscope = element;
//           }}
//           className="space-y-4 scroll-mt-24"
//         >
//           <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 space-y-2">
//             <SectionHeader title="Horoscope" />
//             <InfoRow icon={<Star size={18} />} label="Rashi" value={profile.rashi} />
//             <InfoRow label="Nakshatra" value={profile.nakshatra} />
//             <InfoRow label="Gothram" value={profile.gothram} />
//             <InfoRow label="Manglik" value={profile.manglik} />
//           </div>
//         </section>

//         <section
//           id="Photos"
//           ref={(element) => {
//             sectionRefs.current.Photos = element;
//           }}
//           className="space-y-4 scroll-mt-24"
//         >
//           <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
//             <div className="flex justify-between items-center">
//               <h2 className="text-stone-800 text-xl font-bold">Photos</h2>
//               <span className="text-stone-500 text-sm">{images.length} Photos</span>
//             </div>
//             <div className="relative z-0 h-64 w-full rounded-2xl overflow-hidden group">
//               <div className={isFreePlan ? "pointer-events-none blur-md scale-105" : ""}>
//                 <AnimatePresence initial={false} custom={direction}>
//                   <motion.img
//                     key={page}
//                     src={images[imageIndex]}
//                     custom={direction}
//                     variants={variants}
//                     initial="enter"
//                     animate="center"
//                     exit="exit"
//                     className="absolute  inset-0 w-full h-full object-cover"
//                   />
//                 </AnimatePresence>
//                 <button
//                   className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white"
//                   onClick={() => paginate(-1)}
//                   disabled={isFreePlan}
//                 >
//                   <ChevronLeft />
//                 </button>
//                 <button
//                   className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 text-white"
//                   onClick={() => paginate(1)}
//                   disabled={isFreePlan}
//                 >
//                   <ChevronRight />
//                 </button>
//               </div>
//               {isFreePlan && (
//                 <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
//                   <button
//                     type="button"
//                     onClick={() => router.push("/profile/membership")}
//                     className="rounded-full cursor-pointer bg-gold-gradient px-6 py-3 text-sm font-semibold text-[#4B2A24] shadow-lg transition hover:scale-[1.02]"
//                   >
//                     Upgrade To View Profile
//                   </button>
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={() =>
//                 isFreePlan
//                   ? router.push("/profile/membership")
//                   : setIsGalleryOpen(true)
//               }
//               className="w-full py-2 cursor-pointer rounded-full border border-amber-900 text-amber-900 font-bold text-sm"
//             >
//               {isFreePlan ? "Upgrade To View Profile" : "View Gallery"}
//             </button>
//             {!isFreePlan && (
//               <PhotoModal
//                 isOpen={isGalleryOpen}
//                 onClose={() => setIsGalleryOpen(false)}
//                 images={images}
//               />
//             )}
//           </div>
//         </section>

//         <section
//           id="LookingFor"
//           ref={(element) => {
//             sectionRefs.current.LookingFor = element;
//           }}
//           className={`space-y-6 scroll-mt-24 ${ismatch ? "pb-32" : "pb-20"}`}
//         >
//           <div className="text-center space-y-2">
//             <h3 className="text-2xl font-bold font-playfair text-stone-800">
//               Looking for
//             </h3>
//             <p className="text-stone-500 text-sm">
//               Preferred partner requirements
//             </p>
//           </div>

//           <PreferenceSection
//             title="Basic Preferences"
//             items={[
//               {
//                 label: "Age Range",
//                 value: formatRange(preference.prefAgeRange, " Years"),
//                 matched: true,
//               },
//               {
//                 label: "Height Range",
//                 value: formatRange(preference.prefHeightRange, " cm"),
//                 matched: true,
//               },
//               {
//                 label: "Marital Status",
//                 value: normalizeValue(preference.prefMaritalStatus),
//                 matched: true,
//               },
//               {
//                 label: "Community",
//                 value: normalizeValue(preference.prefCommunities),
//                 matched: true,
//               },
//               {
//                 label: "Language",
//                 value: normalizeValue(preference.prefLanguages),
//                 matched: true,
//               },
//             ]}
//           />

//           <PreferenceSection
//             title="Education & Profession"
//             items={[
//               {
//                 label: "Min Education",
//                 value: normalizeValue(preference.minEducation),
//                 matched: true,
//               },
//               {
//                 label: "Profession",
//                 value: normalizeValue(preference.preferredProfession),
//                 matched: true,
//               },
//               {
//                 label: "Income Range",
//                 value: normalizeValue(preference.annualIncomeRange),
//                 matched: true,
//               },
//             ]}
//           />

//           <PreferenceSection
//             title="Others"
//             items={[
//               {
//                 label: "Location",
//                 value: preference.prefLocation || "Anywhere",
//                 matched: true,
//               },
//               {
//                 label: "Relocate",
//                 value: preference.willingToRelocate ? "Yes" : "No",
//                 matched: true,
//               },
//               {
//                 label: "Horoscope Match",
//                 value: preference.horoscopeMatch ? "Required" : "Not Required",
//                 matched: preference.horoscopeMatch,
//               },
//             ]}
//           />
//         </section>
//       </div>

//       {ismatch && (
//         <div className="shrink-0 sticky bottom-0 z-40 bg-white p-4 border-t border-gray-100 flex items-center mb-20 sm:mb-0 gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
//           <button
//             disabled={hasInterest}
//             className={`flex-1 h-12 rounded-full font-bold ${
//               hasInterest
//                 ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 : "bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-white cursor-pointer"
//             }`}
//             onClick={() => sendInterest(targetUserId)}
//           >
//             {hasInterest ? "Interest Sent" : "Send Interest"}
//           </button>
//           <button
//             className={`w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer ${
//               isShortlisted
//                 ? "border-rose-200 bg-rose-50"
//                 : "border-gray-200 bg-white"
//             }`}
//             onClick={() =>
//               toggleShortlist(
//                 targetUserId,
//                 isShortlisted ? "remove" : "add",
//               )
//             }
//             title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
//           >
//             <Heart
//               className={isShortlisted ? "text-rose-500" : "text-gray-400"}
//               fill={isShortlisted ? "currentColor" : "none"}
//             />
//           </button>
//           <button
//             disabled={hasChatRequest}
//             className={`w-12 h-12 rounded-full border flex items-center justify-center ${
//               hasChatRequest
//                 ? "border-gray-200 bg-gray-100 cursor-not-allowed"
//                 : "border-gray-200 bg-white cursor-pointer"
//             }`}
//             onClick={() => sendChatRequest(targetUserId)}
//             title={hasChatRequest ? "Chat request sent" : "Send chat request"}
//           >
//             <MessageCircle
//               className={hasChatRequest ? "text-green-600" : "text-gray-400"}
//               fill={hasChatRequest ? "currentColor" : "none"}
//             />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function SectionHeader({ title }) {
//   return (
//     <h3 className="text-lg font-bold font-playfair text-stone-800 mb-2">
//       {title}
//     </h3>
//   );
// }

// function InfoRow({ icon, label, value, border }) {
//   return (
//     <div
//       className={`flex items-center gap-4 py-2 ${border ? "border-b border-gray-50" : ""}`}
//     >
//       {icon === "ring" ? (
//         <Users size={18} className="text-green-600" />
//       ) : icon ? (
//         <div className="text-green-600">{icon}</div>
//       ) : (
//         <div className="w-5" />
//       )}
//       <div className="flex text-sm gap-2">
//         <span className="text-stone-400 font-normal">{label}:</span>
//         <span className="text-stone-800 font-medium">{value || "-"}</span>
//       </div>
//     </div>
//   );
// }

// function PreferenceSection({ title, items }) {
//   return (
//     <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
//       <div className="p-4 bg-stone-50/50 border-b border-stone-100 font-bold text-stone-800">
//         {title}
//       </div>
//       {items.map((item, index) => (
//         <div
//           key={index}
//           className="flex justify-between items-center px-6 py-3 border-b border-gray-50 last:border-0"
//         >
//           <div className="flex flex-col">
//             <span className="text-xs font-semibold text-stone-500 uppercase tracking-tighter">
//               {item.label}
//             </span>
//             <span className="text-sm text-stone-800 font-medium">
//               {item.value}
//             </span>
//           </div>
//           {item.matched ? (
//             <Check size={18} className="text-green-600" />
//           ) : (
//             <X size={18} className="text-red-400" />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// function FamilyMember({ label, value }) {
//   return (
//     <div className="flex items-center gap-4">
//       <div className="w-2 h-2 rounded-full border border-stone-400 bg-white" />
//       <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-500">
//         {label}
//       </span>
//       <span className="text-stone-800 font-medium">{value}</span>
//     </div>
//   );
// }

//   <MatchCard
//           title="Why this match?"
//           items={[
//             {
//               text: "Same community",
//               icon: <UsersFour size={18} className="text-green-600" />,
//             },
//             {
//               text: "Same education",
//               icon: <GraduationCap size={18} className="text-green-600" />,
//             },
//             {
//               text: "Preferred location",
//               icon: <MapPin size={18} className="text-green-600" />,
//             },
//           ]}
//         />
// function MatchCard({ title, items }) {
//   return (
//     <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 text-center">
//       <h4 className="text-stone-400 text-sm font-bold mb-6">{title}</h4>
//       <div className="flex justify-between items-start px-16">
//         {items.map((item, index) => (
//           <div
//             key={index}
//             className="flex flex-col items-center gap-2 max-w-[120px]"
//           >
//             <div className="w-12 h-12 bg-white rounded-xl shadow-md border border-gray-50 flex items-center justify-center">
//               {item.icon}
//             </div>
//             <span className="text-[10px] font-bold text-stone-500">
//               {item.text}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
