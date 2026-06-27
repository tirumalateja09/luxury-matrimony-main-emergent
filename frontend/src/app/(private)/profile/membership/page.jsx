"use client";
import React from "react";
import { useState, useEffect } from "react";
import Script from "next/script";
import toast from "react-hot-toast";
import {
  Check,
  ShieldCheck,
  Gem,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import Link from "next/link";
import MobileHeaderText from "@/app/component/MobileHeaderText";

const PricingSection = () => {
  const plans = [
    {
      planKey: "FREE",
      title: "Free",
      subtitle: "Start your journey",
      price: "₹0",
      period: "LIFETIME",
      buttonText: "Register Free",
      theme: "light",
      features: [
        { text: "Browse Profiles", included: true },
        { text: "Shortlist Profiles", included: true },
        { text: "Send Interest (Limited)", included: true },
        { text: "View Unblurred Photos", included: false },
        { text: "Chat & Messaging", included: false },
        // { text: "Voice & Video Calls", included: false },
         { text: "Advanced Search Filters", included: false },
        { text: "View Contact Details", included: false },
        // { text: "Horoscope Matching", included: false },
        { text: "Profile Boost / Spotlight", included: false },
      ],
    },
    {
      planKey: "GOLD",
      title: "Gold",
      subtitle: "Connect with confidence",
      price: "₹4,999",
      period: "3 Months",
      buttonText: "Upgrade to Gold",
      theme: "gold",
      features: [
        { text: "Browse Profiles", included: true },
        { text: "Shortlist & Send Unlimited Interests", included: true },
        { text: "View Unblurred Profile Photos", included: true },
        { text: "Chat Message Request (5 per day)", included: true },
        { text: "View Contact Details", included: true },
      { text: "Advanced Search Filters", included: true },
        { text: "See Who Viewed Your Profile", included: true },
        { text: "Photo Gallery Access", included: false },
      ],
      showViewMore: true,
    },
    {
      planKey: "PREMIUM",
      title: "Premium",
      subtitle: "For serious and priority matches",
      price: "₹9,999",
      period: "6 Months",
      buttonText: "Get Premium",
      theme: "dark",
      features: [
        { text: "Browse Profiles", included: true },
        { text: "Unlimited Interests & Shortlisting", included: true },
        { text: "View Unblurred Photos", included: true },
        { text: "Full Photo Gallery Access", included: true },
        { text: "Unlimited Chat Messaging", included: true },
        // { text: "Voice & Video Calls", included: true },
       { text: "Advanced Search & Filters", included: true },
        { text: "View Contact Details", included: true },
       { text: "Detailed Horoscope Matching", included: true },
      ],
      showViewMore: true,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const subscription = localStorage.getItem("subscription");

    if (subscription === "true") {
    
      // make it false after reload
      localStorage.setItem("subscription", "false");
    }
  }, []);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/profile/me", "private");
        if (response?.success) {
          const profile = response?.data?.profile || {};
          setProfileData(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile for edit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  const handlePayment = async (planKey) => {

    if (!planKey || planKey === "FREE") return;

    setLoading(true);
    try {
      const data = await api.post(
        "/payment/create-order",
        { planKey },
        "private",
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      // 3. Initialize Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Matrimony App",
        description: `Upgrade to ${planKey} Plan`,
        order_id: data.order.id,
        // Handler runs ONLY on Success
        handler: async function (response) {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purchaseType: "SUBSCRIPTION",
              planKey: planKey,
            };

            const verifyData = await api.post(
              "/payment/verify-payment",
              verifyPayload,
              "private",
            );

            if (verifyData.success) {
              toast.success("Payment Successful! Plan Activated.");
              window.location.reload();
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (err) {
            console.error(err);
            const msg = err.data?.message || "Error verifying payment.";
            toast.error(msg);
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#16a34a",
        },
      };

      // 4. Initialize Razorpay Instance
      const paymentObject = new window.Razorpay(options);

      // 5. Add Failure Listener (Invisible logic addition)
      paymentObject.on("payment.failed", function (response) {
        toast.error("Payment Failed: " + response.error.description);
      });

      // 6. Open Popup
      // This line is ONLY reached if Step 2 was successful.
      paymentObject.open();
    } catch (error) {
      console.error("Payment Error:", error);
      // This Alert shows "You already have an active Gold plan"
      // because we threw it in Step 2.
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="w-full max-w-7xl mx-auto mb-40 sm:mb-0">
        <MobileHeaderText>
          <div className="flex items-center gap-2">
            <CreditCard /> Membership Plans
          </div>
        </MobileHeaderText>
        <div className="hidden sm:block w-full ">
          <div className="w-full min-h-[80px] md:h-24 px-4 md:px-6 py-4 bg-[#F3DED3] rounded-[20px] flex flex-row justify-between items-center gap-4 transition-all">
            {/* Left: Back Button */}
            <button
              onClick={() => window.history.back()}
              className="h-10 px-4 py-2  rounded-full cursor-pointer hover:shadow flex items-center gap-2 hover:bg-stone-50 active:scale-95 transition-all group"
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4 text-stone-500 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-stone-500 text-sm font-normal font-inter">
                Back
              </span>
            </button>

            {/* Center: Title */}
            <div className="flex-1 text-center">
              <h1 className="text-green-600 text-lg md:text-2xl font-semibold font-playfair leading-tight">
                Membership Plans
              </h1>
            </div>

            {/* Right: Compare Plans Button */}
            <div className="flex justify-end items-center shrink-0">
              <Link href="/profile/membership/compare">
                <button className="cursor-pointer px-3 md:px-5 py-2 md:py-2.5 rounded-full border border-red-900 bg-transparent hover:bg-red-200/50 transition-colors flex items-center gap-2">
                  <span className="hidden md:inline text-red-900 text-sm font-medium font-inter">
                    Compare plans side-by-side
                  </span>
                </button>{" "}
              </Link>
            </div>
          </div>
        </div>
        <div
          className="
  self-stretch mt-4 text-center text-stone-500 text-xs font-normal font-['Inter']

  /* 📱 Mobile Sticky Bottom */
  fixed bottom-20 left-0 w-full px-4 py-3
  bg-transparent backdrop-blur-[4px]

  /* 💻 Desktop Normal */
  md:static md:mt-4
"
        >
          All plans include verified profiles and family-focused matchmaking.
          Upgrade anytime to unlock more features.
        </div>
        <div className=" py-12 flex flex-col gap-8 sm:gap-12 font-inter px-4 sm:px-0">
          {/* Header Section */}
          <div className="flex flex-col-reverse lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2 text-center lg:text-left">
              <h2 className="text-stone-800 text-3xl md:text-4xl font-semibold font-playfair">
                Choose Your Plan
              </h2>
              <p className="text-stone-500 text-base md:text-lg">
                Find the perfect membership for your matrimony journey
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 bg-white p-3 rounded-full shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-stone-500 text-xs font-medium">
                  Secure Payment
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full">
                <Gem className="w-4 h-4 text-amber-500" />
                <span className="text-stone-500 text-xs font-medium">
                  Premium Quality
                </span>
              </div>
            </div>
          </div>
          <div className="flex  sm:hidden justify-center items-center shrink-0">
            <Link href="/profile/membership/compare">
              <button className="cursor-pointer px-3 md:px-5 py-2 md:py-2.5 rounded-full border border-red-900 bg-transparent hover:bg-red-200/50 transition-colors flex items-center gap-2">
                <span className="inline text-red-900 text-sm font-medium font-inter">
                  Compare plans side-by-side
                </span>
              </button>{" "}
            </Link>
          </div>
          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {plans.map((plan, idx) => (
              <PricingCard
                key={idx}
                {...plan}
                planKey={plan.planKey}
                userMembership={profileData?.profile?.membershipType}
                onBuy={() => handlePayment(plan.planKey)}
                isLoading={loading}
              />
            ))}
          </div>
        </div>{" "}
      </div>
    </>
  );
};

const PricingCard = ({
  title,
  subtitle,
  price,
  period,
  features,
  buttonText,
  theme,
  userMembership,
  onBuy,
  loading,
  planKey,
}) => {
  const isDark = theme === "dark";
  const isGold = theme === "gold";

  const isCurrentPlan =
    userMembership && userMembership.toUpperCase() === planKey?.toUpperCase();
  const normalizedMembership = (userMembership || "FREE").toUpperCase();

  return (
    <div
      className={`w-full max-w-sm flex flex-col py-8 px-5 rounded-[32px] shadow-2xl transition-transform  duration-300 ${
        isDark
          ? "bg-gradient-to-br from-green-700 to-green-950 text-white"
          : isGold
            ? "bg-orange-50 border-2 border-amber-300 text-stone-800"
            : "bg-white text-stone-800"
      }`}
    >
      <div className="mb-6">
        <h3
          className={`text-2xl font-bold font-playfair mb-1 ${isDark ? "text-white" : "text-green-600"}`}
        >
          {title}
        </h3>
        <p
          className={`${isDark ? "text-white/70" : "text-stone-500"} text-sm mb-4`}
        >
          {subtitle}
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl font-bold ${isDark || isGold ? "bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] bg-clip-text text-transparent" : "text-green-600"}`}
          >
            {price}
          </span>
          <span
            className={`text-sm ${isDark ? "text-white/50" : "text-stone-500"}`}
          >
            / {period}
          </span>
        </div>
      </div>

      <div
        className={`h-px w-full mb-8 bg-gradient-to-r from-transparent via-amber-300 to-transparent`}
      />

      <ul className="flex-1 flex flex-col gap-4 mb-1">
        {features.map((feat, i) => (
          <li
            key={i}
            className={`flex items-center gap-3 text-sm ${!feat.included ? "opacity-40" : ""}`}
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                !isDark && !isGold
                  ? "bg-[#F3DED3] text-green-600"
                  : "text-[#6E2F2F] bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043]"
              }`}
            >
              {feat.included ? (
                <Check className="w-3 h-3 " strokeWidth={3} />
              ) : (
                <X className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <span>{feat.text}</span>
          </li>
        ))}
      </ul>
      {isDark || isGold ? (
        <Link href="/">
          <div className="mb-2 text-sm flex  items-center  text-gray-400 ">
            View More <ChevronRight size="16" />
          </div>
        </Link>
      ) : null}
      <button
        disabled={isCurrentPlan || loading}
        className={`w-full py-4 rounded-full font-bold text-base shadow-lg transition-all active:scale-95 cursor-pointer ${
          isDark
            ? "bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] text-red-900"
            : isGold
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] text-stone-800"
        } ${isCurrentPlan ? "cursor-not-allowed" : ""}`}
        onClick={onBuy}
      >
        {isCurrentPlan
          ? "Current Plan"
          : normalizedMembership === "PREMIUM" && planKey === "GOLD"
            ? "Downgrade to Gold"
            : buttonText}
      </button>
    </div>
  );
};

export default PricingSection;
