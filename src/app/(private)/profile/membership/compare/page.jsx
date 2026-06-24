"use client";
import React from "react";
import { useState, useEffect } from "react";
import Script from "next/script";
import toast from "react-hot-toast";
import { api } from "@/lib/apiClient";
import { ChevronLeft, Check, X, Crown, Sparkles, Lock } from "lucide-react";
import MobileHeaderText from "@/app/component/MobileHeaderText";

const ComparisonTable = ({ onBuy, userMembership }) => {
  const features = [
    "Browse Profiles",
    "Shortlist Profiles",
    "Send Interests",
    "View Unblurred Photos",
    "Full Photo Gallery",
    "Chat Messaging",
    "Voice & Video Calls",
    "Advanced Search",
    "Contact Details",
    "Horoscope Matching",
    "Gothram / Dosha",
    "Who Viewed You",
    "Profile Boost",
    "Premium Events",
  ];

  const plans = [
    {
      name: "Free",
      planKey: "FREE",
      subtitle: "Get Started",
      price: "₹0",
      theme: "light",
      values: [
        true,
        true,
        "LIMITED",
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      btnText: "Free Plan",
    },
    {
      name: "Gold",
      planKey: "GOLD",
      subtitle: "Most Popular",
      price: "₹4,999",
      theme: "gold",
      recommended: true,
      values: [
        true,
        true,
        true,
        true,
        false,
        false,
        "LIMITED",
        false,
        true,
        true,
        false,
        false,
        true,
        false,
      ],
      btnText: "Upgrade",
    },
    {
      name: "Premium",
      planKey: "PREMIUM",
      subtitle: "Complete Access",
      price: "₹9,999",
      theme: "dark",
      values: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      btnText: "Get Premium",
    },
  ];

  // Helper to determine if a plan is the user's active plan
  const isCurrentPlan = (planKey) =>
    (userMembership || "FREE").toUpperCase() === planKey.toUpperCase();
  const normalizedMembership = (userMembership || "FREE").toUpperCase();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 p-4 font-inter">
      {/* 2. Responsive Table Container */}
      <div className="w-full overflow-x-auto bg-white rounded-3xl shadow-xl border border-[#E5E7EB]">
        <div className="w-full flex flex-col">
          {/* Table Header Row */}
          <div className="flex items-stretch border-b border-[#E5E7EB]">
            <div className="w-1/4 p-6 flex items-center justify-center bg-gray-50/50">
              <span className="text-stone-600 text-sm font-bold tracking-widest">
                FEATURES
              </span>
            </div>
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`w-1/4 p-6 relative flex flex-col items-center justify-center gap-[3px] border-l border-[#E5E7EB] ${plan.theme === "gold" ? "bg-orange-50/50" : plan.theme === "dark" ? "bg-gradient-to-br from-green-800 to-green-950 text-white" : "bg-white"}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] flex items-center justify-center gap-1.5 shadow-sm">
                    <Sparkles size={11} className="text-red-900" />
                    <span className="text-red-900 text-[10px] font-bold tracking-tighter">
                      RECOMMENDED
                    </span>
                  </div>
                )}
                {plan.name === "Premium" && (
                  <Crown className="text-[#E3B450]" />
                )}
                <h3
                  className={`text-xl font-bold font-playfair ${plan.theme === "dark" ? "text-white" : "text-green-700"}`}
                >
                  {plan.name}
                </h3>
                <p className={`text-[10px] opacity-70`}>{plan.subtitle}</p>
                <p
                  className={`text-2xl font-bold ${
                    ["dark", "gold"].includes(plan.theme)
                      ? "bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] bg-clip-text text-transparent"
                      : "text-green-700"
                  }`}
                >
                  {plan.price}
                </p>
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          {features.map((feature, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center border-b border-[#E5E7EB] hover:bg-gray-50/30 transition-colors"
            >
              <div className="w-1/4 p-4 pl-8 text-stone-700 font-medium border-r border-[#E5E7EB]">
                <span className="text-xs">{feature} </span>
              </div>
              {plans.map((plan, colIndex) => (
                <div
                  key={colIndex}
                  className="w-1/4 p-4 flex justify-center border-r border-[#E5E7EB] last:border-r-0"
                >
                  <StatusIndicator
                    value={plan.values[rowIndex]}
                    isLight={plan.theme === "light"}
                  />
                </div>
              ))}
            </div>
          ))}

          {/* Action Footer Row */}
          <div className="flex items-center bg-gray-50/50">
            <div className="w-1/4 p-5" />
            {plans.map((plan, i) => {
              // Check if THIS specific column represents the user's active plan
              const isCurrent = isCurrentPlan(plan.planKey);

              return (
                <div
                  key={i}
                  className="w-1/4 py-5 border-r border-[#E5E7EB] flex justify-center"
                >
                  <button
                    disabled={isCurrent}
                    onClick={() => {
                      if (!isCurrent && plan.planKey !== "FREE") {
                        onBuy?.(plan.planKey);
                      }
                    }}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                      isCurrent ? "cursor-default opacity-80" : "cursor-pointer"
                    } ${
                      plan.theme === "light"
                        ? "bg-[#429466] hover:bg-green-600 text-white"
                        : plan.theme === "dark"
                          ? "bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] text-[#6E2F2F] "
                          : "bg-[#429466] hover:bg-green-600 text-white"
                    }`}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : normalizedMembership === "PREMIUM" &&
                          plan.planKey === "GOLD"
                        ? "Downgrade"
                        : plan.btnText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Check/X/Limited icons
const StatusIndicator = ({ value, isLight }) => {
  if (value === true) {
    return (
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${!isLight ? "bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] " : "bg-[#FFF6EC]"}`}
      >
        <Check
          size={14}
          className={isLight ? "text-green-900" : "text-[#6E2F2F]"}
          strokeWidth={3}
        />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#FFF6EC] opacity-90">
        <X size={14} className="text-[#6E2F2F]" strokeWidth={3} />
      </div>
    );
  }
  return (
    <div className="px-2 py-1 bg-orange-100 rounded text-[9px] font-bold text-stone-500 tracking-tighter">
      {value}
    </div>
  );
};

export default function Page() {
  const handlePayment = async (planKey) => {
    if (!planKey || planKey === "FREE") return;

    try {
      const data = await api.post(
        "/payment/create-order",
        { planKey },
        "private",
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      if (!window.Razorpay) {
        toast.error("Payment SDK not loaded. Please refresh.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Matrimony App",
        description: `Upgrade to ${planKey} Plan`,
        order_id: data.order.id,

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
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            toast.error("Error verifying payment.");
          }
        },

        theme: {
          color: "#16a34a",
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        toast.error("Payment Failed: " + response.error.description);
      });

      paymentObject.open();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const [userMembership, setUserMembership] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me", "private");
        if (res?.success) {
          setUserMembership(res.data?.profile?.membershipType);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <div className="w-full max-w-7xl mx-auto  mb-40 sm:mb-0">
        <MobileHeaderText>
          <div className="flex items-center gap-2"></div>
        </MobileHeaderText>
        <div className="w-full flex flex-col gap-6 mb-4">
          {/* 1. Navigation Bar */}
          <div className="w-full min-h-[80px] md:h-24 px-4 md:px-6 py-4 bg-[#F3DED3] rounded-[20px]  hidden sm:flex flex-row justify-between items-center gap-4 transition-all">
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

            {/* Center: Main Title */}
            <div className="flex-1 text-center">
              <h1 className="text-green-600 text-lg md:text-2xl font-semibold font-playfair leading-tight">
                Membership Plans
              </h1>
            </div>

            {/* Right Spacer (for balancing center title) */}
            <div className="hidden md:block w-20" aria-hidden="true" />
          </div>

          {/* 2. Headline and Trust Badges Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6  px-4 sm:px-0 ">
            {/* Subtitle Section */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-gradient rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
                <Crown className=" w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-stone-800 text-xl font-semibold font-playfair">
                  Compare Membership Plans
                </h2>
                <p className="text-stone-500 text-base font-normal font-inter">
                  Choose the plan that suits your journey
                </p>
              </div>
            </div>

            {/* Trust Badges Container */}
            <div className="w-full lg:w-auto h-auto min-h-[64px] px-4 py-3 bg-white rounded-[62px] shadow-lg border border-[#E5E7EB]  hidden sm:flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Secure Payment Badge */}
              <div className="w-full sm:w-44 h-10 px-3 bg-orange-50 rounded-full flex items-center gap-2.5">
                <div className="w-8 h-8   flex items-center justify-center">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-stone-500 text-xs font-medium font-inter whitespace-nowrap">
                  Secure Payment
                </span>
              </div>

              {/* Premium Quality Badge */}
              <div className="w-full sm:w-44 h-10 px-3 bg-orange-50 rounded-full flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center shadow-sm">
                  <Crown className="w-4 h-4  text-[#6E2F2F]" />
                </div>
                <span className="text-stone-500 text-xs font-medium font-inter whitespace-nowrap">
                  Premium Quality
                </span>
              </div>
            </div>
          </div>
        </div>{" "}
        <ComparisonTable
          onBuy={handlePayment}
          userMembership={userMembership}
        />
      </div>
    </>
  );
}
