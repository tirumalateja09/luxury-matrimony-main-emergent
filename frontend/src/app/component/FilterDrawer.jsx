"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Import your specific components
import AgeFilter from "./Filter/AgeFilter";
import HeightFilter from "./Filter/HeightFilter";
import ReligionFilter from "./Filter/ReligionFilter";
import MaritalStatusFilter from "./Filter/MaritalStatusFilter";
import CommunityFilter from "./Filter/CommunityFilter";
import MotherTongueFilter from "./Filter/MotherTongueFilter";
import StateFilter from "./Filter/StateFilter";
import CityFilter from "./Filter/CityFilter";
import AnnualIncomeFilter from "./Filter/AnnualIncomeFilter";
import HighestEducationFilter from "./Filter/HighestEducationFilter";
import ProfessionFilter from "./Filter/ProfessionFilter";
import DietFilter from "./Filter/DietFilter";
import ManglikFilter from "./Filter/ManglikFilter";

// Config to map IDs to Labels and Components
const FILTER_MENU = [
  { id: "age", label: "Age", component: AgeFilter },
  { id: "height", label: "Height", component: HeightFilter },
  { id: "religion", label: "Religion", component: ReligionFilter },
  { id: "marital", label: "Marital Status", component: MaritalStatusFilter },
  { id: "community", label: "Caste", component: CommunityFilter },
  { id: "motherTongue", label: "Mother Tongue", component: MotherTongueFilter },
  { id: "state", label: "State", component: StateFilter },
  { id: "city", label: "City", component: CityFilter },
  { id: "annualIncome", label: "Annual Income", component: AnnualIncomeFilter },
  { id: "highestEducation", label: "Highest Education", component: HighestEducationFilter },
  { id: "profession", label: "Profession", component: ProfessionFilter },
  { id: "diet", label: "Diet", component: DietFilter },
  { id: "manglik", label: "Manglik", component: ManglikFilter },
];

