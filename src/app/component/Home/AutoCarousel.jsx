"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const imagesDummy = [
  "/home/slide1.png",
  "/home/slide2.png",
  "/home/slide3.jpg",
  "/home/slide4.png",
];

const mainhomeImages = [
  "/home/homeSlide/matrimonial.mp4",
  "/home/homeSlide/slide1.png",
  "/home/homeSlide/slide2.png",
  "/home/homeSlide/slide3.png",
  "/home/homeSlide/slide4.png",
];

const isVideoSlide = (src) =>
  typeof src === "string" && src.toLowerCase().endsWith(".mp4");

export default function AutoCarousel({ mainhome, images }) {
  const [index, setIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(null);
  const videoRefs = useRef([]);

  const activeImages = images && images.length > 0 ? images : mainhome ? mainhomeImages : imagesDummy;

  const goToPrevious = () => {
    setIndex((prev) => (prev === 0 ? activeImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % activeImages.length);
  };

  const handlePlayVideo = async (slideIndex) => {
    const video = videoRefs.current[slideIndex];

    if (!video) {
      return;
    }

    try {
      await video.play();
      video.controls = true;
      setPlayingVideo(slideIndex);
    } catch (error) {
      console.error("Unable to play video:", error);
    }
  };

  return (
    <div
      className={`${mainhome ? "" : "px-5 md:px-12 lg:px-24 pt-3"} bg-[#FEFCF5]`}
    >
      <div
        className={`${
          mainhome
            ? "w-full h-[250px] sm:h-[350px] md:h-[400px] xl:max-w-[1242px] 2xl:max-w-[1400px] xl:h-[660px] 2xl:max-h-[825px]"
            : "w-full h-[250px] sm:h-[350px] md:h-[450px] xl:max-w-[1242px] 2xl:max-w-[1400px] xl:h-[660px] 2xl:max-h-[825px]"
        } mx-auto overflow-hidden relative rounded-[42px] isolate`}
        style={{
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "radial-gradient(white, black)",
        }}
      >
        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Previous slide"
          className="absolute cursor-pointer left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-xl text-white transition hover:bg-black/60"
        >
         <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-3 cursor-pointer top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-xl text-white transition hover:bg-black/60"
        >
      <ChevronRight />
        </button>

        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {activeImages.map((src, i) => (
            <div key={i} className="relative h-full min-w-full bg-black">
              {isVideoSlide(src) ? (
                <>
                  <video
                    ref={(element) => {
                      videoRefs.current[i] = element;
                    }}
                    src={src}
                    className={`h-full w-full  ${mainhome ? "object-cover sm:object-[center_35%]  " : "object-cover"}`}
                    controls={playingVideo === i}
                    playsInline
                    preload={i === 0 ? "auto" : "metadata"}
                    onPause={() => {
                      if (playingVideo === i) {
                        setPlayingVideo(null);
                      }
                    }}
                  />
                  {playingVideo !== i && (
                    <button
                      type="button"
                      onClick={() => handlePlayVideo(i)}
                      aria-label="Play video"
                      className={`${mainhome ? "sm:h-16 sm:w-16 " : " sm:h-20 sm:w-20 " } absolute cursor-pointer left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:scale-105 hover:bg-white/30`}
                    >
                      <span className="ml-1 text-3xl leading-none"><Play /></span>
                    </button>
                  )}
                </>
              ) : (
                <Image
                  src={src}
                  alt={`Slide ${i + 1}`}
                  fill
                  className={`${mainhome ? "object-cover" : "object-cover "}`}
                  priority={i === 0}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
