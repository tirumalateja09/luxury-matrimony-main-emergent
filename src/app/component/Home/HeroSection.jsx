// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { api } from "@/lib/apiClient";
// import toast from "react-hot-toast";
// import MainCarousel from "./MainCarousel";
// import { FaArrowRight, FaChevronDown } from "react-icons/fa6";
// import Image from "next/image";

// const couplesData = [
//   { name: "Harshita & Ranjit", tag: "#Singing", img: "/home/slide2.jpg", tagBg: "bg-blue-500/80" },
//   { name: "Nagendra & Siri", tag: "#Acting", img: "/home/slide1.jpg", tagBg: "bg-teal-500/80" },
//   { name: "Ganesh & Deepa", tag: "#Traveling", img: "/home/slide3.jpg", tagBg: "bg-emerald-500/80" },
//   { name: "Suresh & Sandhya", tag: "#Cooking", img: "/home/story1.jpg", tagBg: "bg-orange-500/80" },
//   { name: "Kiran & Keerthi", tag: "#Reading", img: "/home/testimonialImg1.png", tagBg: "bg-purple-500/80" },
//   { name: "Venkat & Sireesha", tag: "#Dancing", img: "/home/testimonialImg2.png", tagBg: "bg-pink-500/80" },
//   { name: "Vijay & Lakshmi", tag: "#Fitness", img: "/home/couple.jpg", tagBg: "bg-red-500/80" },
//   { name: "Anand & Pavani", tag: "#Music", img: "/home/slide4.jpg", tagBg: "bg-indigo-500/80" },
//   { name: "Prasanna & Rahul", tag: "#Movies", img: "/home/slide2.jpg", tagBg: "bg-amber-600/80" },
//   { name: "Divya & Sai", tag: "#Photography", img: "/home/slide1.jpg", tagBg: "bg-cyan-500/80" },
//   { name: "Meena & Ram", tag: "#Foodie", img: "/home/slide3.jpg", tagBg: "bg-lime-600/80" },
//   { name: "Sita & Rama", tag: "#Traditional", img: "/home/couple.png", tagBg: "bg-rose-500/80" }
// ];

// const HeroSection = () => {
//   const [profileFor, setProfileFor] = useState("");
//   const [gender, setGender] = useState("");
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const isValidEmail = (value) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

