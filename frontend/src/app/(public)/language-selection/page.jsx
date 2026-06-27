"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState , useEffect } from "react";
import toast from "react-hot-toast";
import {
  getPreferredLanguage,
  LANGUAGE_OPTIONS,
  setPreferredLanguage,
} from "@/lib/languagePreference";

const LanguageSelectionContent = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (redirect) {
      localStorage.setItem("postAuthRedirect", redirect);
    }
  }, [redirect]);

  useEffect(() => {
    setSelectedLanguage(getPreferredLanguage());
  }, []);

  // Logic to save and navigate
  const handleNext = () => {
    if (!selectedLanguage) {
      toast.error("Please select a language first!");
      return;
    }

    setPreferredLanguage(selectedLanguage.code);

    window.location.href = "/register";
  };

  return (
    <div className="min-h-screen flex w-full bg-[linear-gradient(180deg,_#E7B8A5_-55.74%,_#FFFFFF_80.23%)] font-sans">
      <div className="w-1/2 relative hidden md:block">
        <Image
          src={"/Login/couple.png"}
          width={550}
          height={565}
          alt="couple"
          className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-[60%] z-50"
        />
        <Image
          src={"/Login/illustration1.svg"}
          width={450}
          height={350}
          alt="couple"
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[0%] z-20"
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 md:px-20 py-10">
        <div className="w-full max-w-md flex flex-col items-center space-y-6">
          <div className="space-y-3 md:block hidden text-center">
            <h1 className="font-playfair text-[32px] leading-tight text-[#2d2424] font-semibold">
              Welcome to RVR Luxury matrimony 👋
            </h1>
            <p className="text-[#6b5d5d] font-medium leading-relaxed px-2">
              Today is a new day. It&apos;s your day. You shape it.
              <br />
              Your partner search ends here.
            </p>
          </div>

          <div>
            <p className="text-[#2d2424] font-medium text-[17px]">
              Choose your preferred language
            </p>
          </div>

          <div className="w-full flex flex-col gap-4">
            {LANGUAGE_OPTIONS.map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language)}
                className={`
                w-full py-3.5 cursor-pointer rounded-full text-[15px] font-semibold border transition-all duration-200
                ${
                  selectedLanguage?.code === language.code
                    ? "bg-[#FFF6EC] border-[#BCB4B2] text-[#8a6d3b] shadow-sm"
                    : "bg-white text-[#5c5c5c] border border-[#BCB4B2]"
                }
              `}
              >
                {language.name}
              </button>
            ))}
          </div>

          <p className="text-[#5c5c5c] text-sm font-medium pt-2">
            You can change language later
          </p>

          <button
            className="w-full cursor-pointer py-4 rounded-full text-[#2A1D1D] font-medium text-lg shadow-lg 
            bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]"
            onClick={handleNext} // Updated to use the handler
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={null}>
      <LanguageSelectionContent />
    </Suspense>
  );
};

export default Page;
