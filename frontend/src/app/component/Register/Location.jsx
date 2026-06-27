"use client";

import React, { useMemo } from "react";
import Select from "./CustomSelect";
import { Country, State, City } from "country-state-city"; // Package for accurate data

const styles = {
  bgPage: "#FFFCF9",
  textMain: "#5D2E26",
};

const selectStyles = {
  // 1. Menu wrapper styling
  menu: (base) => ({
    ...base,
    position: "relative",
    marginTop: "8px",
    borderRadius: "16px",
    overflow: "hidden",
  }),

  // 2. Restrict the height of the list and add a scrollbar
  menuList: (base) => ({
    ...base,
    maxHeight: "220px", // You can adjust this height to your liking
    overflowY: "auto", // Adds the scrollbar when options exceed 220px
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

// --- Helper for Shared Custom Labels ---
const CustomLabel = ({ children, className = "" }) => (
  <label
    className={`block ${className}`}
    style={{
      color: "var(--Primary-01, #6E2F2F)",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 500,
      lineHeight: "normal",
    }}
  >
    {children} *
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

const Location = ({ data, onChange, profileCreatedFor, onNext }) => {
  // Accessing step 3 data
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

  // 1. Countries List (India prioritized for South India focus)
  const countries = useMemo(() => Country.getAllCountries(), []);

  // 2. States List based on selected Country
  const states = useMemo(
    () => (stepData.country ? State.getStatesOfCountry(stepData.country) : []),
    [stepData.country],
  );

  // 3. Cities List based on selected State
  const cities = useMemo(
    () =>
      stepData.country && stepData.state
        ? City.getCitiesOfState(stepData.country, stepData.state)
        : [],
    [stepData.country, stepData.state],
  );

  const handleCountryChange = (countryCode) => {
    onChange("country", countryCode);
    onChange("state", ""); // Reset state and city on country change
    onChange("city", "");
    onChange("lat", "");
    onChange("long", "");
  };

  const handleStateChange = (stateCode) => {
    onChange("state", stateCode);
    onChange("city", ""); // Reset city on state change
    onChange("lat", "");
    onChange("long", "");
  };

  const handleCityChange = (cityName) => {
    onChange("city", cityName);
    onChange("lat", "");
    onChange("long", "");
  };

  const countryOptions = countries.map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  const stateOptions = states.map((s) => ({
    value: s.isoCode,
    label: s.name,
  }));

  const cityOptions = cities.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  return (
    <div className="w-full">
      {/* DESKTOP VIEW - Added pb-64 for spacing below the final dropdown */}
      <div className="hidden md:flex justify-center font-sans">
        <div className="w-full max-w-2xl space-y-8">
          {/* Country */}
          <div className="space-y-2" id="desktop-country">
            <CustomLabel>{possessiveLabel} Country</CustomLabel>

            <Select
              options={countryOptions}
              value={
                countryOptions.find((o) => o.value === stepData.country) || null
              }
              onChange={(selected) =>
                handleCountryChange(selected?.value || "")
              }
              placeholder="Select Country"
              isSearchable
              styles={selectStyles}
              menuShouldScrollIntoView={false} // Prevents scroll jump
              onMenuOpen={() => handleMenuScroll("desktop-country")}
            />
          </div>

          {/* State */}
          <div className="space-y-2" id="desktop-state">
            <CustomLabel>{possessiveLabel} State</CustomLabel>

            <Select
              options={stateOptions}
              value={
                stateOptions.find((o) => o.value === stepData.state) || null
              }
              onChange={(selected) => handleStateChange(selected?.value || "")}
              placeholder="Select State"
              isDisabled={!stepData.country}
              styles={selectStyles}
              menuShouldScrollIntoView={false} // Prevents scroll jump
              onMenuOpen={() => handleMenuScroll("desktop-state")}
            />
          </div>

          {/* City */}
          <div className="space-y-2" id="desktop-city">
            <CustomLabel>{possessiveLabel} City</CustomLabel>

            <Select
              options={cityOptions}
              value={cityOptions.find((o) => o.value === stepData.city) || null}
              onChange={(selected) => handleCityChange(selected?.value || "")}
              placeholder="Select City"
              isDisabled={!stepData.state}
              styles={selectStyles}
              menuShouldScrollIntoView={false} // Prevents scroll jump
              onMenuOpen={() => handleMenuScroll("desktop-city")}
            />
          </div>

          {stepData.country && stepData.country !== "IN" && (
            <>
              {/* Citizenship */}
              <div className="space-y-2" id="desktop-citizenship">
                <CustomLabel>{possessiveLabel} Citizenship</CustomLabel>
                <Select
                  options={countryOptions}
                  value={
                    countryOptions.find((o) => o.label === stepData.citizenship) || null
                  }
                  onChange={(selected) =>
                    onChange("citizenship", selected?.label || "")
                  }
                  placeholder="Select Citizenship"
                  isSearchable
                  styles={selectStyles}
                  menuShouldScrollIntoView={false}
                  onMenuOpen={() => handleMenuScroll("desktop-citizenship")}
                />
              </div>

              {/* Resident Status */}
              <div className="space-y-2" id="desktop-resident-status">
                <CustomLabel>{possessiveLabel} Resident Status</CustomLabel>
                <Select
                  options={[
                    { value: "Citizen", label: "Citizen" },
                    { value: "Permanent Resident", label: "Permanent Resident" },
                    { value: "Work Permit", label: "Work Permit" },
                    { value: "Student Visa", label: "Student Visa" },
                    { value: "Temporary Visa", label: "Temporary Visa" },
                  ]}
                  value={
                    stepData.residentStatus
                      ? { value: stepData.residentStatus, label: stepData.residentStatus }
                      : null
                  }
                  onChange={(selected) =>
                    onChange("residentStatus", selected?.value || "")
                  }
                  placeholder="Select Resident Status"
                  styles={selectStyles}
                  menuShouldScrollIntoView={false}
                  onMenuOpen={() => handleMenuScroll("desktop-resident-status")}
                />
              </div>
            </>
          )}

          <div className="shrink-0 pt-2 pb-16 flex justify-end z-40 max-sm:mr-4 ">
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

      {/* MOBILE VIEW - Increased to pb-64 to pass behind fixed next button */}
      <div className="md:hidden flex flex-col w-full bg-white space-y-6 pb-64 px-4 md:pt-20">
        {/* Country */}
        <div id="mobile-country">
          <CustomLabel className="mb-3">{possessiveLabel} Country</CustomLabel>

          <Select
            options={countryOptions}
            value={
              countryOptions.find((o) => o.value === stepData.country) || null
            }
            onChange={(selected) => handleCountryChange(selected?.value || "")}
            placeholder="Select"
            styles={selectStyles}
            menuShouldScrollIntoView={false} // Prevents scroll jump
            onMenuOpen={() => handleMenuScroll("mobile-country")}
          />
        </div>

        {/* State */}
        <div id="mobile-state">
          <CustomLabel className="mb-3">{possessiveLabel} State</CustomLabel>

          <Select
            options={stateOptions}
            value={stateOptions.find((o) => o.value === stepData.state) || null}
            onChange={(selected) => handleStateChange(selected?.value || "")}
            placeholder="Select"
            isDisabled={!stepData.country}
            styles={selectStyles}
            menuShouldScrollIntoView={false} // Prevents scroll jump
            onMenuOpen={() => handleMenuScroll("mobile-state")}
          />
        </div>

        {/* City */}
        <div id="mobile-city">
          <CustomLabel className="mb-3">{possessiveLabel} City</CustomLabel>

          <Select
            options={cityOptions}
            value={cityOptions.find((o) => o.value === stepData.city) || null}
            onChange={(selected) => handleCityChange(selected?.value || "")}
            placeholder="Select"
            isDisabled={!stepData.state}
            styles={selectStyles}
            menuShouldScrollIntoView={false} // Prevents scroll jump
            onMenuOpen={() => handleMenuScroll("mobile-city")}
          />
        </div>

        {stepData.country && stepData.country !== "IN" && (
          <>
            {/* Citizenship */}
            <div id="mobile-citizenship">
              <CustomLabel className="mb-3">{possessiveLabel} Citizenship</CustomLabel>
              <Select
                options={countryOptions}
                value={
                  countryOptions.find((o) => o.label === stepData.citizenship) || null
                }
                onChange={(selected) =>
                  onChange("citizenship", selected?.label || "")
                }
                placeholder="Select"
                isSearchable
                styles={selectStyles}
                menuShouldScrollIntoView={false}
                onMenuOpen={() => handleMenuScroll("mobile-citizenship")}
              />
            </div>

            {/* Resident Status */}
            <div id="mobile-resident-status">
              <CustomLabel className="mb-3">{possessiveLabel} Resident Status</CustomLabel>
              <Select
                options={[
                  { value: "Citizen", label: "Citizen" },
                  { value: "Permanent Resident", label: "Permanent Resident" },
                  { value: "Work Permit", label: "Work Permit" },
                  { value: "Student Visa", label: "Student Visa" },
                  { value: "Temporary Visa", label: "Temporary Visa" },
                ]}
                value={
                  stepData.residentStatus
                    ? { value: stepData.residentStatus, label: stepData.residentStatus }
                    : null
                }
                onChange={(selected) =>
                  onChange("residentStatus", selected?.value || "")
                }
                placeholder="Select"
                styles={selectStyles}
                menuShouldScrollIntoView={false}
                onMenuOpen={() => handleMenuScroll("mobile-resident-status")}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Location;