//   const handleProfileForChange = (val) => {
//     setProfileFor(val);
//     if (val === "Son" || val === "Brother") {
//       setGender("Male");
//     } else if (val === "Daughter" || val === "Sister") {
//       setGender("Female");
//     } else {
//       setGender("");
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!profileFor) {
//       toast.error("Please select who the profile is for");
//       return;
//     }

//     if (!gender) {
//       toast.error("Please select a gender");
//       return;
//     }

//     const trimmedName = name.trim();
//     if (!trimmedName) {
//       toast.error("Please enter the name");
//       return;
//     }

//     const trimmedPhone = phone.trim();
//     if (!trimmedPhone || trimmedPhone.length !== 10) {
//       toast.error("Please enter a valid 10-digit mobile number");
//       return;
//     }

//     const trimmedEmail = email.trim();
//     if (!trimmedEmail) {
//       toast.error("Please enter an email address");
//       return;
//     }

//     if (!isValidEmail(trimmedEmail)) {
//       toast.error("Please enter a valid email address");
//       return;
//     }

//     try {
//       setLoading(true);
//       await api.post("/auth/send-otp", { email: trimmedEmail });

//       // Store pending registration data for smooth onboarding
//       localStorage.setItem("rvr_pending_email", trimmedEmail);
//       localStorage.setItem("rvr_otp_sent", "true");

//       const initialRegisterData = {
//         user_details: {
//           1: {
//             profileCreatedFor: profileFor,
//             fullName: trimmedName,
//             gender: gender,
//             phone: trimmedPhone
//           }
//         }
//       };
//       sessionStorage.setItem("registerData", JSON.stringify(initialRegisterData));

//       toast.success("OTP sent to your email!");
//       router.push("/register");
//     } catch (err) {
//       toast.error(err.message || "Failed to send OTP. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Shared form JSX elements to ensure consistency
//   const renderFormFields = (isMobile = false) => {
//     const inputSuffix = isMobile ? "-mobile" : "-desktop";
//     return (
//       <>
//         {/* Profile Created For Select */}
//         <div className="relative">
//           <select
//             value={profileFor}
//             onChange={(e) => handleProfileForChange(e.target.value)}
//             className="w-full px-5 py-3.5 border border-gray-300 rounded-full bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E3B450] focus:ring-2 focus:ring-[#E3B450]/20 transition-all appearance-none cursor-pointer pr-10 font-inter"
//             id={`profile-for-select${inputSuffix}`}
//           >
//             <option value="" disabled>Profile Created For</option>
//             <option value="Myself">Myself</option>
//             <option value="Daughter">Daughter</option>
//             <option value="Son">Son</option>
//             <option value="Sister">Sister</option>
//             <option value="Brother">Brother</option>
//             <option value="Relative">Relative</option>
//             <option value="Friend">Friend</option>
//           </select>
//           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
//             <FaChevronDown className="text-xs" />
//           </div>
//         </div>

//         {/* Gender Selection (Pill Buttons) */}
//         {(profileFor === "Myself" || profileFor === "Relative" || profileFor === "Friend") && (
//           <div className="flex gap-2 p-1 bg-gray-100 rounded-full border border-gray-200">
//             <button
//               type="button"
//               onClick={() => setGender("Male")}
//               className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${gender === "Male"
//                 ? "bg-[#6E2F2F] text-white shadow-sm"
//                 : "text-gray-600 hover:text-gray-800"
//                 }`}
//             >
//               Male
//             </button>
//             <button
//               type="button"
//               onClick={() => setGender("Female")}
//               className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${gender === "Female"
//                 ? "bg-[#6E2F2F] text-white shadow-sm"
//                 : "text-gray-600 hover:text-gray-800"
//                 }`}
//             >
//               Female
//             </button>
//           </div>
//         )}

//         {/* Name Input */}
//         <div>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Full Name"
//             className="w-full px-5 py-3.5 border border-gray-300 rounded-full bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E3B450] focus:ring-2 focus:ring-[#E3B450]/20 transition-all placeholder:text-gray-400 font-inter"
//             id={`name-input${inputSuffix}`}
//           />
//         </div>

//         {/* Phone Input with +91 prefix */}
//         <div className="relative flex items-center">
//           <span className="absolute left-5 text-sm text-gray-500 font-medium font-inter">+91</span>
//           <input
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
//             placeholder="Mobile Number"
//             className="w-full pl-14 pr-5 py-3.5 border border-gray-300 rounded-full bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E3B450] focus:ring-2 focus:ring-[#E3B450]/20 transition-all placeholder:text-gray-400 font-inter"
//             id={`phone-input${inputSuffix}`}
//           />
//         </div>

//         {/* Email Input */}
//         <div>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Email Address"
//             className="w-full px-5 py-3.5 border border-gray-300 rounded-full bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E3B450] focus:ring-2 focus:ring-[#E3B450]/20 transition-all placeholder:text-gray-400 font-inter"
//             id={`email-input${inputSuffix}`}
//           />
//         </div>
//       </>
//     );
//   };

//   return (
//     <section className="relative w-full min-h-[640px] bg-[#FEFCF5] overflow-hidden py-12 md:py-20 flex items-center justify-center">

//       {/* ── Collage Background Grid (Matching telugumatrimony.com Campaign Layout) ── */}
//       <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 p-5 opacity-[0.25] sm:opacity-[0.35] md:opacity-[0.45] lg:opacity-[0.55] pointer-events-none select-none overflow-hidden z-0">
//         {couplesData.map((couple, i) => (
//           <div
//             key={i}
//             className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-100 border border-stone-200/50 shadow-sm transition-transform duration-500 hover:scale-[1.03]"
//           >
//             <Image
//               src={couple.img}
//               alt={couple.name}
//               fill
//               className="object-cover"
//               sizes="(max-width: 768px) 150px, 200px"
//               priority={i < 6}
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
//             <div className="absolute bottom-3 left-3 right-3 text-left">
//               <p className="text-white text-xs font-bold font-playfair mb-1">{couple.name}</p>
//               <span className={`inline-block px-2 py-0.5 ${couple.tagBg} backdrop-blur-[2px] rounded-full text-[9px] text-white font-semibold font-inter`}>
//                 {couple.tag}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ── Soft Gradient Mask Overlay to merge edges and ensure high legibility ── */}
//       <div className="absolute inset-0 bg-gradient-to-b from-[#FEFCF5] via-[#FEFCF5]/50 to-[#FEFCF5] pointer-events-none z-0" />

//       {/* ── Foreground Main Layout ── */}
//       <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 lg:px-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

//         {/* Left Side: Brand Text & Compact Carousel */}
//         <div className="lg:col-span-7 space-y-8 text-left">
//           <div className="space-y-4">
//             <span className="inline-block px-4 py-1.5 rounded-full bg-[#6E2F2F]/10 text-[#6E2F2F] text-xs font-bold tracking-wider uppercase font-inter">
//               Sacred Telugu Traditions
//             </span>
//             <h1 className="font-playfair text-[#2A1D1D] text-3xl md:text-5xl font-extrabold leading-tight">
//               The Biggest & Most Trusted Matrimony for{" "}
//               <span className="bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] bg-clip-text text-transparent">
//                 Telugu Families
//               </span>
//             </h1>
//             <p className="text-[#7B6A64] text-sm md:text-base font-medium leading-relaxed max-w-xl font-inter">
//               Welcome to RVR Matrimony, the premium matchmaking platform for Telugu brides and grooms. Find meaningful connections rooted in compatibility, stars, and family trust.
//             </p>
//           </div>

//           {/* Compact visual slider representing latest couple stories */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.4 }}
//             className="w-full max-w-[440px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative group bg-stone-100"
//           >
//             <MainCarousel compact={true} />
//             <div className="absolute top-4 left-4 z-20 bg-[#6E2F2F] text-white text-[9px] font-bold font-inter px-3 py-1 rounded-full shadow-md tracking-wider">
//               LATEST SUCCESS STORIES
//             </div>
//           </motion.div>
//         </div>

//         {/* Right Side: Registration Card */}
//         <div className="lg:col-span-5 flex justify-center lg:justify-end">
//           <motion.div
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
//             className="w-full max-w-[400px] rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20"
//             style={{
//               background: "rgba(255, 255, 255, 0.95)",
//               backdropFilter: "blur(20px)",
//               WebkitBackdropFilter: "blur(20px)",
//             }}
//           >
//             {/* Card Header */}
//             <div className="text-center mb-6">
//               <h3 className="font-playfair text-[#6E2F2F] text-xl font-bold mb-1">
//                 Begin Your Sacred Search
//               </h3>
//               <p className="text-[#7B6A64] text-xs font-inter font-medium">
//                 Find your perfect Telugu life partner
//               </p>
//             </div>

//             {/* Registration Form */}
//             <form onSubmit={handleRegister} className="space-y-4">
//               {renderFormFields(false)}

//               <motion.button
//                 type="submit"
//                 disabled={loading}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full font-semibold text-[15px] text-[#6E2F2F] bg-[linear-gradient(99.44deg,#E3B450_2.09%,#F6DC7F_40.67%,#CAA043_92.25%)] shadow-[0px_4px_15px_rgba(202,160,67,0.4)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-shadow hover:shadow-[0px_6px_20px_rgba(202,160,67,0.5)]"
//                 id="hero-register-btn"
//               >
//                 {loading ? "Sending OTP..." : "REGISTER FREE"}
//                 {!loading && <FaArrowRight className="text-sm" />}
//               </motion.button>
//             </form>

//             {/* Disclaimer */}
//             <p className="text-[10px] text-[#7B6A64] text-center mt-4 leading-relaxed font-medium">
//               *By clicking register free, I agree to the{" "}
//               <span className="underline cursor-pointer hover:text-[#6E2F2F]" onClick={() => router.push("/terms-and-conditions")}>
//                 T&C
//               </span>{" "}
//               and{" "}
//               <span className="underline cursor-pointer hover:text-[#6E2F2F]" onClick={() => router.push("/privacy-policy")}>
//                 Privacy Policy
//               </span>
//             </p>
//           </motion.div>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default HeroSection;

// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { api } from "@/lib/apiClient";
// import toast from "react-hot-toast";
// import { FaArrowRight, FaChevronDown } from "react-icons/fa6";
// import Image from "next/image";

// const couplesData = [
//   "/home/slide2.jpg", "/home/slide1.jpg", "/home/slide3.jpg",
//   "/home/story1.jpg", "/home/testimonialImg1.png", "/home/testimonialImg2.png",
//   "/home/couple.jpg", "/home/slide4.jpg", "/home/slide2.jpg", "/home/slide1.jpg"
// ];

// const HeroSection = () => {
//   const [profileFor, setProfileFor] = useState("");
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!profileFor || !name || !phone || !email) {
//       toast.error("Please fill in all fields");
//       return;
//     }
//     setLoading(true);
//     try {
//       await api.post("/auth/send-otp", { email });
//       toast.success("OTP sent to your email!");
//       router.push("/register");
//     } catch (err) {
//       toast.error("Failed to send OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="relative w-full min-h-screen bg-[#FDFBF7] flex flex-col justify-center overflow-hidden py-10">

//       {/* --- TWO-ROW HORIZONTAL SCROLLING GRID --- */}
//       <div className="absolute inset-0 z-0 flex flex-col justify-center gap-6 opacity-100">
//         {[0, 1].map((rowIndex) => (
//           <motion.div
//             key={rowIndex}
//             animate={{ x: rowIndex === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
//             transition={{ ease: "linear", duration: 60, repeat: Infinity }}
//             className="flex gap-6 w-max items-center px-6"
//           >
//             {[...couplesData, ...couplesData].map((img, i) => (
//               <div key={i} className="relative w-[240px] h-[300px] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
//                 <Image src={img} alt="Couple" fill className="object-cover" />
//               </div>
//             ))}
//           </motion.div>
//         ))}
//       </div>

//       <div className="absolute inset-0 bg-[#FDFBF7]/70 z-[1]" />

//       {/* --- CONTENT --- */}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">

//         <div className="space-y-4">
//           <h1 className="font-playfair text-[#1A1111] text-4xl md:text-5xl font-black leading-tight">
//             The biggest and most trusted matrimony for <br />
//             <span className="text-[#6E2F2F]">Telugu Families</span>
//           </h1>
//           <p className="text-[#555] text-base font-inter max-w-md">
//             Find your perfect match based on your stars, values, and shared interests.
//           </p>
//         </div>

//         {/* --- LUXURY MAROON & GOLD FORM --- */}
//         <div className="w-full max-w-[400px] lg:ml-auto">
//           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
//             <div className="bg-[#6E2F2F] py-6 px-6 text-center">
//               <h2 className="text-white font-playfair text-2xl font-bold">Begin Your Journey</h2>
//             </div>

//             <form onSubmit={handleRegister} className="p-6 space-y-4">
//               <select onChange={(e) => setProfileFor(e.target.value)} className="w-full px-4 py-3 bg-[#F9F9F9] border-b-2 border-gray-200 text-sm outline-none focus:border-[#D4AF37]">
//                 <option>Profile created for</option>
//                 <option>Myself</option><option>Daughter</option><option>Son</option>
//               </select>

//               <input type="text" onChange={(e) => setName(e.target.value)} placeholder="Enter the name" className="w-full px-4 py-3 bg-[#F9F9F9] border-b-2 border-gray-200 text-sm outline-none focus:border-[#D4AF37]" />

//               <div className="flex gap-2">
//                 <select className="w-[70px] px-2 bg-[#F9F9F9] border-b-2 border-gray-200 text-sm outline-none"><option>+91</option></select>
//                 <input type="tel" onChange={(e) => setPhone(e.target.value)} placeholder="Enter Number" className="flex-1 px-4 py-3 bg-[#F9F9F9] border-b-2 border-gray-200 text-sm outline-none focus:border-[#D4AF37]" />
//               </div>

//               <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" className="w-full px-4 py-3 bg-[#F9F9F9] border-b-2 border-gray-200 text-sm outline-none focus:border-[#D4AF37]" />

//               <button type="submit" className="w-full py-4 bg-[#D4AF37] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#b8962d] transition-all shadow-md">
//                 {loading ? "Processing..." : <>REGISTER FREE <FaArrowRight /></>}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;









// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { api } from "@/lib/apiClient";
// import toast from "react-hot-toast";
// import { FaArrowRight, FaChevronDown } from "react-icons/fa6";
// import Image from "next/image";

// const couplesData = [
//   { img: "/home/slide2.jpg", name: "Harshita & Ranjit" },
//   { img: "/home/slide1.jpg", name: "Nagendra & Siri" },
//   { img: "/home/slide3.jpg", name: "Ganesh & Deepa" },
//   { img: "/home/story1.jpg", name: "Suresh & Sandhya" },
//   { img: "/home/testimonialImg1.png", name: "Kiran & Keerthi" },
//   { img: "/home/testimonialImg2.png", name: "Venkat & Sireesha" },
//   { img: "/home/couple.jpg", name: "Vijay & Lakshmi" },
//   { img: "/home/slide4.jpg", name: "Anand & Pavani" },
// ];

// /* ── Custom Select Component ── */
// const CustomSelect = ({ value, onChange, options, placeholder, className, style, focusStyle }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isFocused, setIsFocused] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setIsOpen(false);
//         setIsFocused(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const currentStyle = isFocused || isOpen ? { ...style, ...focusStyle } : style;

//   return (
//     <div className="relative w-full" ref={dropdownRef}>
//       <div
//         onClick={() => {
//           setIsOpen(!isOpen);
//           setIsFocused(true);
//         }}
//         className={`${className} flex items-center justify-between cursor-pointer select-none`}
//         style={currentStyle}
//       >
//         <span className={value ? "text-[#1C3A1C]" : "text-[#8A9E8A]"}>
//           {value || placeholder}
//         </span>
//         <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
//           <FaChevronDown className="text-[#5E8A5E] text-[10px]" />
//         </motion.div>
//       </div>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.2 }}
//             className="absolute z-50 w-full mt-2 bg-white border border-[#C8DFC8] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden max-h-[220px] overflow-y-auto"
//           >
//             {options.map((opt) => (
//               <div
//                 key={opt}
//                 onClick={() => {
//                   onChange(opt);
//                   setIsOpen(false);
//                   setIsFocused(false);
//                 }}
//                 className="px-4 py-3 text-[13px] font-medium font-inter text-[#1C3A1C] hover:bg-[#F0F7F0] hover:text-[#0A3B2A] cursor-pointer transition-colors"
//               >
//                 {opt}
//               </div>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// /* ── Couple Card Component ── */
// const CoupleCard = ({ item, rowKey }) => {
//   const [hovered, setHovered] = useState(false);
//   return (
//     <div
//       key={rowKey}
//       className="relative w-[160px] h-[220px] md:w-[220px] md:h-[280px] rounded-2xl overflow-hidden border-2 border-white cursor-pointer flex-shrink-0 group"
//       style={{
//         transition: "transform 0.4s ease, box-shadow 0.4s ease",
//         boxShadow: hovered
//           ? "0 12px 40px rgba(0,0,0,0.35)"
//           : "0 2px 8px rgba(0,0,0,0.10)",
//         transform: hovered ? "scale(1.06)" : "scale(1)",
//         zIndex: hovered ? 10 : 1,
//       }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       <Image
//         src={item.img}
//         alt={item.name}
//         fill
//         className="object-cover transition-transform duration-500 ease-out"
//         sizes="(max-width: 768px) 160px, 250px"
//         style={{
//           transform: hovered ? "scale(1.04)" : "scale(1)",
//         }}
//       />

//       {/* White Opaque overlay by default */}
//       <div
//         className="absolute inset-0 bg-white/70 transition-opacity duration-400 ease-in-out"
//         style={{ opacity: hovered ? 0 : 1 }}
//       />

//       {/* Dark gradient for text readability (only shows on hover when image is bright) */}
//       <div
//         className="absolute inset-0 transition-opacity duration-400 ease-in-out"
//         style={{
//           background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
//           opacity: hovered ? 1 : 0,
//         }}
//       />

//       {/* Couple name */}
//       <span
//         className="absolute bottom-3 left-3 text-xs md:text-sm font-bold font-inter drop-shadow-md transition-colors duration-400"
//         style={{
//           color: hovered ? "#fff" : "#0A3B2A",
//           textShadow: hovered ? "0 2px 4px rgba(0,0,0,0.5)" : "none",
//         }}
//       >
//         {item.name}
//       </span>
//     </div>
//   );
// };

// /* ── Hero Section ── */
// const HeroSection = () => {
//   const [profileFor, setProfileFor] = useState("");
//   const [gender, setGender] = useState("");
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [countryCode, setCountryCode] = useState("+91");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const profileOptions = ["Myself", "Daughter", "Son", "Sister", "Brother", "Relative", "Friend"];
//   const countryCodeOptions = ["+91",];

//   const isValidEmail = (value) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

//   const handleProfileForChange = (val) => {
//     setProfileFor(val);
//     if (val === "Son" || val === "Brother") setGender("Male");
//     else if (val === "Daughter" || val === "Sister") setGender("Female");
//     else setGender("");
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!profileFor) return toast.error("Please select who the profile is for");
//     if (!gender) return toast.error("Please select a gender");
//     const trimmedName = name.trim();
//     if (!trimmedName) return toast.error("Please enter the name");
//     const trimmedPhone = phone.trim();
//     if (!trimmedPhone || trimmedPhone.length !== 10)
//       return toast.error("Please enter a valid 10-digit mobile number");
//     const trimmedEmail = email.trim();
//     if (!trimmedEmail) return toast.error("Please enter an email address");
//     if (!isValidEmail(trimmedEmail))
//       return toast.error("Please enter a valid email address");

