"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LanguageDropdown from "./LanguageDropdown";

export default function MobileHeaderText({ children, onBack }) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 block lg:hidden w-full  bg-[#fefcf5] shadow-sm border-b border-[#f1e9c8]">
      <div className="flex items-center justify-between px-4 h-14">

        {/* Back Button */}
        <button
          onClick={onBack ? onBack : () => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ChevronLeft size={22} className="text-green-600" />
        </button>

        {/* Center Content (from children) */}
        <div className="lg:flex-1 text-center font-playfair text-lg font-semibold text-green-700">
          {children}
        </div>

        <div className="flex items-center justify-end min-w-[96px]">
          <LanguageDropdown compact />
        </div>
      </div>
    </div>
  );
}
