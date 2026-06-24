import React from "react";
// import Image from 'next/image';

const cardData = [
  {
    id: 1,
    title: "Secure & Private",
    description:
      "Your information is protected with industry-leading security measures",
    imageSrc: "/contact/cardIcon1.svg",
  },
  {
    id: 2,
    title: "Family Support",
    description: "Dedicated assistance for both individuals and families",
    imageSrc: "/contact/cardIcon2.svg",
  },
  {
    id: 3,
    title: "Quick Response",
    description: "Our team responds within 24 hours on business days",
    imageSrc: "/contact/cardIcon3.svg",
  },
  {
    id: 4,
    title: "Detailed Guidance",
    description: "Comprehensive help documentation and step-by-step guides",
    imageSrc: "/contact/cardIcon4.svg",
  },
];

const FeatureCards = () => {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 bg-[#FFF6EC]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card) => (
          <div
            key={card.id}
            // 1. Added 'relative' for positioning the overlay.
            // 2. Added 'group-hover:border-transparent' to hide the original border on hover.
            className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-[0.8px] border-[#E7B8A5] shadow-[0_0_20px_0_#0000001A] bg-[#F3DED3] shadow-sm hover:shadow-md hover:-translate-y-6 group-hover:border-transparent transition-all duration-300 ease-in-out"
          >
            {/* --- NEW: Gradient Border Overlay --- */}
            {/* This div sits on top of the card but lets clicks pass through (pointer-events-none).
                It uses a CSS mask to only show the border area with the gradient. */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                border: "0.8px solid transparent",
                background:
                  "linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%) border-box",
                // The mask magic: keeps the border visible, makes the center transparent
                WebkitMask:
                  "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            {/* Image/Icon Container */}
            <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-[#E4BCAE] group-hover:bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] transition-all duration-300">
              <img
                src={card.imageSrc}
                alt={card.title}
                className="w-8 h-8 object-contain opacity-80"
              />
            </div>

            {/* Title */}
            {/* 3. Added 'group-hover:text-[#429466]' and transition for the text color change */}
            <h3 className="text-xl font-playfair font-semibold text-[#4A3B32] mb-3 group-hover:text-[#429466] transition-colors duration-300">
              {card.title}
            </h3>

            {/* Description */}
            <p className="text-[16px] leading-relaxed text-[#7B6A64]">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
