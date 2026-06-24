"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { getToken } from "@/function/getToken";
import LanguageDropdown from "./LanguageDropdown";

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
    <div className="z-[999] w-full px-5 md:px-12 lg:px-24 flex justify-between items-center max-h-[105px] h-full shadow-[0px_10px_20px_0px_rgba(0,0,0,0.1)] relative bg-white sticky top-0">
      {/* Logo */}

      <div className="relative w-48 h-16 md:w-64 md:h-24">
        <Image
          src="/icon.png"
          alt="RVR Luxury Matrimony"
          fill
          onClick={() => router.push("/")}
          className="object-contain  cursor-pointer object-left"
        />
      </div>
      {/* <Image
        src={"/logo.svg"}
        height={80}
        width={225}
        alt="logo"
        onClick={() => router.push("/")}
        className=" cursor-pointer"
      /> */}

      {/* --- Desktop Menu (Hidden on Mobile) --- */}
      <div className="hidden md:flex gap-6 items-center text-[#6E2F2F]">
        <Link href="/about">About Us</Link>
        <Link href="/contact">Contact Us</Link>
        <Link href="/Faq">FAQ</Link>
        <LanguageDropdown />
        {!isAuthChecking && (
          <button
            className="border-[1.18px] border-[#6E2F2F] hover:border-0 hover:bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] bg-[#FFFFFF] cursor-pointer shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)]
          h-[46px] w-[152px] rounded-full"
            onClick={() => router.push(isAuthorized ? "/home" : "/login")}
          >
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
          className={`h-0.5 w-6 bg-[#6E2F2F] transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        ></span>
        <span
          className={`h-0.5 w-6 bg-[#6E2F2F] transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`h-0.5 w-6 bg-[#6E2F2F] transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        ></span>
      </button>

      {/* --- Mobile Drawer & Overlay --- */}

      {/* Dark Overlay Background */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMenu}
      ></div>

      {/* Sliding Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[75%] max-w-[300px] bg-white z-[1001] shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
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
