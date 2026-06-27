"use client";

import React, { useState } from "react";
import { ChevronLeft, Camera, ChevronDown } from "lucide-react";

export default function BasicDetailsForm() {
  const [gender, setGender] = useState("Male");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");

  return (
    <div className="w-full max-w-2xl  mt-8 mx-auto flex flex-col gap-8 p-4 font-inter">
      {/* 1. Scrollable Form Container */}
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 pb-12">
        {/* Full Name */}
        <FormGroup label="Full Name">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full h-14 p-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 text-stone-800"
          />
        </FormGroup>

        {/* Gender Selection */}
        <FormGroup label="Select your Gender">
          <div className="flex flex-wrap gap-3">
            {["Male", "Female"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-6 py-2 rounded-3xl text-sm font-medium transition-all border ${
                  gender === g
                    ? "bg-orange-50 border-stone-500 text-stone-800 shadow-sm"
                    : "bg-white border-stone-300 text-stone-500"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </FormGroup>

        {/* Date of Birth & Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="Enter your Date of Birth">
            <div className="relative">
              <input
                type="text"
                placeholder="dd-mm-yyyy"
                className="w-full h-14 p-4 bg-white rounded-3xl border border-stone-300 focus:outline-none"
              />
              <ChevronDown className="absolute right-4 top-4 text-stone-500 w-5 h-5" />
            </div>
          </FormGroup>

          <FormGroup label="What is your Height?">
            <input
              type="text"
              placeholder="Enter Height"
              className="w-full h-14 p-4 bg-white rounded-3xl border border-stone-300 focus:outline-none"
            />
          </FormGroup>
        </div>

        {/* Marital Status */}
        <FormGroup label="What is your marital status?">
          <div className="flex flex-wrap gap-2.5">
            {[
              "Never Married",
              "Awaiting Divorce",
              "Divorced",
              "Widowed",
              "Annulled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setMaritalStatus(status)}
                className={`px-5 py-2 rounded-3xl text-sm font-medium transition-all border ${
                  maritalStatus === status
                    ? "bg-orange-50 border-stone-500 text-stone-800"
                    : "bg-white border-stone-300 text-stone-500"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </FormGroup>

        {/* Multi-Column Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Languages/Community */}
          <div className="flex flex-col gap-6">
            <FormGroup label="Mother Tongue">
              <SelectBox placeholder="Tamil" />
            </FormGroup>
            <FormGroup label="Community">
              <SelectBox placeholder="Reddy" />
            </FormGroup>
            <FormGroup label="Sub-Community (Optional)">
              <SelectBox placeholder="Select" />
            </FormGroup>
          </div>

          {/* Location Details */}
          <div className="flex flex-col gap-6">
            <FormGroup label="City">
              <SelectBox placeholder="Select City" />
            </FormGroup>
            <FormGroup label="State">
              <SelectBox placeholder="Select State" />
            </FormGroup>
            <FormGroup label="Country">
              <SelectBox placeholder="Select Country" />
            </FormGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper Components for cleaner code */
function FormGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2">
      <label className="text-red-900 text-sm font-semibold font-inter">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectBox({ placeholder }) {
  return (
    <div className="w-full h-14 px-4 bg-white rounded-3xl border border-stone-300 flex justify-between items-center cursor-pointer hover:border-stone-400 transition-colors">
      <span className="text-stone-800 text-base">{placeholder}</span>
      <ChevronDown className="w-5 h-5 text-stone-400" />
    </div>
  );
}
