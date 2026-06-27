import React from "react";
import Image from "next/image";

// 1. Data definition now uses file paths instead of components
const values = [
  {
    title: "Trust & Authenticity",
    description:
      "Every profile is verified to ensure genuine connections and peace of mind for families",
    iconSrc: "/about/card1Icon.svg", // Path to your image in /public
  },
  {
    title: "Cultural Respect",
    description:
      "We honor traditions, values, and the sacred bond of matrimony in Indian culture",
    iconSrc: "/about/card2Icon.svg",
  },
  {
    title: "Privacy & Security",
    description:
      "Your personal information and family details are protected with the highest security standards",
    iconSrc: "/about/card3Icon.svg",
  },
  {
    title: "Meaningful Connections",
    description:
      "Beyond profiles—we facilitate matches based on compatibility, values, and shared goals",
    iconSrc: "/about/card4Icon.svg",
  },
];

export default function MissionValues() {
  return (
    // Added 'overflow-hidden' to ensure corner images don't cause scrollbars
    <section className="relative w-full py-20 px-4 sm:px-6 md:px-12 lg:px-24 bg-[#A65D5B] overflow-hidden">
      <Image
        src="/about/mandala1.svg"
        alt="decorative pattern"
        height={200}
        width={200}
        className=" absolute left-0 top-0" // Rotate as needed to fit corner
      />
      <Image
        src="/about/mandala1.svg"
        alt="decorative pattern"
        height={200}
        width={200}
        className=" absolute right-0 bottom-0 -scale-x-100 -scale-y-100" // Rotate as needed to fit corner
      />
      <div className="relative z-10">
        {/* --- Header Section (Unchanged) --- */}
        <div className="text-center mb-16 text-white space-y-3">
          <h2 className="text-4xl font-playfair font-semibold tracking-wide">
            Our Mission & Values
          </h2>
          <p className="text-lg md:text-2xl text-[#F3DED3] font-light font-inter">
            The principles that guide everything we do
          </p>
        </div>

        {/* --- Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-lg transition-transform hover:-translate-y-1 duration-300"
            >
              {/* Image Icon Wrapper */}
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                {/* 1. The Ornate Background Badge Image */}
                {/* This sits behind the main icon. Adjust opacity if your image is too dark. */}
                <div className="absolute inset-0 w-full h-full z-0 opacity-80">
                  <Image
                    src={item.iconSrc}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-3">
                {item.title}
              </h3>

              <p className="text-[#7B6A64] leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
