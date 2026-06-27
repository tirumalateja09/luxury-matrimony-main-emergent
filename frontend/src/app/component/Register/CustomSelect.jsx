"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  isSearchable = true,
  isMulti = false, // ADDED: Support for multi-select
  id,
  onMenuOpen,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // NEW: State to hold the dynamically calculated max-height for the dropdown
  const [menuMaxHeight, setMenuMaxHeight] = useState(240); // default to 240px (15rem)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus({ preventScroll: true });
      }, 50);
    } else {
      setSearchTerm(""); // Reset search when closed
    }
  }, [isOpen, isSearchable]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // NEW: Helper to check if an option is currently selected
  const isOptionSelected = (opt) => {
    if (isMulti) {
      return Array.isArray(value) && value.some((v) => v.value === opt.value);
    }
    const currentValue = value && typeof value === "object" ? value.value : value;
    return currentValue === opt.value;
  };

  // NEW: Handle selection logic for both single and multi-select
  const handleSelect = (option) => {
    if (isMulti) {
      const currentSelected = Array.isArray(value) ? value : [];
      const alreadySelected = currentSelected.some((v) => v.value === option.value);

      let newSelected;
      if (alreadySelected) {
        // Remove item if it's already selected
        newSelected = currentSelected.filter((v) => v.value !== option.value);
      } else {
        // Add item
        newSelected = [...currentSelected, option];
      }
      onChange(newSelected);
      // Notice we do NOT close the dropdown for multi-select so users can keep clicking
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  // Determine the display label for the trigger button
  let displayLabel = placeholder;
  let hasSelection = false;

  if (isMulti) {
    if (Array.isArray(value) && value.length > 0) {
      displayLabel = value.map((v) => v.label).join(", ");
      hasSelection = true;
    }
  } else {
    const currentValue = value && typeof value === "object" ? value.value : value;
    const selectedOpt = options.find((opt) => opt.value === currentValue);
    if (selectedOpt) {
      displayLabel = selectedOpt.label;
      hasSelection = true;
    }
  }

  return (
    <div className="relative w-full" ref={dropdownRef} id={id}>
      {/* --- TRIGGER BUTTON --- */}
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          const nextState = !isOpen;

          if (nextState) {
            // Calculate available height below the button
            if (dropdownRef.current) {
              const rect = dropdownRef.current.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const spaceAbove = rect.top;

              // Give 20px padding from the bottom edge of the screen
              // If space below is less than 150px but we have more space above, 
              // we might want to open upwards (future enhancement, for now we just cap height)
              const calculatedHeight = Math.max(150, spaceBelow - 20);

              // We don't want it to be infinitely tall, cap it at say 350px
              setMenuMaxHeight(Math.min(350, calculatedHeight));
            }
          }

          setIsOpen(nextState);
          if (nextState && onMenuOpen) onMenuOpen();
        }}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-full border bg-white text-left transition-colors focus:outline-none focus:border-[#5D2E26] ${disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
          : isOpen
            ? "border-[#5D2E26]"
            : "border-gray-300 hover:border-[#5D2E26]"
          }`}
      >
        <span className={`truncate mr-4 ${disabled ? "text-gray-400" : hasSelection ? "text-gray-800" : "text-[#888888]"}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${disabled ? "text-gray-300" : "text-gray-500"} ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* --- DROPDOWN MENU --- */}
      {isOpen && (
        <div className="w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

          {/* Search Bar */}
          {isSearchable && (
            <div className="p-3 bg-white border-b border-gray-100 sticky top-0 z-10">
              <div className="flex items-center w-full px-3 py-2 border border-[#F3DED3] rounded-[10px] bg-white focus-within:border-[#5D2E26] transition-colors">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search"
                  className="w-full text-[15px] outline-none bg-transparent text-[#5D2E26] placeholder:text-[#A8A8A8]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <ul
            className="overflow-y-auto no-scrollbar p-2"
            style={{ maxHeight: `${menuMaxHeight}px` }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option,index) => {
                const isSelected = isOptionSelected(option);

                return (
                  <li
                    key={`${option.value}-${index}`} // Added index to ensure unique keys in case of duplicate values
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-2.5 mb-1 flex justify-between items-center last:mb-0 cursor-pointer transition-colors rounded-[6px] ${isSelected
                      ? "bg-[#F3DED3] text-[#5D2E26] font-medium"
                      : "hover:bg-[#F3DED3] text-gray-700"
                      }`}
                  >
                    <span className="truncate pr-2">{option.label}</span>

                    {/* Render a checkmark for selected multi-select items */}
                    {isMulti && isSelected && (
                      <Check className="w-4 h-4 text-[#5D2E26] shrink-0" />
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-5 py-4 text-center text-gray-500">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
