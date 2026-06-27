"use client";

import React, { useEffect, useMemo } from "react";
import Select from "./CustomSelect";
import isoCountryCurrency from "iso-country-currency";
import { DEGREE_OPTIONS, INCOME_SLABS, PROFESSION_OPTIONS } from "@/lib/constants";

// --- NEW: Helper to get the symbol (e.g., USD -> $, EUR -> €) ---
const getCurrencySymbol = (currencyCode) => {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    });
    // Extracts just the symbol part from the formatter
    return formatter.formatToParts(0).find((part) => part.type === "currency")
      .value;
  } catch (error) {
    return currencyCode; // Fallback to the 3-letter code if symbol isn't found
  }
};

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

const getFilteredDegreeOptions = (
  highestEducation,
  degreeSectionOrder,
  degreeSectionMarkers,
) => {
  if (!highestEducation) return [];

  const startMarker = degreeSectionMarkers[highestEducation];
  if (!startMarker) return [];

  const startIndex = DEGREE_OPTIONS.indexOf(startMarker);
  if (startIndex === -1) return [];

  const currentIndex = degreeSectionOrder.indexOf(highestEducation);
  let endIndex = DEGREE_OPTIONS.length;

  for (let i = currentIndex + 1; i < degreeSectionOrder.length; i += 1) {
    const marker = degreeSectionMarkers[degreeSectionOrder[i]];
    const idx = DEGREE_OPTIONS.indexOf(marker);
    if (idx !== -1) {
      endIndex = idx;
      break;
    }
  }

  return DEGREE_OPTIONS.slice(startIndex, endIndex);
};

const DEGREE_SECTION_ORDER = [
  "Doctorate",
  "Civil Services / Elite",
  "Professional / Finance",
  "Post graduate/Master's",
  "Graduate/Bachelor's",
  "Diploma/Certifications",
  "Class XII",
  "Class X or below",
];

const DEGREE_SECTION_MARKERS = {
  Doctorate: "Ph.D. - Doctor of Philosophy",
  "Civil Services / Elite": "IAS - Indian Administrative Service",
  "Professional / Finance": "CA - Chartered Accountant",
  "Post graduate/Master's": "MBA - Master of Business Administration",
  "Graduate/Bachelor's": "MBBS - Bachelor of Medicine, Bachelor of Surgery",
  "Diploma/Certifications": "Diploma",
  "Class XII": "12th Pass - Higher Secondary",
};

