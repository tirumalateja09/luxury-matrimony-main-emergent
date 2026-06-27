"use client";
import { Bell, Crown, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import LanguageDropdown from "./LanguageDropdown";
const MobileHeader = ({ defaultValue, onKeyDown, updateParams, isRead }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const handleMyData = async () => {
      const res = await api.get(`/profile/summary`, "private");
      if (res.success) {
        setSummary(res.data);
      }
    };
    handleMyData();
  }, []);

  return (
    <div className="w-full  px-4 py-2 bg-[#fefcf5] mx-auto h-16  rounded-b-[20px] lg:hidden flex justify-between items-center gap-4 sticky top-0 z-50">
      {isRead ? (
        <Link href="/matches" className="max-w-lg flex-1">
          <div className=" lg:hidden block relative max-w-lg flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700"
              size={20}
            />

            <input
              readOnly
              type="text"
              defaultValue={defaultValue}
              onKeyDown={onKeyDown}
              placeholder="Search your match"
              className="w-full pl-12 pr-4 py-3 text-gray-800 border border-[#E3B450] rounded-full bg-white outline-none"
            />
          </div>{" "}
        </Link>
      ) : (
        <div className=" lg:hidden block relative max-w-lg flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700"
            size={20}
          />

          <input
            type="text"
            defaultValue={defaultValue}
            onKeyDown={onKeyDown}
            placeholder="Search your match"
            className="w-full text-gray-800 pl-12 pr-4 py-3 border border-[#E3B450] rounded-full bg-white outline-none"
          />
        </div>
      )}
      {/* Icons & Profile Group */}

      <div className="flex items-center gap-2">
        <LanguageDropdown compact />
        {/* Notification Icon */}
        <Link href="/notification">
          {" "}
          <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer">
            <Bell className="text-green-700" size={24} />
            {/* Notification Badge/Dot */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-[#E3B450] rounded-full border-2 border-white" />
          </div>{" "}
        </Link>

        {/* Profile Image with Premium Badge */}
        <Link href="/profile">
          <div className="relative flex-shrink-0 cursor-pointer">
            <div className="w-12 h-12 rounded-full border-2 border-[#E3B450] p-0.5 overflow-hidden">
              <Image
                src={summary?.profilePhoto || "/home/user.png"} // Ensure this path is correct in your public folder
                width={44}
                height={44}
                className="w-full h-full rounded-full object-cover"
                alt="Avatar"
              />
            </div>
            {/* Crown Badge with correct gradient from image */}
            {summary?.subscription !== "Free" && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-[#E3B450] via-[#F6DC7F] to-[#CAA043] w-6 h-6 rounded-full shadow-sm flex items-center justify-center border-2 border-white">
                <Crown
                  size={14}
                  className="text-stone-800"
                  fill="currentColor"
                />
              </div>
            )}
          </div>{" "}
        </Link>
      </div>
    </div>
  );
};

export default MobileHeader;
