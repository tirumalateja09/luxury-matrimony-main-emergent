"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Register = () => {

  const router = useRouter()

  return (
    <div className="relative w-full px-5 md:px-12 lg:px-24 bg-[#FEFCF5]">
      {/* Top Right Decoration - Scaled down for mobile */}
      <Image
        src={"/home/circular.svg"}
        alt="circular"
        height={200}
        width={200}
        className="absolute top-0 right-0 w-24 md:w-[200px]"
      />
      <Image
        src={"/home/leftIllustration.svg"}
        alt="leftIllustration"
        height={120}
        width={45}
        // Changed w-24 to w-12 (you can also use w-10 or w-16)
        className="absolute bottom-0 left-0 w-12 h-auto md:w-[45px]"
      />

      {/* Main Content Container */}
      {/* Changed to flex-col for mobile, flex-row for desktop */}
      <div className="relative w-full flex flex-col md:flex-row md:items-center py-10 gap-12 md:gap-40 z-40">
        {/* Text Section */}
        {/* Full width and centered on mobile, Half width and left-aligned on desktop */}
        <div className="w-full md:w-1/2 space-y-6 md:space-y-10 text-left">
          <h2 className="text-[#2A1D1D] font-playfair font-semibold italic text-3xl md:text-5xl leading-tight md:leading-normal">
            “Because finding the right <br className="hidden 2xl:block" /> match
            deserves care, trust, <br className="hidden 2xl:block" /> and
            respect.”
          </h2>
          <p className="text-[#7B6A64] text-base md:text-[20px] font-normal">
            We are a premium matrimony platform dedicated to helping families
            find meaningful matches rooted in cultural values, mutual respect,
            and genuine connections.
          </p>

          {/* Button: Centered and responsive width on mobile */}
          <button className="flex items-center justify-center gap-[10px] px-8 md:px-[55px] h-14 md:h-16 py-3.25 rounded-[24px] border-[1.18px] border-transparent bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] shadow-[0px_0px_10px_0px_#00000026] font-semibold text-lg md:text-[20px] leading-none text-[#6E2F2F] mx-auto md:mx-0 w-full md:w-auto hover:bg-none hover:bg-white cursor-pointer font-inter hover:border-[#6E2F2F]"
          onClick={()=>router.push('/register')}
          >
            Register for Free
          </button>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-auto flex justify-center mt-6 md:mt-0">
          <Image
            src={"/home/couple.png"}
            alt="couple"
            height={621}
            width={390}
            className="w-[80%] md:w-[390px] h-auto" // Responsive image scaling
          />
        </div>
      </div>

      {/* Decorative Images - Hidden on Mobile to prevent overlap, visible on Desktop */}
      <Image
        src={"/home/illustration1.svg"}
        alt="decoration"
        height={340}
        width={333}
        className="hidden md:block absolute right-0 bottom-0 z-20"
      />
      <Image
        src={"/home/circular2.png"}
        alt="decoration"
        height={340}
        width={333}
        className="hidden md:block absolute right-100 bottom-0 z-20"
      />
      <Image
        src={"/home/illustration2.svg"}
        alt="decoration"
        height={200}
        width={200}
        className="hidden md:block absolute left-0 -bottom-50 z-20"
      />
    </div>
  );
};

export default Register;
