"use client";

import React, { useState } from "react";
import Select from "./CustomSelect";
import { allTongues, CASTES_BY_RELIGION } from "@/lib/constants";
import ProgressBar from "./ProgressBar";

// --- Helper for Shared Custom Labels ---
const CustomLabel = ({ children, className = "", isMandatory = true }) => (
  <label
    className={`block mb-3 ${className}`}
    style={{
      color: "var(--Primary-01, #6E2F2F)",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 500,
      lineHeight: "normal",
    }}
  >
    {children} {isMandatory && "*"}
  </label>
);

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

const Community = ({ data, onChange, profileCreatedFor, onNext }) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const possessiveLabel = getPossessiveLabel(profileCreatedFor);

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

  const religionOptions = Object.keys(CASTES_BY_RELIGION).map((rel) => ({
    value: rel,
    label: rel,
  }));

  const tongueOptions = allTongues.map((tongue) => ({
    value: tongue,
    label: tongue,
  }));

  const casteOptions = [
    ...(CASTES_BY_RELIGION[data.religion] || []).map((caste) => ({
      value: caste,
      label: caste,
    })),
    { value: "__other__", label: "Other" },
  ];

  const handleReligionChange = (selected) => {
    const nextReligion = selected?.value || "";
    if (nextReligion !== data.religion) {
      onChange("religion", nextReligion);
      onChange("community", "");
      onChange("subCommunity", "");
      setShowOtherInput(false);
      return;
    }
    onChange("religion", nextReligion);
  };

  const handleCasteChange = (selected) => {
    if (selected?.value === "__other__") {
      setShowOtherInput(true);
      onChange("community", "");
      return;
    }
    setShowOtherInput(false);
    onChange("community", selected?.value || "");
  };

  const selectedCasteOption =
    casteOptions.find((opt) => opt.value === data.community) ||
    (showOtherInput ? { value: "__other__", label: "Other" } : null);

  const selectedReligionOption =
    religionOptions.find((opt) => opt.value === data.religion) || null;

  const selectedTongueOption =
    tongueOptions.find((opt) => opt.value === data.motherTongue) || null;

  // --- REUSABLE STYLES FOR REACT-SELECT ---
  const getSelectStyles = () => ({
    menu: (base) => ({
      ...base,
      position: "relative", // Pushes content down
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
      "&:hover": {
        borderColor: "#5D2E26",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#F6ECE6" : "white",
      color: "#333",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#888888",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#333",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#666",
    }),
  });

  return (
    <div className="flex flex-col w-full space-y-8 px-4 font-sans">
      {/* --- Mother Tongue Section --- */}
      <div id="desktop-motherTongue">
        <CustomLabel>{possessiveLabel} Mother Tongue</CustomLabel>

        <Select
          options={tongueOptions}
          value={selectedTongueOption}
          onChange={(selected) =>
            onChange("motherTongue", selected?.value || "")
          }
          placeholder="Select Mother Tongue"
          isSearchable
          styles={getSelectStyles()}
          menuShouldScrollIntoView={false} // Prevents jarring scroll jumps
          onMenuOpen={() => handleMenuScroll("desktop-motherTongue")}
        // Removed menuPortalTarget and menuPosition to allow push-down
        />
      </div>
      {/* --- Religion Section --- */}
      <div>
        <div id="desktop-religion">
          <CustomLabel>{possessiveLabel} Religion</CustomLabel>

          <Select
            options={religionOptions}
            value={selectedReligionOption}
            onChange={handleReligionChange}
            placeholder="Select Religion"
            isSearchable
            styles={getSelectStyles()}
            menuShouldScrollIntoView={false} // Prevents jarring scroll jumps
            onMenuOpen={() => handleMenuScroll("desktop-religion")}
          />
        </div>
      </div>
      {/* --- Caste Section --- */}
      {data.religion ? (
        <div id="desktop-caste">
          <CustomLabel>{possessiveLabel} Caste</CustomLabel>

          <Select
            options={casteOptions}
            value={selectedCasteOption}
            onChange={handleCasteChange}
            placeholder="Select Caste"
            isSearchable
            styles={getSelectStyles()}
            menuShouldScrollIntoView={false} // Prevents jarring scroll jumps
            onMenuOpen={() => handleMenuScroll("desktop-caste")}
          // Removed menuPortalTarget and menuPosition to allow push-down
          />

          {showOtherInput && (
            <div className="mt-4">
              <input
                autoFocus
                type="text"
                value={data.community || ""}
                onChange={(e) => onChange("community", e.target.value)}
                placeholder="Type your caste"
                className="w-full px-5 py-3 rounded-full border border-[#5D2E26] text-gray-800 outline-none"
              />
            </div>
          )}
        </div>
      ) : null}

      {/* --- Sub-Community Section --- */}
      {data.community ? (
        <div>
          <CustomLabel isMandatory={false}>{possessiveLabel} Sub-Caste (Optional)</CustomLabel>
          <input
            type="text"
            value={data.subCommunity || ""}
            onChange={(e) => onChange("subCommunity", e.target.value)}
            placeholder="e.g. Padmashali, Iyengar"
            className="w-full px-5 py-4 rounded-full border border-[#888888] text-gray-800 outline-none focus:border-[#5D2E26]"
          />
        </div>
      ) : null}

      <div className="shrink-0 pt-2 pb-16 hidden md:flex justify-end z-40 max-sm:mr-4 ">
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
  );
};

export default Community;