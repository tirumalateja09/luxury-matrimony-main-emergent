"use client";

import React, { useEffect, useRef, useState } from "react";
import Select from "./CustomSelect";
import { components } from "react-select";
import { CaretDown } from "@phosphor-icons/react";
import { RASHI_OPTIONS, NAKSHATRA_OPTIONS } from "@/lib/constants";

const getPossessiveLabel = (value) => {
  switch (value) {
    case "Myself":
      return "Your";
    case "Daughter":
      return "Daughter's";
    case "Son":
      return "Son's";
    case "Sister":
      return "Sister's";
    case "Brother":
      return "Brother's";
    case "Relative":
      return "Relative's";
    case "Friend":
      return "Friend's";
    default:
      return "Your";
  }
};

// Custom Dropdown Indicator using Phosphor Icons
const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <CaretDown size={18} weight="bold" color="#666666" />
    </components.DropdownIndicator>
  );
};

const Horoscope = ({ data, onChange, profileCreatedFor, onNext }) => {
  const stepData = data || {};
  const possessiveLabel = getPossessiveLabel(profileCreatedFor);
  const [birthPlaceInput, setBirthPlaceInput] = useState(stepData.birthPlace || "");
  const [birthPlaceSuggestions, setBirthPlaceSuggestions] = useState([]);
  const [isBirthPlaceLoading, setIsBirthPlaceLoading] = useState(false);
  const [showBirthPlaceSuggestions, setShowBirthPlaceSuggestions] = useState(false);
  const birthPlaceRequestRef = useRef(0);

  // Custom scroll for React-Select dropdowns
  const handleMenuScroll = (id) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const isDesktop = window.innerWidth >= 768;
        const scrollContainer = isDesktop
          ? element.closest(".overflow-y-auto")
          : window;

        if (scrollContainer && scrollContainer !== window) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          scrollContainer.scrollTo({
            top: scrollContainer.scrollTop + elementRect.top - containerRect.top - 20,
            behavior: "smooth",
          });
        } else {
          const offsetPosition = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    }, 50);
  };

  // Parse existing birthTime or set defaults
  let currentHour = "01";
  let currentMinute = "00";
  let currentAmPm = "AM";

  if (stepData.birthTime) {
    const parts = stepData.birthTime.split(/[:\s]/);
    if (parts.length >= 3) {
      currentHour = parts[0];
      currentMinute = parts[1];
      currentAmPm = parts[2];
    }
  }

  const handleTimeChange = (type, value) => {
    let newH = currentHour;
    let newM = currentMinute;
    let newAP = currentAmPm;

    if (type === "hour") newH = value;
    if (type === "minute") newM = value;
    if (type === "ampm") newAP = value;

    onChange("birthTime", `${newH}:${newM} ${newAP}`);
  };

  useEffect(() => {
    setBirthPlaceInput(stepData.birthPlace || "");
  }, [stepData.birthPlace]);

  useEffect(() => {
    const query = birthPlaceInput.trim();

    if (query.length < 2) {
      setBirthPlaceSuggestions([]);
      setIsBirthPlaceLoading(false);
      return;
    }

    const requestId = birthPlaceRequestRef.current + 1;
    birthPlaceRequestRef.current = requestId;

    const timeoutId = setTimeout(async () => {
      try {
        setIsBirthPlaceLoading(true);
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
        );
        const result = await response.json();

        if (birthPlaceRequestRef.current !== requestId) return;

        const suggestions = (result.features || []).map((place) => {
          const properties = place.properties || {};
          const labelParts = [
            properties.name,
            properties.city,
            properties.state,
            properties.country,
          ].filter(Boolean);

          return {
            label: labelParts.join(", "),
            city: properties.city || properties.name || "",
            lat: place.geometry.coordinates[1],
            long: place.geometry.coordinates[0],
          };
        }).filter((place) => place.label && place.city);

        setBirthPlaceSuggestions(suggestions);
      } catch (error) {
        if (birthPlaceRequestRef.current === requestId) {
          setBirthPlaceSuggestions([]);
        }
        console.error("Birth place lookup failed:", error);
      } finally {
        if (birthPlaceRequestRef.current === requestId) {
          setIsBirthPlaceLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [birthPlaceInput]);

  const handleBirthPlaceInputChange = (value) => {
    setBirthPlaceInput(value);
    setShowBirthPlaceSuggestions(true);
    onChange("birthPlace", value);
    onChange("lat", "");
    onChange("long", "");
  };

  const handleBirthPlaceSelect = (suggestion) => {
    setBirthPlaceInput(suggestion.city);
    setBirthPlaceSuggestions([]);
    setShowBirthPlaceSuggestions(false);
    onChange("birthPlace", suggestion.city);
    onChange("lat", suggestion.lat);
    onChange("long", suggestion.long);
  };

  // Options Definitions
  const manglikOptions = ["Yes", "No", "Anshik"];

  const rashiOptions = RASHI_OPTIONS.map((r) => ({ value: r, label: r }));
  const manglikSelectOptions = manglikOptions.map((opt) => ({
    value: opt,
    label: opt,
  }));
  const nakshatraOptions = NAKSHATRA_OPTIONS.map((n) => ({
    value: n,
    label: n,
  }));

  // Options for Time
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const val = String(i + 1).padStart(2, "0");
    return { value: val, label: val };
  });

  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const val = String(i).padStart(2, "0");
    return { value: val, label: val };
  });

  const ampmOptions = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  // Styles for Main Selects
  const selectStyles = {
    menu: (base) => ({
      ...base,
      position: "relative",
      marginTop: "8px",
      borderRadius: "16px",
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "220px", // Sets a medium scrollable height
      overflowY: "auto",
    }),
    control: (base, state) => ({
      ...base,
      borderRadius: "9999px",
      padding: "6px 12px",
      borderColor: state.isFocused ? "#5D2E26" : "#888888",
      boxShadow: "none",
      minHeight: "48px",
      "&:hover": { borderColor: "#5D2E26" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#F6ECE6" : "white",
      color: "#333",
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  // Styles specifically for Time Selects
  const timeSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.75rem",
      padding: "2px 0px",
      borderColor: state.isFocused ? "#5D2E26" : "#888888",
      backgroundColor: "#FFFCF9",
      boxShadow: "none",
      minHeight: "50px",
      cursor: "pointer",
      "&:hover": { borderColor: "#5D2E26" },
      "@media (min-width: 768px)": {
        minHeight: "58px",
      },
    }),
    menu: (base) => ({
      ...base,
      position: "relative", // Changed to relative to push content down
      marginTop: "4px",
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "150px", // Strict 50px max height for the options wrapper
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#F6ECE6" : "white",
      color: "#333",
      cursor: "pointer",
      textAlign: "center",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    valueContainer: (base) => ({
      ...base,
      justifyContent: "center",
      padding: "0 4px",
    }),
    singleValue: (base) => ({
      ...base,
      textAlign: "center",
      marginLeft: "18px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 8px",
    }),
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-3xl mx-auto space-y-8 px-4 font-sans bg-[#FFFCF9] md:bg-transparent">

        {/* 3. Nakshatra Dropdown */}
        <div className="space-y-2" id="horoscope-nakshatra">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Nakshatra*
          </label>
          <Select
            options={nakshatraOptions}
            value={
              nakshatraOptions.find(
                (opt) => opt.value === stepData.nakshatra,
              ) || null
            }
            onChange={(selected) =>
              onChange("nakshatra", selected?.value || "")
            }
            placeholder="Select Nakshatra"
            isSearchable={true}
            styles={selectStyles}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("horoscope-nakshatra")}
          />
        </div>

        {/* 1. Rashi Selection */}
        <div className="space-y-4" id="horoscope-rashi">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Rashi*
          </label>
          <Select
            options={rashiOptions}
            value={
              rashiOptions.find((opt) => opt.value === stepData.rashi) || null
            }
            onChange={(selected) => onChange("rashi", selected?.value || "")}
            placeholder="Select Rashi"
            isSearchable
            styles={selectStyles}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("horoscope-rashi")}
          />
        </div>

        {/* 2. Manglik Status */}
        <div className="space-y-2" id="horoscope-manglik">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Manglik Status*
          </label>
          <Select
            options={manglikSelectOptions}
            value={
              manglikSelectOptions.find(
                (opt) => opt.value === stepData.manglik,
              ) || null
            }
            onChange={(selected) => onChange("manglik", selected?.value || "")}
            placeholder="Select Status"
            isSearchable
            styles={selectStyles}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("horoscope-manglik")}
          />
        </div>


        {/* 4. Gothram & Birth Time */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
              {possessiveLabel} Gothram*
            </label>
            <input
              type="text"
              value={stepData.gothram || ""}
              onChange={(e) => onChange("gothram", e.target.value)}
              placeholder="Enter Gothram"
              className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-full border text-gray-700 border-[#888888] md:border-gray-400 outline-none focus:border-[#5D2E26]"
            />
          </div>

          <div className="space-y-2" id="horoscope-time">
            <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
              {possessiveLabel} Birth Time*
            </label>

            {/* Switched to items-start so closed inputs don't jump down when the flex container height expands */}
            <div className="flex items-start gap-2 md:gap-3 max-w-sm">
              {/* Hour Dropdown */}
              <div className="flex-1">
                <Select
                  options={hourOptions}
                  value={hourOptions.find((opt) => opt.value === currentHour)}
                  onChange={(selected) =>
                    handleTimeChange("hour", selected.value)
                  }
                  styles={timeSelectStyles}
                  isSearchable
                  menuPlacement="bottom"
                  components={{ DropdownIndicator }}
                  onMenuOpen={() => handleMenuScroll("horoscope-time")}
                />
              </div>

              {/* Added mt-3/md:mt-4 to align the colon correctly with the inputs now that items-start is used */}
              <span className="text-xl font-bold text-gray-800 mt-3 md:mt-4">
                :
              </span>

              {/* Minute Dropdown */}
              <div className="flex-1">
                <Select
                  options={minuteOptions}
                  value={minuteOptions.find(
                    (opt) => opt.value === currentMinute,
                  )}
                  onChange={(selected) =>
                    handleTimeChange("minute", selected.value)
                  }
                  styles={timeSelectStyles}
                  isSearchable
                  menuPlacement="bottom"
                  components={{ DropdownIndicator }}
                  onMenuOpen={() => handleMenuScroll("horoscope-time")}
                />
              </div>

              {/* AM/PM Dropdown */}
              <div className="flex-1 ml-1 md:ml-2">
                <Select
                  options={ampmOptions}
                  value={ampmOptions.find((opt) => opt.value === currentAmPm)}
                  onChange={(selected) =>
                    handleTimeChange("ampm", selected.value)
                  }
                  styles={timeSelectStyles}
                  isSearchable
                  menuPlacement="bottom"
                  components={{ DropdownIndicator }}
                  onMenuOpen={() => handleMenuScroll("horoscope-time")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Birth Place */}
        <div className="space-y-2 relative">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Birth Place*
          </label>
          <input
            type="text"
            value={birthPlaceInput}
            onChange={(e) => handleBirthPlaceInputChange(e.target.value)}
            onFocus={() => setShowBirthPlaceSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowBirthPlaceSuggestions(false), 150);
            }}
            placeholder="e.g. Hyderabad, India"
            className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-full border text-gray-700 border-[#888888] md:border-gray-400 outline-none focus:border-[#5D2E26] bg-[#FFFCF9]"
          />
          {showBirthPlaceSuggestions &&
            (birthPlaceSuggestions.length > 0 ||
              isBirthPlaceLoading ||
              birthPlaceInput.trim().length >= 2) && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#E7B8A5] bg-white shadow-lg">
                {isBirthPlaceLoading && (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Searching places...
                  </div>
                )}
                {!isBirthPlaceLoading && birthPlaceSuggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.label}-${suggestion.lat}-${suggestion.long}`}
                    type="button"
                    onMouseDown={() => handleBirthPlaceSelect(suggestion)}
                    className="block w-full cursor-pointer px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-[#F6ECE6]"
                  >
                    {suggestion.label}
                  </button>
                ))}
                {!isBirthPlaceLoading &&
                  birthPlaceInput.trim().length >= 2 &&
                  birthPlaceSuggestions.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No places found.
                    </div>
                  )}
              </div>
            )}
        </div>

        <div className="shrink-0 pt-2 pb-26 hidden md:flex justify-end z-40 max-sm:mr-4 ">
          <button
            onClick={onNext}
            className={
              "w-[172px] h-[54px] rounded-full font-inter font-medium md:text-[18px] text-center text-[#2d2424] shadow-lg transition-all active:scale-95 hover:shadow-xl cursor-pointer"
            }
            style={{
              background:
                "linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%)",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Horoscope;
