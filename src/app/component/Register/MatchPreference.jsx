"use client";

import React, { useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import Select from "./CustomSelect";
import {
  allCommunities,
  allTongues,
  HEIGHT_RANGE_OPTIONS,
  INCOME_SLABS,
} from "@/lib/constants";

const styles = {
  bgPage: "#FFFCF9",
  textMain: "#5D2E26",
  textGreen: "#3b9b72",
  bgSelected: "#F6ECE6",
};

const ageOptions = Array.from({ length: (60 - 21) / 5 + 1 }, (_, i) => {
  const min = 21 + i * 5;
  const max = min + 4;

  return {
    value: `${min}-${max}`,
    label: `${min}-${max} years`,
    min,
    max,
  };
});

const communityOptions = allCommunities.map((c) => ({
  value: c,
  label: c,
}));

const languageOptions = allTongues.map((lang) => ({
  value: lang,
  label: lang,
}));

const incomeOptions = INCOME_SLABS.map((slab) => ({
  value: slab,
  label: slab,
}));

const selectStyles = {
  // Force the menu to be relative so it pushes content down
  menu: (base) => ({
    ...base,
    position: "relative",
    marginTop: "8px",
  }),

  control: (base, state) => ({
    ...base,
    borderRadius: "24px",
    padding: "6px 12px",
    borderColor: state.isFocused ? "#5D2E26" : "#D1D5DB",
    boxShadow: "none",
    minHeight: "48px",
    "&:hover": {
      borderColor: "#5D2E26",
    },
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#F6ECE6" : "white",
    color: "#333",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),
};

const SectionHeader = ({ title }) => (
  <div className="flex justify-between items-center mt-8 mb-4 pb-2">
    <h2 className="text-lg font-bold" style={{ color: styles.textGreen }}>
      {title}
    </h2>
  </div>
);

// --- Custom Label Component with your EXACT requested styling ---
const Label = ({ children }) => (
  <label
    className="block mb-3"
    style={{
      color: "var(--Primary-01, #6E2F2F)",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 500,
      lineHeight: "normal",
    }}
  >
    {children}
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

const MatchPreference = ({
  data,
  onChange,
  profileCreatedFor,
  onNext,
}) => {
  const pref = data || {};
  const [activeSearch, setActiveSearch] = useState(null);
  const [query, setQuery] = useState("");
  const possessiveLabel = getPossessiveLabel(profileCreatedFor);

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

  const maritalOptions = [
    "Never Married",
    "Awaiting Divorce",
    "Divorced",
    "Widowed",
    "Annulled",
  ];

  const locationOptions = [
    "Same City",
    "Same State",
    "Anywhere in India",
    "Abroad",
  ];

  const locationSelectOptions = locationOptions.map((loc) => ({
    value: loc,
    label: loc,
  }));

  const maritalSelectOptions = maritalOptions.map((opt) => ({
    value: opt,
    label: opt,
  }));

  const heightOptions = HEIGHT_RANGE_OPTIONS.map((opt) => {
    const [min, max] = opt.value.split("-").map(Number);
    return {
      ...opt,
      min,
      max,
    };
  });

  const educationOptions = [
    "Doctorate",
    "Post graduate/Master's",
    "Graduate/Bachelor's",
    "Diploma/Certifications",
    "Class XII",
    "Class X or below",
  ].map((opt) => ({
    value: opt,
    label: opt,
  }));

  // Logic to handle search filtering
  const filteredItems =
    query.length > 0
      ? (activeSearch === "tongue" ? allTongues : allCommunities).filter((i) =>
        i.toLowerCase().includes(query.toLowerCase()),
      )
      : (activeSearch === "tongue" ? allTongues : allCommunities).slice(0, 6);

  const handleToggle = (field, value) => {
    const current = pref[field] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange(field, updated);
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-2xl mx-auto space-y-8 px-4 mt-20 sm:mt-0 font-sans ">
        <SectionHeader title="Basic Preferences" />

        {/* Age & Height Section */}
        <div className="grid grid-cols-1 gap-6">
          <div id="pref-age">
            <Label>Age Range</Label>

            <Select
              options={ageOptions}
              value={
                pref.prefAgeRange
                  ? ageOptions.find(
                    (opt) =>
                      opt.min === pref.prefAgeRange.min &&
                      opt.max === pref.prefAgeRange.max,
                  ) || null
                  : null
              }
              onChange={(selected) => {
                if (!selected) return;
                onChange("prefAgeRange", {
                  min: selected.min,
                  max: selected.max,
                });
              }}
              placeholder="Select Age Range"
              isSearchable
              styles={selectStyles}
              menuShouldScrollIntoView={false} // Prevents scroll jump
              onMenuOpen={() => handleMenuScroll("pref-age")}
            />
          </div>

          <div id="pref-height">
            <Label>Height Range</Label>

            <Select
              options={heightOptions}
              value={
                pref.prefHeightRange
                  ? heightOptions.find(
                    (opt) =>
                      opt.min === pref.prefHeightRange.min &&
                      opt.max === pref.prefHeightRange.max,
                  ) || null
                  : null
              }
              onChange={(selected) => {
                if (!selected) return;
                onChange("prefHeightRange", {
                  min: selected.min,
                  max: selected.max,
                });
              }}
              placeholder="Select Height Range"
              isSearchable
              styles={selectStyles}
              menuShouldScrollIntoView={false} // Prevents scroll jump
              onMenuOpen={() => handleMenuScroll("pref-height")}
            />
          </div>
        </div>

        {/* Marital Status */}
        <div id="pref-marital">
          <Label>Marital status?</Label>

          <Select
            options={maritalSelectOptions}
            isMulti
            value={maritalSelectOptions.filter((opt) =>
              (pref.prefMaritalStatus || []).includes(opt.value),
            )}
            onChange={(selected) =>
              onChange(
                "prefMaritalStatus",
                selected ? selected.map((s) => s.value) : [],
              )
            }
            placeholder="Select Marital Status"
            styles={selectStyles}
            menuShouldScrollIntoView={false} // Prevents scroll jump
            onMenuOpen={() => handleMenuScroll("pref-marital")}
          />
        </div>

        <SectionHeader title="Community & Language" />

        {/* Community Search & Selection */}
        <div id="pref-community">
          <Label>{possessiveLabel} Preferred Community</Label>

          <Select
            options={communityOptions}
            isMulti
            value={communityOptions.filter((opt) =>
              (pref.prefCommunities || []).includes(opt.value),
            )}
            onChange={(selected) =>
              onChange(
                "prefCommunities",
                selected ? selected.map((s) => s.value) : [],
              )
            }
            placeholder="Search community..."
            styles={selectStyles}
            menuShouldScrollIntoView={false} // Prevents scroll jump
            onMenuOpen={() => handleMenuScroll("pref-community")}
          />
        </div>

        {/* Mother Tongue Search & Selection */}
        <div className="mt-6" id="pref-tongue">
          <Label>{possessiveLabel} Preferred Mother Tongue</Label>

          <Select
            options={languageOptions}
            isMulti
            value={languageOptions.filter((opt) =>
              (pref.prefLanguages || []).includes(opt.value),
            )}
            onChange={(selected) =>
              onChange(
                "prefLanguages",
                selected ? selected.map((s) => s.value) : [],
              )
            }
            placeholder="Search language..."
            styles={selectStyles}
            menuShouldScrollIntoView={false} // Prevents scroll jump
            onMenuOpen={() => handleMenuScroll("pref-tongue")}
          />
        </div>

        {/* Location Preference */}
        <SectionHeader title="Location Preference" />
        <div className="space-y-6" id="pref-location">
          <Select
            options={locationSelectOptions}
            value={
              locationSelectOptions.find(
                (opt) => opt.value === pref.prefLocation,
              ) || null
            }
            onChange={(selected) =>
              onChange("prefLocation", selected?.value || "")
            }
            placeholder="Select Preferred Location"
            isSearchable
            styles={selectStyles}
            menuShouldScrollIntoView={false} // Prevents scroll jump
            onMenuOpen={() => handleMenuScroll("pref-location")}
          />
        </div>

        {/* Education & Profession */}
        <SectionHeader title="Education & Profession" />
        <div className="space-y-6">
          <div id="pref-education">
            <Label>Minimum Education Level</Label>

            <Select
              options={educationOptions}
              value={
                educationOptions.find(
                  (opt) => opt.value === pref.minEducation,
                ) || null
              }
              onChange={(selected) =>
                onChange("minEducation", selected?.value || "")
              }
              placeholder="Select Education Level"
              isSearchable
              styles={selectStyles}
              menuShouldScrollIntoView={false} // Prevents scroll jump
              onMenuOpen={() => handleMenuScroll("pref-education")}
            />
          </div>

          <div>
            <Label>Preferred Profession</Label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              className="w-full px-5 py-4 rounded-3xl border border-gray-300 text-gray-800 outline-none focus:border-[#5D2E26]"
              value={pref.preferredProfession || ""}
              onChange={(e) => onChange("preferredProfession", e.target.value)}
            />
          </div>

          <div id="pref-income">
            <Label>Annual income range?</Label>
            <div>
              <Select
                options={incomeOptions}
                value={
                  incomeOptions.find(
                    (opt) => opt.value === pref.annualIncomeRange,
                  ) || null
                }
                onChange={(selected) =>
                  onChange("annualIncomeRange", selected?.value || "")
                }
                placeholder="Select range"
                isSearchable
                styles={selectStyles}
                menuShouldScrollIntoView={false} // Prevents scroll jump
                onMenuOpen={() => handleMenuScroll("pref-income")}
              />
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default MatchPreference;