//     try {
//       setLoading(true);
//       await api.post("/auth/send-otp", { email: trimmedEmail });
//       localStorage.setItem("rvr_pending_email", trimmedEmail);
//       localStorage.setItem("rvr_otp_sent", "true");
//       const initialRegisterData = {
//         user_details: {
//           1: {
//             profileCreatedFor: profileFor,
//             fullName: trimmedName,
//             gender,
//             phone: `${countryCode} ${trimmedPhone}`,
//           },
//         },
//       };
//       sessionStorage.setItem("registerData", JSON.stringify(initialRegisterData));
//       toast.success("OTP sent to your email!");
//       router.push("/register");
//     } catch (err) {
//       toast.error(err.message || "Failed to send OTP. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const firstRow = [...couplesData, ...couplesData];
//   const secondRow = [...couplesData].reverse();
//   const secondRowDoubled = [...secondRow, ...secondRow];

//   /* ─── Shared Input Styles ─── */
//   const inputCls =
//     "w-full px-4 py-3 rounded-xl text-[13px] font-medium font-inter placeholder:text-[#8A9E8A] text-[#1C3A1C] outline-none transition-all duration-200";
//   const inputStyle = {
//     background: "#F0F7F0",
//     border: "1.5px solid #C8DFC8",
//   };
//   const inputFocusStyle = {
//     border: "1.5px solid #C5A02A",
//     boxShadow: "0 0 0 3px rgba(197,160,42,0.13)",
//     background: "#fff",
//   };

