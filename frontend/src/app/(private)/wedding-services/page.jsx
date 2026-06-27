"use client";
import React, { useRef } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const WeddingPartners = () => {
  // 1. Create Refs for scroll containers
  const categoryRef = useRef(null);
  const featuredRef = useRef(null);

  // 2. Scroll Function (Mainly for Desktop now)
  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth / 1.5
          : scrollLeft + clientWidth / 1.5;

      ref.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const categories = [
    {
      icon: "📸",
      name: "Wedding Photographers",
      desc: "Capture your special moments",
      count: 45,
    },
    {
      icon: "💍",
      name: "Wedding Planners",
      desc: "Plan your perfect day",
      count: 32,
    },
    {
      icon: "🏛️",
      name: "Venues & Halls",
      desc: "Beautiful locations for your ceremony",
      count: 28,
    },
    {
      icon: "🍽️",
      name: "Catering Services",
      desc: "Delicious food for your guests",
      count: 38,
    },
    { icon: "🌸", name: "Decoration", desc: "Transform your venue", count: 41 },
    {
      icon: "💄",
      name: "Makeup & Beauty",
      desc: "Look your best on your big day",
      count: 52,
    },
  ];

  const featured = Array(6).fill({
    name: "Royal Chennai Photography",
    price: "50,000+",
    type: "Wedding Photographer",
    loc: "Chennai, Tamil Nadu",
    rating: 4.9,
    reviews: 124,
  });

  return (
    <div className="flex flex-col gap-8 md:gap-12 font-inter pb-10 bg-gray-50/50 md:bg-transparent">
      {/* Mobile Top Navigation */}
      <div className="flex md:hidden items-center gap-4 p-4 bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <ChevronLeft className="text-[#429466]" size={24} />
        <div className="flex items-center justify-center gap-4 text-green-800 font-bold text-lg w-full">
          <Image
            src={'/wedding/wedding.svg'}
            alt="icon"
            height={20}
            width={20}
          />
          <h1 className=" font-playfair text-xl font-semibold">Wedding Services</h1>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-0">
        <div
          className="relative w-full min-h-[200px] md:min-h-[280px] px-6 py-8 md:py-12 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center gap-4 md:gap-6 overflow-hidden"
          style={{
            backgroundImage: "url('/private/service/bgimg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 70%",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 to-orange-50/10 md:from-red-900/40 md:to-orange-50/80 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="max-w-4xl text-white md:text-red-900 text-2xl md:text-4xl font-semibold font-playfair drop-shadow-md md:drop-shadow-none">
              Trusted Partners for Your Special Day
            </h1>
            <p className="max-w-lg text-white/90 md:text-white mt-3 md:mt-10 font-inter text-sm md:text-xl font-medium mx-auto px-4">
              Handpicked wedding service providers verified by RVR Matrimony
            </p>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <section className="flex flex-col gap-4 md:gap-6 relative group px-4 md:px-0">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <h2 className="text-stone-800 text-xl md:text-2xl font-semibold font-playfair">
            Browse by Category
          </h2>

          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll(categoryRef, "left")}
              className="cursor-pointer p-2 rounded-full border border-gray-200 hover:bg-gray-100 shadow-sm transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll(categoryRef, "right")}
              className="cursor-pointer p-2 rounded-full border border-gray-200 hover:bg-gray-100 shadow-sm transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Categories: Grid on Mobile, Row on Desktop */}
        <div
          ref={categoryRef}
          className="grid grid-cols-2 gap-3 md:flex md:flex-row md:overflow-x-auto md:gap-4 pb-4 no-scrollbar md:scroll-smooth"
        >
          {categories.map((cat, i) => (
            <div
              key={i}
              className="w-full md:w-auto md:min-w-[240px] bg-white p-4 md:p-5 rounded-xl md:rounded-2xl shadow-sm md:shadow-md border border-gray-100 flex flex-col justify-between items-start h-40 md:h-48 hover:shadow-xl transition-shadow cursor-pointer flex-shrink-0"
            >
              <span className="text-3xl md:text-4xl">{cat.icon}</span>
              <div className="space-y-1 w-full">
                <h3 className="text-green-800 line-clamp-2 text-sm md:text-base font-semibold font-playfair leading-tight">
                  {cat.name}
                </h3>
                <p className="text-stone-500 text-[10px] md:text-xs line-clamp-2 leading-tight">
                  {cat.desc}
                </p>
              </div>
              <span className="text-red-900 text-[10px] md:text-xs font-bold flex items-center gap-1 group mt-2">
                {cat.count} Partners{" "}
                <ArrowRight
                  size={12}
                  className="hidden md:block group-hover:translate-x-1 transition-transform"
                />
                <span className="md:hidden">→</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Partners Section */}
      <section className="flex flex-col gap-4 md:gap-6 relative group overflow-hidden px-4 md:px-0">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <h2 className="text-stone-800 text-xl md:text-2xl font-semibold font-playfair">
            Featured Partners
          </h2>
          <div className="flex items-center gap-4">
            <button className="cursor-pointer text-red-900 text-sm md:text-base font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>

            <div className="hidden md:flex gap-2 ml-4">
              <button
                onClick={() => scroll(featuredRef, "left")}
                className="cursor-pointer p-2 rounded-full border border-gray-200 hover:bg-gray-100 shadow-sm transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll(featuredRef, "right")}
                className="cursor-pointer p-2 rounded-full border border-gray-200 hover:bg-gray-100 shadow-sm transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* CHANGED: Layout logic for visibility
            Mobile: 'flex-col' (Vertical Stack) - Shows all cards one by one
            Desktop: 'md:flex-row' (Horizontal Scroll) - Preserves original design
        */}
        <div
          ref={featuredRef}
          className="flex flex-col md:flex-row md:overflow-x-auto gap-4 md:gap-6 pb-6 no-scrollbar md:flex-nowrap md:scroll-smooth"
        >
          {featured.map((partner, i) => (
            <div
              key={i}
              className="w-full md:w-auto md:min-w-[340px] bg-white rounded-2xl shadow-sm md:shadow-md overflow-hidden border border-gray-100 flex flex-col flex-shrink-0"
            >
              <div className="bg-[linear-gradient(99deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] py-2 px-4 flex items-center justify-center gap-2">
                <Star size={14} className="fill-red-900 text-red-900" />
                <span className="text-red-900 text-[10px] font-bold tracking-widest uppercase">
                  Featured Partner
                </span>
              </div>
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-1.5 overflow-hidden">
                      <h3 className="text-green-900 truncate text-base md:text-lg font-bold font-playfair leading-tight">
                        {partner.name}
                      </h3>
                      <CheckCircle
                        size={16}
                        className="text-green-600 mt-1 flex-shrink-0"
                      />
                    </div>
                    <span className="text-green-600 font-bold whitespace-nowrap text-sm md:text-base">
                      {partner.price}
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs">{partner.type}</p>
                  <div className="flex items-center gap-1 text-stone-400 text-xs">
                    <MapPin size={12} />
                    <span className="truncate">{partner.loc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-green-700 font-bold text-sm">
                      {partner.rating}
                    </span>
                  </div>
                  <span className="text-stone-400 text-xs">
                    ({partner.reviews} reviews)
                  </span>
                </div>
                <div className="flex gap-3">
                  <button className="cursor-pointer flex-1 py-2.5 rounded-full border border-red-900 text-red-900 text-xs font-bold hover:bg-red-50 transition-colors">
                    View Details
                  </button>
                  <button className="cursor-pointer flex-1 py-2.5 rounded-full bg-[#429466] text-white text-xs font-bold hover:bg-green-700 shadow-md">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Footer */}
      <div className="flex px-4 md:px-0">
        <div className="w-full bg-orange-50 font-inter rounded-2xl border border-amber-200 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="space-y-4 w-full">
            <h4 className="text-green-700 font-bold text-sm md:text-base">
              Why Choose RVR Wedding Partners?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[
                "All partners are verified and background checked",
                "Trusted by RVR Matrimony members for quality",
                "Exclusive offers for RVR Premium members",
              ].map((text, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CheckCircle
                    size={16}
                    className="text-green-600 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-stone-500 text-xs leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingPartners;
