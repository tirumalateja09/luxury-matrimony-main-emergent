"use client";

import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";

// --- Data Objects ---
const goldData = {
  id: "gold",
  theme: "gold",
  title: "Gold",
  subtitle: "Connect with confidence",
  price: "₹4,999",
  duration: "/ 3 Months",
  buttonText: "Upgrade to Gold",
  features: [
    { text: "Browse Profiles", included: true },
    { text: "Shortlist & Send Unlimited Interests", included: true },
    { text: "View Unblurred Profile Photos", included: true },
        { text: "Chat Message Request (5 per day)", included: true },
    { text: "View Contact Details", included: true },
    { text: "Advanced Search Filters", included: true },
  ],
  extraFeatures: [
    { text: "See Who Viewed Your Profile", included: true },
    { text: "Photo Gallery Access", included: false },
    // { text: "Voice & Video Calls", included: false },
    // { text: "Detailed Horoscope Matching", included: false },
    { text: "Profile Boost / Priority Listing", included: false },
  ],
};

const freeData = {
  id: "free",
  theme: "free",
  title: "Free",
  subtitle: "Start your journey",
  price: "₹0",
  duration: "/ Lifetime",
  buttonText: "Register Free",
  features: [
    { text: "Browse Profiles", included: true },
    { text: "Shortlist Profiles", included: true },
    { text: "Send Interest (Limited)", included: true },
    { text: "View Unblurred Photos", included: false },
    { text: "Chat & Messaging", included: false },
    // { text: "Voice & Video Calls", included: false },
  { text: "Advanced Search Filters", included: false },
    { text: "View Contact Details", included: false },
    { text: "Horoscope Matching", included: false },
    { text: "Profile Boost / Spotlight", included: false },
  ],
};

const premiumData = {
  id: "premium",
  theme: "premium",
  title: "Premium",
  subtitle: "For serious and priority matches",
  price: "₹9,999",
  duration: "/ 6 Months",
  buttonText: "Get Premium",
  features: [
    { text: "Browse Profiles", included: true },
    { text: "Unlimited Interests & Shortlisting", included: true },
    { text: "View Unblurred Photos", included: true },
    { text: "Full Photo Gallery Access", included: true },
    { text: "Unlimited Chat Messaging", included: true },
    // { text: "Voice & Video Calls", included: true },
   { text: "Advanced Search & Filters", included: true },
  ],
  extraFeatures: [
    { text: "View Contact Details", included: true },
    // { text: "Detailed Horoscope Matching", included: true },
       { text: "Horoscope Matching", included: true },
    { text: "See Who Viewed You", included: true },
    { text: "Profile Boost / Spotlight", included: true },
  ],
};