//   const inputFocusHandlers = {
//     onFocus: (e) => {
//       Object.assign(e.target.style, inputFocusStyle);
//     },
//     onBlur: (e) => {
//       e.target.style.border = inputStyle.border;
//       e.target.style.boxShadow = "none";
//       e.target.style.background = inputStyle.background;
//     },
//   };

//   return (
//     <section className="relative w-full min-h-[90vh] bg-[#FAFAF8] overflow-hidden flex flex-col lg:flex-row items-stretch justify-center py-10 md:py-16">

//       {/* ── COLLAGE ROWS (Background) ── */}
//       <div className="absolute inset-0 z-0 flex flex-col justify-center gap-5 py-4 pointer-events-none select-none" style={{ pointerEvents: "auto" }}>
//         {/* Row 1 — left to right */}
//         <div className="overflow-hidden flex w-full">
//           <motion.div
//             animate={{ x: ["0%", "-50%"] }}
//             transition={{ ease: "linear", duration: 40, repeat: Infinity }}
//             className="flex gap-4 w-max"
//           >
//             {firstRow.map((item, i) => (
//               <CoupleCard key={`r1-${i}`} item={item} rowKey={`r1-${i}`} />
//             ))}
//           </motion.div>
//         </div>

//         {/* Row 2 — right to left */}
//         <div className="overflow-hidden flex w-full">
//           <motion.div
//             animate={{ x: ["-50%", "0%"] }}
//             transition={{ ease: "linear", duration: 45, repeat: Infinity }}
//             className="flex gap-4 w-max"
//           >
//             {secondRowDoubled.map((item, i) => (
//               <CoupleCard key={`r2-${i}`} item={item} rowKey={`r2-${i}`} />
//             ))}
//           </motion.div>
//         </div>
//       </div>

//       {/* Subtle background wash for text readability */}
//       <div className="absolute inset-0 bg-white/20 lg:bg-gradient-to-r lg:from-white/40 lg:to-transparent z-[1] pointer-events-none lg:w-[60%]" />

//       {/* ── CONTENT ── Note the added 'pointer-events-none' so it doesn't block background hovers */}
//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col lg:flex-row items-center justify-between gap-12 min-h-full mt-8 lg:mt-0 pointer-events-none">

//         {/* Left — Headline */}
//         <div className="w-full lg:w-1/2 space-y-4 text-center lg:text-left mt-10 lg:mt-0 pointer-events-none">
//           <h1
//             className="font-playfair text-[#111111] text-4xl md:text-[3rem] font-black leading-[1.2] md:leading-[1.1] tracking-tight pointer-events-auto"
//             style={{ textShadow: "0 2px 15px rgba(255,255,255,0.9)" }}
//           >
//             The biggest and most trusted matrimony for{" "}
//             <br className="hidden md:block" />
//             <span className="text-[#7A202A] relative inline-block mt-2">
//               Telugu Families
//               <svg className="absolute -bottom-2 left-0 w-full opacity-80" height="6" viewBox="0 0 200 6" fill="none">
//                 <path d="M0 3 Q50 0, 100 3 T200 3" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
//               </svg>
//             </span>
//           </h1>
//           <p
//             className="text-[#111111] text-base md:text-lg font-medium font-inter max-w-md mx-auto lg:mx-0 pt-2 pointer-events-auto"
//             style={{ textShadow: "0 1px 8px rgba(255,255,255,1)" }}
//           >
//             Find your perfect match based on your stars, values, and shared interests.
//           </p>
//         </div>

//         {/* Right — Registration Form */}
//         {/* Re-enabled pointer events just for the form container */}
//         <div className="w-full sm:max-w-md lg:w-[420px] flex justify-center lg:justify-end pb-10 lg:pb-0 pointer-events-auto">
//           <div
//             className="w-full rounded-2xl overflow-hidden relative z-20"
//             style={{
//               background: "#fff",
//               boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
//               border: "1px solid #D6EAD6",
//             }}
//           >
//             {/* ── Form Header ── */}
//             <div className="relative py-6 px-6 text-center overflow-hidden bg-[#0A3B2A]">
//               <svg className="absolute top-0 left-0 opacity-20" width="56" height="56" viewBox="0 0 56 56" fill="none">
//                 <path d="M0 0 Q28 0 28 28 Q28 0 56 0" stroke="#C5A02A" strokeWidth="1.2" fill="none" />
//                 <path d="M0 12 Q16 12 16 28 Q16 12 32 12" stroke="#C5A02A" strokeWidth="0.8" fill="none" />
//               </svg>
//               <svg className="absolute top-0 right-0 opacity-20 scale-x-[-1]" width="56" height="56" viewBox="0 0 56 56" fill="none">
//                 <path d="M0 0 Q28 0 28 28 Q28 0 56 0" stroke="#C5A02A" strokeWidth="1.2" fill="none" />
//                 <path d="M0 12 Q16 12 16 28 Q16 12 32 12" stroke="#C5A02A" strokeWidth="0.8" fill="none" />
//               </svg>
//               <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#E8C84A] to-transparent" />
//               <h2 className="text-white font-playfair text-[21px] font-bold tracking-wide drop-shadow-md">
//                 Begin Your Journey
//               </h2>
//               <div className="flex items-center justify-center gap-3 mt-2">
//                 <div className="h-px flex-1 max-w-[48px] bg-[#C5A02A]/40" />
//                 <span className="text-[9px] font-bold tracking-[0.2em] uppercase font-inter text-[#C5A02A]">
//                   Find Your Perfect Match
//                 </span>
//                 <div className="h-px flex-1 max-w-[48px] bg-[#C5A02A]/40" />
//               </div>
//               <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8C84A] to-transparent" />
//             </div>

