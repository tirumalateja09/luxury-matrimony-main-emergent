"use client";
import React from "react";
import Image from "next/image";

const WhyChooseUs = () => {
  const card_data = [
    {
      icon: "/home/cardIcon1.svg",
      header: "Verified Profiles You Can Trust",
      desc: "Profiles are reviewed and screened for genuine matrimonial intent.",
    },
    {
      icon: "/home/cardIcon2.svg",
      header: "Human-Led Verification",
      desc: "Selected profiles are personally verified by our trained team members.",
    },
    {
      icon: "/home/cardIcon3.svg",
      header: "Privacy You Control",
      desc: "Decide who can connect with you and what they can see.",
    },
  ];

  return (
    // Changed h-[436px] to h-auto md:h-[436px] so the red background grows on mobile
    <div className="bg-[#A96060] h-auto md:h-[436px] px-5 md:px-12 lg:px-24 py-12 md:py-8 text-white relative">
      
      {/* Headings */}
      <div className="relative z-10 text-center md:text-left">
        <h1 className="font-playfair font-semibold text-3xl md:text-[40px] mb-4">
          Why Choose{" "}
          <span className="bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
            Luxury Matrimony
          </span>
        </h1>
        <p className="font-inter text-base md:text-[20px] text-[#FFF6EC] font-normal">
          Because the Right Match Deserves Care, Trust, and Respect
        </p>
      </div>

      {/* Decorative Image - Hidden on mobile to prevent layout issues */}
      <Image
        src={"/home/illustration2.svg"}
        alt="couple"
        height={150}
        width={150}
        className="hidden md:block absolute right-0 -bottom-20 z-20 scale-x-[-1]"
      />

      {/* Cards Container */}
      {/* Changed flex to flex-col for mobile, kept row for desktop */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-5 py-8 md:py-8 mt-4 md:mt-0 relative z-10">
        {card_data.map((ele, ind) => {
          return (
            <div
              key={ind}
              // Width matches parent on mobile, fixed max-width on desktop
              // Height is auto on mobile to prevent text clipping
              className="w-full md:max-w-[398px] h-auto md:h-[208px] space-y-2 p-5 bg-[#ffffff] rounded-xl shadow-[0px_4px_40px_0px_rgba(0,0,0,0.1)]"
            >
              <Image
                src={ele.icon}
                alt="icon"
                height={58}
                width={58}
                className=""
              />
              <h1 className="text-black font-inter font-semibold text-lg md:text-[20px]">
                {ele.header}
              </h1>
              <p className="text-[#7B6A64] font-medium text-sm md:text-base">
                {ele.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhyChooseUs;