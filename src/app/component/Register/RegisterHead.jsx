"use client"
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const RegisterHead = () => {

  const router = useRouter()

  return (
    <div className="z-[999] w-full px-4 md:px-8 lg:px-12 hidden md:flex justify-between items-center max-h-[105px] h-full shadow-[0px_10px_20px_0px_rgba(0,0,0,0.1)] relative bg-white">
      {/* Logo */}
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
