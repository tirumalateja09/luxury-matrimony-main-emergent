"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProfileImageSlider({ photos = [] }) {
  const [index, setIndex] = useState(0);

  if (!photos.length) return null;

  const prev = () => {
    setIndex((p) => (p === 0 ? photos.length - 1 : p - 1));
  };

  const next = () => {
    setIndex((p) => (p === photos.length - 1 ? 0 : p + 1));
  };

  return (
    <div className="relative w-full h-36 md:h-48 rounded-[20px] overflow-hidden border border-gray-100">
      
      {/* Image */}
      <Image
        src={photos[index].url}
        alt="Profile"
        fill
        priority
        className="object-contain"
      />

      {/* Dark overlay (same like screenshot) */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Left Arrow */}
      {photos.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer bg-[#429466CC]/80 hover:bg-[#429466CC] text-white shadow-md active:scale-95 transition"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Right Arrow */}
      {photos.length > 1 && (
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer bg-[#429466CC]/80 hover:bg-[#429466CC] text-white shadow-md active:scale-95 transition"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
