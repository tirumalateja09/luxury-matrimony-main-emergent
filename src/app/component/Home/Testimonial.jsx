import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

const testimonials = [
  {
    id: 1,
    image: "/home/testimonialImg1.png",
    quote:
      "Found my perfect life partner through RVR. The verification process gave our families complete confidence.",
    name: "Lakshmi & Arun",
    date: "Married Mar 2024",
  },
  {
    id: 2,
    image: "/home/testimonialImg2.png",
    quote:
      "RVR made our family search easy and trustworthy. Premium membership was worth every rupee.",
    name: "Priya & Rajesh",
    date: "Married Jan 2024",
  },
];

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const changeSlide = (direction) => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        if (direction === "next") {
          return prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1;
        } else {
          return prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
        }
      });
      setIsVisible(true);
    }, 500);
  };

  useEffect(() => {
    const scrollToSection = () => {
      if (window.location.hash === "#testimonials") {
        const el = document.getElementById("testimonials");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Run on first load
    scrollToSection();

    // Run when hash changes
    window.addEventListener("hashchange", scrollToSection);

    return () => {
      window.removeEventListener("hashchange", scrollToSection);
    };
  }, []);

  const handleNext = () => changeSlide("next");
  const handlePrev = () => changeSlide("prev");

  const currentData = testimonials[currentIndex];

  return (
    <div
      className="relative w-full min-h-screen xl:min-h-[120vh] px-4 sm:px-6 md:px-12 lg:px-24 bg-[#6E2F2F] flex flex-col justify-center items-center overflow-hidden scroll-mt-20"
      id="testimonials"
    >
      {/* --- Shared Background Illustration --- */}
      <div className="absolute bottom-0 w-full z-0 pointer-events-none">
        <Image
          src={"/home/illustration5.svg"}
          width={1440}
          height={341}
          alt="illustration5"
          className="w-full object-cover h-[150px] md:h-auto"
        />
      </div>

      {/* ==================================================================
          MOBILE VIEW (Buttons on sides of Image)
         ================================================================== */}
      <div className="z-10 w-full py-10 flex flex-col items-center justify-center gap-8 md:hidden h-full">
        <div
          className={`
            flex flex-col items-center gap-6 text-white w-full
            transition-opacity duration-500 ease-in-out
            ${isVisible ? "opacity-100" : "opacity-0"}
          `}
        >
          {/* --- Image Container with Flanking Buttons --- */}
          <div className="relative w-full flex justify-center items-center">
            {/* Left Button (Absolute Left) */}
            <button
              onClick={handlePrev}
              className="absolute left-0 z-20 h-[40px] w-[40px] rounded-full flex justify-center items-center bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] shadow-lg active:scale-95 transition-transform"
              aria-label="Previous testimonial"
            >
              <FaAngleLeft className="h-4 w-4 text-[#4A2C2C]" />
            </button>

            {/* Centered Image */}
            <div className="relative shrink-0 w-[230px] h-[320px] sm:w-[240px] sm:h-[340px] z-10">
              <Image
                src={currentData.image}
                alt={currentData.name}
                fill
                className="object-contain"
                sizes="240px"
                priority
              />
            </div>

            {/* Right Button (Absolute Right) */}
            <button
              onClick={handleNext}
              className="absolute right-0 z-20 h-[40px] w-[40px] rounded-full flex justify-center items-center bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] shadow-lg active:scale-95 transition-transform"
              aria-label="Next testimonial"
            >
              <FaAngleRight className="h-4 w-4 text-[#4A2C2C]" />
            </button>
          </div>

          {/* Mobile Text Content */}
          <div className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-playfair tracking-wide text-white">
              Hear from happy Couples
            </h2>

            <p className="text-lg font-playfair italic leading-relaxed text-white opacity-90">
              &quot;{currentData.quote}&quot;
            </p>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-medium font-playfair">
                {currentData.name}
              </span>

              {/* Mobile Badge */}
              <div className="bg-[#368157] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Image
                  src={"/home/heart.svg"}
                  width={18}
                  height={17}
                  alt="heart"
                />
                <span className="text-sm font-medium tracking-wide bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] bg-clip-text text-transparent font-semibold">
                  {currentData.date}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================
          DESKTOP VIEW (Untouched)
         ================================================================== */}
      <div className="hidden md:flex z-10 w-full max-w-[1400px] mx-auto py-10 items-center justify-between gap-4">
        {/* Left Button */}
        <button
          onClick={handlePrev}
          className="shrink-0 h-[40px] w-[40px] md:h-[50px] md:w-[50px] lg:h-[66px] lg:w-[67px] rounded-full flex justify-center items-center
          bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]
          shadow-[0px_0px_10px_0px_#00000026] cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Previous testimonial"
        >
          <FaAngleLeft className="h-5 w-3 md:h-6 md:w-4 lg:h-8 lg:w-5 text-[#4A2C2C]" />
        </button>

        {/* Content Card with Transition Class */}
        <div
          className={`
            flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12 xl:gap-20 text-white flex-1 max-w-6xl justify-center
            transition-opacity duration-500 ease-in-out
            ${isVisible ? "opacity-100" : "opacity-0"}
          `}
        >
          {/* --- FIXED IMAGE CONTAINER --- */}
          <div className="relative shrink-0 w-[280px] h-[398px] md:w-[320px] md:h-[455px] lg:w-[384px] lg:h-[546px] flex justify-center md:justify-end">
            <Image
              src={currentData.image}
              alt={currentData.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 384px"
              priority
            />
          </div>

          {/* Text Content */}
          <div className="w-full md:w-[55%] lg:w-[60%] text-center md:text-left flex flex-col gap-4 lg:gap-6 px-2 md:px-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-playfair tracking-wide">
              Hear from happy Couples
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl font-playfair italic leading-relaxed text-[#F3DED3] opacity-90">
              &quot;{currentData.quote}&quot;
            </p>

            {/* Name and Badge Row */}
            <div className="flex flex-col lg:flex-row items-center md:items-start lg:items-center justify-between gap-4 mt-2">
              <span className="text-xl lg:text-2xl font-medium font-playfair">
                {currentData.name}
              </span>

              {/* Badge */}
              <div className="bg-[#368157] px-4 py-2 lg:px-5 lg:py-2 rounded-full max-w-[250px] flex items-center gap-2 shadow-lg whitespace-nowrap min-w-0">
                <Image
                  src={"/home/heart.svg"}
                  width={22}
                  height={21}
                  alt="heart"
                  className="w-[18px] h-[17px] lg:w-[22px] lg:h-[21px]"
                />
                <span
                  className="
                    text-sm md:text-lg xl:text-[20px] font-medium tracking-wide
                    bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]
                    bg-clip-text text-transparent font-semibold
                  "
                >
                  {currentData.date}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Button */}
        <button
          onClick={handleNext}
          className="shrink-0 h-[40px] w-[40px] md:h-[50px] md:w-[50px] lg:h-[66px] lg:w-[67px] rounded-full flex justify-center items-center
          bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]
          shadow-[0px_0px_10px_0px_#00000026] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Next testimonial"
        >
          <FaAngleRight className="h-5 w-3 md:h-6 md:w-4 lg:h-8 lg:w-5 text-[#4A2C2C]" />
        </button>
      </div>
    </div>
  );
};

export default Testimonial;