//             {/* ── Form Body ── */}
//             <form onSubmit={handleRegister} className="p-5 space-y-4">

//               {/* Profile For (Custom Dropdown) */}
//               <div className="relative z-30">
//                 <CustomSelect
//                   value={profileFor}
//                   onChange={handleProfileForChange}
//                   options={profileOptions}
//                   placeholder="Profile created for"
//                   className={inputCls}
//                   style={inputStyle}
//                   focusStyle={inputFocusStyle}
//                 />
//               </div>

//               {/* Gender pill — only when ambiguous */}
//               <AnimatePresence>
//                 {(profileFor === "Myself" || profileFor === "Relative" || profileFor === "Friend") && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className="flex gap-2 p-1 rounded-xl overflow-hidden"
//                     style={{ background: "#F0F7F0", border: "1.5px solid #C8DFC8" }}
//                   >
//                     {["Male", "Female"].map((g) => (
//                       <button
//                         key={g}
//                         type="button"
//                         onClick={() => setGender(g)}
//                         className="flex-1 py-2 rounded-lg text-[12px] font-bold font-inter transition-all duration-200 cursor-pointer"
//                         style={
//                           gender === g
//                             ? { background: "#0A3B2A", color: "#fff", boxShadow: "0 2px 8px rgba(10,59,42,0.18)" }
//                             : { color: "#5E8A5E", background: "transparent" }
//                         }
//                       >
//                         {g}
//                       </button>
//                     ))}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Name */}
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Full name"
//                 className={inputCls}
//                 style={inputStyle}
//                 {...inputFocusHandlers}
//               />

//               {/* Phone row with Custom Dropdown for Country Code */}
//               <div className="flex gap-2 relative z-20">
//                 <div className="w-[85px] flex-shrink-0">
//                   <CustomSelect
//                     value={countryCode}
//                     onChange={setCountryCode}
//                     options={countryCodeOptions}
//                     placeholder="+91"
//                     className={`${inputCls} !px-2 justify-center`}
//                     style={inputStyle}
//                     focusStyle={inputFocusStyle}
//                   />
//                 </div>
//                 <input
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
//                   placeholder="Mobile number"
//                   maxLength={10}
//                   className={`flex-1 ${inputCls}`}
//                   style={inputStyle}
//                   {...inputFocusHandlers}
//                 />
//               </div>

//               {/* Email */}
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Email address"
//                 className={inputCls}
//                 style={inputStyle}
//                 {...inputFocusHandlers}
//               />

//               {/* Submit */}
//               <motion.button
//                 type="submit"
//                 disabled={loading}
//                 whileHover={{ scale: 1.015 }}
//                 whileTap={{ scale: 0.975 }}
//                 className="w-full py-3.5 mt-2 text-white text-[12px] font-extrabold tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 font-inter relative overflow-hidden"
//                 style={{
//                   background: loading ? "#5E8A5E" : "linear-gradient(135deg, #0A3B2A 0%, #145C40 100%)",
//                   boxShadow: loading ? "none" : "0 4px 16px rgba(10,59,42,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
//                 }}
//               >
//                 {!loading && (
//                   <span className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A02A]/60 to-transparent" />
//                 )}
//                 {loading ? "Processing…" : (
//                   <>
//                     REGISTER FREE
//                     <FaArrowRight className="text-[10px] text-[#C5A02A]" />
//                   </>
//                 )}
//               </motion.button>
//             </form>

//             {/* Footer */}
//             <div className="px-6 pb-5 text-center border-t border-[#EBF4EB]">
//               <p className="text-[10px] font-inter pt-3 text-[#8A9E8A]">
//                 By registering, you agree to our{" "}
//                 <a href="#" className="underline text-[#0A3B2A]">Terms</a>{" "}
//                 &amp;{" "}
//                 <a href="#" className="underline text-[#0A3B2A]">Privacy Policy</a>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;



"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { FaArrowRight, FaChevronDown } from "react-icons/fa6";
import Image from "next/image";

const couplesData = [
  { img: "/home/slide2.jpg", name: "Harshita & Ranjit" },
  { img: "/home/slide1.jpg", name: "Nagendra & Siri" },
  { img: "/home/slide3.jpg", name: "Ganesh & Deepa" },
  { img: "/home/story1.jpg", name: "Suresh & Sandhya" },
  { img: "/home/testimonialImg1.png", name: "Kiran & Keerthi" },
  { img: "/home/testimonialImg2.png", name: "Venkat & Sireesha" },
  { img: "/home/couple.jpg", name: "Vijay & Lakshmi" },
  { img: "/home/slide4.jpg", name: "Anand & Pavani" },
];

