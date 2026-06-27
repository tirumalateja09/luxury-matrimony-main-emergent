'use client';

import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Playfair_Display, Lato } from 'next/font/google';

// Font configuration (ensuring consistency)
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['600', '700'],
  variable: '--font-playfair'
});

const lato = Lato({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-lato'
});

export default function VisitSection() {
  return (
    <section className={`py-16 px-4 sm:px-6 md:px-8 lg:px-12 bg-white ${playfair.variable} ${lato.variable} font-sans`}>
      <div className=" mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl text-[#488B64] font-playfair font-semibold mb-3">
            Visit Our Office
          </h2>
          <p className="text-[#8D7F75] text-lg">
            We welcome you and your family
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Card: Address Info */}
          <div className="lg:col-span-4 bg-white border border-[#EAE0D5] rounded-3xl p-8 flex flex-col justify-between shadow-sm h-full">
            <div>
              <h3 className="text-2xl text-[#5E2E2E] font-playfair font-semibold mb-8">
                RVR Luxury Matrimony
              </h3>

              <div className="mb-8">
                {/* Icon Circle */}
                <div className="w-14 h-14 bg-[#F5E6D8] rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6 text-[#488B64]" strokeWidth={2} />
                </div>
                
                {/* Address Text */}
                <p className="text-[#488B64] text-lg leading-relaxed font-medium">
                  Brindavanam Street, Near Muthoot Finance Office, Trunk Road, Kavali - 524201.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[#488B64] hover:bg-[#3d7a55] text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              View on Google Maps
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right Card: Map Visual */}
          <div className="lg:col-span-8 h-full min-h-[400px] relative rounded-3xl overflow-hidden shadow-sm border border-[#EAE0D5]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.6!2d79.99!3d14.91!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDU0JzM2LjAiTiA3OcKwNTknMjQuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full object-cover"
              title="Google Map Location"
            ></iframe>
          </div>

        </div>
      </div>
    </section>
  );
}