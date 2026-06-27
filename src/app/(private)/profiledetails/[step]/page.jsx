"use client";

import { useParams, useRouter } from "next/navigation";
import { REGISTER_STEPS } from "@/app/lib/registerSteps";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  User,
  Languages,
  MapPin,
  GraduationCap,
  Star,
  Users,
  Camera,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BiChevronLeft } from "react-icons/bi";
import Image from "next/image";

import BasicDetails from "@/app/component/Register/BasicDetails";
import Community from "@/app/component/Register/Community";
import Location from "@/app/component/Register/Location";
import EducationAndProfession from "@/app/component/Register/EducationAndProfession";
import Horoscope from "@/app/component/Register/Horoscope";
import MatchPreference from "@/app/component/Register/MatchPreference";
import UploadPhoto from "@/app/component/Register/UploadPhoto";
import VerifyPhoto from "@/app/component/Register/VerifyPhoto";
import RegisterHead from "@/app/component/Register/RegisterHead";
import { api } from "@/lib/apiClient";

const getStepIcon = (id) => {
  const icons = [
    User,
    Languages,
    MapPin,
    GraduationCap,
    Star,
    Users,
    Camera,
    ShieldCheck,
  ];
  return icons[id - 1] || User;
};

const DefaultStep = () => <div>Component not created yet</div>;

