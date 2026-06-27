import React from "react";
import PricingSection from "./PricingSection";
import Image from "next/image";

const Plans = () => {
  return (
    <div className="bg-[linear-gradient(358.66deg,_#F3DED3_1.14%,_rgba(141,129,122,0)_73.64%)] bg-[#FEFCF5] py-14 md:pt-24 md:pb-4 px-5 md:px-12 lg:px-24 md:max-h-[200vh]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className=" space-y-3">
          <h1 className=" font-playfair text-[#2A1D1D] font-semibold md:font-extrabold text-[29px] md:text-[40px]">
            Explore Membership Plans
          </h1>
          <p className=" font-semibold text-[#7B6A64] text-[20px]">
            Find the perfect membership for your Telugu matrimonial search
          </p>
        </div>
        <p className=" w-1/2 xl:w-1/3 text-[20px] hidden font-inter text-[#7B6A64] md:block">
          All plans include verified profiles and family-focused matchmaking.
          Upgrade anytime to unlock more features.
        </p>
      </div>
      <PricingSection />
      <button className="flex items-center my-3  md:hidden min-w-[156px] justify-center gap-[10px] px-8 md:px-[55px] h-10 md:h-16 py-3.25 rounded-full border-[1.18px] border-transparent bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] shadow-[0px_0px_10px_0px_#00000026] text-[#6E2F2F] font-semibold">
        Explore Plans
      </button>
      <Image src={"/home/pricing.png"} alt="" height={343} width={379} className=" md:hidden" />
      <p className=" text-[#7B6A64] md:hidden my-3.5">All plans include verified profiles and family-focused matchmaking. Upgrade anytime to unlock more features.</p>
    </div>
  );
};

export default Plans;
