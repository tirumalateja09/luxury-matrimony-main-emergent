import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { LuCircleCheckBig } from "react-icons/lu";
import { ShieldIcon } from "@phosphor-icons/react";
import { FaCheck } from "react-icons/fa6";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const Steps = () => {
  const router = useRouter();

  return (
    <div className="px-5 md:px-12 bg-[#FEFCF5] lg:px-24 py-20 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className=" font-playfair text-[40px] font-semibold leading-tight text-[#2D2D2D]">
            Find Your <span className="text-[#A96060]">Telugu Life Partner</span>
          </h1>
          <p className="text-[#7B6A64] font-medium text-2xl mt-2 font-inter">
            In Three Simple Steps
          </p>
        </div>
        <button
          className="border-[1.18px] text-[#2A1D1D] border-[#6E2F2F] hover:border-0 hover:bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] bg-[#FFFFFF] cursor-pointer shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)]
          rounded-full font-semibold text-lg px-8 py-3  transition-all duration-300 "
          onClick={() => router.push("/home")}
        >
          Start Your Journey
        </button>
      </div>

      <LayoutGroup>
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[670px] items-stretch">
          {/* Card 01: Preferences */}
          <CardWrapper
            number="01."
            title="Define Gothram & Nakshatram"
            description="Provide your traditional star, ancestral lineage (Gothram), and partner preferences for accurate matchmaking."
          >
            <PreferencesGraphic />
          </CardWrapper>

          {/* Card 02: Profiles */}
          <CardWrapper
            number="02."
            title="Browse Screened Profiles"
            description="Explore verified profiles of Telugu brides and grooms, filtered by education, sub-caste, and location."
          >
            <ProfilesGraphic />
          </CardWrapper>

          {/* Card 03: Chat */}
          <CardWrapper
            number="03."
            title="Initiate Shubhalagnam"
            description="Send interest requests, securely share horoscopes (Jatakam), and begin secure family conversations."
          >
            <ChatGraphic />
          </CardWrapper>
        </div>
      </LayoutGroup>
    </div>
  );
};

// ------------------------------------------------------------------
// 1. Shared Card Wrapper
// ------------------------------------------------------------------
const CardWrapper = ({ number, title, description, children }) => {
  return (
    <motion.div
      layout
      // UPDATED: hover:flex-[2.5] allows massive growth.
      // UPDATED: lg:min-w-[240px] allows siblings to shrink enough to fit.
      className="group rounded-[32px] p-8 flex flex-col h-full relative border border-transparent cursor-default flex-1 hover:flex-[2.5] min-w-[300px] lg:min-w-[240px] transition-all duration-500 ease-in-out overflow-hidden"
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: {
          backgroundColor: "#F3DED3",
          boxShadow: "0px 0px 0px rgba(0,0,0,0)",
        },
        hover: {
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 20px 40px rgba(0,0,0,0.08)",
        },
      }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <motion.h1
        layout="position"
        className="font-serif font-bold text-3xl text-[#A96060] mb-6"
      >
        {number}
      </motion.h1>

      <motion.div layout className="flex-grow flex flex-col relative z-10 mb-8">
        {children}
      </motion.div>

      <motion.div layout="position" className="mt-auto">
        <motion.h2
          layout="position"
          className="font-serif font-bold md:text-2xl text-[#6E2F2F] mb-3 leading-tight group-hover:text-[#5A3F3F] transition-colors whitespace-nowrap lg:whitespace-normal"
        >
          {title}
        </motion.h2>
        <motion.p
          layout="position"
          className="text-[#2A1D1D] font-medium leading-relaxed"
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

// ------------------------------------------------------------------
// 2. Graphic: Preferences (Card 1)
// ------------------------------------------------------------------
const PreferencesGraphic = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState("Just Joined");

  return (
    <div className="w-full relative mt-4">
      <div className="h-4 bg-[#A4A4A4] rounded-full w-32 mb-4 opacity-40"></div>

      <div className="relative mb-6 z-20 w-full max-w-[90%]">
        <motion.div
          className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          whileTap={{ scale: 0.98 }}
        >
          <div className="h-3 bg-[#A4A4A4] rounded-full w-32 opacity-40"></div>
          <motion.svg
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            className="h-4 w-4 text-[#A4A4A4]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </motion.svg>
        </motion.div>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 5 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 w-48 bg-white rounded-lg border border-[#E0E0E0] shadow-lg overflow-hidden z-30"
            >
              <div
                className="flex items-center justify-between p-3 border-b border-[#E0E0E0] cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setSelectedOption(
                    selectedOption === "Verified" ? "" : "Verified",
                  )
                }
              >
                <span className="text-sm text-[#6B4F4F]">Verified</span>
                <div
                  className={`h-4 w-4 border rounded flex items-center justify-center ${
                    selectedOption === "Verified"
                      ? "bg-[#E8C489] border-[#E8C489]"
                      : "border-[#D8B4A0]"
                  }`}
                >
                  {selectedOption === "Verified" && (
                    <LuCircleCheckBig size={10} />
                  )}
                </div>
              </div>
              <div
                className="flex items-center justify-between p-3 bg-[#F8F4F2] cursor-pointer"
                onClick={() => setSelectedOption("Just Joined")}
              >
                <span className="text-sm text-[#6B4F4F]">Just Joined</span>
                <div
                  className={`h-4 w-4 border rounded flex items-center justify-center ${
                    selectedOption === "Just Joined"
                      ? "bg-[#E8C489] border-[#E8C489]"
                      : "border-[#D8B4A0]"
                  }`}
                >
                  {selectedOption === "Just Joined" && (
                    <LuCircleCheckBig size={10} />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-4 bg-[#A4A4A4] rounded-full w-24 mb-4 opacity-40 mt-8"></div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          <Pill width="w-16" />
          <Pill width="w-20" />
          <Pill width="w-12" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Pill width="w-14" />
          <Pill width="w-16" />
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 3. Graphic: Profiles (Card 2)
// ------------------------------------------------------------------
const ProfilesGraphic = () => {
  return (
    <div className="w-full flex justify-center">
      <motion.div
        className="w-[306px] bg-white max-h-[579px] rounded-2xl shadow-[0px_0px_20px_0px_#1F5C3A26] overflow-hidden relative"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="h-[204px] bg-[#F6E8E6] rounded-xl relative p-3 flex justify-end gap-2">
          <div className="w-7 h-7 rounded-full bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] flex items-center justify-center shadow-sm">
            <LuCircleCheckBig
              size={18}
              className="text-[#6E2F2F] stroke-[#6E2F2F]"
            />
          </div>
          <div className="w-7 h-7 rounded-full  bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] flex items-center justify-center shadow-sm">
            <ShieldIcon size={18} className="text-[#6E2F2F] stroke-[#6E2F2F]" />
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="h-3 bg-[#AAAAAA] rounded-full w-3/4"></div>
          <div className="h-2 bg-[#DCDCDC] rounded-full w-4/6"></div>
          <div className="h-2 bg-[#DCDCDC] rounded-full w-full"></div>
          <div className="h-2 bg-[#DCDCDC] rounded-full w-5/6"></div>

          <div className="h-10 bg-[#DCDCDC] mt-4 w-full flex justify-center items-center">
            <div className="h-3 bg-[#AAAAAA] rounded-full w-4/6"></div>
          </div>

          <div className="flex justify-center gap-8 mt-2 pt-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-11 h-11 shadow-[0_0_20px_#00000026] rounded-full border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                <span className="text-[#DCDCDC] text-sm">✕</span>
              </div>
              <span className="text-sm text-[#AAAAAA] font-medium">Decline</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-11 h-11 shadow-[0_0_20px_#00000026] rounded-full bg-[#DCDCDC] flex items-center justify-center">
                <FaCheck size={16} className=" text-white" />
              </div>
              <span className="text-[#AAAAAA] font-medium text-sm">Accept</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ------------------------------------------------------------------
// 4. Graphic: Chat (Card 3)
// ------------------------------------------------------------------
const ChatGraphic = () => {
  return (
    <div className="w-full flex flex-col justify-between h-full pt-8">
      <div className="flex flex-col gap-6 w-full">
        <div className=" w-full">
          <motion.div
            className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm w-[85%] self-start"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-2.5 bg-[#A4A4A4] rounded-full w-32 mb-2 opacity-50"></div>
            <div className="h-2.5 bg-[#A4A4A4] rounded-full w-24 opacity-30"></div>
          </motion.div>
          <span className="text-[10px] text-gray-400 mt-1 block ml-2">
            10:40 AM
          </span>
        </div>

        <div className="self-end flex flex-col items-end w-full">
          <motion.div
            className="bg-[#D8D8D8] p-4 rounded-2xl rounded-br-none shadow-sm w-[85%]"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="h-2.5 bg-gray-600 rounded-full w-40 mb-2 opacity-40"></div>
            <div className="h-2.5 bg-gray-600 rounded-full w-28 opacity-40"></div>
            <div className="h-2.5 bg-gray-600 rounded-full w-20 opacity-40 mt-1"></div>
          </motion.div>
          <span className="text-[10px] text-gray-400 mt-1 block mr-2">
            10:42 AM
          </span>
        </div>
      </div>

      <motion.div
        className="bg-white rounded-full p-2 pl-6 flex items-center justify-between shadow-sm mt-auto border border-transparent group-hover:border-[#E0E0E0] transition-colors w-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-gray-300 text-sm">Type your message...</span>
        <div className="h-10 w-10 bg-[#429466] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#357a53] transition-colors shrink-0">
          <SendIcon />
        </div>
      </motion.div>
    </div>
  );
};

// ------------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------------

function Pill({ width }) {
  return (
    <div
      className={`px-3 py-1.5 rounded-full border border-[#D8B4A0] bg-[#F3DED3] group-hover:bg-white group-hover:border-[#E0E0E0] transition-colors duration-300`}
    >
      <div
        className={`h-2 bg-[#A4A4A4] rounded-full ${width} opacity-40`}
      ></div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

export default Steps;
