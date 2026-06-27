"use client";

import Image from "next/image";
import { REGISTER_STEPS } from "@/app/lib/registerSteps";
import {
  User,
  Languages,
  MapPin,
  GraduationCap,
  Star,
  Users,
  Camera,
  ShieldCheck,
} from "lucide-react";

const getStepIcon = (id) => {
  const icons = [
    User,
    Languages,
    MapPin,
    GraduationCap,
    Star,
    Users,
    Camera,
    ShieldCheck,
  ];
  return icons[id - 1] || User;
};

export default function ProgressBar({
  stepNumber,
  progressPercent,
  visualStepNumber,
  visualTotalSteps,
}) {
  return (
    <div className="w-full flex flex-col shrink-0 mb-6">
      {/* --- DESKTOP VIEW: Horizontal Icons --- */}
      <div className="hidden md:flex flex-row relative w-full items-center h-auto overflow-x-auto no-scrollbar pb-4">
        <div className="w-full flex flex-row items-center min-w-max gap-4 px-2">
          {REGISTER_STEPS.map((s, index) => {
            const Icon = getStepIcon(s.id);
            const isActive = s.id === stepNumber;
            const isCompleted = s.id < stepNumber;
            const isLastDivider = index === REGISTER_STEPS.length - 1; // Since there are 5 max steps displayed

            return (
              <div
                key={s.id}
                className="flex flex-row items-center justify-center relative group gap-4"
              >
                {/* Icon and Title */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-200 z-10 ${isActive
                        ? "bg-[#3b9b72] border-[#3b9b72] text-white shadow-md"
                        : isCompleted
                          ? "bg-[#BCB4B2] border-[#BCB4B2] text-[#7B6A64]"
                          : "bg-white border-gray-200 text-[#429466]"
                      }`}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <h2
                    className={`text-center text-sm ${isActive
                        ? "font-semibold text-[#22613d]"
                        : "text-[#2A1D1D]"
                      }`}
                  >
                    {s.title}
                  </h2>
                </div>

                {/* Horizontal Divider */}
                {!isLastDivider && (
                  <div className="flex items-center justify-center mb-6">
                    <Image
                      src={"/Register/divider.png"}
                      height={40}
                      width={15}
                      alt="divider"
                      className="h-11 w-2 -rotate-90 object-contain"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MOBILE VIEW: Percentage Bar --- */}
      {stepNumber <= 5 && (
        <div className="flex flex-col md:hidden w-full mt-20 max-sm:px-4">
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            <span>
              Step {visualStepNumber} / {visualTotalSteps}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#f0e6e0] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-[#3b9b72] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
