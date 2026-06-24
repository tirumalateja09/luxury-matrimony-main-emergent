"use client";

import {
  ChatCircleText,
  Clock,
  Crown,
  Heart,
  House,
  CalendarHeartIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

// const menuItems = [
//   { icon1: "/sidebar/icons/1.svg", icon2: "/sidebar/icons/11.svg", label: "Home", href: "/home" },
//   { icon1: "/sidebar/icons/2.svg", icon2: "/sidebar/icons/22.svg", label: "Matches", href: "/matches" },
//   { icon1: "/sidebar/icons/3.svg", icon2: "/sidebar/icons/33.svg", label: "Activity", href: "/activity" },
//   { icon1: "/sidebar/icons/4.svg", icon2: "/sidebar/icons/44.svg", label: "Messages", href: "/messages" },
//   // { icon1: "/sidebar/icons/5.svg", icon2: "/sidebar/icons/55.svg", label: "Wedding Services", href: "/wedding-services" },
// ];

const menuItems = [
  { icon: House, label: "Home", href: "/home" },
  { icon: Heart, label: "Matches", href: "/matches" },
  { icon: Clock, label: "Activity", href: "/activity" },
  { icon: ChatCircleText, label: "Messages", href: "/messages" },
  // { icon: CalendarHeartIcon, label: "Wedding Services", href: "/wedding-services" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/profile");
  const [summary, setSummary] = useState(null);
  const [hoveredItem, setHoveredItem] = useState("");

  useEffect(() => {
    const fetchProfileSummary = async () => {
      try {
        const response = await api.get("/profile/summary", "private");
        if (response?.success) {
          setSummary(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile summary:", error);
      }
    };

    fetchProfileSummary();
  }, []);

  const profilePhoto = summary?.profilePhoto || "/home/user.png";
  const profileName = summary?.fullName || "User";
  const profileSubText = summary?.subscription || "Free";
  const completionPercentage = Number(summary?.completionPercentage || 0);
  const profileStrengthText =
    summary?.profileStrength || `${completionPercentage}%`;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* User Profile Section */}
      <div className="relative mt-5 pl-7 mb-4 group">
        <Link
          href="/profile"
          className={`w-full h-20 px-3 flex justify-start items-center transition-all duration-300 cursor-pointer ${
            isActive
              ? "bg-white rounded-[10px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)]"
              : "hover:bg-gray-50/50 rounded-[10px]"
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-shrink-0">
              <Image
                src={profilePhoto}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#E3B450]"
                alt="Avatar"
              />
              {profileSubText !== "Free" && (
                <span className="absolute -top-1 -right-1 bg-[linear-gradient(135deg,#E3B450_0%,#F6DC7F_50%,#CAA043_100%)] p-0.5 rounded-full shadow-md flex items-center justify-center">
                  <Crown size={12} className="text-stone-800" />
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center overflow-hidden">
              <h3 className="font-bold font-playfair text-gray-800 text-[13px] truncate">
                {profileName}
              </h3>
              <p className="text-[10px] text-[#6E2F2F] font-inter uppercase tracking-wider truncate">
                {profileSubText}
              </p>
            </div>
          </div>
        </Link>

        {/* Profile Active Indicator Bar */}
        {isActive && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[5px] h-8 bg-[#4B845C] rounded-full animate-in slide-in-from-right duration-300" />
        )}
      </div>

      {/* Navigation Links */}
      <div className="pl-7">
        <nav className="flex-1 space-y-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem("")}
                className={`group relative flex items-center gap-3 px-4 py-2 transition-all duration-300 ${
                  isActive
                    ? "text-[#4B845C]"
                    : "text-[#6E2F2F] hover:text-[#4B845C]"
                }`}
              >
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[5px] h-8 bg-[#4B845C] rounded-full animate-in slide-in-from-right duration-300" />
                )}

                {/* <Image
                src={isActive ? item.icon2 : item.icon1}
                width={20}
                height={20}
                alt={item.label}
                className="transition-transform group-hover:scale-110"
              /> */}
                <IconComponent
                  size={24}
                  weight={
                    isActive || hoveredItem === item.label ? "fill" : "regular"
                  }
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-[#4B845C]"
                      : "text-[#8d6e6e] group-hover:text-[#4B845C]"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-all ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Strength Card */}

      <div className="bg-[#F3DED3] ml-7 mr-5 mb-5  px-4 py-3 rounded-2xl mt-auto shadow-sm border border-[#F6E2D9]">
        <p className="text-[14px] font-bold text-[#5F5F5F] font-playfair mb-3">
          Profile Strength
        </p>
        <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-gray-100">
          <div
            className="bg-[linear-gradient(135deg,#2D5F3F_0%,#4A8B5F_100%)] h-full transition-all duration-1000 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[11px] text-[#2D5F3F] font-inter font-bold">
            {profileStrengthText} Complete
          </p>
        </div>
      </div>
    </div>
  );
}
