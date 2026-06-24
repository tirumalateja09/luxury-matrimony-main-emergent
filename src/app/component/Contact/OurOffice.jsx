"use client";
import Image from "next/image";
import { motion } from "framer-motion";

// I've added a few more items to the array to demonstrate the effect better.
// Even if you only have one image file, repeating the data object ensures the strip is long enough to loop.
const images = [
  { src: "/contact/slid1.png", alt: "Reception" },
  { src: "/contact/slid2.png", alt: "Signage" },
  { src: "/contact/slid3.png", alt: "Hallway" },
  { src: "/contact/slid4.png", alt: "Meeting Room" },
];

const OurOffice = () => {
  return (
    <div className="relative bg-[#F7E6D9]  py-12 overflow-hidden">
      {/* Decorative Mandala Patterns */}
      <div>
        <Image
          src="/contact/mandala1.svg"
          height={313}
          width={309}
          alt=""
          className="absolute -top-12 -left-10 w-64 h-64  pointer-events-none rotate-180"
        />
      </div>
      <div>
        <Image
          src="/contact/mandala1.svg"
          alt=""
          height={200}
          width={150}
          className="absolute bottom-0 right-0 pointer-events-none transform "
        />
      </div>

      <div className="relative z-10 w-full">
        {/* Title and Subtitle */}
        <div className="text-center mb-12 container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#4A3F35] mb-3">
            Our Office
          </h2>
          <p className="text-xl text-[#3B8C6E] font-medium">
            A welcoming space for families
          </p>
        </div>

        {/* Infinite Scrolling Image Carousel */}
        <div className="flex overflow-hidden w-full">
          <motion.div
            className="flex gap-8" // Use gap instead of space-x for consistent spacing
            // We animate to -50% because the list contains 2 sets of images.
            // When the first set (50%) moves out, the second set takes its place instantly.
            animate={{ x: "-50%" }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 30, // Adjust speed (higher number = slower)
              ease: "linear",
            }}
            // w-max ensures the div is exactly as wide as the images inside
            style={{ width: "max-content" }}
          >
            {/* We map the images array twice. 
               Set 1: Scrolls out of view.
               Set 2: Scrolls into view to replace Set 1.
            */}
            {[...images, ...images].map((image, index) => (
              <div
                key={index}
                // Fixed width for cards ensures consistent sizing.
                // Adjust w-[300px] md:w-[400px] as needed for your design.
                className="flex-shrink-0 w-[300px] md:w-[400px] h-[250px] md:h-[300px] relative"
              >
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden h-full w-full">
                  <div className="relative h-full w-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-3xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12 container mx-auto px-4">
          <p className="text-[#4A3F35] font-medium">
            Visit us during business hours for personalized assistance
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurOffice;