const EducationAndProfession = ({
  data,
  onChange,
  profileCreatedFor,
  onNext,
}) => {
  const stepData = data || {};
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

  const educationOptions = [
    "Doctorate",
    "Civil Services / Elite",
    "Professional / Finance",
    "Post graduate/Master's",
    "Graduate/Bachelor's",
    "Diploma/Certifications",
    "Class XII",
    "Class X or below",
  ];

  const educationSelectOptions = educationOptions.map((opt) => ({
    value: opt,
    label: opt,
  }));

  const professionSelectOptions = useMemo(
    () => PROFESSION_OPTIONS.map((opt) => ({ value: opt, label: opt })),
    []
  );

  const filteredDegreeBaseOptions = useMemo(
    () =>
      getFilteredDegreeOptions(
        stepData.highestEducation,
        DEGREE_SECTION_ORDER,
        DEGREE_SECTION_MARKERS,
      ),
    [stepData.highestEducation],
  );

  const isOtherSelected =
    !!stepData.highestEducation &&
    (stepData.degree === "Other" ||
      (stepData.degree &&
        !filteredDegreeBaseOptions.includes(stepData.degree)));

  const degreeOptions = filteredDegreeBaseOptions.map((d) => ({
    value: d,
    label: d,
  }));

  if (stepData.highestEducation) {
    degreeOptions.push({ value: "Other", label: "Other" });
  }

  const currencyOptions = useMemo(() => {
    const allCodes = isoCountryCurrency.getAllISOCodes();

    const rawOptions = allCodes.map((c) => ({
      value: c.currency,
      label: `${c.currency} - ${c.countryName}`,
    }));

    const uniqueOptionsMap = new Map();
    rawOptions.forEach((opt) => {
      if (!uniqueOptionsMap.has(opt.label)) {
        uniqueOptionsMap.set(opt.label, opt);
      }
    });

    const formattedOptions = Array.from(uniqueOptionsMap.values());
    formattedOptions.sort((a, b) => a.label.localeCompare(b.label));

    const inrIndex = formattedOptions.findIndex((o) => o.value === "INR");
    if (inrIndex > -1) {
      const inr = formattedOptions.splice(inrIndex, 1)[0];
      formattedOptions.unshift(inr);
    }

    return formattedOptions;
  }, []);

  // --- UPDATED: Retrieve the symbol and replace '₹' with it ---
  const currentCurrency = stepData.currency || "INR";
  const incomeOptions = useMemo(() => {
    const symbol = getCurrencySymbol(currentCurrency);

    return INCOME_SLABS.map((slab) => {
      // Replaces the ₹ symbol with the new symbol (e.g., "$", "€")
      const label = slab.replace("₹", symbol);

      return {
        value: slab, // Keep original value intact for your database
        label,
      };
    });
  }, [currentCurrency]);

  useEffect(() => {
    if (!stepData.highestEducation && stepData.degree) {
      onChange("degree", "");
      return;
    }

    if (
      stepData.degree &&
      stepData.degree !== "Other" &&
      !filteredDegreeBaseOptions.includes(stepData.degree)
    ) {
      onChange("degree", "");
    }

    if (!stepData.currency) {
      onChange("currency", "INR");
    }
  }, [
    stepData.highestEducation,
    stepData.degree,
    stepData.currency,
    filteredDegreeBaseOptions,
    onChange,
  ]);

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
      borderColor: state.isFocused ? "#5D2E26" : "#9CA3AF",
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
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const handleDegreeChange = (val) => {
    if (val === "Other") {
      onChange("degree", "Other");
    } else {
      onChange("degree", val);
    }
  };

  return (
    <div className="w-full px-4 sm:px-0 max-w-2xl mx-auto space-y-8 font-sans bg-[#FFFCF9] md:bg-transparent">
      {/* 1. Highest Education */}
      <div className="space-y-4" id="edu-highest">
        <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
          Tell us {possessiveLabel} Highest Education *
        </label>
        <Select
          options={educationSelectOptions}
          value={
            educationSelectOptions.find(
              (opt) => opt.value === stepData.highestEducation,
            ) || null
          }
          onChange={(selected) =>
            onChange("highestEducation", selected?.value || "")
          }
          placeholder="Select Education"
          isSearchable
          styles={selectStyles}
          menuShouldScrollIntoView={false}
          onMenuOpen={() => handleMenuScroll("edu-highest")}
        />
      </div>

      {/* 2. Degree Selection */}
      <div className="space-y-2" id="edu-degree">
        <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
          Select {possessiveLabel} Qualification *
        </label>
        <Select
          options={degreeOptions}
          value={
            degreeOptions.find(
              (opt) =>
                opt.value === stepData.degree ||
                (opt.value === "Other" &&
                  stepData.degree &&
                  !filteredDegreeBaseOptions.includes(stepData.degree)),
            ) || null
          }
          onChange={(selected) => handleDegreeChange(selected?.value || "")}
          placeholder={
            stepData.highestEducation
              ? "Select Qualification"
              : "Select Highest Education first"
          }
          isDisabled={!stepData.highestEducation}
          isSearchable
          styles={selectStyles}
          menuShouldScrollIntoView={false}
          onMenuOpen={() => handleMenuScroll("edu-degree")}
        />
        {isOtherSelected && (
          <input
            type="text"
            autoFocus
            value={stepData.degree === "Other" ? "" : stepData.degree}
            onChange={(e) => onChange("degree", e.target.value)}
            placeholder="Type your degree name"
            className="w-full mt-3 px-5 md:px-6 py-3.5 md:py-4 rounded-full border border-[#5D2E26] outline-none animate-in fade-in shadow-sm"
          />
        )}
      </div>

      {/* 3. Profession & Income */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2" id="edu-profession">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Profession *
          </label>
          <Select
            options={professionSelectOptions}
            value={
              professionSelectOptions.find(
                (opt) => opt.value === stepData.profession,
              ) || null
            }
            onChange={(selected) =>
              onChange("profession", selected?.value || "")
            }
            placeholder="Select Profession"
            isSearchable
            styles={selectStyles}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("edu-profession")}
          />
        </div>

        {/* Currency Dropdown */}
        <div className="space-y-2" id="edu-currency">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Currency *
          </label>
          <Select
            options={currencyOptions}
            value={
              currencyOptions.find(
                (opt) => opt.value === (stepData.currency || "INR"),
              ) || currencyOptions[0]
            }
            onChange={(selected) =>
              onChange("currency", selected?.value || "INR")
            }
            placeholder="Select Currency"
            isSearchable={true}
            styles={selectStyles}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("edu-currency")}
          />
        </div>

        {/* Income Slab Dropdown */}
        <div className="space-y-2" id="edu-income">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Annual Income (LPA) *
          </label>
          <Select
            options={incomeOptions}
            value={
              incomeOptions.find((opt) => opt.value === stepData.incomeRange) ||
              null
            }
            onChange={(selected) =>
              onChange("incomeRange", selected?.value || "")
            }
            placeholder="Select Slab"
            isSearchable
            styles={selectStyles}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("edu-income")}
          />
        </div>

        {/* 4. Company (Optional) */}
        <div className="space-y-2">
          <label className="block text-[#6E2F2F] font-inter text-[14px] font-medium leading-normal">
            {possessiveLabel} Company (Optional)
          </label>
          <input
            type="text"
            value={stepData.company || ""}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="Enter Company Name"
            className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-full border border-[#888888] text-gray-700 md:border-gray-400 outline-none focus:border-[#5D2E26]"
          />
        </div>
      </div>

      <div className="shrink-0 pt-2 pb-16 hidden md:flex justify-end z-40 max-sm:mr-4">
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

export default EducationAndProfession;