/* ── Custom Select Component ── */
const CustomSelect = ({ value, onChange, options, placeholder, className, style, focusStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStyle = isFocused || isOpen ? { ...style, ...focusStyle } : style;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setIsFocused(true);
        }}
        className={`${className} flex items-center justify-between cursor-pointer select-none`}
        style={currentStyle}
      >
        <span className={value ? "text-[#1C3A1C]" : "text-[#8A9E8A]"}>
          {value || placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FaChevronDown className="text-[#5E8A5E] text-[10px]" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-[#C8DFC8] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden max-h-[220px] overflow-y-auto"
          >
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setIsFocused(false);
                }}
                className="px-4 py-3 text-[13px] font-medium font-inter text-[#1C3A1C] hover:bg-[#F0F7F0] hover:text-[#0A3B2A] cursor-pointer transition-colors"
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Couple Card Component ── */
const CoupleCard = ({ item, rowKey }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      key={rowKey}
      className="relative w-[160px] h-[220px] md:w-[220px] md:h-[280px] rounded-2xl overflow-hidden border-2 border-white cursor-pointer flex-shrink-0 group"
      style={{
        transition: "transform 0.4s ease, box-shadow 0.4s ease",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.10)",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={item.img}
        alt={item.name}
        fill
        className="object-cover transition-transform duration-500 ease-out"
        sizes="(max-width: 768px) 160px, 250px"
        style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
      />
      <div
        className="absolute inset-0 bg-white/70 transition-opacity duration-400 ease-in-out"
        style={{ opacity: hovered ? 0 : 1 }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-400 ease-in-out"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
          opacity: hovered ? 1 : 0,
        }}
      />
      <span
        className="absolute bottom-3 left-3 text-xs md:text-sm font-bold font-inter drop-shadow-md transition-colors duration-400"
        style={{
          color: hovered ? "#fff" : "#0A3B2A",
          textShadow: hovered ? "0 2px 4px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {item.name}
      </span>
    </div>
  );
};

/* ── Hero Section ── */
const HeroSection = () => {
  const [profileFor, setProfileFor] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // FIX: countryCode kept but removed the CustomSelect dropdown since only +91 is used.
  // Keeps phone format consistent with page.jsx expectations.
  const countryCode = "+91";
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const profileOptions = ["Myself", "Daughter", "Son", "Sister", "Brother", "Relative", "Friend"];

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

  const handleProfileForChange = (val) => {
    setProfileFor(val);
    if (val === "Son" || val === "Brother") setGender("Male");
    else if (val === "Daughter" || val === "Sister") setGender("Female");
    else setGender("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!profileFor) return toast.error("Please select who the profile is for");
    if (!gender) return toast.error("Please select a gender");
    const trimmedName = name.trim();
    if (!trimmedName) return toast.error("Please enter the name");
    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length !== 10)
      return toast.error("Please enter a valid 10-digit mobile number");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return toast.error("Please enter an email address");
    if (!isValidEmail(trimmedEmail))
      return toast.error("Please enter a valid email address");

    try {
      setLoading(true);

      // STEP 1 — Send OTP (same endpoint as page.jsx handleSendOtp)
      await api.post("/auth/send-otp", { email: trimmedEmail });

      // STEP 2 — Set localStorage flags page.jsx useEffect watches
      localStorage.setItem("rvr_pending_email", trimmedEmail);
      localStorage.setItem("rvr_otp_sent", "true");

      // STEP 3 — Persist initial profile data for /profiledetails/step1
      // FIX: phone stored WITHOUT space → "+91XXXXXXXXXX" not "+91 XXXXXXXXXX"
      const initialRegisterData = {
        user_details: {
          1: {
            profileCreatedFor: profileFor,
            fullName: trimmedName,
            gender,
            phone: `${countryCode}${trimmedPhone}`,
          },
        },
      };
      sessionStorage.setItem("registerData", JSON.stringify(initialRegisterData));

      toast.success("OTP sent to your email!");

      // STEP 4 — page.jsx takes over: OTP → password → /profiledetails/step1
      router.push("/register");
    } catch (err) {
      toast.error(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const firstRow = [...couplesData, ...couplesData];
  // FIX: avoid mutating couplesData in place — spread into new array before reversing
  const secondRowDoubled = [...[...couplesData].reverse(), ...[...couplesData].reverse()];

  const inputCls =
    "w-full px-4 py-3 rounded-xl text-[13px] font-medium font-inter placeholder:text-[#8A9E8A] text-[#1C3A1C] outline-none transition-all duration-200";
  const inputStyle = {
    background: "#F0F7F0",
    border: "1.5px solid #C8DFC8",
  };
  const inputFocusStyle = {
    border: "1.5px solid #C5A02A",
    boxShadow: "0 0 0 3px rgba(197,160,42,0.13)",
    background: "#fff",
  };
  const inputFocusHandlers = {
    onFocus: (e) => { Object.assign(e.target.style, inputFocusStyle); },
    onBlur: (e) => {
      e.target.style.border = inputStyle.border;
      e.target.style.boxShadow = "none";
      e.target.style.background = inputStyle.background;
    },
  };

  return (
    <section className="relative w-full min-h-[90vh] bg-[#FAFAF8] overflow-hidden flex flex-col lg:flex-row items-stretch justify-center py-10 md:py-16">

      {/* ── COLLAGE ROWS (Background) ── */}
      <div className="absolute inset-0 z-0 flex flex-col justify-center gap-5 py-4 pointer-events-none select-none" style={{ pointerEvents: "auto" }}>
        <div className="overflow-hidden flex w-full">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 40, repeat: Infinity }}
            className="flex gap-4 w-max"
          >
            {firstRow.map((item, i) => (
              <CoupleCard key={`r1-${i}`} item={item} rowKey={`r1-${i}`} />
            ))}
          </motion.div>
        </div>
        <div className="overflow-hidden flex w-full">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ ease: "linear", duration: 45, repeat: Infinity }}
            className="flex gap-4 w-max"
          >
            {secondRowDoubled.map((item, i) => (
              <CoupleCard key={`r2-${i}`} item={item} rowKey={`r2-${i}`} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Subtle background wash for text readability */}
      <div className="absolute inset-0 bg-white/20 lg:bg-gradient-to-r lg:from-white/40 lg:to-transparent z-[1] pointer-events-none lg:w-[60%]" />

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col lg:flex-row items-center justify-between gap-12 min-h-full mt-8 lg:mt-0 pointer-events-none">

        {/* Left — Headline */}
        <div className="w-full lg:w-1/2 space-y-4 text-center lg:text-left mt-10 lg:mt-0 pointer-events-none">
          <h1
            className="font-playfair text-[#111111] text-4xl md:text-[3rem] font-black leading-[1.2] md:leading-[1.1] tracking-tight pointer-events-auto"
            style={{ textShadow: "0 2px 15px rgba(255,255,255,0.9)" }}
          >
            The biggest and most trusted matrimony for{" "}
            <br className="hidden md:block" />
            <span className="text-[#7A202A] relative inline-block mt-2">
              South Indian Families
              <svg className="absolute -bottom-2 left-0 w-full opacity-80" height="6" viewBox="0 0 200 6" fill="none">
                <path d="M0 3 Q50 0, 100 3 T200 3" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p
            className="text-[#111111] text-base md:text-lg font-medium font-inter max-w-md mx-auto lg:mx-0 pt-2 pointer-events-auto"
            style={{ textShadow: "0 1px 8px rgba(255,255,255,1)" }}
          >
            Find your perfect match based on your stars, values, and shared interests.
          </p>
        </div>

        {/* Right — Registration Form */}
        <div className="w-full sm:max-w-md lg:w-[420px] flex justify-center lg:justify-end pb-10 lg:pb-0 pointer-events-auto">
          <div
            className="w-full rounded-2xl overflow-hidden relative z-20"
            style={{
              background: "#fff",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              border: "1px solid #D6EAD6",
            }}
          >
            {/* Form Header */}
            <div className="relative py-6 px-6 text-center overflow-hidden bg-[#0A3B2A]">
              <svg className="absolute top-0 left-0 opacity-20" width="56" height="56" viewBox="0 0 56 56" fill="none">
                <path d="M0 0 Q28 0 28 28 Q28 0 56 0" stroke="#C5A02A" strokeWidth="1.2" fill="none" />
                <path d="M0 12 Q16 12 16 28 Q16 12 32 12" stroke="#C5A02A" strokeWidth="0.8" fill="none" />
              </svg>
              <svg className="absolute top-0 right-0 opacity-20 scale-x-[-1]" width="56" height="56" viewBox="0 0 56 56" fill="none">
                <path d="M0 0 Q28 0 28 28 Q28 0 56 0" stroke="#C5A02A" strokeWidth="1.2" fill="none" />
                <path d="M0 12 Q16 12 16 28 Q16 12 32 12" stroke="#C5A02A" strokeWidth="0.8" fill="none" />
              </svg>
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#E8C84A] to-transparent" />
              <h2 className="text-white font-playfair text-[21px] font-bold tracking-wide drop-shadow-md">
                Begin Your Journey
              </h2>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="h-px flex-1 max-w-[48px] bg-[#C5A02A]/40" />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase font-inter text-[#C5A02A]">
                  Find Your Perfect Match
                </span>
                <div className="h-px flex-1 max-w-[48px] bg-[#C5A02A]/40" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8C84A] to-transparent" />
            </div>

            {/* Form Body */}
            <form onSubmit={handleRegister} className="p-5 space-y-4">

              {/* Profile For */}
              <div className="relative z-30">
                <CustomSelect
                  value={profileFor}
                  onChange={handleProfileForChange}
                  options={profileOptions}
                  placeholder="Profile created for"
                  className={inputCls}
                  style={inputStyle}
                  focusStyle={inputFocusStyle}
                />
              </div>

              {/* Gender pill */}
              <AnimatePresence>
                {(profileFor === "Myself" || profileFor === "Relative" || profileFor === "Friend") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 p-1 rounded-xl overflow-hidden"
                    style={{ background: "#F0F7F0", border: "1.5px solid #C8DFC8" }}
                  >
                    {["Male", "Female"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className="flex-1 py-2 rounded-lg text-[12px] font-bold font-inter transition-all duration-200 cursor-pointer"
                        style={
                          gender === g
                            ? { background: "#0A3B2A", color: "#fff", boxShadow: "0 2px 8px rgba(10,59,42,0.18)" }
                            : { color: "#5E8A5E", background: "transparent" }
                        }
                      >
                        {g}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={inputCls}
                style={inputStyle}
                {...inputFocusHandlers}
              />

              {/* Phone — static +91 label, no dropdown */}
              <div className="flex gap-2">
                <div
                  className="flex-shrink-0 flex items-center justify-center px-3 rounded-xl text-[13px] font-semibold font-inter text-[#1C3A1C]"
                  style={inputStyle}
                >
                  +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Mobile number"
                  maxLength={10}
                  className={`flex-1 ${inputCls}`}
                  style={inputStyle}
                  {...inputFocusHandlers}
                />
              </div>

              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className={inputCls}
                style={inputStyle}
                {...inputFocusHandlers}
              />

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
                className="w-full py-3.5 mt-2 text-white text-[12px] font-extrabold tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 font-inter relative overflow-hidden"
                style={{
                  background: loading ? "#5E8A5E" : "linear-gradient(135deg, #0A3B2A 0%, #145C40 100%)",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(10,59,42,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {!loading && (
                  <span className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A02A]/60 to-transparent" />
                )}
                {loading ? "Processing…" : (
                  <>
                    REGISTER FREE
                    <FaArrowRight className="text-[10px] text-[#C5A02A]" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="px-6 pb-5 text-center border-t border-[#EBF4EB]">
              <p className="text-[10px] font-inter pt-3 text-[#8A9E8A]">
                By registering, you agree to our{" "}
                <a href="/terms-and-conditions" className="underline text-[#0A3B2A]">Terms</a>{" "}
                &amp;{" "}
                <a href="/privacy-policy" className="underline text-[#0A3B2A]">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;