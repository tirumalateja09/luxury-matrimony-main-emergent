"use client";
import {
  Heart,
  Eye,
  Bell,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageDropdown from "./LanguageDropdown";
const navItems = [
  { label: "Profile Boost", href: "/boostprofile", icon: Sparkles },
  { label: "Priority Matches", href: "/prioritymatches", icon: Heart },
  { label: "Profile Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Who Viewed You", href: "/views", icon: Eye },
];
export default function TopHeader() {
  // profile-boost
  const pathname = usePathname();
  return (
    <div className="flex items-center justify-between px-8 h-full bg-white border-b-[1.5px] border-[#E7B8A5]">
      {/* Logo Area */}
      <Link href="/home">
        {/* <div className="flex items-center gap-2">
          <Image src={"/logo.svg"} height={80} width={225} alt="logo" />
        </div> */}

        <div className="relative w-48 h-16 md:w-64 md:h-24">
          <Image
            src="/icon.png"
            alt="RVR Luxury Matrimony"
            fill

            className="object-contain  cursor-pointer object-center md:object-left"
          />
        </div>
      </Link>


      {/* Top Navigation Icons */}
      <div className="flex items-center gap-8 text-gray-600">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-col items-center gap-2 py-4 transition-all duration-300 cursor-pointer`}
            >
              {/* Label and Icon Container */}
              <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? "text-[#4B845C]" : "text-[#6E2F2F] hover:text-[#4B845C]"
                }`}>
                <Icon size={18} className={isActive ? "animate-pulse" : ""} />
                <span>{item.label}</span>
              </div>

              {/* Active Indicator Bar (Horizontal Bottom Line) */}
              {isActive && (
                <span
                  className="absolute bottom-0 w-10 h-[4px] bg-[#4B845C] rounded-full animate-in fade-in zoom-in duration-300"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Notification Area */}
      <div className="flex items-center gap-4  pl-8">
        <LanguageDropdown />
        <Link href="/notification">
          <button className="relative cursor-pointer text-[#429466] flex items-center gap-2">
            <Bell size={22} />
            <span className="text-sm font-medium">Notifications</span>
            <span className="absolute -top-1 left-3 bg-[#C9A24D] w-2 h-2 rounded-full border border-white"></span>
          </button> </Link>
      </div>
    </div>
  );
}
