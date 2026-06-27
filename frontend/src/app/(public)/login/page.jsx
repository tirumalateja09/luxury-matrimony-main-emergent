"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { getLanguageNameFromCode } from "@/lib/languagePreference";
// helper to mask phone number (keep first 2 and last 2 digits visible)
export const maskContact = (value, type) => {
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
const LoginPageContent = () => {
  const [step, setStep] = useState("login");
  const [loginMethod, setLoginMethod] = useState("phone");
  const [loginMode, setLoginMode] = useState("otp");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const normalizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

  const handleSendOtp = async (method) => {
    const selectedMethod = method || loginMethod;
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

    try {
      setLoginMethod(selectedMethod);
      await api.post("/auth/login/send-otp", {
        [selectedMethod === "email" ? "email" : "phone"]: identifier.trim(),
      });
      setStep("otp");
      setTimer(30);
      setOtp(new Array(6).fill(""));
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const handlePasswordLogin = async () => {
    const identifier = loginMethod === "email" ? email : phoneNumber;

    if (!identifier?.trim()) {
      toast.error(
        loginMethod === "email"
          ? "Please enter your email address"
          : "Please enter your phone number",
      );
      return;
    }
    if (loginMethod === "phone" && normalizePhone(identifier).length !== 10) {
      toast.error("Please enter a valid 10 digit phone number");
      return;
    }
    if (loginMethod === "email" && !isValidEmail(identifier)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    try {
      const selectedLang = localStorage.getItem("preferredLanguage");
      const selectedLanguageName = getLanguageNameFromCode(selectedLang);
      const payload = {
        email: loginMethod === "email" ? email.trim() : undefined,
        phone: loginMethod === "phone" ? phoneNumber.trim() : undefined,
        password: password.trim(),
        language: selectedLanguageName || undefined,
      };

      const res = await api.post("/auth/login", payload);
      if (res.success) {
        localStorage.setItem(
          "rvr_auth_data",
          JSON.stringify({ token: res.token, user: res.user }),
        );
        if (res.isNewUser) {
          router.replace("/profiledetails/step1");
        } else {
          router.replace(redirect || "/home");
        }
      }
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter 6 digit OTP");
      return;
    }

    try {
      const selectedLang = localStorage.getItem("preferredLanguage");
      const selectedLanguageName = getLanguageNameFromCode(selectedLang);
      const payload = {
        email: loginMethod === "email" ? email.trim() : undefined,
        phone: loginMethod === "phone" ? phoneNumber.trim() : undefined,
        otp: enteredOtp,
        language: selectedLanguageName || undefined,
      };

      const res = await api.post("/auth/verify-otp", payload);
      if (res.success) {
        localStorage.setItem(
          "rvr_auth_data",
          JSON.stringify({ token: res.token, user: res.user }),
        );
        if (res.isNewUser) {
          router.replace("/profiledetails/step1");
        } else {
          router.replace(redirect || "/home");
        }
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    }
  };



  const handleBack = () => {
    if (step === "otp") {
      setStep("login");
      setOtp(new Array(6).fill(""));
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
  const handleLoginKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (loginMode === "password") {
        handlePasswordLogin();
      } else {
        handleSendOtp(loginMethod);
      }
    }
  };

  const handleOtpEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyOtp();
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window === "undefined") return;

    const callbackUrl = new URL("/auth/google/callback", window.location.origin);

    if (redirect) {
      callbackUrl.searchParams.set("redirect", redirect);
    }

    const googleAuthUrl = new URL("/api/auth/google", apiBaseUrl);
    googleAuthUrl.searchParams.set("callbackUrl", callbackUrl.toString());

    if (redirect) {
      googleAuthUrl.searchParams.set("redirect", redirect);
    }

    setIsGoogleLoading(true);
    window.location.assign(googleAuthUrl.toString());
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
          {step === "login" && (
            <>
              <div className="block">
                <div className="hidden sm:block">
                  <h2 className="text-3xl  md:text-4xl font-playfair font-semibold text-[#2D2424] mb-2">
                    Welcome Back 👋
                  </h2>
                  <p className="font-medium text-[#7B6A64] my-3">
                    Today is a new day. It&lsquo;s your day. You shape it.
                    <br />
                    Your partner search ends here.
                  </p>
                </div>
                <div className="sm:hidden block text-center">
                  <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-[#2D2424] mb-2">
                    Let’s get started
                  </h2>
                  <p className="font-medium text-[#7B6A64] my-3">
                    Find your perfect life partner
                  </p>{" "}
                </div>
                <div className="flex gap-2.5 my-6">
                  <button
                    onClick={() => setLoginMethod("phone")}
                    className={`flex-1 cursor-pointer py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${loginMethod === "phone"
                      ? "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-black"
                      : "text-[#6E2F2F] bg-white border border-[#6E2F2F]"
                      }`}
                  >
                    Phone
                  </button>
                  <button
                    onClick={() => setLoginMethod("email")}
                    className={`flex-1 py-2 cursor-pointer rounded-full text-sm font-medium transition-all duration-300 shadow-md ${loginMethod === "email"
                      ? "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-black"
                      : "text-[#6E2F2F] bg-white border border-[#6E2F2F]"
                      }`}
                  >
                    Email
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block  font-medium text-gray-700 mb-2">
                    {loginMethod === "phone" ? "Phone" : "Email Address"}
                  </label>
                  <input
                    type={loginMethod === "phone" ? "tel" : "email"}
                    value={loginMethod === "phone" ? phoneNumber : email}
                    onChange={(e) =>
                      loginMethod === "phone"
                        ? setPhoneNumber(normalizePhone(e.target.value))
                        : setEmail(e.target.value)
                    }
                    onKeyDown={handleLoginKeyDown}
                    inputMode={loginMethod === "phone" ? "numeric" : undefined}
                    maxLength={loginMethod === "phone" ? 10 : undefined}
                    placeholder={
                      loginMethod === "phone"
                        ? "+91 XXXXX XXXXX"
                        : "name@example.com"
                    }
                    className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  />
                </div>

                <button
                  onClick={() => handleSendOtp(loginMethod)}
                  className={`w-full cursor-pointer  bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 ${loginMode === "password" ? "hidden" : "mb-6"
                    }`}
                >
                  Send OTP
                </button>

                {loginMode === "otp" && (
                  <button
                    onClick={() => setLoginMode("password")}
                    className="w-full cursor-pointer bg-white border border-[#6E2F2F] text-[#6E2F2F] font-medium py-3 rounded-full shadow-md hover:bg-gray-50 transition-colors mb-6"
                  >
                    Login using password
                  </button>
                )}

                {loginMode === "password" && (
                  <>
                    <div className="mb-6">
                      <label className="block  font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleLoginKeyDown}
                          placeholder="Enter your password"
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

                    <button
                      onClick={handlePasswordLogin}
                      className="w-full cursor-pointer  bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4"
                    >
                      Login
                    </button>

                    <button
                      onClick={() => setLoginMode("otp")}
                      className="w-full cursor-pointer bg-white border border-[#6E2F2F] text-[#6E2F2F] font-medium py-3 rounded-full shadow-md hover:bg-gray-50 transition-colors mb-4"
                    >
                      Login using OTP
                    </button>

                    <p className="text-end -mt-1 mb-6">
                      <Link
                        href="/forgot-password"
                        className="text-sm underline font-medium text-[#6E2F2F] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </p>
                  </>
                )}

                <div className="flex items-center justify-between mb-6">
                  <span className="w-2/5 border-b border-gray-300"></span>
                  <span className="text-xs text-gray-400 uppercase">OR</span>
                  <span className="w-2/5 border-b border-gray-300"></span>
                </div>

                <div className="space-y-3 sm:block hidden">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full cursor-pointer  flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <GoogleIcon />
                    <span className="text-sm font-medium">
                      {isGoogleLoading
                        ? "Redirecting to Google..."
                        : "Login with Google"}
                    </span>
                  </button>
                  <button className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors">
                    <FacebookIcon />
                    <span className="text-sm font-medium">
                      Login with Facebook
                    </span>
                  </button>
                </div>

                <p className="text-center text-[#2A1D1D] mt-8">
                  <Link
                    href={
                      redirect
                        ? `/language-selection?redirect=${encodeURIComponent(redirect)}`
                        : "/language-selection"
                    }
                    className="text-blue-500 sm:block hidden hover:underline"
                  >
                    Sign up
                  </Link>
                </p>

                <Link
                  href={
                    redirect
                      ? `/language-selection?redirect=${encodeURIComponent(redirect)}`
                      : "/language-selection"
                  }
                  className={`w-full flex sm:hidden justify-center py-2 cursor-pointer rounded-full text-sm font-medium transition-all duration-300 shadow-md 
                       text-[#6E2F2F] bg-white border border-[#6E2F2F]
                   `}
                >
                  Create New Account
                </Link>

                <p className="text-center  mt-10 text-[#7B6A64] text-xs px-8 leading-relaxed">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>

              <div className="hidden w-full">
                <h2 className="text-3xl font-playfair font-semibold text-[#2D2424] mb-8 text-center">
                  Welcome Back 👋
                </h2>

                <div className="mb-6">
                  <label className="block font-medium text-[#2D2424] text-sm mb-2 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(normalizePhone(e.target.value))
                    }
                    placeholder="+91 XXXXX XXXXX"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full px-6 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E3B450] bg-white text-gray-600"
                  />
                </div>

                <button
                  onClick={() => handleSendOtp("phone")}
                  className="w-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3.5 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8"
                >
                  Send OTP
                </button>

                <div className="flex items-center justify-center mb-8">
                  <span className="w-24 border-b border-gray-300"></span>
                  <span className="text-sm text-gray-400 mx-4">OR</span>
                  <span className="w-24 border-b border-gray-300"></span>
                </div>

                <div className="mb-6">
                  <label className="block font-medium text-[#2D2424] text-sm mb-2 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full px-6 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E3B450] bg-white text-gray-600"
                  />
                </div>

                <button
                  onClick={() => handleSendOtp("email")}
                  className="w-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3.5 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mb-10"
                >
                  Send OTP
                </button>

                <p className="text-center text-[#7B6A64] text-xs px-8 leading-relaxed">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </>
          )}

          {step === "otp" && (
            <div className="flex flex-col items-center w-full">
              <div className="w-full flex justify-start mb-8">
                <button
                  onClick={handleBack}
                  className="p-2 cursor-pointer -ml-2"
                >
                  <BackArrowIcon />
                </button>
                <div
                  className="
  w-full text-center 
  text-stone-800 
  font-semibold font-playfair
   text-3xl lg:text-4xl
  leading-tight
"
                >
                  Verify your {loginMethod === "phone" ? "Phone" : "Email"}
                </div>
              </div>

              <p className="text-[#2D2424] text-lg mb-8 text-center">
                We sent a code to <br />
                <span className="font-semibold">
                  {maskContact(
                    loginMethod === "phone" ? phoneNumber : email,
                    loginMethod,
                  )}
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

              <p className="text-[#555] mb-8">
                <button
                  onClick={() => handleSendOtp(loginMethod)}
                  disabled={timer > 0} // Timer chalte waqt button disabled rahega
                  className={`${timer > 0
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
                Enter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;

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

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="#1877F2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