export default function PricingSection() {
  const [orderedPlans, setOrderedPlans] = useState([
    goldData,
    freeData,
    premiumData,
  ]);

  const [expandedId, setExpandedId] = useState(null);

  const router = useRouter();

  const handleCardClick = () => {
    const token = JSON.parse(
      localStorage.getItem("rvr_auth_data") || "{}",
    )?.token;

    localStorage.setItem("subscription", true);

    router.push(token ? "profile/membership" : "/profiledetails/step1");
  };

  // --- Logic to Swap Cards ---
  const handleSwap = (clickedIndex) => {
    const middleIndex = 1;
    if (clickedIndex === middleIndex) return;

    const newOrder = [...orderedPlans];
    const temp = newOrder[middleIndex];
    newOrder[middleIndex] = newOrder[clickedIndex];
    newOrder[clickedIndex] = temp;

    setOrderedPlans(newOrder);
    setExpandedId(null);
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  // --- Helper to ensure the correct tick icon travels with the card ---
  const getTickIcon = (theme) => {
    if (theme === "free") return "/home/tick.svg";
    return "/home/tickGr.svg";
  };

  const getTheme = (theme) => {
    if (theme === "premium")
      return {
        text: "text-white",
        sub: "text-gray-200",
        accent: "text-yellow-200",
        // Added 'text-[#2A1D1D]' for readability on the gold gradient
        btn: "bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] text-[#2A1D1D]",
        check: "text-yellow-200",
      };
    if (theme === "gold")
      return {
        text: "text-gray-800",
        sub: "text-gray-500",
        accent: "text-yellow-600",
        btn: "bg-[#429466] text-white",
        check: "text-yellow-600",
      };
    return {
      text: "text-gray-800",
      sub: "text-gray-500",
      accent: "text-yellow-600",
      // Changed 'text-white' to 'text-[#2A1D1D]' so it's readable
      btn: "bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] text-[#2A1D1D]",
      check: "text-yellow-600",
    };
  };

  // --- SPECIAL STYLES (Backgrounds & Borders) ---
  const getCardStyle = (plan) => {
    // 1. GOLD CARD: Gradient Border
    if (plan.theme === "gold") {
      return {
        background: `
          linear-gradient(#FFF6EC, #FFF6EC) padding-box,
          linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%) border-box
        `,
        border: "1px solid transparent",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      };
    }
    // 2. FREE CARD: Specific White BG + Shadow
    if (plan.theme === "free") {
      return {
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 0px 20px 0px #00000040",
        border: "1px solid transparent",
      };
    }
    // 3. PREMIUM CARD: Specific Dark Gradient
    if (plan.theme === "premium") {
      return {
        background: "linear-gradient(270deg, #429466 0%, #152E20 120.59%)",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        border: "1px solid transparent",
      };
    }

    return { backgroundColor: "#ffffff" };
  };

  return (
    <div className="w-full  justify-center py-32 hidden md:flex">
      <LayoutGroup>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 max-w-5xl w-full items-center">
          {/* =======================
              1. LEFT POSITION DIV 
             ======================= */}
          <motion.div
            layout
            transition={{
              layout: { duration: 0.5, type: "spring", bounce: 0.2 },
            }}
            key={orderedPlans[0].id}
            onClick={() => handleSwap(0)}
            style={getCardStyle(orderedPlans[0])}
            className={`
              relative w-full rounded-3xl p-6 cursor-pointer flex flex-col justify-between 
              scale-95 opacity-90 z-10 min-h-[600px]
              ${getTheme(orderedPlans[0].theme).text}
            `}
          >
            <div>
              <h3
                className={`text-3xl font-semibold font-playfair mb-2 ${orderedPlans[0].theme === "premium" ? "text-white" : "text-[#639a82]"}`}
              >
                {orderedPlans[0].title}
              </h3>
              <p
                className={`text-sm mb-4 ${getTheme(orderedPlans[0].theme).sub}`}
              >
                {orderedPlans[0].subtitle}
              </p>
              <div className="flex items-baseline mb-6 border-b pb-6 border-gray-200/20">
                <span
                  className={`text-2xl font-bold mr-2 ${orderedPlans[0].theme === "free" ? "text-[#429466]" : "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] bg-clip-text text-transparent"}`}
                >
                  {orderedPlans[0].price}
                </span>

                <span
                  className={`text-lg ${getTheme(orderedPlans[0].theme).sub} text-[#7B6A64]`}
                >
                  {orderedPlans[0].duration}
                </span>
              </div>

              <ul className="space-y-3 mb-2 text-[15px]">
                {orderedPlans[0].features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {f.included ? (
                      <Image
                        // CHANGED: Dynamic icon source
                        src={getTickIcon(orderedPlans[0].theme)}
                        width={20}
                        height={20}
                        alt="tick"
                      />
                    ) : (
                      <IoCloseCircle className="w-5 h-5 text-[#BCB4B2] flex-shrink-0" />
                    )}
                    <span className={f.included ? "" : "text-[#BCB4B2] "}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {orderedPlans[0].extraFeatures && (
                <>
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${expandedId === orderedPlans[0].id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-3 pb-4 pt-1 text-[14px]">
                        {orderedPlans[0]?.extraFeatures?.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {f.included ? (
                              <Image
                                // CHANGED: Dynamic icon source
                                src={getTickIcon(orderedPlans[0].theme)}
                                width={20}
                                height={20}
                                alt="tick"
                              />
                            ) : (
                              <IoCloseCircle className="w-5 h-5 text-[#BCB4B2] flex-shrink-0" />
                            )}
                            <span
                              className={f.included ? "" : "text-[#BCB4B2]"}
                            >
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div
                    onClick={(e) => toggleExpand(e, orderedPlans[0].id)}
                    className="flex items-center gap-2 text-sm mb-6 mt-2 w-fit text-[#2A1D1D]"
                  >
                    {expandedId === orderedPlans[0].id
                      ? "View Less features"
                      : "View More Features"}{" "}
                    <FaArrowRight />
                  </div>
                </>
              )}
            </div>
            <button
              className={`w-full py-3 rounded-full text-[15px] font-semibold shadow-md cursor-pointer ${getTheme(orderedPlans[0].theme).btn}`}
              onClick={() => handleCardClick()}
            >
              {orderedPlans[0].buttonText}
            </button>
          </motion.div>

          {/* =======================
              2. MIDDLE POSITION DIV (HERO)
             ======================= */}
          <motion.div
            layout
            transition={{
              layout: { duration: 0.5, type: "spring", bounce: 0.2 },
            }}
            key={orderedPlans[1].id}
            onClick={() => handleSwap(1)}
            style={getCardStyle(orderedPlans[1])}
            className={`
              relative w-full rounded-3xl p-8 cursor-pointer flex flex-col justify-between
              md:scale-110 md:-my-12 py-6 z-30 min-h-[580px]
              ${getTheme(orderedPlans[1].theme).text}
            `}
          >
            <div>
              <h3
                className={`text-3xl font-serif font-bold mb-2 ${orderedPlans[1].theme === "premium" ? "text-white" : "text-[#639a82]"}`}
              >
                {orderedPlans[1].title}
              </h3>
              <p
                className={`text-sm mb-4 ${getTheme(orderedPlans[1].theme).sub}`}
              >
                {orderedPlans[1].subtitle}
              </p>
              <div className="flex items-baseline mb-6 border-b pb-6 border-gray-200/20">
                <span
                  className={`text-2xl font-bold mr-2 ${orderedPlans[1].theme === "free" ? "text-[#429466]" : "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] bg-clip-text text-transparent"}`}
                >
                  {orderedPlans[1].price}
                </span>
                <span className={`text-lg text-[#7B6A64]`}>
                  {orderedPlans[1].duration}
                </span>
              </div>

              <ul className="space-y-3 mb-2 text-[14px]">
                {orderedPlans[1].features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {f.included ? (
                      <Image
                        // CHANGED: Dynamic icon source
                        src={getTickIcon(orderedPlans[1].theme)}
                        width={20}
                        height={20}
                        alt="tick"
                      />
                    ) : (
                      <IoCloseCircle className="w-5 h-5 text-[#BCB4B2] flex-shrink-0" />
                    )}
                    <span className={f.included ? "" : " text-[#BCB4B2] "}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {orderedPlans[1].extraFeatures && (
                <>
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${expandedId === orderedPlans[1].id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-3 pb-4 pt-1 text-[14px]">
                        {orderedPlans[1]?.extraFeatures?.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {f.included ? (
                              <Image
                                // CHANGED: Dynamic icon source
                                src={getTickIcon(orderedPlans[1].theme)}
                                width={20}
                                height={20}
                                alt="tick"
                              />
                            ) : (
                              <IoCloseCircle className="w-5 h-5 text-[#BCB4B2] flex-shrink-0" />
                            )}
                            <span
                              className={f.included ? "" : "text-[#BCB4B2] "}
                            >
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div
                    onClick={(e) => toggleExpand(e, orderedPlans[1].id)}
                    className="flex items-center gap-2 text-sm mb-6 mt-2 hover:underline w-fit"
                  >
                    {expandedId === orderedPlans[1].id
                      ? "View Less features"
                      : "View More Features"}{" "}
                    <FaArrowRight />
                  </div>
                </>
              )}
            </div>
            <button
              className={`w-full py-3 rounded-full text-[15px] font-semibold shadow-md cursor-pointer ${getTheme(orderedPlans[1].theme).btn}`}
              onClick={() => handleCardClick()}
            >
              {orderedPlans[1].buttonText}
            </button>
          </motion.div>

          {/* =======================
              3. RIGHT POSITION DIV
             ======================= */}
          <motion.div
            layout
            transition={{
              layout: { duration: 0.5, type: "spring", bounce: 0.2 },
            }}
            key={orderedPlans[2].id}
            onClick={() => handleSwap(2)}
            style={getCardStyle(orderedPlans[2])}
            className={`
              relative w-full rounded-3xl p-6 cursor-pointer flex flex-col justify-between 
              scale-95 opacity-90 z-10 min-h-[600px]
              ${getTheme(orderedPlans[2].theme).text}
            `}
          >
            <div>
              <h3
                className={`text-3xl font-serif font-bold mb-2 ${orderedPlans[2].theme === "premium" ? "text-white" : "text-[#639a82]"}`}
              >
                {orderedPlans[2].title}
              </h3>
              <p
                className={`text-sm mb-4 ${getTheme(orderedPlans[2].theme).sub}`}
              >
                {orderedPlans[2].subtitle}
              </p>
              <div className="flex items-baseline mb-6 border-b pb-6 border-gray-200/20">
                <span
                  className={`text-2xl font-bold mr-2 ${orderedPlans[2].theme === "free" ? "text-[#429466]" : "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] bg-clip-text text-transparent"}`}
                >
                  {orderedPlans[2].price}
                </span>
                <span
                  className={`text-lg ${getTheme(orderedPlans[2].theme).sub}`}
                >
                  {orderedPlans[2].duration}
                </span>
              </div>

              <ul className="space-y-3 mb-2 text-[14px]">
                {orderedPlans[2].features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {f.included ? (
                      <Image
                        // CHANGED: Dynamic icon source
                        src={getTickIcon(orderedPlans[2].theme)}
                        width={20}
                        height={20}
                        alt="tick"
                      />
                    ) : (
                      <IoCloseCircle className="w-5 h-5 text-[#BCB4B2] flex-shrink-0" />
                    )}
                    <span className={f.included ? "" : "text-[#BCB4B2] "}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {orderedPlans[2].extraFeatures && (
                <>
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${expandedId === orderedPlans[2].id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <ul className="space-y-3 pb-4 pt-1 text-[14px]">
                        {orderedPlans[2]?.extraFeatures?.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {f.included ? (
                              <Image
                                // CHANGED: Dynamic icon source
                                src={getTickIcon(orderedPlans[2].theme)}
                                width={20}
                                height={20}
                                alt="tick"
                              />
                            ) : (
                              <IoCloseCircle className="w-5 h-5 text-[#BCB4B2] flex-shrink-0" />
                            )}
                            <span
                              className={f.included ? "" : "text-[#BCB4B2]"}
                            >
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    onClick={(e) => toggleExpand(e, orderedPlans[2].id)}
                    className="flex items-center gap-2 text-sm font-semibold mb-6 mt-2 hover:underline w-fit"
                  >
                    {expandedId === orderedPlans[2].id
                      ? "View Less features"
                      : "View More Features"}{" "}
                    <FaArrowRight />
                  </div>
                </>
              )}
            </div>
            <button
              className={`w-full py-3 rounded-full text-[15px] font-semibold shadow-md cursor-pointer ${getTheme(orderedPlans[2].theme).btn}`}
              onClick={() => handleCardClick()}
            >
              {orderedPlans[2].buttonText}
            </button>
          </motion.div>
        </div>
      </LayoutGroup>
    </div>
  );
}
