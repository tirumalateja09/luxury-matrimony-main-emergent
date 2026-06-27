"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const PhotoModal = ({
  isOpen,
  onClose,
  images = [],
}) => {
  const [mounted, setMounted] =
    useState(false);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "unset";
    }

    return () => {
      document.body.style.overflow =
        "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const nextImage = () => {
    setCurrentIndex(
      (prev) => (prev + 1) % images.length
    );
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + images.length) %
        images.length
    );
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black"
      >
        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6">
          <div>
            <h2 className="text-lg font-semibold text-white md:text-xl">
              Photo Gallery
            </h2>

            <p className="text-sm text-white/60">
              {currentIndex + 1} /{" "}
              {images.length}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex cursor-pointer h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            <X size={22} />
          </button>
        </div>

        {/* IMAGE AREA */}
        <div className="relative h-screen w-screen overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              initial={{
                opacity: 0,
                scale: 1.02,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
              }}
              transition={{
                duration: 0.35,
              }}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </AnimatePresence>

          {/* LEFT BUTTON */}
          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 md:left-6 md:h-14 md:w-14"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* RIGHT BUTTON */}
          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 md:right-6 md:h-14 md:w-14"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* THUMBNAILS */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 gap-3 overflow-x-auto rounded-2xl bg-black/40 px-4 py-3 backdrop-blur-xl no-scrollbar md:bottom-6">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setCurrentIndex(idx)
                  }
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    currentIndex === idx
                      ? "scale-105 border-white"
                      : "border-transparent opacity-60"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default PhotoModal;





// "use client";
// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

// const PhotoModal = ({ isOpen, onClose, images }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (isOpen) document.body.style.overflow = "hidden";
//     else document.body.style.overflow = "unset";
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const nextImage = () => {
//     setCurrentIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = () => {
//     setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   return (
//     // Backdrop: Lighter semi-transparent black to show background content
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      
//       {/* Centered Small Card */}
//       <div className="relative w-full overflow-y-auto max-w-[500px] max-h-[95vh] md:h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-4 md:p-6 flex flex-col gap-4">
        
//         {/* Header Row: Back button and Counter */}
//         <div className="flex items-center justify-between">
//           <button 
//             onClick={onClose}
//             className="w-10 cursor-pointer h-10 rounded-full bg-green-600/10 text-green-700 flex items-center justify-center hover:bg-green-600/20 transition-colors"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <p className="text-green-700 font-bold text-sm">
//             {currentIndex + 1} / {images.length}
//           </p>
//           <div className="w-10 h-10" /> {/* Spacer to balance flexbox */}
//         </div>

//         {/* Main Image: High quality portrait/square display */}
//         <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={currentIndex}
//               src={images[currentIndex]}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.2 }}
//               className="w-full h-full object-cover"
//             />
//           </AnimatePresence>

//           {/* Floating Navigation Arrows */}
//           <button
//             onClick={prevImage}
//             className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition-all"
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <button
//             onClick={nextImage}
//             className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition-all"
//           >
//             <ChevronRight size={20} />
//           </button>
//         </div>

//         {/* Bottom: Horizontal Thumbnail Track */}
//         <div className="flex flex-row overflow-x-auto gap-2 pb-2 no-scrollbar scroll-smooth">
//           {images.map((img, idx) => (
//             <button
//               key={idx}
//               onClick={() => setCurrentIndex(idx)}
//               className={`relative cursor-pointer flex-shrink-0 mx-1 mt-1 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
//                 currentIndex === idx 
//                   ? "border-green-600 scale-105" 
//                   : "border-transparent opacity-60"
//               }`}
//             >
//               <img src={img} className="w-full h-full object-cover" alt="" />
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PhotoModal;


