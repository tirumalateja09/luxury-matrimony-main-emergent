"use client";
import React, { createContext, useContext, useState } from "react";
// Make sure this path points to your actual FilterDrawer component
// If FilterDrawer is in src/app/component/FilterDrawer, use this:
import FilterDrawer from "@/app/component/FilterDrawer"; 

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <FilterContext.Provider value={{ isFilterOpen, setIsFilterOpen }}>
      {children}
      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};