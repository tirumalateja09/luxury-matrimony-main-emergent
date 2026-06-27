"use client";
import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";

const stories = [
  {
    id: 1,
    image: "/home/story1.jpg",
    date: "Married Jan 2024",
    name: "Priya & Rajesh",
    meta: "Tamil Iyer Brahmin • Chennai",
    text: "Found my perfect life partner through RVR. The verification process gave our families complete confidence.",
  },
  {
    id: 2,
 image: "/home/story1.jpg",
    date: "Married Feb 2024",
    name: "Lakshmi & Arun",
    meta: "Kerala Iyer • Coimbatore",
    text: "RVR made the matchmaking journey smooth, secure, and trustworthy for both families.",
  },
  {
    id: 3,
  image: "/home/story1.jpg",
    date: "Married Dec 2023",
    name: "Anita & Karthik",
    meta: "Tamil Brahmin • Trichy",
    text: "A premium platform with genuine verified profiles and excellent support.",
  },
  {
    id: 4,
    image: "/home/story1.jpg",
    date: "Married Nov 2023",
    name: "Meena & Suresh",
    meta: "Iyer Brahmin • Madurai",
    text: "Trust, privacy and quality matches — everything we were looking for.",
  },
];

export default function SuccessStories() {
  const sliderRef = useRef(null);

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.clientWidth;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-12 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-[#2A1D1D]">
            Success Stories
          </h2>
          <p className="text-sm text-gray-600">Real couples, real happiness</p>
        </div>

        {/* Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)]
            flex items-center justify-center shadow-md"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#E7B84F_0%,#F6DE86_52%,#C79A3A_100%)]
            flex items-center justify-center shadow-md"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="
          flex gap-6 overflow-x-auto scroll-smooth
          md:overflow-hidden py-2
        "
      >
        {stories.map((item) => (
          <div
            key={item.id}
            className="
              bg-white rounded-2xl shadow-md overflow-hidden
              min-w-[85%] sm:min-w-[70%]   /* 📱 mobile peek */
              md:min-w-[32%]              /* 💻 3 cards desktop */
            "
          >
            {/* Image */}
            <div className="relative h-[220px] w-full">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />

              {/* Badge */}
              <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                <Heart size={14} /> {item.date}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 ">
              {/* Stars */}
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-[#E7B84F] text-[#E7B84F]" />
                ))}
              </div>

              <h3 className="font-playfair text-lg font-bold text-[#2A1D1D]">
                {item.name}
              </h3>

              <p className="text-sm text-gray-600 mb-3">{item.meta}</p>

              <p className="text-sm text-gray-700 leading-relaxed">
                “{item.text}”
              </p>
            </div>
          </div>
        ))}
      </div>

     
    </section>
  );
}
