"use client";

import React, { useState } from "react";
import { Sparkles, TrendingUp, Check, ShieldCheck, Zap } from "lucide-react";
import MobileHeaderText from "@/app/component/MobileHeaderText";
import toast from "react-hot-toast";
import Script from "next/script"; // Added for Razorpay
import { api } from "@/lib/apiClient"; // Added for API calls

const BoostProfile = () => {
  const [selectedPlan, setSelectedPlan] = useState("3 Days"); // Keeps your existing state
  const [loading, setLoading] = useState(false); // Added loading state

  // Map your UI IDs to Backend Keys
  const PLAN_MAPPING = {
    "24 Hours": "BOOST_1",
    "3 Days": "BOOST_3",
    "7 Days": "BOOST_7",
  };

  const plans = [
    {
      id: "24 Hours",
      label: "24 Hours",
      sub: "Quick visibility boost",
      multiplier: "2× more views",
      price: "₹299", // Ensure this matches backend amount
    },
    {
      id: "3 Days",
      label: "3 Days",
      sub: "Popular choice",
      multiplier: "3× more views",
      price: "₹699",
      popular: true,
    },
    {
      id: "7 Days",
      label: "7 Days",
      sub: "Best results",
      multiplier: "5× more views",
      price: "₹1,299",
    },
  ];

  // --- LOGIC INTEGRATION START ---
  const handlePayment = async () => {
    const planKey = PLAN_MAPPING[selectedPlan];

    if (!planKey) return;

    setLoading(true);
    try {
      const data = await api.post(
        "/payment/create-order",
        { planKey },
        "private"
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      // 4. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Matrimony App",
        description: `Profile Boost - ${selectedPlan}`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purchaseType: "BOOST", // Critical for backend logic
              planKey: planKey,
            };

            const verifyData = await api.post(
              "/payment/verify-payment",
              verifyPayload,
              "private"
            );

            if (verifyData.success) {
              toast.success("🚀 Profile Boosted Successfully!");
              window.location.reload();
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error(err);
            toast.error(err.data?.message || "Error verifying payment.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#E3B450", // Gold theme
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response){
          toast.error("Payment Failed: " + response.error.description);
      });

      paymentObject.open();

    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  // --- LOGIC INTEGRATION END ---

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 font-inter mb-40 sm:mb-0">
      
      {/* Script Tag Added invisibly here */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
    
      <MobileHeaderText>
        Profile Boost
      </MobileHeaderText>
      {/* 1. Top Banner Header */}
      <div className="w-full lg:bg-gradient-to-bl from-[#429466] to-[#134D2D] rounded-[24px] p-5 md:p-12 text-center flex flex-col items-center gap-4 lg:shadow-xl">
        <div className="w-16 h-16 bg-gold-gradient rounded-full flex items-center justify-center shadow-lg border-2 border-white/10">
          <Sparkles className="text-red-900 w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-gold-gradient text-3xl md:text-4xl font-bold font-playfair">
            Increase Your Visibility
          </h1>
          <p className="text-black lg:text-white/90 text-sm md:text-lg max-w-2xl leading-relaxed">
            Boost your profile to appear higher in search results and get more
            responses from compatible matches.
          </p>
        </div>
      </div>

      {/* 2. Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-3 lg:px-0">
        {/* Left: Plan Selection Card */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col gap-6">
          <h2 className="text-stone-800 text-2xl font-bold font-playfair">
            Choose Boost Duration
          </h2>

          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-5 rounded-[20px] cursor-pointer transition-all border-2 flex items-center gap-4 ${
                  selectedPlan === plan.id
                    ? "bg-white border-amber-300 shadow-md ring-4 ring-amber-50"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-6 bg-gold-gradient px-3 py-0.5 h-6 flex items-center justify-center rounded-full shadow-sm">
                    <span className="text-red-900 text-[9px] font-black tracking-widest uppercase">
                      Popular
                    </span>
                  </div>
                )}

                {/* Custom Radio Button */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPlan === plan.id
                      ? "border-amber-300"
                      : "border-stone-300"
                  }`}
                >
                  {selectedPlan === plan.id && (
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-orange-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-[#4A9369] text-lg font-bold">
                    {plan.label}
                  </h3>
                  <p className="text-stone-500 text-xs">{plan.sub}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[#4A9369]">
                    <TrendingUp size={14} strokeWidth={3} />
                    <span className="text-xs font-bold">{plan.multiplier}</span>
                  </div>
                </div>

                <div className="text-[#4A9369] text-xl font-black">
                  {plan.price}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {/* ONLY CHANGED: Added onClick handler and disabled state */}
            <button 
              onClick={handlePayment} 
              disabled={loading}
              className=" cursor-pointer w-full py-4 bg-[#4A9369] hover:bg-[#3d7a57] text-white rounded-full font-bold text-lg shadow-lg active:scale-95 transition-all"
            >
              {loading ? "Processing..." : "Activate Boost"}
            </button>
            <p className="text-center text-stone-500 text-xs font-medium">
              Your boost will start immediately
            </p>
          </div>
        </div>

        {/* Right: How It Works Section */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-stone-800 text-2xl font-bold font-playfair">
            How It Works
          </h2>
          <div className="bg-[#F3DED3] rounded-[24px] p-6 md:p-8 border border-amber-300 shadow-sm flex flex-col gap-6">
            <BenefitItem
              title="Higher Search Ranking"
              desc="Your profile appears at the top of search results"
            />
            <BenefitItem
              title="More Relevant Matches"
              desc="Shown to profiles that match your preferences"
            />
            <BenefitItem
              title="Increased Response Rate"
              desc="Higher chances of getting interests and messages"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for benefits list
const BenefitItem = ({ title, desc }) => (
  <div className="flex gap-4 group">
    <div className="w-10 h-10 bg-[#4A9369] rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
      <Check className="text-white w-6 h-6" strokeWidth={3} />
    </div>
    <div className="space-y-1">
      <h4 className="text-[#4A9369] text-base font-bold leading-tight">
        {title}
      </h4>
      <p className="text-stone-600 text-xs leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default BoostProfile;
