"use client";
import React from "react";
import { Search } from "lucide-react";
import { useFilter } from "@/context/FilterContext";

const SearchInput = ({ 
  className = "", 
  containerClassName = "", 
  placeholder = "Search your match",
  ...props 
}) => {
  // Try to get context, fallback if not wrapped (prevents crashing if tested in isolation)
  const context = useFilter();
  const setIsFilterOpen = context?.setIsFilterOpen || (() => {});

  return (
    <div 
      // Merged your container classes here
      className={`relative group cursor-pointer ${containerClassName}`}
      onClick={() => setIsFilterOpen(true)}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="text-green-700" size={20} />
      </div>
      <input
        type="text"
        readOnly // Prevents mobile keyboard from popping up before the drawer opens
        placeholder={placeholder}
        // Merged your exact input classes here
        className={`w-full h-full pl-11 pr-4 bg-white rounded-full border border-[#E3B450] text-stone-600 placeholder:text-stone-400 text-base font-normal font-['Inter'] outline-none focus:ring-1 focus:ring-[#E3B450] transition-all cursor-pointer ${className}`}
        {...props}
      />
    </div>
  );
};

export default SearchInput;