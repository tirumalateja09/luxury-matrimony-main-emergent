"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/apiClient";

// helper to mask phone number (keep first 2 and last 2 digits visible)
const maskContact = (value, type) => {
  if (!value) {
    return type === "phone" ? "+91 XXXXX XXXXX" : "your email";
  }

  if (type === "phone") {
    const digits = value.replace(/\D/g, "");
    const clean = digits.startsWith("91") ? digits.slice(2) : digits;

    if (clean.length !== 10) return "+91 XXXXX XXXXX";

    return `+91 ${clean.slice(0, 2)}******${clean.slice(-2)}`;
  }

  // Email masking
  if (type === "email") {
    const [name, domain] = value.split("@");
    if (!name || !domain) return "your email";

    if (name.length <= 2) {
      return `${name[0]}***@${domain}`;
    }

    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  }

  return value;
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState("forgot");
  const [method, setMethod] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);
  const router = useRouter();

  const normalizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

  const handleSendOtp = async (selectedMethod = method) => {
    const identifier = selectedMethod === "email" ? email : phoneNumber;

    if (!identifier?.trim()) {
      toast.error(
        selectedMethod === "email"
          ? "Please enter your email address"
          : "Please enter your phone number",
      );
      return;
    }
    if (
      selectedMethod === "phone" &&
      normalizePhone(identifier).length !== 10
    ) {
      toast.error("Please enter a valid 10 digit phone number");
      return;
    }
    if (selectedMethod === "email" && !isValidEmail(identifier)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setStep("otp");
    setTimer(30);

    try {
      setMethod(selectedMethod);
      await api.post("/auth/forgot-password", {
        [selectedMethod === "email" ? "email" : "phone"]: identifier.trim(),
      });
      setOtp(new Array(6).fill(""));
      toast.success("OTP sent successfully");
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter 6 digit OTP");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await api.post("/auth/forgot-password/reset", {
        email: method === "email" ? email.trim() : undefined,
        phone: method === "phone" ? phoneNumber.trim() : undefined,
        otp: enteredOtp,
        newPassword: newPassword.trim(),
      });
      toast.success("Password reset successfully");
      router.replace("/login");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("forgot");
      setOtp(new Array(6).fill(""));
      setNewPassword("");
    }
  };

  const fillOtpFromString = (value, startIndex = 0) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return;
    const nextOtp = [...otp];
    let cursor = startIndex;
    for (let i = 0; i < digits.length && cursor < nextOtp.length; i += 1) {
      nextOtp[cursor] = digits[i];
      cursor += 1;
    }
    setOtp(nextOtp);
    const focusIndex = Math.min(cursor, nextOtp.length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleChange = (element, index) => {
    const raw = element.value;
    if (!raw) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }
    if (raw.length > 1) {
      fillOtpFromString(raw, index);
      return;
    }
    if (isNaN(raw)) return;
    const newOtp = [...otp];
    newOtp[index] = raw;
    setOtp(newOtp);
    if (raw && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text") || "";
    fillOtpFromString(text, index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFormEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendOtp(method);
    }
  };

  const handleOtpEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyOtp();
    }
  };

  useEffect(() => {
    let interval;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  return (
    <div className="min-h-screen flex w-full bg-[linear-gradient(180deg,_#E7B8A5_-55.74%,_#FFFFFF_80.23%)] font-sans">
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src={"/Login/couple.png"}
          width={550}
          height={565}
          alt="couple"
          className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-[60%] z-50"
        />
        <Image
          src={"/Login/illustration1.svg"}
          width={450}
          height={350}
          alt="illustration"
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-20 py-10 relative">
        <div className="w-full max-w-md">
          {step === "forgot" && (
            <>
              <div className="block">
                <div className="hidden sm:block">
                  <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-[#2D2424] mb-2">
                    Forgot Password?
                  </h2>
                  <p className="font-medium text-[#7B6A64] my-3">
                    No worries. We&apos;ll send you a one time code.
                  </p>
                </div>
                <div className="sm:hidden block text-center">
                  <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-[#2D2424] mb-2">
                    Reset access
                  </h2>
                  <p className="font-medium text-[#7B6A64] my-3">
                    We&apos;ll send you a one time code.
                  </p>
                </div>

                <div className="flex gap-2.5 my-6">
                  <button
                    onClick={() => setMethod("phone")}
                    className={`flex-1 cursor-pointer py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${
                      method === "phone"
                        ? "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-black"
                        : "text-[#6E2F2F] bg-white border border-[#6E2F2F]"
                    }`}
                  >
                    Phone
                  </button>
                  <button
                    onClick={() => setMethod("email")}
                    className={`flex-1 py-2 cursor-pointer rounded-full text-sm font-medium transition-all duration-300 shadow-md ${
                      method === "email"
                        ? "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-black"
                        : "text-[#6E2F2F] bg-white border border-[#6E2F2F]"
                    }`}
                  >
                    Email
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block font-medium text-gray-700 mb-2">
                    {method === "phone" ? "Phone" : "Email Address"}
                  </label>
                  <input
                    type={method === "phone" ? "tel" : "email"}
                    value={method === "phone" ? phoneNumber : email}
                    onChange={(e) =>
                      method === "phone"
                        ? setPhoneNumber(normalizePhone(e.target.value))
                        : setEmail(e.target.value)
                    }
                    onKeyDown={handleFormEnter}
                    inputMode={method === "phone" ? "numeric" : undefined}
                    maxLength={method === "phone" ? 10 : undefined}
                    placeholder={
                      method === "phone" ? "+91 XXXXX XXXXX" : "name@example.com"
                    }
                    className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  />
                </div>

                <button
                  onClick={() => handleSendOtp(method)}
                  className="w-full cursor-pointer bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6"
                >
                  Send OTP
                </button>

                <div className="flex items-center justify-between mb-6">
                  <span className="w-2/5 border-b border-gray-300"></span>
                  <span className="text-xs text-gray-400 uppercase">OR</span>
                  <span className="w-2/5 border-b border-gray-300"></span>
                </div>

                <p className="text-center text-[#2A1D1D]">
                  <Link href="/login" className="text-blue-500 hover:underline">
                    Back to Login
                  </Link>
                </p>

                <p className="text-center mt-10 text-[#7B6A64] text-xs px-8 leading-relaxed">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </>
          )}

          {step === "otp" && (
            <div className="flex flex-col items-center w-full">
              <div className="w-full flex justify-start mb-8">
                <button onClick={handleBack} className="p-2 cursor-pointer -ml-2">
                  <BackArrowIcon />
                </button>
                <div className="w-full text-center text-stone-800 font-semibold font-playfair text-3xl lg:text-4xl leading-tight">
                  Verify your {method === "phone" ? "Phone" : "Email"}
                </div>
              </div>

              <p className="text-[#2D2424] text-lg mb-8 text-center">
                We sent a code to <br />
                <span className="font-semibold">
                  {maskContact(method === "phone" ? phoneNumber : email, method)}
                </span>
              </p>

              <div className="flex justify-between gap-2 mb-8 w-full px-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    onKeyDown={(e) => {
                      handleKeyDown(e, index);
                      handleOtpEnter(e);
                    }}
                    className="w-10 h-10 text-gray-800 md:w-12 md:h-12 border border-gray-400 rounded-full text-center text-xl font-medium focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 bg-white shadow-sm"
                  />
                ))}
              </div>

              <div className="w-full mb-8">
                <label className="block font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={handleOtpEnter}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6E2F2F]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <p className="text-[#555] mb-8">
                <button
                  onClick={() => handleSendOtp(method)}
                  disabled={timer > 0}
                  className={`${
                    timer > 0
                      ? "text-stone-400 cursor-not-allowed"
                      : "text-green-600 font-semibold hover:underline cursor-pointer"
                  } transition-all`}
                >
                  Resend OTP
                </button>
                {timer > 0 && (
                  <span className="font-semibold text-black ml-1">
                    in {timer}s
                  </span>
                )}
              </p>

              <button
                onClick={handleVerifyOtp}
                className="w-full cursor-pointer bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                Verify
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

const BackArrowIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-800"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
