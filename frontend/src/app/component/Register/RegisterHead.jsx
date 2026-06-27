"use client"
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const RegisterHead = () => {

  const router = useRouter()

  return (
    <div className="z-[999] w-full px-4 md:px-8 lg:px-12 hidden md:flex justify-between items-center max-h-[105px] h-full shadow-[0px_10px_20px_0px_rgba(0,0,0,0.1)] relative bg-white">
      {/* Logo */}


      {/* ── Gold Traditional Filigree Corner Ornaments ── */}
      <div className="absolute top-0 left-0 w-16 h-16 opacity-[2.55] pointer-events-none z-0 select-none">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>
      <div className="absolute top-0 right-0 w-16 h-16 opacity-[2.55] pointer-events-none z-0 select-none rotate-90">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 opacity-[2.55] pointer-events-none z-0 select-none rotate-180">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 opacity-[2.55] pointer-events-none z-0 select-none -rotate-90">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>

      {/* ── Thin Premium Gold Gradient Bottom Border ── */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] z-10" />
      <div className="relative w-48 h-16 md:w-64 md:h-24">


        <Image
          src="/icon.png"
          alt="RVR Luxury Matrimony"
          fill
          onClick={() => router.push("/")}
          className="object-contain  cursor-pointer object-center md:object-left"
        />
      </div>
    </div>
  );
};

export default RegisterHead;
