"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import RegisterHead from "@/app/component/Register/RegisterHead";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { getLanguageNameFromCode } from "@/lib/languagePreference";
import { maskContact } from "../login/page";

const Page = () => {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [userId, setUserId] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);
  const router = useRouter();

  // Pick up pending registration details from home page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingEmail = localStorage.getItem("rvr_pending_email");
      const otpSent = localStorage.getItem("rvr_otp_sent") === "true";
      if (pendingEmail) {
        setEmail(pendingEmail);
        if (otpSent) {
          setStep("otp");
          setTimer(30);
          localStorage.removeItem("rvr_otp_sent");
        }
      }
    }
  }, []);

  // --- API HANDLERS ---
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

  const handleSendOtp = async () => {
    try {
      const identifier = email.trim();
      if (!isValidEmail(identifier)) {
        toast.error("Please enter a valid email address");
        return;
      }

      await api.post("/auth/send-otp", {
        email: identifier,
      });
      setStep("otp");
      setTimer(30);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const otpValue = otp.join("");
      if (otp.some((digit) => !digit) || otpValue.trim().length !== 6) {
        toast.error("Please enter 6 digit OTP");
        return;
      }
      const selectedLang = localStorage.getItem("preferredLanguage");
      const selectedLanguageName = getLanguageNameFromCode(selectedLang);
      const payload = {
        email: email.trim(),
        otp: otpValue,
        language: selectedLanguageName,
      };

      const res = await api.post("/auth/verify-otp", payload);

      if (res.success) {
        if (res.requirePasswordSetup) {
          setUserId(res.userId);
          setStep("password");
        } else {
          localStorage.setItem(
            "rvr_auth_data",
            JSON.stringify({ token: res.token, user: res.user }),
          );
          router.push("/home");
        }
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    }
  };

  const handleSetPassword = async () => {
    try {
      if (password.length < 8 || password.length > 20) {
        toast.error("Password must be 8–20 characters");
        return;
      }

      const res = await api.post("/auth/set-password-after-otp", {
        userId,
        newPassword: password,
      });

      if (res.success) {
        localStorage.setItem(
          "rvr_auth_data",
          JSON.stringify({ token: res.token, user: res.user }),
        );
        localStorage.removeItem("rvr_pending_email");

        router.push("/profiledetails/step1");
      }
    } catch (err) {
      toast.error(err.message || "Failed to set password");
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
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1].focus();
  };

  const handleLoginKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendOtp();
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
    <div>
      <RegisterHead />
      <div className="min-h-screen flex w-full bg-[linear-gradient(180deg,_#E7B8A5_-55.74%,_#FFFFFF_80.23%)] font-sans">
        {/* LEFT SECTION */}
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
            alt="couple"
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-20 py-10 relative">
          <div className="w-full max-w-md">
            {step === "login" && (
              <>
                <div className="hidden md:block">
                  <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-[#2D2424] mb-2">
                    Welcome to RVR Luxury matrimony 👋
                  </h2>
                  <p className="font-medium text-[#7B6A64] my-3">
                    Today is a new day. Your partner search ends here.
                  </p>
                  <div className="mb-6 text-black">
                    <label className="block font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleLoginKeyDown}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800  rounded-full bg-white"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    className="w-full  cursor-pointer bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg"
                  >
                    Send OTP
                  </button>
                  <p className="text-center text-[#2A1D1D] mt-8">
                    Do you have an account?{" "}
                    <Link
                      href="/login"
                      className="text-blue-500 hover:underline"
                    >
                      Login
                    </Link>
                  </p>
                </div>

                <div className="block md:hidden w-full text-center">
                  <h2 className="text-3xl font-playfair font-semibold text-[#2D2424] mb-8">
                    Create your account
                  </h2>
                  <div className="mb-6 text-left">
                    <label className="block font-medium text-[#2D2424] text-sm mb-2 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleLoginKeyDown}
                      placeholder="youremail@example.com"
                      className="w-full px-6 py-3.5 border border-gray-300 rounded-full bg-white"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    className="w-full cursor-pointer bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3.5 rounded-full mb-10"
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
                    Verify your Email
                  </div>
                </div>

                <p className="text-[#2D2424] text-lg mb-8 text-center">
                  We sent a code to <br />
                  <span className="font-semibold">
                    {maskContact(email, "email")}
                  </span>
                </p>
                <div className="flex justify-between gap-2 mb-8 w-full px-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={data}
                      onChange={(e) => handleChange(e.target, index)}
                      onPaste={(e) => handlePaste(e, index)}
                      onKeyDown={(e) => {
                        handleKeyDown(e, index);
                        handleOtpEnter(e);
                      }}
                      className="w-10 h-10 md:w-12 md:h-12 border border-gray-400 rounded-full text-center text-xl font-medium focus:outline-none focus:border-yellow-500 bg-white shadow-sm text-gray-800"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  className="w-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg  cursor-pointer"
                >
                  Enter
                </button>
              </div>
            )}

            {step === "password" && (
              <div className="flex flex-col items-center w-full">

                {/* Header */}
                <div className="w-full flex justify-start mb-10">
                  <button
                    onClick={() => setStep("otp")}
                    className="p-2 cursor-pointer -ml-2"
                  >
                    <BackArrowIcon />
                  </button>
                  <div className="w-full text-center text-stone-800 font-semibold font-playfair text-3xl lg:text-4xl">
                    Create Password
                  </div>
                </div>

                {/* Input */}
                <div className="relative w-full mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create Password"
                    className="w-full px-6 py-4 pr-14 rounded-full bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />

                  {/* Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7B6A64] hover:text-[#2D2424] transition"
                  >
                    {showPassword ? (
                      <EyeSlash size={22} weight="regular" />
                    ) : (
                      <Eye size={22} weight="regular" />
                    )}
                  </button>
                </div>

                {/* Helper text */}
                <p className="text-[#2D2424] text-center mb-10">
                  Your password must be within 8–20 characters
                </p>

                {/* Button */}
                <button
                  onClick={handleSetPassword}
                  className="w-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-4 rounded-full shadow-lg cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

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

const EyeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a21.77 21.77 0 015.06-7.94" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

















// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Eye, EyeSlash } from "@phosphor-icons/react";
// import RegisterHead from "@/app/component/Register/RegisterHead";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { api } from "@/lib/apiClient";
// import toast from "react-hot-toast";
// import { getLanguageNameFromCode } from "@/lib/languagePreference";
// import { maskContact } from "../login/page";

// const Page = () => {
//   const [step, setStep] = useState("login");
//   const [loginMethod, setLoginMethod] = useState("phone");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState(new Array(6).fill(""));
//   const [userId, setUserId] = useState(null);
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const inputRefs = useRef([]);
//   const router = useRouter();

//   // --- API HANDLERS ---
//   const normalizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);
//   const isValidEmail = (value) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

//   const handleSendOtp = async (method) => {
//     try {
//       if (method) setLoginMethod(method);
//       const identifier = method === "email" ? email : phoneNumber;
//       if (
//         method === "phone" &&
//         (!normalizePhone(identifier) ||
//           normalizePhone(identifier).length !== 10)
//       ) {
//         toast.error("Please enter a valid 10 digit phone number");
//         return;
//       }
//       if (method === "email" && !isValidEmail(identifier)) {
//         toast.error("Please enter a valid email address");
//         return;
//       }

//       // API call to send OTP
//       await api.post("/auth/send-otp", {
//         [method === "email" ? "email" : "phone"]: identifier,
//       });
//       setStep("otp");
//       setTimer(30);
//     } catch (err) {
//       toast.error(err.message || "Failed to send OTP");
//     }
//   };

//   const handleVerifyOtp = async () => {
//     try {
//       const otpValue = otp.join("");
//       if (otp.some((digit) => !digit) || otpValue.trim().length !== 6) {
//         toast.error("Please enter 6 digit OTP");
//         return;
//       }
//       const selectedLang = localStorage.getItem("preferredLanguage");
//       const selectedLanguageName = getLanguageNameFromCode(selectedLang);
//       const payload = {
//         email: loginMethod === "email" ? email : undefined,
//         phone: loginMethod === "phone" ? phoneNumber : undefined,
//         otp: otpValue,
//         language: selectedLanguageName,
//       };

//       const res = await api.post("/auth/verify-otp", payload);

//       if (res.success) {
//         if (res.requirePasswordSetup) {
//           setUserId(res.userId);
//           setStep("password");
//         } else {
//           localStorage.setItem(
//             "rvr_auth_data",
//             JSON.stringify({ token: res.token, user: res.user }),
//           );
//           router.push("/home");
//         }
//       }
//     } catch (err) {
//       toast.error(err.message || "Invalid OTP");
//     }
//   };

//   const handleSetPassword = async () => {
//     try {
//       if (password.length < 8 || password.length > 20) {
//         toast.error("Password must be 8–20 characters");
//         return;
//       }

//       const res = await api.post("/auth/set-password-after-otp", {
//         userId,
//         newPassword: password,
//       });

//       if (res.success) {
//         localStorage.setItem(
//           "rvr_auth_data",
//           JSON.stringify({ token: res.token, user: res.user }),
//         );

//         router.push("/profiledetails/step1");
//       }
//     } catch (err) {
//       toast.error(err.message || "Failed to set password");
//     }
//   };

//   const handleBack = () => {
//     if (step === "otp") {
//       setStep("login");
//       setOtp(new Array(6).fill(""));
//     }
//   };

//   const fillOtpFromString = (value, startIndex = 0) => {
//     const digits = String(value || "").replace(/\D/g, "");
//     if (!digits) return;
//     const nextOtp = [...otp];
//     let cursor = startIndex;
//     for (let i = 0; i < digits.length && cursor < nextOtp.length; i += 1) {
//       nextOtp[cursor] = digits[i];
//       cursor += 1;
//     }
//     setOtp(nextOtp);
//     const focusIndex = Math.min(cursor, nextOtp.length - 1);
//     inputRefs.current[focusIndex]?.focus();
//   };

//   const handleChange = (element, index) => {
//     const raw = element.value;
//     if (!raw) {
//       const newOtp = [...otp];
//       newOtp[index] = "";
//       setOtp(newOtp);
//       return;
//     }
//     if (raw.length > 1) {
//       fillOtpFromString(raw, index);
//       return;
//     }
//     if (isNaN(raw)) return;
//     const newOtp = [...otp];
//     newOtp[index] = raw;
//     setOtp(newOtp);
//     if (raw && index < 5) inputRefs.current[index + 1]?.focus();
//   };

//   const handlePaste = (e, index) => {
//     e.preventDefault();
//     const text = e.clipboardData?.getData("text") || "";
//     fillOtpFromString(text, index);
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0)
//       inputRefs.current[index - 1].focus();
//   };

//   const handleLoginKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSendOtp(loginMethod);
//     }
//   };

//   const handleOtpEnter = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleVerifyOtp();
//     }
//   };

//   useEffect(() => {
//     let interval;
//     if (step === "otp" && timer > 0) {
//       interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(interval);
//   }, [step, timer]);

//   return (
//     <div>
//       <RegisterHead />
//       <div className="min-h-screen flex w-full bg-[linear-gradient(180deg,_#E7B8A5_-55.74%,_#FFFFFF_80.23%)] font-sans">
//         {/* LEFT SECTION */}
//         <div className="hidden lg:block w-1/2 relative">
//           <Image
//             src={"/Login/couple.png"}
//             width={550}
//             height={565}
//             alt="couple"
//             className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-[60%] z-50"
//           />
//           <Image
//             src={"/Login/illustration1.svg"}
//             width={450}
//             height={350}
//             alt="couple"
//             className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
//           />
//         </div>

//         {/* RIGHT SECTION */}
//         <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-20 py-10 relative">
//           <div className="w-full max-w-md">
//             {step === "login" && (
//               <>
//                 <div className="hidden md:block">
//                   <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-[#2D2424] mb-2">
//                     Welcome to RVR Luxury matrimony 👋
//                   </h2>
//                   <p className="font-medium text-[#7B6A64] my-3">
//                     Today is a new day. Your partner search ends here.
//                   </p>
//                   <div className="flex gap-2.5 my-6">
//                     <button
//                       onClick={() => setLoginMethod("phone")}
//                       className={`flex-1 cursor-pointer py-2 rounded-full text-sm font-medium ${loginMethod === "phone" ? "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]" : "bg-white border border-[#6E2F2F] "} text-[#6E2F2F]`}
//                     >
//                       Phone
//                     </button>
//                     <button
//                       onClick={() => setLoginMethod("email")}
//                       className={`flex-1 cursor-pointer py-2 rounded-full text-sm font-medium ${loginMethod === "email" ? "bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]" : "bg-white border border-[#6E2F2F] text-[#6E2F2F]"}`}
//                     >
//                       Email
//                     </button>
//                   </div>
//                   <div className="mb-6 text-black">
//                     <label className="block font-medium text-gray-700 mb-2">
//                       {loginMethod === "phone" ? "Phone" : "Email Address"}
//                     </label>
//                     <input
//                       type={loginMethod === "phone" ? "tel" : "email"}
//                       value={loginMethod === "phone" ? phoneNumber : email}
//                       onChange={(e) =>
//                         loginMethod === "phone"
//                           ? setPhoneNumber(normalizePhone(e.target.value))
//                           : setEmail(e.target.value)
//                       }
//                       onKeyDown={handleLoginKeyDown}
//                       placeholder={
//                         loginMethod === "phone"
//                           ? "+91 XXXXX XXXXX"
//                           : "name@example.com"
//                       }
//                       inputMode={
//                         loginMethod === "phone" ? "numeric" : undefined
//                       }
//                       maxLength={loginMethod === "phone" ? 10 : undefined}
//                       className="w-full px-4 py-3 border border-gray-300 text-gray-800  rounded-full bg-white"
//                     />
//                   </div>
//                   <button
//                     onClick={() => handleSendOtp(loginMethod)}
//                     className="w-full  cursor-pointer bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg"
//                   >
//                     Send OTP
//                   </button>
//                   <p className="text-center text-[#2A1D1D] mt-8">
//                     Do you have an account?{" "}
//                     <Link
//                       href="/login"
//                       className="text-blue-500 hover:underline"
//                     >
//                       Login
//                     </Link>
//                   </p>
//                 </div>

//                 {/* Mobile View logic handles similarly using the method buttons */}
//                 <div className="block md:hidden w-full text-center">
//                   <h2 className="text-3xl font-playfair font-semibold text-[#2D2424] mb-8">
//                     Create your account
//                   </h2>
//                   <div className="mb-6 text-left">
//                     <label className="block font-medium text-[#2D2424] text-sm mb-2 ml-1">
//                       Phone Number
//                     </label>
//                     <input
//                       type="tel"
//                       value={phoneNumber}
//                       onChange={(e) =>
//                         setPhoneNumber(normalizePhone(e.target.value))
//                       }
//                       onKeyDown={handleLoginKeyDown}
//                       placeholder="+91 XXXXX XXXXX"
//                       inputMode="numeric"
//                       maxLength={10}
//                       className="w-full px-6 py-3.5 border border-gray-300 rounded-full bg-white"
//                     />
//                   </div>
//                   <button
//                     onClick={() => handleSendOtp("phone")}
//                     className="w-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)]  cursor-pointer text-[#2A1D1D] font-medium py-3.5 rounded-full mb-8"
//                   >
//                     Send OTP
//                   </button>
//                   <div className="mb-6 text-left">
//                     <label className="block font-medium text-[#2D2424] text-sm mb-2 ml-1">
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       onKeyDown={handleLoginKeyDown}
//                       placeholder="youremail@example.com"
//                       className="w-full px-6 py-3.5 border border-gray-300 rounded-full bg-white"
//                     />
//                   </div>
//                   <button
//                     onClick={() => handleSendOtp("email")}
//                     className="w-full cursor-pointer bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3.5 rounded-full mb-10"
//                   >
//                     Send OTP
//                   </button>

//                   <p className="text-center text-[#7B6A64] text-xs px-8 leading-relaxed">
//                     By continuing, you agree to our Terms of Service and Privacy
//                     Policy
//                   </p>
//                 </div>
//               </>
//             )}

//             {step === "otp" && (
//               <div className="flex flex-col items-center w-full">
//                 <div className="w-full flex justify-start mb-8">
//                   <button
//                     onClick={handleBack}
//                     className="p-2 cursor-pointer -ml-2"
//                   >
//                     <BackArrowIcon />
//                   </button>
//                   <div
//                     className="
//   w-full text-center 
//   text-stone-800 
//   font-semibold font-playfair
//    text-3xl lg:text-4xl
//   leading-tight
// "
//                   >
//                     Verify your {loginMethod === "phone" ? "Phone" : "Email"}
//                   </div>
//                 </div>

//                 <p className="text-[#2D2424] text-lg mb-8 text-center">
//                   We sent a code to <br />
//                   <span className="font-semibold">
//                     {maskContact(
//                       loginMethod === "phone" ? phoneNumber : email,
//                       loginMethod,
//                     )}
//                   </span>
//                 </p>
//                 <div className="flex justify-between gap-2 mb-8 w-full px-2">
//                   {otp.map((data, index) => (
//                     <input
//                       key={index}
//                       type="tel"
//                       inputMode="numeric"
//                       pattern="[0-9]*"
//                       maxLength={1}
//                       ref={(el) => (inputRefs.current[index] = el)}
//                       value={data}
//                       onChange={(e) => handleChange(e.target, index)}
//                       onPaste={(e) => handlePaste(e, index)}
//                       onKeyDown={(e) => {
//                         handleKeyDown(e, index);
//                         handleOtpEnter(e);
//                       }}
//                       className="w-10 h-10 md:w-12 md:h-12 border border-gray-400 rounded-full text-center text-xl font-medium focus:outline-none focus:border-yellow-500 bg-white shadow-sm text-gray-800"
//                     />
//                   ))}
//                 </div>
//                 <button
//                   onClick={handleVerifyOtp}
//                   className="w-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-3 rounded-full shadow-lg  cursor-pointer"
//                 >
//                   Enter
//                 </button>
//               </div>
//             )}

//             {step === "password" && (
//               <div className="flex flex-col items-center w-full">

//                 {/* Header */}
//                 <div className="w-full flex justify-start mb-10">
//                   <button
//                     onClick={() => setStep("otp")}
//                     className="p-2 cursor-pointer -ml-2"
//                   >
//                     <BackArrowIcon />
//                   </button>
//                   <div className="w-full text-center text-stone-800 font-semibold font-playfair text-3xl lg:text-4xl">
//                     Create Password
//                   </div>
//                 </div>

//                 {/* Input */}
//                 <div className="relative w-full mb-4">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Create Password"
//                     className="w-full px-6 py-4 pr-14 rounded-full bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//                   />

//                   {/* Eye Toggle */}
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7B6A64] hover:text-[#2D2424] transition"
//                   >
//                     {showPassword ? (
//                       <EyeSlash size={22} weight="regular" />
//                     ) : (
//                       <Eye size={22} weight="regular" />
//                     )}
//                   </button>
//                 </div>

//                 {/* Helper text */}
//                 <p className="text-[#2D2424] text-center mb-10">
//                   Your password must be within 8–20 characters
//                 </p>

//                 {/* Button */}
//                 <button
//                   onClick={handleSetPassword}
//                   className="w-full bg-[linear-gradient(99.44deg,_#E3B450_2.09%,_#F6DC7F_40.67%,_#CAA043_92.25%)] text-[#2A1D1D] font-medium py-4 rounded-full shadow-lg cursor-pointer"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;

// const BackArrowIcon = () => (
//   <svg
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     className="text-gray-800"
//   >
//     <path d="M15 18l-6-6 6-6" />
//   </svg>
// );

// const EyeIcon = () => (
//   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
//     <circle cx="12" cy="12" r="3" />
//   </svg>
// );

// const EyeOffIcon = () => (
//   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a21.77 21.77 0 015.06-7.94" />
//     <line x1="1" y1="1" x2="23" y2="23" />
//   </svg>
// );
