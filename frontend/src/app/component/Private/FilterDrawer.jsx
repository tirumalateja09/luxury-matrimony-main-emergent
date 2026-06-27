"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

const categories = [
  "Types of Matches",
  "Religion",
  "Community",
  "Sub-Community",
  "Mother Tongue",
  "City",
  "State",
  "Income",
  "Education",
  "Employed In",
  "Occupation",
];

// Mock data for the right side
const filterOptions = {
  "Types of Matches": ["All", "Verified", "Just Joined", "Top Matches"],
  "Religion": ["Hindu", "Christian", "Muslim", "Sikh", "Jain"],
  "Community": ["Iyer", "Iyengar", "Naidu", "Reddy"],
  // Add more mock data as needed
};

const FilterDrawer = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("Types of Matches");
  const [selectedFilters, setSelectedFilters] = useState([]);

  if (!isOpen) return null;

  const toggleFilter = (option) => {
    if (selectedFilters.includes(option)) {
      setSelectedFilters(selectedFilters.filter((item) => item !== option));
    } else {
      setSelectedFilters([...selectedFilters, option]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end ">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
          <h2 className="text-xl font-playfair font-bold text-[#2f4f38]">Filters</h2>
          <span className="text-sm text-gray-500">3238 Matches</span>
        </div>

        {/* Filter Tabs (Pills) */}
        <div className="px-6 py-4 flex gap-3">
          <button className="px-6 py-1.5 rounded-full border border-[#E3B450] text-[#4A2C2A] text-sm font-medium bg-[#FFFbf0]">
            Filter 1
          </button>
          <button className="px-6 py-1.5 rounded-full border border-[#E3B450] text-[#4A2C2A] text-sm font-medium hover:bg-[#FFFbf0]">
            Filter 2
          </button>
        </div>

        {/* Main Content: Split View */}
        <div className="flex flex-1 overflow-hidden border-t border-gray-100">
          
          {/* Left Sidebar (Categories) */}
          <div className="w-[40%] bg-[#FFF8F0] overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  relative px-4 py-4 text-sm font-medium cursor-pointer transition-colors
                  ${
                    activeCategory === cat
                      ? "text-[#4A2C2A] bg-white"
                      : "text-gray-500 hover:text-[#4A2C2A]"
                  }
                `}
              >
                {activeCategory === cat && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4A03D] rounded-r-full" />
                )}
                {cat}
              </div>
            ))}
          </div>

          {/* Right Content (Checkboxes) */}
          <div className="w-[60%] bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
               {/* Small dot decoration from image */}
               <span className="w-2 h-2 rounded-full bg-[#D4A03D]"></span>
               <button 
                 onClick={() => setSelectedFilters([])}
                 className="text-xs font-bold text-gray-500 tracking-wider hover:text-red-500"
               >
                 CLEAR
               </button>
            </div>

            <div className="space-y-4">
              {(filterOptions[activeCategory] || ["No options available"]).map((option) => (
                <label key={option} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-[#6B5B52] group-hover:text-[#2A1D1D]">{option}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedFilters.includes(option)}
                      onChange={() => toggleFilter(option)}
                    />
                    <div className="w-5 h-5 border-2 border-[#E3B450] rounded bg-white peer-checked:bg-[#E3B450] peer-checked:border-[#E3B450] transition-all"></div>
                    {/* Checkmark SVG */}
                    <svg
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-4">
          <button className="flex-1 py-3 rounded-full border border-[#4A2C2A] text-[#4A2C2A] font-semibold text-sm hover:bg-gray-50">
            Save Settings
          </button>
          <button className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-[#4A2C2A] font-bold text-sm shadow-md hover:shadow-lg">
            APPLY
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterDrawer;