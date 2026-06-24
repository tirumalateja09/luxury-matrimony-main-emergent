"use client";

import { useState } from "react";

const faqData = [
  {
    question: "How does profile verification work?",
    answer:
      "Profile verification involves multiple steps including phone verification, government ID verification via DigiLocker, live photo verification, and optional family verification. Verified profiles receive a trust badge and get 3x more responses.",
  },
  {
    question: "How can I upgrade my Membership?",
    answer:
      "You can upgrade your membership by visiting the Membership section. We offer various plans designed to help you connect with more matches and access premium features like unlimited messaging and horoscope matching.",
  },
  {
    question: "How do I contact a match?",
    answer:
      "First, send an interest to the profile you like. Once they accept your interest, you can start messaging directly through our secure chat system. Your contact details remain private until both parties agree to share.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security very seriously. All your personal information is encrypted and stored securely. Your photos are blurred by default, and contact details are never shared without your consent. We comply with all data protection regulations.",
  },
  {
    question: "Can parents manage profile?",
    answer:
      "Absolutely. Our platform is designed for both self-managed and parent-managed profiles. Parents can create and manage profiles on behalf of their son or daughter with full access to all features.",
  },
  {
    question: "What if i need to pause my profile?",
    answer:
      "You can temporarily hide your profile from search results at any time from Settings. Your data remains safe, and you can reactivate whenever you're ready to continue your matrimony journey.",
  },
];

export default function FAQSection() {
  // Changed initial state from null to 0 to keep the first item open
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 md:px-8 lg:px-12 bg-white p-4">
      <div className="w-full max-w-[974px] space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="overflow-hidden w-full rounded-2xl font-playfair border-[#E5D5C3] border-[0.8px] shadow-[0_0_20px_rgba(0,0,0,0.15)]"
          >
            {/* Header / Button */}
            <button
              onClick={() => toggleFAQ(index)}
              className={`flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-200 bg-[#F3DED3]`}
            >
              {/* Question Text - Using Serif to match image */}
              <span className=" font-playfair text-lg md:text-2xl font-semibold text-[#2A1D1D]">
                {item.question}
              </span>

              {/* Chevron Icon */}
              <span
                className={`transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#3d2e2b]"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {/* Content / Answer (Collapsible) */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index
                  ? " max-h-60 md:max-h-40 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className=" px-6 py-10 text-[#6E2F2F] font-inter text-lg">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
