"use client";

import { Clock, Heart, House, ChatCircleText } from "@phosphor-icons/react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState("");

  const navItems = [
    { label: "Home", href: "/home", icon: House },
    { label: "Matches", href: "/matches", icon: Heart },
    { label: "Activity", href: "/activity", icon: Clock },
    { label: "Messages", href: "/messages", icon: ChatCircleText },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] mt-14">
      {/* Container: Rounded Top + Shadow */}
      <div className="bg-white rounded-t-[30px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-8 pb-6 pt-3 w-full border-t border-gray-100">
        <nav className="flex justify-between items-end w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem("")}
                className="relative flex flex-col items-center gap-1.5 w-14 group"
              >
                {/* Green Active Indicator Dash 
                    - Positioned to sit perfectly at the top of the curve
                */}
                {isActive && (
                  <span className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-8 h-[5px] bg-[#4B845C] rounded-full" />
                )}

                {/* Icon Wrapper */}
                <div
                  className={`transition-transform duration-300 ${
                    isActive ? "-translate-y-1" : ""
                  }`}
                >
                  <IconComponent
                    size={24}
                    weight={isActive || hoveredItem === item.label ? "fill" : "regular"}
                    className={`transition-colors duration-300 ${
                      isActive
                        ? "text-[#4B845C]" // Active: Solid Green
                        : "text-[#8d6e6e] group-hover:text-[#4B845C]" // Inactive: Brownish-Grey
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] tracking-wide font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-[#4B845C] font-bold"
                      : "text-[#8d6e6e] group-hover:text-[#4B845C]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
