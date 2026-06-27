"use client"

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";


const Journey = () => {

  const router = useRouter()

  return (
    <div className="bg-[linear-gradient(180deg,_#429466_0%,_#0B502A_100%)] w-full h-[400px] md:h-[344px] overflow-hidden rounded-t-2xl -mt-3 relative z-10 px-4 sm:px-6 md:px-12 lg:px-24">
      <Image
        src={"/contact/mandala3.svg"}
        alt=""
        height={700}
        width={700}
        className="absolute right-0 border-0 hidden md:block"
      />
      <div className="flex items-center h-full md:w-1/2 max-sm:my-5">
        <div className=" flex flex-col max-sm:text-center gap-6">
          <h1
            className="md:text-4xl text-3xl font-playfair font-semibold 
               bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]
               bg-clip-text text-transparent"
          >
            Start Your Journey With Us
          </h1>
          <div className=" text-lg md:text-xl text-white space-y-5">
            <p>
              Join thousands of families who have found their perfect match
              through our trusted platform
            </p>
            <button className="flex items-center justify-center gap-[10px] px-8 md:px-[55px] h-14 md:h-16 py-3.25 rounded-[24px] border-[1.18px] border-transparent bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] shadow-[0px_0px_10px_0px_#00000026] font-semibold text-lg md:text-[20px] leading-none text-[#6E2F2F] mx-auto md:mx-0 w-full md:w-auto hover:bg-none hover:bg-white cursor-pointer font-inter hover:border-[#6E2F2F]"
          onClick={()=>router.push('/register')}
          >
            Register for Free
          </button>
            <p>No payment required to create your profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journey;
