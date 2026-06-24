import React from 'react';
import Image from 'next/image';

// Data for the approach steps
const approachSteps = [
  {
    id: "01",
    title: "Profile Verification",
    description: "Every member goes through phone verification, government ID check via DigiLocker, and live photo verification to ensure authenticity",
  },
  {
    id: "02",
    title: "Intelligent Matching",
    description: "Our platform uses advanced algorithms combined with traditional compatibility factors like community, education, values, and horoscope",
  },
  {
    id: "03",
    title: "Safe Communication",
    description: "Interest-based connections ensure mutual consent before any personal information is shared, protecting your privacy at every step",
  },
  {
    id: "04",
    title: "Family Involvement",
    description: "We recognize the importance of family in matrimonial decisions and provide features that enable parent participation",
  }
];

export default function OurApproach() {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 md:px-12 lg:px-24 bg-[linear-gradient(0deg,_#F3DED3_0%,_rgba(255,246,236,0)_78.54%)] overflow-hidden">
      
        <Image 
          src="/about/mandala2.svg" // Replace with your actual file path
          alt="Mandala pattern"
          height={350}
          width={500}
          className=' absolute -top-25 left-0'
        />

        <Image 
        src={'/about/Illustration1.svg'}
                  alt="Mandala pattern"
          height={350}
          width={500}
          className=' absolute -top-50 left-0'
        />

      <div className="relative z-10 mx-auto">
        
        {/* --- Section Header --- */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-4xl md:text-[40px] text-[#417F56] font-semibold font-playfair">
            Our Approach
          </h2>
          <p className="text-[#2A1D1D] text-xl font-inter">
            How we ensure safety, authenticity, and meaningful matches
          </p>
        </div>

        {/* --- Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {approachSteps.map((step) => (
            <div 
              key={step.id} 
              className="bg-white rounded-2xl p-8 flex items-start gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Number Badge */}
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#429466] flex items-center justify-center text-white font-playfair text-lg pt-1">
                  {step.id}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-playfair font-semibold text-[#6B4423]">
                  {step.title}
                </h3>
                <p className="text-[#2A1D1D] text-lg leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}