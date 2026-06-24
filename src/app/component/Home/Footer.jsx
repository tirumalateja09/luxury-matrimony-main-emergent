"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LinkedinLogoIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
} from "@phosphor-icons/react";

const Footer = () => {
  return (
    <div className=" bg-[#FEFCF5] w-full px-4 sm:px-5 md:px-12 lg:px-24 py-10">
      {/* Main Card Container */}
      <div className="w-full bg-white rounded-[24px] md:rounded-[40px] shadow-xl overflow-hidden relative">
        {/* Decorative Corner - Top Left */}
        <div className="absolute top-5 left-5 w-20 h-20 md:w-32 md:h-32 pointer-events-none z-10">
          <Image
            src="/home/illustration6.svg"
            alt="Corner Decoration"
            width={160}
            height={159}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Decorative Corner - Top Right */}
        <div className="absolute top-5 right-5 w-20 h-20 md:w-32 md:h-32 pointer-events-none z-10 rotate-90">
          <Image
            src="/home/illustration6.svg"
            alt="Corner Decoration"
            width={160}
            height={159}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Main Content Padding */}
        <div className="pt-12 px-6 pb-8 md:pt-16 md:px-16 md:pb-12 relative z-20">
          <div className="">
            {/* BRAND / LOGO SECTION */}
            {/* Centered on mobile, Left on desktop */}
            <div className="flex flex-col items-center md:items-start space-y-4 mb-8 md:mb-4">
              <div className="relative w-48 h-16 md:w-64 md:h-24">
                <Image
                  src="/icon.png"
                  alt="RVR Luxury Matrimony"
                  fill
                  className="object-contain object-center md:object-left"
                />
              </div>
            </div>

            {/* LINKS & SOCIALS CONTAINER */}
            <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-0">
              {/* LINKS SECTION - Mobile: 2 Cols, Desktop: 3 Cols */}
              <div className="w-full lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 text-left">
                {/* Explore Column (Left on Mobile) */}
                <div className="flex flex-col space-y-3">
                  <h3 className="text-gray-900 font-bold text-[18px] md:text-[20px]">
                    Explore
                  </h3>
                  <ul className="space-y-2 text-[#2A1D1D] text-[15px] md:text-[16px]">
                    <li>
                      <Link
                        href="/login"
                        className="hover:text-green-700 transition"
                      >
                        Member Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/language-selection"
                        className="hover:text-green-700 transition"
                      >
                        Register
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/matches"
                        className="hover:text-green-700 transition"
                      >
                        Search Matches
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile/membership"
                        className="hover:text-green-700 transition"
                      >
                        Membership/Subscription
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/customer-support"
                        className="hover:text-green-700 transition"
                      >
                        Customer Support
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Wrapper for Company & Legal to stack in Right Column on Mobile */}
                {/* md:contents causes this div to 'disappear' on desktop, letting children become direct grid items */}
                <div className="flex flex-col gap-8 col-span-1 md:contents">
                  {/* Company Column */}
                  <div className="flex flex-col space-y-3 max-sm:pl-6">
                    <h3 className="text-[#2A1D1D] font-bold text-[18px] md:text-xl">
                      Company
                    </h3>
                    <ul className="space-y-2 text-[#2A1D1D] text-[15px] md:text-[16px]">
                      <li>
                        <Link
                          href="/about"
                          className="hover:text-green-700 transition"
                        >
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/Faq"
                          className="hover:text-green-700 transition"
                        >
                          Faq
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/#testimonials"
                          className="hover:text-green-700 transition"
                          onClick={(e) => {
                            const el = document.getElementById("testimonials");

                            if (el) {
                              e.preventDefault(); // stop default navigation
                              el.scrollIntoView({ behavior: "smooth" });

                              // update URL hash without reload
                              window.history.pushState(
                                null,
                                "",
                                "/#testimonials",
                              );
                            }
                          }}
                        >
                          Success Stories
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/contact"
                          className="hover:text-green-700 transition"
                        >
                          Contact Us
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Legal Column */}
                  <div className="flex flex-col text-[#2A1D1D] space-y-3 max-sm:pl-6">
                    <h3 className="font-bold text-[18px] md:text-xl">Legal</h3>
                    <ul className="space-y-2 text-[15px] md:text-[16px]">
                      <li>
                        <Link
                          href="/terms-and-conditions"
                          className="hover:text-green-700 transition"
                        >
                          Terms & Conditions
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/privacy-policy"
                          className="hover:text-green-700 transition"
                        >
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* APP & SOCIALS SECTION */}
              <div className="lg:col-span-3 flex flex-col space-y-6 items-start text-left mt-4 md:mt-0">
                <div>
                  <p className="text-[#7B6A64] text-lg mb-4 leading-snug">
                    Get matched anytime,
                    <br />
                    anywhere using the app
                  </p>

                  {/* App Buttons */}
                  {/* <div className="flex flex-row gap-3">
                    <Image
                      src={"/home/android.png"}
                      width={120}
                      height={40}
                      alt="android"
                      className="w-[125px] h-auto"
                    />
                    <Image
                      src={"/home/ios.png"}
                      width={120}
                      height={40}
                      alt="ios"
                      className="w-[125px] h-auto"
                    />
                  </div> */}
                  <div className="flex flex-row gap-3">
                    <Link href="#" className="hover:opacity-90 transition">
                      <Image
                        src="/home/android.png"
                        width={125}
                        height={40}
                        alt="android"
                        className="w-[125px] h-[40px] object-contain"
                      />{" "}
                    </Link>
                    <Link href="#" className="hover:opacity-90 transition">
                      <Image
                        src="/home/ios.png"
                        width={125}
                        height={40}
                        alt="ios"
                        className="w-[125px] h-[40px] object-contain"
                      />{" "}
                    </Link>
                  </div>
                </div>

                {/* Social Icons */}
                <div>
                  <p className="text-[#7B6A64] mb-3 text-lg">Follow Us:</p>
                  <div className="flex gap-3">
                    <Link
                      href="#"
                      className="w-10 h-10 md:w-11 md:h-11 bg-[#F3DED3] rounded-lg flex items-center justify-center text-[#6E2F2F] text-xl hover:bg-[#e6cbb8] transition"
                    >
                      <LinkedinLogoIcon
                        size={24}
                        className="md:w-[30px] md:h-[30px]"
                      />
                    </Link>
                    <Link
                      href="#"
                      className="w-10 h-10 md:w-11 md:h-11 bg-[#F3DED3] rounded-lg flex items-center justify-center text-[#6E2F2F] text-xl hover:bg-[#e6cbb8] transition"
                    >
                      <InstagramLogoIcon
                        size={24}
                        className="md:w-[30px] md:h-[30px]"
                      />
                    </Link>
                    <Link
                      href="#"
                      className="w-10 h-10 md:w-11 md:h-11 bg-[#F3DED3] rounded-lg flex items-center justify-center text-[#6E2F2F] text-xl hover:bg-[#e6cbb8] transition"
                    >
                      <FacebookLogoIcon
                        size={24}
                        className="md:w-[30px] md:h-[30px]"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GREEN COPYRIGHT BAR */}
        <div className="w-full bg-[#429466] flex flex-col gap-2 py-4 px-6 md:px-16 text-white text-[14px] md:text-[16px] text-center md:text-left font-medium">
          All rights reserves © 2026
          <p className="text-sm opacity-70">
            Powered By{" "}
            <Link
              href="https://www.softwaregiant.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-90 transition"
            >
              SoftwareGiant
            </Link>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
