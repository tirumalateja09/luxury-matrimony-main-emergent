"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Phone, Mail, Clock, Send } from "lucide-react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    queryType: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.emailAddress.trim() ||
      !formData.queryType.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    const phoneDigits = formData.phoneNumber.replace(/\D/g, "");
    const isValidIndianPhone = /^[6-9]\d{9}$/.test(phoneDigits);
    if (!isValidIndianPhone) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/contact/contact-us", {
        fullName: formData.fullName.trim(),
        phoneNumber: phoneDigits,
        emailAddress: formData.emailAddress.trim(),
        queryType: formData.queryType.trim(),
        message: formData.message.trim(),
      });

      if (res?.success) {
        toast.success(
          res?.message || "Your message has been submitted successfully.",
        );
        setFormData({
          fullName: "",
          phoneNumber: "",
          emailAddress: "",
          queryType: "",
          message: "",
        });
      } else {
        toast.error(res?.message || "Failed to submit your request.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[linear-gradient(180deg,_#FFF6EC_0%,_rgba(255,246,236,0)_52.14%)] py-5 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-center font-sans relative overflow-hidden`}
    >
      <Image
        src={"/contact/mandala1.svg"}
        height={250}
        width={200}
        alt="mandala1"
        className="absolute right-0 top-1/2 -translate-y-1/2"
      />

      {/* Added items-stretch to ensure grid children can fill height */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 items-stretch">
        {/* --- LEFT COLUMN: Contact Info --- */}
        {/* Added h-full and justify-between to spread cards, or you can use justify-start */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <h2 className="text-4xl text-[#5E2E2E] font-playfair font-semibold mb-2">
            Get in Touch
          </h2>

          <div className="flex-1 flex flex-col gap-6">
            {/* Card 1: Call Support */}
            {/* Added flex-1 to make cards grow to fill the available height evenly */}
            <div className="bg-[#FFF5EB] border border-[#F5E6D8] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col justify-center">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Phone className="w-6 h-6 text-[#4F9168]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#1F1F1F] mb-1">
                    Call Support
                  </h3>
                  <p className="text-[#4F9168] font-medium">+91-9700900532</p>
                  <p className="text-[#4F9168] font-medium">+91-9951884885</p>
                </div>
              </div>
              <p className="text-[#7B6A64] text-sm mt-5">
                Available during business hours
              </p>
            </div>

            {/* Card 2: Email Support */}
            <div className="bg-[#FFF5EB] border border-[#F5E6D8] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col justify-center">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Mail className="w-6 h-6 text-[#4F9168]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#1F1F1F] mb-1">
                    Email Support
                  </h3>
                  <p className="text-[#4F9168] font-medium break-all">
                    rvrluxurymatrimony@gmail.com
                  </p>
                </div>
              </div>
              <p className="text-[#7B6A64] text-sm mt-5">
                Available during business hours
              </p>
            </div>

            {/* Card 3: Support Hours */}
            <div className="bg-[#FFF5EB] border border-[#F5E6D8] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col justify-center">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Clock className="w-6 h-6 text-[#4F9168]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#1F1F1F] mb-1">
                    Support Hours
                  </h3>
                  <p className="text-[#5E2E2E] font-bold text-sm">
                    Monday - Saturday
                  </p>
                  <p className="text-[#8D7F75] text-sm mb-2">
                    9:00 AM - 7:00 PM IST
                  </p>
                  <p className="text-[#5E2E2E] font-bold text-sm">Sunday</p>
                  <p className="text-[#8D7F75] text-sm">
                    10:00 AM - 5:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Form --- */}
        {/* Added h-full to ensure the white background stretches if the left column is ever taller */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-[#F0E4D8] h-full">
          <h2 className="text-4xl text-[#5E2E2E] font-playfair font-semibold mb-3">
            Send us a Message
          </h2>
          <p className="text-[#8D7F75] mb-8">
            Fill out the form below and we&apos;ll get back to you shortly
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#1F1F1F] font-bold text-sm">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 text-gray-800 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F9168]/20 focus:border-[#4F9168] transition-all bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#1F1F1F] font-bold text-sm">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleChange(
                      "phoneNumber",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="+91 XXXXX XXXXX"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9]{1}[0-9]{9}"
                  className="w-full px-4 text-gray-800 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F9168]/20 focus:border-[#4F9168] transition-all bg-white"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#1F1F1F] font-bold text-sm">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleChange("emailAddress", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 text-gray-800 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F9168]/20 focus:border-[#4F9168] transition-all bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#1F1F1F] font-bold text-sm">
                  Query Type *
                </label>
                <select
                  value={formData.queryType}
                  onChange={(e) => handleChange("queryType", e.target.value)}
                  required
                  className="w-full px-4 text-gray-800 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F9168]/20 focus:border-[#4F9168] transition-all bg-white text-gray-500"
                >
                  <option value="">Select a query type</option>
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing</option>
                  <option>Payment Issue</option>
                </select>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex flex-col gap-2">
              <label className="text-[#1F1F1F] font-bold text-sm">
                Message *
              </label>
              <textarea
                rows={6}
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Please describe your query in detail..."
                required
                className="w-full px-4 text-gray-800 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F9168]/20 focus:border-[#4F9168] transition-all bg-white resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#488B64] hover:bg-[#3d7a55] text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#488B64]/20"
            >
              <Send className="w-5 h-5" />
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
