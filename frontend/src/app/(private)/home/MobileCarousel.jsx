"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Image + Link mapping */
const slides = [
  { src: "/home/mobileslide/1.svg", href: "#" },
  { src: "/home/mobileslide/2.svg", href: "#" },
  { src: "/home/mobileslide/3.svg", href: "/matches" },
  { src: "/home/mobileslide/4.svg", href: "#" },
];

export default function MobileCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 lg:hidden">
      <div
        className="
        relative w-full 
        h-auto 
        overflow-hidden 
        rounded-2xl
      "
      >
        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="min-w-full relative flex justify-center items-center"
            >
              <Image
                src={item.src}
                alt={`carousel-${i}`}
                width={1200}
                height={800}
                className="w-full h-auto object-contain cursor-pointer"
                priority={i === 0}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-2 justify-center">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full cursor-pointer transition-all ${
              i === index
                ? "bg-green-500 w-5"
                : "bg-gray-300 w-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