const FilterDrawer = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(FILTER_MENU[0].id);
  const router = useRouter();
  const searchParams = useSearchParams();

  // GLOBAL STATE: { age: [21, 25], religion: "Hindu" }
  const [filters, setFilters] = useState({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const minAge = Number(searchParams.get("minAge")) || null;
    const maxAge = Number(searchParams.get("maxAge")) || null;
    const minHeight = Number(searchParams.get("minHeight")) || null;
    const maxHeight = Number(searchParams.get("maxHeight")) || null;
    const religion = searchParams.get("religion") || "";
    const maritalStatus = searchParams.get("maritalStatus") || "";
    const community = searchParams.get("community") || "";
    const motherTongue = searchParams.get("motherTongue") || "";
    const state = searchParams.get("state") || "";
    const city = searchParams.get("city") || "";
    const annualIncome = searchParams.get("annualIncome") || "";
    const highestEducation = searchParams.get("highestEducation") || "";
    const profession = searchParams.get("profession") || "";
    const diet = searchParams.get("diet") || "";
    const manglik = searchParams.get("manglik") || "";

    setFilters((prev) => ({
      ...prev,
      age: minAge && maxAge ? [minAge, maxAge] : null,
      height: minHeight && maxHeight ? [minHeight, maxHeight] : null,
      religion,
      marital: maritalStatus,
      community,
      motherTongue,
      state,
      city,
      annualIncome,
      highestEducation,
      profession,
      diet,
      manglik,
    }));
  }, [isOpen, searchParams]);

  const handleFilterChange = (key, newValue) => {
    setFilters((prev) => {
      if (key === "state") {
        return { ...prev, state: newValue, city: "" };
      }
      return { ...prev, [key]: newValue };
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (filters.age?.length === 2) {
      params.set("minAge", String(filters.age[0]));
      params.set("maxAge", String(filters.age[1]));
    } else {
      params.delete("minAge");
      params.delete("maxAge");
    }

    if (filters.height?.length === 2) {
      params.set("minHeight", String(filters.height[0]));
      params.set("maxHeight", String(filters.height[1]));
    } else {
      params.delete("minHeight");
      params.delete("maxHeight");
    }

    if (filters.religion) {
      params.set("religion", filters.religion);
    } else {
      params.delete("religion");
    }

    if (filters.marital) {
      params.set("maritalStatus", filters.marital);
    } else {
      params.delete("maritalStatus");
    }

    if (filters.community) params.set("community", filters.community);
    else params.delete("community");

    if (filters.motherTongue) params.set("motherTongue", filters.motherTongue);
    else params.delete("motherTongue");

    if (filters.state) params.set("state", filters.state);
    else params.delete("state");

    if (filters.city) params.set("city", filters.city);
    else params.delete("city");

    if (filters.annualIncome) params.set("annualIncome", filters.annualIncome);
    else params.delete("annualIncome");

    if (filters.highestEducation) params.set("highestEducation", filters.highestEducation);
    else params.delete("highestEducation");

    if (filters.profession) params.set("profession", filters.profession);
    else params.delete("profession");

    if (filters.diet) params.set("diet", filters.diet);
    else params.delete("diet");

    if (filters.manglik) params.set("manglik", filters.manglik);
    else params.delete("manglik");

    router.push(`?${params.toString()}`);
    onClose();
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams);
    [
      "filterType",
      "minAge",
      "maxAge",
      "minHeight",
      "maxHeight",
      "religion",
      "maritalStatus",
      "community",
      "motherTongue",
      "state",
      "city",
      "annualIncome",
      "highestEducation",
      "profession",
      "diet",
      "manglik",
    ].forEach((key) => params.delete(key));
    setFilters({});
    router.push(`?${params.toString()}`);
  };

  const getActiveComponent = () => {
    const activeItem = FILTER_MENU.find(item => item.id === activeTab);
    const Component = activeItem?.component;
    
    if (!Component) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-end mb-6 pb-4 border-b sticky top-0 bg-white z-20">
          <h3 className="text-lg font-bold text-[#4A2C2A]">{activeItem.label}</h3>
          {filters[activeTab] && (
            <button onClick={() => handleFilterChange(activeTab, null)} className="text-xs font-bold text-[#D4A03D]">CLEAR</button>
          )}
        </div>
        
        {/* Render the specific component here */}
        <Component 
          value={filters[activeTab]} 
          onChange={(val) => handleFilterChange(activeTab, val)} 
          stateValue={filters.state}
        />
      </div>
    );
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white">
          <div className="flex items-center gap-3">
            <button onClick={onClose}><X size={24} className="text-gray-500 cursor-pointer" /></button>
            <h2 className="text-xl font-bold text-[#4A2C2A]">Filters</h2>
          </div>
          <button onClick={resetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500">RESET ALL</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-[35%] bg-[#FFFBF7] overflow-y-auto border-r">
            {FILTER_MENU.map((item) => (
              <div key={item.id} onClick={() => setActiveTab(item.id)}
                className={`px-5 py-4 cursor-pointer flex justify-between items-center ${activeTab === item.id ? "bg-white border-l-4 border-[#D4A03D]" : "text-gray-500"}`}>
                <span className={`text-sm font-medium ${activeTab === item.id ? "text-[#4A2C2A]" : ""}`}>{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} className="text-[#D4A03D]" />}
              </div>
            ))}
          </div>

          {/* Right Content */}
          <div className="w-[65%] bg-white p-6 overflow-y-auto">
            {getActiveComponent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center bg-white shadow-md z-30">
          <span className="text-sm text-gray-500"></span>
          {/* 1,200+ Matches */}
          <button onClick={applyFilters} className="bg-[#D4A03D] text-white px-8 py-3 rounded-full text-sm font-bold cursor-pointer shadow-lg">APPLY FILTERS</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FilterDrawer;