export default function RegisterStepPage() {
  const params = useParams();
  const router = useRouter();

  const rawStep = params.step?.toString() || "";
  let stepNumber;

  // --- ROUTING LOGIC ---
  if (rawStep.toLowerCase() === "preferences") {
    stepNumber = 6;
  } else if (rawStep.toLowerCase() === "upload-photo") {
    stepNumber = 7;
  } else if (rawStep.toLowerCase() === "verify") {
    stepNumber = 8;
  } else {
    stepNumber = Number(rawStep.toLowerCase().replace("step", ""));
  }

  let stepConfig = REGISTER_STEPS.find((s) => s.id === stepNumber);
  if (!stepConfig) {
    if (stepNumber === 6) stepConfig = { id: 6, title: "Your Match Preference" };
    else if (stepNumber === 7) stepConfig = { id: 7, title: "Upload Photo" };
    else if (stepNumber === 8) stepConfig = { id: 8, title: "Verify Profile" };
  }

  // --- PROGRESS LOGIC ---
  const totalSteps = 8;
  const visualTotalSteps = 5;
  const visualStepNumber = stepNumber > 6 ? 6 : stepNumber;
  const progressPercent = Math.round(
    (visualStepNumber / visualTotalSteps) * 100,
  );

  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        // Only trigger scroll on desktop screens (md breakpoint: 768px and above)
        if (window.innerWidth >= 768 && containerRef.current) {
          // Since layout.jsx uses <main className="overflow-y-auto"> instead of window scroll,
          // window.scrollTo won't work. We use scrollIntoView to scroll the specific container. 
          containerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start" // Aligns the top of the div to the top of the scrollable <main>
          });
        }
      }, 500); // 500ms timeout ensures page fully renders first

      return () => clearTimeout(timer);
    }
  }, [isMounted, stepNumber]);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("registerData");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return { user_details: {} };
  });

  const profileCreatedFor = formData.user_details?.[1]?.profileCreatedFor || "";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted)
      sessionStorage.setItem("registerData", JSON.stringify(formData));
  }, [formData, isMounted]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const currentStepData = prev.user_details?.[stepNumber] || {};
      return {
        ...prev,
        user_details: {
          ...prev.user_details,
          [stepNumber]: { ...currentStepData, [field]: value },
        },
      };
    });
  };

  const prevStep = () => {
    if (stepNumber <= 1) return;

    if (stepNumber === 8) {
      router.push(`/profiledetails/upload-photo`);
      return;
    }
    if (stepNumber === 7) {
      router.push(`/profiledetails/preferences`);
      return;
    }
    if (stepNumber === 6) {
      router.push(`/profiledetails/step5`);
      return;
    }
    router.push(`/profiledetails/step${stepNumber - 1}`);
  };

  const nextStep = async () => {
    // --- VALIDATION LOGIC ---
    const currentData = formData.user_details?.[stepNumber] || {};

    if (stepNumber === 1) {
      const {
        profileCreatedFor, fullName, dob, height, gender, maritalStatus, physicalStatus, familyStatus,
        numberOfChildren, childrenLivingTogether, phoneVerified
      } = currentData;
      if (!profileCreatedFor || !fullName || !dob || !height || !gender || !maritalStatus || !physicalStatus || !familyStatus) {
        toast.error("Please fill all mandatory fields.");
        return;
      }

      if (!phoneVerified) {
        toast.error("Please verify your phone number before continuing.");
        return;
      }

      // Dynamic conditional validation for divorced/widowed users
      if (maritalStatus && maritalStatus !== "Never Married") {
        if (numberOfChildren === undefined || numberOfChildren === null || numberOfChildren === "") {
          toast.error("Please specify the number of children.");
          return;
        }

        if (numberOfChildren > 0 && !childrenLivingTogether) {
          toast.error("Please specify if children are living with you.");
          return;
        }
      }
    } else if (stepNumber === 2) {
      const { motherTongue, religion, community } = currentData;
      if (!motherTongue || !religion || !community) {
        toast.error("Please fill all mandatory fields.");
        return;
      }
    } else if (stepNumber === 3) {
      const { country, state, city, citizenship, residentStatus } = currentData;
      if (!country || !state || !city) {
        toast.error("Please fill all mandatory fields.");
        return;
      }
      if (country !== "IN" && (!citizenship || !residentStatus)) {
        toast.error("Please fill all mandatory fields.");
        return;
      }
    } else if (stepNumber === 4) {
      const { highestEducation, degree, profession, currency, incomeRange } = currentData;
      if (!highestEducation || !degree || !profession || !currency || !incomeRange) {

        toast.error("Please fill all mandatory fields.");
        return;
      }
    } else if (stepNumber === 5) {
      const { rashi, manglik, nakshatra, gothram, birthPlace, lat, long } = currentData;
      const hasCoordinates =
        lat !== undefined && lat !== null && lat !== "" &&
        long !== undefined && long !== null && long !== "";

      if (!rashi || !manglik || !nakshatra || !gothram || !birthPlace || !hasCoordinates) {
        toast.error("Please fill all mandatory fields.");
        return;
      }
    }

    // --- STEP 5: Main Profile Submission (Step 1 to 5) ---
    if (stepNumber === 5) {
      try {
        const mainProfileData = Object.entries(formData.user_details)
          .filter(([key]) => Number(key) <= 5)
          .reduce((acc, [_, stepData]) => ({ ...acc, ...stepData }), {});

        const payload = {
          ...mainProfileData,
        };



        const response = await api.put("/profile/update", payload, "private");

        if (response.success) {
          router.push(`/profiledetails/preferences`);
        }
      } catch (err) {
        console.error("Profile Submission Error:", err);
        toast.error("Failed to save profile. Please try again.");
      }
      return;
    }

    // --- STEP 6: Match Preferences (Separate API) ---
    if (stepNumber === 6) {
      try {
        const preferenceData = formData.user_details[6];
        await api.put("/profile/preferences", preferenceData, "private");
        router.push(`/profiledetails/upload-photo`);
      } catch (err) {
        console.error("Preferences Error:", err);
      }
      return;
    }

    // --- STEP 7: Photo Upload (Separate Logic) ---
    if (stepNumber === 7) {
      router.push(`/profiledetails/verify`);
      return;
    }

    // --- STEP 8: Final Step / Verification ---
    if (stepNumber === totalSteps) {
      try {
        const preferenceData = formData.user_details[8];
        const response = await api.put(
          "/profile/update",
          preferenceData,
          "private",
        );
        if (response.success) {
          const isMobile = window.innerWidth < 768;

          sessionStorage.removeItem("registerData"); // Clean up session storage after successful registration
          localStorage.removeItem("registerData"); // Clean up any lingering old localStorage data

          const storedRedirect = localStorage.getItem("postAuthRedirect");

          if (isMobile) {
            router.push("/profile-view");
          } else {
            const isSubscribed =
              localStorage.getItem("subscription") === "true";

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
          }
        }
      } catch (err) {
        console.error("Preferences Error:", err);
      }
      return;
    }

    // Default navigation for Steps 1, 2, 3, and 4
    router.push(`/profiledetails/step${stepNumber + 1}`);
  };

  const skipStep6 = () => {
    router.push("/profiledetails/upload-photo");
  };

  const skipStep7 = () => {
    router.push("/profiledetails/verify");
  };

  const skipStep8 = () => {
    router.push("/profile-view");
  };

  const handleSkip = () => {
    if (stepNumber === 6) skipStep6();
    else if (stepNumber === 7) skipStep7();
    else if (stepNumber === 8) skipStep8();
  };

  if (!stepConfig) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-bold text-red-500">Step not found</h2>
        <p className="text-gray-600 mt-2">
          Could not find configuration for ID: {stepNumber}.
          <br /> Please check <code>app/lib/registerSteps.js</code>
        </p>
      </div>
    );
  }

  if (!isMounted) return null;

  return (
    <div>
      <RegisterHead />
      {/* LAYOUT FIX:
         - h-screen: Locks height to viewport so internal scrolling works.
         - overflow-hidden: Prevents body scrollbar.
      */}
      <div
        ref={containerRef}
        className="min-h-screen flex w-full md:bg-[#FFFBF5] font-sans md:px-20 py-2 md:items-center justify-center relative overflow-hidden"
      >

        {/* MAIN CONTENT AREA
            - h-full: Takes full height of h-screen container.
            - overflow-hidden: Ensures children manage their own scroll.
        */}
        <div className="w-full max-w-[730px] flex flex-col md:p-8 gap-8 h-full items-stretch z-40 overflow-hidden">

          <div className="hidden md:flex flex-row shrink-0 relative w-full items-center h-auto overflow-x-auto no-scrollbar pb-4">
            {/* min-w-max prevents squishing if there are too many steps */}
            <div className="w-full flex flex-row items-start justify-between px-2">
              {REGISTER_STEPS.map((s, index) => {
                if (s.id > 6) return null;

                const Icon = getStepIcon(s.id);
                const isActive = s.id === stepNumber;
                const isCompleted = s.id < stepNumber;

                // FIX 1: Accurately find the last rendered step
                const isLastRenderedStep =
                  s.id === 6 || index === REGISTER_STEPS.length - 1;

                return (
                  <div
                    key={s.id}
                    // FIX 2: Give flex-1 to all items except the last one to distribute gaps evenly
                    className={`flex flex-row items-start ${!isLastRenderedStep ? "flex-1" : ""
                      } group cursor-pointer`}
                  >
                    {/* Icon and Title Container */}
                    {/* FIX 3: Fixed width (w-20) and shrink-0 keeps the text from squishing */}
                    <div className="flex flex-col items-center justify-start gap-2 w-20 shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-200 z-10 ${isActive
                          ? "bg-[#3b9b72] border-[#3b9b72] text-white shadow-md"
                          : isCompleted
                            ? "bg-[#BCB4B2] border-[#BCB4B2] text-[#7B6A64]"
                            : "bg-white border-gray-200 text-[#429466]"
                          }`}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <h2
                        className={`text-center text-sm ${isActive
                          ? "font-semibold text-[#22613d]"
                          : "text-[#2A1D1D]"
                          }`}
                      >
                        {s.title}
                      </h2>
                    </div>

                    {/* Divider */}
                    {!isLastRenderedStep && (
                      // FIX 4: h-10 perfectly aligns the divider with the center of the 40px (h-10) icon
                      <div className="flex-1 flex items-center justify-center h-10 px-2">
                        <Image
                          src={"/Register/divider.png"}
                          height={40}
                          width={15}
                          alt="divider"
                          className="h-11 w-2 -rotate-90 object-contain"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM CONTENT (Formerly Right Content) */}
          <div className="flex-1 flex flex-col relative md:bg-[#FFF6EC] border border-[#E7B8A5] rounded-3xl md:px-6">
            {/* Header */}
            <div className="md:flex items-center hidden shrink-0 mb-6 w-full pt-10 relative">
              {/* LEFT BUTTON */}
              {stepNumber > 1 && (
                <button
                  onClick={prevStep}
                  disabled={stepNumber === 1}
                  className="flex items-center gap-1 cursor-pointer z-10"
                >
                  <ChevronLeft className="text-[#429466]" />
                  <p className="text-[#429466]">Back</p>
                </button>
              )}

              {/* CENTER TITLE */}
              <h1 className="absolute left-1/2 -translate-x-1/2 font-inter text-xl text-[#2d2424] whitespace-nowrap">
                {stepConfig.title}
              </h1>

              {/* RIGHT BUTTON */}
              {stepNumber >= 6 && (
                <button
                  onClick={handleSkip}
                  className="absolute right-0 flex items-center gap-1 font-inter text-[16px] font-normal leading-normal cursor-pointer z-10"
                  style={{ color: "var(--Tertiary-03, #429466)" }}
                >
                  Skip for now <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* DESKTOP PROGRESS BAR */}
            {stepNumber <= 5 && (
              // ADDED: "hidden md:block" to hide this duplicate on mobile
              <div className="hidden md:block w-full shrink-0">
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  <span>
                    Step {visualStepNumber} / {visualTotalSteps}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#f0e6e0] rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-[#3b9b72] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div
              className="z-50 h-16 w-screen absolute -top-2 -left-0 shadow-[0px_8px_20px_0px_#0000001A] rounded-bl-[20px] rounded-br-[20px] md:hidden pb-[1px]"
              style={{
                background:
                  "linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%)",
              }}
            >
              <div className="bg-[#FFF6EC] w-full h-full rounded-bl-[19px] rounded-br-[19px] px-4 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <button
                    onClick={prevStep}
                    disabled={stepNumber === 1}
                    className={`rounded-full h-[42px] w-[42px] flex items-center justify-center cursor-pointer bg-[#429466]`}
                  >
                    <ChevronLeft className="text-white" />
                  </button>
                  <h1 className="text-xl text-[#2d2424]">{stepConfig.title}</h1>
                </div>
                {stepNumber >= 6 && (
                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-1 font-inter text-[16px] font-normal leading-normal hover:underline cursor-pointer z-10"
                    style={{ color: "var(--Tertiary-03, #429466)" }}
                  >
                    Skip for now <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* NON-SCROLLABLE FORM AREA (Expands naturally) */}
            <div className="flex-1 pr-2 flex flex-col pb-4 overflow-visible">
              {stepNumber <= 5 && (
                <>
                  <div className="shrink-0 w-full md:hidden">
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide mt-20 max-sm:px-4">
                      <span>
                        Step {visualStepNumber} / {visualTotalSteps}
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-[90%] mx-auto h-1.5 bg-[#f0e6e0] rounded-full overflow-hidden mb-6">
                      <div
                        className="h-full bg-[#3b9b72] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              {(() => {
                const currentStepData =
                  formData.user_details?.[stepNumber] || {};
                switch (stepNumber) {
                  case 1:
                    return (
                      <BasicDetails
                        data={currentStepData}
                        onChange={handleFieldChange}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );
                  case 2:
                    return (
                      <Community
                        data={currentStepData}
                        onChange={handleFieldChange}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );
                  case 3:
                    return (
                      <Location
                        data={currentStepData}
                        onChange={handleFieldChange}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );
                  case 4:
                    return (
                      <EducationAndProfession
                        data={currentStepData}
                        onChange={handleFieldChange}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );
                  case 5:
                    return (
                      <Horoscope
                        data={currentStepData}
                        onChange={handleFieldChange}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );
                  case 6:
                    return (
                      <MatchPreference
                        data={currentStepData}
                        onChange={handleFieldChange}
                        skipStep6={skipStep6}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );
                  case 7:
                    return (
                      <UploadPhoto
                        data={currentStepData}
                        onChange={handleFieldChange}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );
                  case 8:
                    return (
                      <VerifyPhoto
                        data={currentStepData}
                        onChange={handleFieldChange}
                        profileCreatedFor={profileCreatedFor}
                        onNext={nextStep}
                      />
                    );

                  default:
                    return <DefaultStep />;
                }
              })()}
            </div>

            {/* FIXED BOTTOM FOOTER (NEXT BUTTON) */}
            <div className="shrink-0 pt-2 pb-6 flex justify-end z-40 md:bg-[#FFFBF5] max-sm:mr-4 md:hidden">
              <button
                onClick={nextStep}
                className={`${stepNumber === totalSteps ? "w-full px-14 py-5" : "w-[174px] md:w-auto py-5 px-14 md:px-30"} rounded-full font-inter font-medium md:text-[18px] text-center text-[#2d2424] shadow-lg transition-all active:scale-95 hover:shadow-xl cursor-pointer`}
                style={{
                  background:
                    "linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%)",
                }}
              >
                {stepNumber === totalSteps ? "Explore Matches" : "Next"}
              </button>
            </div>
          </div>
        </div>


        {/* ── Symmetrical Luxury Background Ornaments ── */}

        {/* Top Left Circular Mandala */}
        <Image
          src="https://res.cloudinary.com/dhf0ydaoz/image/upload/v1782540999/Pngtree_luxury_golden_islamic_mandala_for_7494417_edbyhd.png"
          alt="decoration"
          width={280}
          height={280}
          className="absolute -top-20 -left-24 pointer-events-none z-10 select-none max-lg:hidden opacity-95 saturate-150 brightness-100 drop-shadow-[0_0_12px_rgba(227,180,80,0.45)]"
        />

        {/* Top Right Circular Mandala */}
        <Image
          src="https://res.cloudinary.com/dhf0ydaoz/image/upload/v1782540999/Pngtree_luxury_golden_islamic_mandala_for_7494417_edbyhd.png"
          alt="decoration"
          width={280}
          height={280}
          className="absolute -top-20 -right-24 pointer-events-none z-10 select-none max-lg:hidden opacity-95 saturate-150 brightness-100 drop-shadow-[0_0_12px_rgba(227,180,80,0.45)]"
        />

        {/* Center Left Vertical Leaf Ornament */}
        {/* <Image
          src="/home/leftIllustration.svg"
          alt="decoration"
          width={60}
          height={180}
          className="absolute top-1/2 -translate-y-1/2 left-6 pointer-events-none z-10 select-none max-lg:hidden h-auto opacity-95 saturate-250 brightness-90 drop-shadow-[0_0_12px_rgba(227,180,80,0.45)]"
        /> */}

        {/* Center Right Vertical Leaf Ornament (Mirrored) */}
        {/* <Image
          src="/home/leftIllustration.svg"
          alt="decoration"
          width={60}
          height={180}
          className="absolute top-1/2 -translate-y-1/2 right-6 pointer-events-none z-10 select-none scale-x-[-1] max-lg:hidden h-auto opacity-95 saturate-250 brightness-90 drop-shadow-[0_0_12px_rgba(227,180,80,0.45)]"
        /> */}

        {/* Bottom Left Traditional Gold Graphic */}
        <Image
          src="/home/illustration2.svg"
          alt="decoration"
          width={220}
          height={220}
          className="absolute -bottom-10 -left-10 pointer-events-none z-10 select-none max-lg:hidden opacity-85 saturate-100 brightness-90 drop-shadow-[0_0_12px_rgba(227,180,80,0.45)]"
        />

        {/* Bottom Right Traditional Gold Graphic */}
        <Image
          src="/Login/illustration1.svg"
          width={320}
          height={320}
          alt="decoration"
          className="absolute -bottom-10 -right-10 pointer-events-none z-10 select-none max-lg:hidden opacity-85 saturate-100 brightness-90 drop-shadow-[0_0_12px_rgba(227,180,80,0.45)]"
        />


      </div>
    </div>
  );
}
