import React from "react";
import Image from "next/image";
import { MedalIcon } from "@phosphor-icons/react";
import Link from "next/link";

const FindMatch = () => {
  return (
    <div className="w-full max-w-md mx-auto p-4 block sm:hidden">
      {/* Container with background gradient and border */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-800 to-green-700 rounded-2xl shadow-2xl border border-amber-300/50 flex flex-col items-center justify-center py-10 px-6 text-center gap-4">
        
        {/* Decorative Corner Images using next/image */}
        {/* Top Left */}
        <div className="absolute top-2 left-2 w-16 h-16 opacity-80">
          <Image 
            src="/home/tldesign.svg" 
            alt="decor" 
            fill
            className="object-contain"
          />
        </div>
        
        {/* Top Right */}
        <div className="absolute top-2 right-2 w-16 h-16 opacity-80 rotate-90">
          <Image 
            src="/home/tldesign.svg" 
            alt="decor" 
            fill
            className="object-contain"
          />
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-2 left-2 w-16 h-16 opacity-80 -rotate-90">
          <Image 
            src="/home/tldesign.svg" 
            alt="decor" 
            fill
            className="object-contain"
          />
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-2 right-2 w-16 h-16 opacity-80 rotate-180">
          <Image 
            src="/home/tldesign.svg" 
            alt="decor" 
            fill
            className="object-contain"
          />
        </div>

        {/* Center Icon (Medal/Badge) */}
        <div className="relative z-10 flex flex-col items-center mb-2">
         <div className="w-12 h-12 relative flex items-center justify-center">
      {/* 1. Gradient Define Karein (Ye invisible rehta hai) */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e3b450" />
            <stop offset="50%" stopColor="#f6dc7f" />
            <stop offset="100%" stopColor="#caa043" />
          </linearGradient>
        </defs>
      </svg>

      {/* 2. MedalIcon mein gradient ID pass karein */}
      <MedalIcon 
        size={44} 
        color="url(#gold-gradient)" 
        weight="regular" // aap bold ya duotone bhi try kar sakte hain
      />
    </div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 space-y-2">
          <h2 className="text-white text-2xl md:text-3xl font-bold font-['Playfair_Display'] leading-tight">
            Find Your Perfect Match Today
          </h2>
          <p className="text-white/80 text-sm md:text-base font-normal font-['Inter']">
            Join thousands of verified members
          </p>
        </div>

        {/* CTA Button */}
       <Link href="/matches">
       <button className="relative z-10 mt-4 px-10 py-3 bg-gold-gradient rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-stone-800 text-base font-bold font-['Inter']">
          Explore Profiles Now
        </button> </Link>
      </div>
    </div>
  );
};

export default FindMatch;