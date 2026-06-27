"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { getToken } from "@/function/getToken";
import LanguageDropdown from "./LanguageDropdown";
import { motion } from "framer-motion";
import { FaInfo, FaPhone, FaCircleQuestion, FaHeart } from "react-icons/fa6";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        localStorage.removeItem("rvr_auth_data");
        if (isMounted) {
          setIsAuthorized(false);
          setIsAuthChecking(false);
        }
        return;
      }

      try {
        const response = await api.get("/auth/token-status", "private");
        const isValid =
          response?.success && response?.valid && !response?.expired;

        if (!isValid) {
          localStorage.removeItem("rvr_auth_data");
          if (isMounted) {
            setIsAuthorized(false);
            setIsAuthChecking(false);
          }
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (error) {
        localStorage.removeItem("rvr_auth_data");
        if (isMounted) {
          setIsAuthorized(false);
        }
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    // Main Navbar Container
    <div className="z-[999] w-full px-5 md:px-12 lg:px-24 flex justify-between items-center max-h-[105px] h-full shadow-[0px_10px_20px_0px_rgba(0,0,0,0.06)] relative bg-white sticky top-0">

      {/* ── Gold Traditional Filigree Corner Ornaments ── */}
      <div className="absolute top-0 left-0 w-16 h-16 opacity-[2.55]   pointer-events-none z-0 select-none">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>
      <div className="absolute top-0 right-0 w-16 h-16 opacity-[2.55] pointer-events-none z-0 select-none rotate-90">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 opacity-[2.55] pointer-events-none z-0 select-none rotate-180">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 opacity-[2.55] pointer-events-none z-0 select-none -rotate-90">
        <Image src="/home/tldesign.svg" alt="decoration" fill className="object-contain" />
      </div>

      {/* ── Thin Premium Gold Gradient Bottom Border ── */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] z-10" />

      {/* Logo */}
      <div className="relative w-48 h-16 md:w-64 md:h-24 z-10">
        <Image
          src="/icon.png"
          alt="RVR Luxury Matrimony"
          fill
          onClick={() => router.push("/")}
          className="object-contain cursor-pointer object-left"
        />
      </div>

      {/* --- Desktop Menu (Hidden on Mobile) --- */}
      <div className="hidden md:flex gap-8 items-center text-[#6E2F2F] relative z-10 font-inter font-semibold text-sm">
        <Link href="/about" className="flex items-center gap-1.5 hover:text-[#CAA043] transition-colors group">
          <motion.span whileHover={{ scale: 1.2, rotate: 15 }} className="text-xs text-[#E3B450]">
            {/* <FaInfo /> */}
          </motion.span>
          About Us
        </Link>
        <Link href="/contact" className="flex items-center gap-1.5 hover:text-[#CAA043] transition-colors group">
          <motion.span whileHover={{ scale: 1.2, y: -2 }} className="text-xs text-[#E3B450]">
            {/* <FaPhone /> */}
          </motion.span>
          Contact Us
        </Link>
        <Link href="/Faq" className="flex items-center gap-1.5 hover:text-[#CAA043] transition-colors group">
          <motion.span whileHover={{ scale: 1.2, rotate: -15 }} className="text-xs text-[#E3B450]">
            <FaCircleQuestion />
          </motion.span>
          FAQ
        </Link>
        <LanguageDropdown />
        {!isAuthChecking && (
          <button
            className="border-[1.18px] border-[#6E2F2F] hover:border-0 hover:bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] bg-[#FFFFFF] cursor-pointer shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)]
          h-[46px] w-[152px] rounded-full flex items-center justify-center gap-1.5 font-bold transition-all hover:scale-[1.03]"
            onClick={() => router.push(isAuthorized ? "/home" : "/login")}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#6E2F2F] text-xs"
            >
              <FaHeart />
            </motion.span>
            {isAuthorized ? "Dashboard" : "Login"}
          </button>
        )}
      </div>

      {/* --- Mobile Hamburger Button --- */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 z-[2000] relative"
      >
        <span
          className={`h-0.5 w-6 bg-[#6E2F2F] transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""
            }`}
        ></span>
        <span
          className={`h-0.5 w-6 bg-[#6E2F2F] transition-all duration-300 ${isOpen ? "opacity-0" : ""
            }`}
        ></span>
        <span
          className={`h-0.5 w-6 bg-[#6E2F2F] transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
        ></span>
      </button>

      {/* --- Mobile Drawer & Overlay --- */}

      {/* Dark Overlay Background */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={toggleMenu}
      ></div>

      {/* Sliding Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[75%] max-w-[300px] bg-white z-[1001] shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col p-6 gap-6 mt-20">
          {/* Action Buttons */}
          {!isAuthorized && (
            <button
              // Added onClick navigation for Register
              onClick={() => {
                router.push("/register"); // Or your specific register path
                toggleMenu();
              }}
              className="w-full bg-[#E3B556] text-[#6E2F2F] font-semibold py-3 rounded-full shadow-md bg-gradient-to-r from-[#e3b556] to-[#d4af37]"
            >
              Register for Free
            </button>
          )}
          {!isAuthChecking && (
            <button
              // Added onClick navigation for Login/Dashboard
              onClick={() => {
                router.push(isAuthorized ? "/home" : "/login");
                toggleMenu();
              }}
              className="w-full border border-[#6E2F2F] text-[#6E2F2F] font-semibold py-3 rounded-full hover:bg-gray-50"
            >
              {isAuthorized ? "Dashboard" : "Login"}
            </button>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-6 text-[#6E2F2F] text-lg font-medium mt-4">
            <div className="flex justify-start">
              <LanguageDropdown align="left" />
            </div>
            <Link
              href="/about"
              onClick={toggleMenu}
              className="hover:text-[#E3B556] transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={toggleMenu}
              className="hover:text-[#E3B556] transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/Faq"
              onClick={toggleMenu}
              className="hover:text-[#E3B556] transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
