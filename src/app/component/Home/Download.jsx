"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const Download = () => {
  const floatAnimation = {
    animate: { y: [0, -12, 0] },
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  };

  return (
    <>
      <div className="h-[541px] w-full px-5 md:px-12 lg:px-24 bg-[#F3DED3] hidden md:block">
        <div className=" relative h-full flex">
          <Image
            src={"/home/illustration3.svg"}
            height={141}
            width={141}
            alt="illustration3"
            className=" absolute left-0 top-2.5"
          />
          <Image
            src={"/home/illustration3.svg"}
            height={141}
            width={141}
            alt="illustration3"
            className="absolute left-0 bottom-2.5 scale-y-[-1]"
          />
          <div className=" flex flex-col justify-between h-full w-2/3 py-5 lg:py-12 2xl:py-24 px-16 2xl:space-y-10">
            <div className="">
              <h1 className=" text-[#2A1D1D] font-playfair text-[40px] font-extrabold">
                Download the App
              </h1>
              <p className=" text-[#368157] text-[20px] font-semibold font-inter">
                Find & connect with your matches, anytime and anywhere.
              </p>
            </div>
            <div className="flex gap-5 relative text-[#2A1D1D]">
              <motion.div
                {...floatAnimation}
                className="bg-white flex items-center font-inter justify-between px-5 w-[227px] h-[43px] rounded-3xl absolute -right-60 2xl:-right-70 z-50 shadow-[0px_4px_10px_0px_#00000026]"
              >
                <h1 className="text-lg font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                  20K
                </h1>
                <h2 className="text-xs font-medium">Premium Members</h2>
              </motion.div>

              <div className=" bg-white flex items-center font-inter justify-between px-5 w-[227px] h-[43px] rounded-3xl absolute -top-62 -right-100 z-50 shadow-[0px_4px_10px_0px_#00000026]">
                <h1 className="text-lg font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                  100%
                </h1>
                <h2 className=" text-xs font-medium">Confidential & Secure</h2>
              </div>
              <motion.div
                {...floatAnimation}
                className="bg-white flex items-center font-inter justify-between px-5 w-[227px] h-[43px] rounded-3xl absolute -top-36 md:-right-120 xl:-right-150 2xl:-right-175 z-50 shadow-[0px_4px_10px_0px_#00000026]"
              >
                <h1 className="text-lg font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                  50K+
                </h1>
                <h2 className="text-xs font-medium">100% Verified Profiles</h2>
              </motion.div>

              <div className=" bg-white flex items-center font-inter justify-between px-7 w-[227px] h-[43px] rounded-3xl absolute -bottom-50 md:-right-120 xl:-right-150 2xl:-right-170 z-50 shadow-[0px_4px_10px_0px_#00000026]">
                <h1 className="text-lg font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                  35K+
                </h1>
                <h2 className=" text-xs font-medium">Family Verified</h2>
              </div>
              <Image
                src={"/home/android.png"}
                height={141}
                width={141}
                alt="illustration3"
                className=" z-40"
              />
              <Image
                src={"/home/ios.png"}
                height={141}
                width={141}
                alt="illustration3"
                className="z-40"
              />
            </div>
            <p className=" font-medium text-lg text-[#2A1D1D]">
              Access genuine profiles, stay informed instantly, and communicate
              with confidence. Our mobile app is designed to support families
              and individuals in finding the right match with complete peace of
              mind.
            </p>
          </div>
          <div>
            <Image
              src={"/home/illustration3.svg"}
              height={141}
              width={141}
              alt="illustration3"
              className="absolute left-0 bottom-2.5 scale-y-[-1]"
            />
          </div>
          <div className=" relative w-1/2 h-full">
            <Image
              src={"/home/phone1.png"}
              height={43}
              width={274}
              alt="illustration3"
              className="absolute -bottom-8 right-40 z-30"
            />
            <Image
              src={"/home/phone2.png"}
              height={600}
              width={274}
              alt="illustration3"
              className="absolute -top-8 right-0 z-20"
            />
            <Image
              src={"/home/illustration4.svg"}
              height={394}
              width={412}
              alt="illustration3"
              className="absolute top-8 -left-8 2xl:-left-2"
            />
          </div>
        </div>
      </div>
      <div className="md:h-screen w-full px-4 md:px-8 lg:px-12 bg-[#F3DED3] overflow-hidden md:hidden">
        {/* 3. Changed to flex-col for mobile, flex-row for desktop */}
        <div className="relative h-full flex flex-col md:flex-row">
          {/* Decoration: Hidden on mobile to prevent overlap with text */}
          <Image
            src={"/home/illustration3.svg"}
            height={141}
            width={141}
            alt="illustration3"
            className="hidden md:block absolute left-0 top-2.5"
          />
          <Image
            src={"/home/illustration3.svg"}
            height={141}
            width={141}
            alt="illustration3"
            className="hidden md:block absolute left-0 bottom-2.5 scale-y-[-1]"
          />

          {/* Text Section */}
          {/* Adjusted width, padding, and alignment for mobile */}
          <div className="flex flex-col justify-between h-auto md:h-full w-full md:w-1/2 py-10 md:py-5 2xl:py-24 px-4 md:px-16 2xl:space-y-10 text-left md:text-left gap-8 md:gap-0 relative z-10">
            <div className="">
              <h1 className="font-playfair text-[#2A1D1D] text-3xl md:text-[40px] font-extrabold leading-tight">
                Download the App
              </h1>
              <p className="text-[#368157] font-semibold font-inter mt-2 md:mt-0">
                Find & connect with your matches, anytime and anywhere.
              </p>
            </div>

            {/* Buttons: Centered on mobile */}
            <div className="flex gap-5 justify-center md:justify-start">
              <Image
                src={"/home/android.png"}
                height={141}
                width={141}
                alt="android"
                className="w-[130px] md:w-[141px] h-auto"
              />
              <Image
                src={"/home/ios.png"}
                height={141}
                width={141}
                alt="ios"
                className="w-[130px] md:w-[141px] h-auto"
              />
            </div>

            <p className="font-medium text-base md:text-lg text-[#2A1D1D]">
              Access genuine profiles, stay informed instantly, and communicate
              with confidence. Our mobile app is designed to support families
              and individuals in finding the right match with complete peace of
              mind.
            </p>
          </div>

          {/* Decoration Duplicate (Optional: usually hidden on mobile) */}
          <div>
            <Image
              src={"/home/illustration3.svg"}
              height={141}
              width={141}
              alt="illustration3"
              className="hidden md:block absolute left-0 bottom-2.5 scale-y-[-1]"
            />
          </div>

          {/* Phone Images Section */}
          {/* Set specific height for mobile to contain absolute images */}
          <div className="relative w-full md:w-1/2 h-[400px] md:h-full mt-8 md:mt-0">
            {/* Phone 1 (Front/Bottom) */}
            <Image
              src={"/home/phone1.png"}
              height={43}
              width={274}
              alt="phone1"
              // Mobile: positioned bottom-0 left-4. Desktop: kept original.
              className="absolute bottom-0 left-4 md:-bottom-8 md:left-15 2xl:left-24 z-30 w-[60%] md:w-[274px] h-auto"
            />

            {/* Phone 2 (Back/Top) */}
            <Image
              src={"/home/phone2.png"}
              height={600}
              width={274}
              alt="phone2"
              // Mobile: positioned top-4 right-4. Desktop: kept original.
              className="absolute -top-4 right-4 md:-top-8 md:left-50 2xl:left-60 z-20 w-[60%] md:w-[274px] h-auto"
            />
            <motion.div
              {...floatAnimation}
              className="bg-white flex items-center font-inter justify-between px-5  w-[209px] h-[43px] rounded-3xl absolute top-54 right-30 2xl:-right-70 z-50 shadow-[0px_4px_10px_0px_#00000026]"
            >
              <h1 className="text-[11px] font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                20K
              </h1>
              <h2 className="text-xs font-medium">Premium Members</h2>
            </motion.div>

            <div className=" bg-white flex items-center font-inter justify-between px-5 w-[209px] h-[43px] rounded-3xl absolute -top-4 right-30 z-50 shadow-[0px_4px_10px_0px_#00000026]">
              <h1 className=" text-[11px] -left-5 font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                100%
              </h1>
              <h2 className=" text-xs font-medium">Confidential & Secure</h2>
            </div>
            <motion.div
              {...floatAnimation}
              className="bg-white flex items-center font-inter justify-between px-5 w-[227px] h-[43px] rounded-3xl absolute top-30 right-0 md:-right-120 xl:-right-150 2xl:-right-175 z-50 shadow-[0px_4px_10px_0px_#00000026]"
            >
              <h1 className="text-[11px] font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                50K+
              </h1>
              <h2 className="text-xs font-medium">100% Verified Profiles</h2>
            </motion.div>

            <div className=" bg-white flex items-center font-inter justify-between px-7 w-[200px] h-[43px] rounded-3xl absolute bottom-4 right-0 md:-right-120 xl:-right-150 2xl:-right-170 z-50 shadow-[0px_4px_10px_0px_#00000026]">
              <h1 className="text-[11px] font-bold bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
                35K+
              </h1>
              <h2 className=" text-xs font-medium">Family Verified</h2>
            </div>
            {/* Background Illustration */}
            <Image
              src={"/home/illustration4.svg"}
              height={394}
              width={412}
              alt="bg-illustration"
              className="absolute top-10 left-0 md:top-8 md:-left-8 2xl:-left-2 w-full md:w-auto opacity-60 md:opacity-100"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Download;
