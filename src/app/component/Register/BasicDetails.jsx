"use client";

import React, { useState, useRef, useEffect } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import Select from "./CustomSelect";
import toast from "react-hot-toast";
import "react-day-picker/style.css";
import {
  FAMILY_STATUS_OPTIONS,
  HEIGHT_OPTIONS,
  PHYSICAL_STATUS_OPTIONS,
} from "@/lib/constants";
import { api } from "@/lib/apiClient";

// --- Custom Label Component with your EXACT requested styling ---
const CustomLabel = ({ children, className = "", isMandatory = true }) => (
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
    {children}
    {isMandatory && <span> *</span>}
  </label>
);

const normalizePhone = (value = "") => value.replace(/\D/g, "").slice(0, 10);
const isValidPhone = (value = "") => /^[6-9]\d{9}$/.test(value);

const BasicDetails = ({ data, onChange, profileCreatedFor, onNext }) => {
  const colors = {
    textMain: "#5D2E26",
    bgInput: "#FFFFFF",
    bgPage: "#FFFCF9",
    borderActive: "#5D2E26",
    bgActive: "#F6ECE6",
    textInactive: "#888888",
    borderInactive: "#888888",
  };

  const defaultClassNames = getDefaultClassNames();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(data.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(data.phoneVerified));
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const desktopCalendarRef = useRef(null);
  const mobileCalendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop =
        desktopCalendarRef.current &&
        !desktopCalendarRef.current.contains(event.target);
      const clickedOutsideMobile =
        mobileCalendarRef.current &&
        !mobileCalendarRef.current.contains(event.target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (event) => {
    const nextPhone = normalizePhone(event.target.value);
    setPhoneNumber(nextPhone);

    if (phoneVerified) {
      setPhoneVerified(false);
      onChange("phoneVerified", false);
    }
  };

  const handleOtpChange = (event) => {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleSendOtp = async () => {
    const normalizedPhone = normalizePhone(phoneNumber);

    if (!isValidPhone(normalizedPhone)) {
      toast.error("Please enter a valid 10 digit phone number");
      return;
    }

    try {
      setIsSendingOtp(true);
      await api.post(
        "/auth/phone/send-otp",
        { phone: normalizedPhone },
        "private",
      );
      setPhoneNumber(normalizedPhone);
      setOtp("");
      setOtpSent(true);
      setPhoneVerified(false);
      onChange("phoneVerified", false);
      toast.success("OTP sent successfully");
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedPhone = normalizePhone(phoneNumber);

    if (!isValidPhone(normalizedPhone)) {
      toast.error("Please enter a valid 10 digit phone number");
      return;
    }

    if (otp.trim().length !== 6) {
      toast.error("Please enter a valid 6 digit OTP");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      await api.post(
        "/auth/phone/verify-otp",
        { phone: normalizedPhone, otp: otp.trim() },
        "private",
      );
      setPhoneVerified(true);
      onChange("phoneVerified", true);
      onChange("phone", normalizedPhone);
      toast.success("Phone number verified");
    } catch (error) {
      setPhoneVerified(false);
      onChange("phoneVerified", false);
      toast.error(
        error?.data?.message || error?.message || "Failed to verify OTP",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNext = () => {
    if (!phoneVerified) {
      toast.error("Please verify your phone number before continuing");
      return;
    }

    onNext();
  };

  // Custom scroll for Calendar to prevent it from snapping to the very top
  useEffect(() => {
    if (isCalendarOpen) {
      setTimeout(() => {
        const isDesktop = window.innerWidth >= 768;
        const activeRef = isDesktop ? desktopCalendarRef.current : mobileCalendarRef.current;

        if (activeRef) {
          const scrollContainer = isDesktop
            ? activeRef.closest(".overflow-y-auto")
            : window;

          if (scrollContainer && scrollContainer !== window) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = activeRef.getBoundingClientRect();
            scrollContainer.scrollTo({
              top: scrollContainer.scrollTop + elementRect.top - containerRect.top - 20,
              behavior: "smooth",
            });
          } else {
            const offsetPosition = activeRef.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }
      }, 50);
    }
  }, [isCalendarOpen]);

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

  const handleDateSelect = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange("dob", `${year}-${month}-${day}`);
    } else {
      onChange("dob", "");
    }
    setIsCalendarOpen(false);
  };

  const getParsedDate = (dateStr) => {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const displayDate = data.dob
    ? getParsedDate(data.dob).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "";

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const childrenOptions = [
    { value: 0, label: "0" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
  ];

  const livingTogetherOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const profileCreatedForOptions = [
    { value: "Myself", label: "Myself" },
    { value: "Daughter", label: "Daughter" },
    { value: "Son", label: "Son" },
    { value: "Sister", label: "Sister" },
    { value: "Brother", label: "Brother" },
    { value: "Relative", label: "Relative" },
    { value: "Friend", label: "Friend" },
  ];

  const maritalOptions = [
    { value: "Never Married", label: "Never Married" },
    { value: "Awaiting Divorce", label: "Awaiting Divorce" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
    { value: "Annulled", label: "Annulled" },
  ];

  const familyStatusOptions = FAMILY_STATUS_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }));

  const physicalStatusOptions = PHYSICAL_STATUS_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }));

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

  const possessiveLabel = getPossessiveLabel(
    profileCreatedFor || data.profileCreatedFor,
  );

  const getSelectStyles = (isMobile = false) => ({
    menu: (base) => ({
      ...base,
      position: "relative",
      marginTop: "8px",
      borderRadius: "16px",
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "220px",
      overflowY: "auto",
    }),
    control: (base, state) => ({
      ...base,
      borderRadius: "9999px",
      padding: isMobile ? "4px 10px" : "6px 12px",
      borderColor: state.isFocused
        ? "#5D2E26"
        : isMobile
          ? "#888888"
          : "#9CA3AF",
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

  const phoneVerificationBlock = (isMobile = false) => (
    <div className={isMobile ? "space-y-3" : "space-y-3"}>
      <CustomLabel>Phone Number</CustomLabel>
      <div className={isMobile ? "space-y-3" : "flex gap-3 items-start"}>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter 10 digit phone number"
          className={`w-full ${isMobile ? "px-5 py-3.5" : "px-6 py-4"} rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-[#5D2E26]`}
        />
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isSendingOtp}
          className={`shrink-0 ${isMobile ? "w-full py-3.5" : "px-6 py-4"} rounded-full border border-[#5D2E26] text-[#5D2E26] font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isSendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
        </button>
      </div>

      {otpSent && (
        <div className="space-y-3">
          <CustomLabel>OTP</CustomLabel>
          <div className={isMobile ? "space-y-3" : "flex gap-3 items-start"}>
            <input
              type="tel"
              value={otp}
              onChange={handleOtpChange}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6 digit OTP"
              className={`w-full ${isMobile ? "px-5 py-3.5" : "px-6 py-4"} rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-[#5D2E26]`}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || phoneVerified}
              className={`shrink-0 ${isMobile ? "w-full py-3.5" : "px-6 py-4"} rounded-full font-medium text-[#2d2424] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
              style={{
                background:
                  "linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%)",
              }}
            >
              {phoneVerified
                ? "Verified"
                : isVerifyingOtp
                  ? "Verifying..."
                  : "Verify OTP"}
            </button>
          </div>
          {phoneVerified && (
            <p className="text-sm text-[#429466]">Phone number verified successfully.</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* =========================================================
          DESKTOP VIEW
          ========================================================= */}
      <div className="hidden md:flex justify-center font-sans bg-[#FFF6EC]">
        <div className="w-full max-w-2xl flex flex-col space-y-8">

          {/* Profile Created For */}
          <div className="space-y-3" id="desktop-profileFor">
            <CustomLabel>Profile Created For</CustomLabel>
            <Select
              options={profileCreatedForOptions}
              value={
                profileCreatedForOptions.find(
                  (opt) => opt.value === data.profileCreatedFor,
                ) || null
              }
              onChange={(selected) => {
                const val = selected?.value || "";
                onChange("profileCreatedFor", val);
                if (val === "Daughter" || val === "Sister") {
                  onChange("gender", "Female");
                } else if (val === "Son" || val === "Brother") {
                  onChange("gender", "Male");
                }
              }}
              placeholder="Select"
              isSearchable
              styles={getSelectStyles(false)}
              menuShouldScrollIntoView={false}
              onMenuOpen={() => handleMenuScroll("desktop-profileFor")}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <CustomLabel>{possessiveLabel} Name</CustomLabel>
            <input
              type="text"
              value={data.fullName || ""}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder={`${possessiveLabel} Name`}
              className="w-full px-6 py-4 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-[#5D2E26]"
            />
          </div>

          {phoneVerificationBlock(false)}

          {/* DOB & Height Row */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2 relative" ref={desktopCalendarRef}>
              <CustomLabel>{possessiveLabel} Date of Birth</CustomLabel>
              <input
                type="text"
                readOnly
                value={displayDate}
                placeholder={`${possessiveLabel} DOB`}
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="w-full px-6 py-4 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-[#5D2E26] cursor-pointer"
              />
              {isCalendarOpen && (
                <div className="mt-2 bg-white border border-gray-200 rounded-3xl shadow-xl p-4 w-fit">
                  <DayPicker
                    mode="single"
                    selected={data.dob ? new Date(data.dob) : undefined}
                    onSelect={handleDateSelect}
                    defaultMonth={
                      data.dob ? new Date(data.dob) : new Date(2000, 0)
                    }
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    style={{
                      "--rdp-accent-color": "#2A1D1D",
                      "--rdp-accent-background-color": "#e0e7ff",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2" id="desktop-height">
              <CustomLabel>{possessiveLabel} Height (in CM)</CustomLabel>
              <Select
                options={HEIGHT_OPTIONS}
                value={
                  HEIGHT_OPTIONS.find(
                    (opt) => opt.value === Number(data.height),
                  ) || null
                }
                onChange={(selected) =>
                  onChange(
                    "height",
                    selected?.value !== undefined ? Number(selected.value) : "",
                  )
                }
                placeholder={`Select ${possessiveLabel.toLowerCase()} height`}
                isSearchable
                styles={getSelectStyles(false)}
                menuShouldScrollIntoView={false}
                onMenuOpen={() => handleMenuScroll("desktop-height")}
              />
            </div>
          </div>

          {/* Gender Selection */}
          {(!data.profileCreatedFor || ["Myself", "Relative", "Friend"].includes(data.profileCreatedFor)) && (
            <div className="space-y-3" id="desktop-gender">
              <CustomLabel>{possessiveLabel} Gender</CustomLabel>
              <Select
                options={genderOptions}
                value={
                  genderOptions.find((opt) => opt.value === data.gender) || null
                }
                onChange={(selected) => onChange("gender", selected?.value || "")}
                placeholder="Select Gender"
                isSearchable
                styles={getSelectStyles(false)}
                menuShouldScrollIntoView={false}
                onMenuOpen={() => handleMenuScroll("desktop-gender")}
              />
            </div>
          )}

          {/* Marital Status */}
          <div className="space-y-3" id="desktop-marital">
            <CustomLabel>{possessiveLabel} Marital Status</CustomLabel>
            <Select
              options={maritalOptions}
              value={
                maritalOptions.find(
                  (opt) => opt.value === data.maritalStatus,
                ) || null
              }
              onChange={(selected) => {
                const val = selected?.value || "";
                onChange("maritalStatus", val);
                if (val === "Never Married") {
                  onChange("numberOfChildren", null);
                  onChange("childrenLivingTogether", null);
                }
              }}
              placeholder="Select Marital Status"
              isSearchable
              styles={getSelectStyles(false)}
              menuShouldScrollIntoView={false}
              onMenuOpen={() => handleMenuScroll("desktop-marital")}
            />
          </div>

          {/* Number of Children & Living Together */}
          {data.maritalStatus && data.maritalStatus !== "Never Married" && (
            <>
              <div className="space-y-3" id="desktop-children">
                <CustomLabel>No. of Children</CustomLabel>
                <Select
                  options={childrenOptions}
                  value={
                    childrenOptions.find(
                      (opt) => opt.value === data.numberOfChildren,
                    ) || null
                  }
                  onChange={(selected) => {
                    const val = selected?.value !== undefined ? selected.value : null;
                    onChange("numberOfChildren", val);
                    if (val === 0 || val === null) {
                      onChange("childrenLivingTogether", null);
                    }
                  }}
                  placeholder="Select"
                  isSearchable
                  styles={getSelectStyles(false)}
                  menuShouldScrollIntoView={false}
                  onMenuOpen={() => handleMenuScroll("desktop-children")}
                />
              </div>

              {data.numberOfChildren > 0 && (
                <div className="space-y-3" id="desktop-living-together">
                  <CustomLabel>Children Living Together?</CustomLabel>
                  <Select
                    options={livingTogetherOptions}
                    value={
                      livingTogetherOptions.find(
                        (opt) => opt.value === data.childrenLivingTogether,
                      ) || null
                    }
                    onChange={(selected) =>
                      onChange("childrenLivingTogether", selected?.value || "")
                    }
                    placeholder="Select"
                    isSearchable
                    styles={getSelectStyles(false)}
                    menuShouldScrollIntoView={false}
                    onMenuOpen={() => handleMenuScroll("desktop-living-together")}
                  />
                </div>
              )}
            </>
          )}

          {/* Physical Status */}
          <div className="space-y-3" id="desktop-physical">
            <CustomLabel>{possessiveLabel} Physical Status</CustomLabel>
            <Select
              options={physicalStatusOptions}
              value={
                physicalStatusOptions.find(
                  (opt) => opt.value === data.physicalStatus,
                ) || null
              }
              onChange={(selected) =>
                onChange("physicalStatus", selected?.value || "")
              }
              placeholder="Select Physical Status"
              isSearchable
              styles={getSelectStyles(false)}
              menuShouldScrollIntoView={false}
              onMenuOpen={() => handleMenuScroll("desktop-physical")}
            />
          </div>

          {/* Family Status */}
          <div className="space-y-3" id="desktop-family">
            <CustomLabel>{possessiveLabel} Family Status</CustomLabel>
            <Select
              options={familyStatusOptions}
              value={
                familyStatusOptions.find(
                  (opt) => opt.value === data.familyStatus,
                ) || null
              }
              onChange={(selected) =>
                onChange("familyStatus", selected?.value || "")
              }
              placeholder="Select Family Status"
              isSearchable
              styles={getSelectStyles(false)}
              menuShouldScrollIntoView={false}
              onMenuOpen={() => handleMenuScroll("desktop-family")}
            />
          </div>

          <div className="shrink-0 pt-2 pb-26 flex justify-end z-40 max-sm:mr-4 ">
            <button
              onClick={handleNext}
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

      {/* =========================================================
          MOBILE VIEW
          ========================================================= */}
      <div className="md:hidden flex flex-col w-full bg-white space-y-6 pb-24 px-4 pt-2 md:pt-20">

        {/* Mobile Profile Created For */}
        <div id="mobile-profileFor">
          <CustomLabel className="mb-3">Profile Created For</CustomLabel>
          <Select
            options={profileCreatedForOptions}
            value={
              profileCreatedForOptions.find(
                (opt) => opt.value === data.profileCreatedFor,
              ) || null
            }
            onChange={(selected) => {
              const val = selected?.value || "";
              onChange("profileCreatedFor", val);
              if (val === "Daughter" || val === "Sister") {
                onChange("gender", "Female");
              } else if (val === "Son" || val === "Brother") {
                onChange("gender", "Male");
              }
            }}
            placeholder="Select"
            isSearchable
            styles={getSelectStyles(true)}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("mobile-profileFor")}
          />
        </div>

        {/* Mobile Full Name */}
        <div>
          <CustomLabel className="mb-3">{possessiveLabel} Name</CustomLabel>
          <input
            type="text"
            value={data.fullName || ""}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder={`${possessiveLabel} Name`}
            className="w-full px-5 py-3.5 rounded-full border border-[#888888] text-gray-800 focus:outline-none focus:border-[#5D2E26]"
          />
        </div>

        {phoneVerificationBlock(true)}

        {/* Mobile Gender */}
        {(!data.profileCreatedFor || ["Myself", "Relative", "Friend"].includes(data.profileCreatedFor)) && (
          <div id="mobile-gender">
            <CustomLabel className="mb-3">{possessiveLabel} Gender</CustomLabel>
            <Select
              options={genderOptions}
              value={
                genderOptions.find((opt) => opt.value === data.gender) || null
              }
              onChange={(selected) => onChange("gender", selected?.value || "")}
              placeholder="Select Gender"
              isSearchable
              styles={getSelectStyles(true)}
              menuShouldScrollIntoView={false}
              onMenuOpen={() => handleMenuScroll("mobile-gender")}
            />
          </div>
        )}

        {/* Mobile DOB */}
        <div className="relative" ref={mobileCalendarRef}>
          <CustomLabel className="mb-3">{possessiveLabel} Date of Birth</CustomLabel>
          <input
            type="text"
            readOnly
            value={displayDate}
            placeholder={`${possessiveLabel} DOB`}
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-full px-6 py-4 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-[#5D2E26] cursor-pointer"
          />

          {isCalendarOpen && (
            <div className="mt-2 bg-white border border-gray-200 rounded-3xl shadow-xl p-4 w-fit">
              <DayPicker
                mode="single"
                selected={data.dob ? new Date(data.dob) : undefined}
                onSelect={handleDateSelect}
                defaultMonth={data.dob ? new Date(data.dob) : new Date(2000, 0)}
                captionLayout="dropdown"
                fromYear={1900}
                toYear={new Date().getFullYear()}
                style={{
                  "--rdp-accent-color": "#2A1D1D",
                  "--rdp-accent-background-color": "#e0e7ff",
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile Height */}
        <div id="mobile-height">
          <CustomLabel className="mb-3">{possessiveLabel} Height (in CM)</CustomLabel>
          <Select
            options={HEIGHT_OPTIONS}
            value={
              HEIGHT_OPTIONS.find((opt) => opt.value === Number(data.height)) ||
              null
            }
            onChange={(selected) =>
              onChange(
                "height",
                selected?.value !== undefined ? Number(selected.value) : "",
              )
            }
            placeholder={`Select ${possessiveLabel.toLowerCase()} height`}
            isSearchable
            styles={getSelectStyles(true)}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("mobile-height")}
          />
        </div>

        {/* Mobile Marital Status */}
        <div id="mobile-marital">
          <CustomLabel className="mb-3">{possessiveLabel} Marital Status</CustomLabel>
          <Select
            options={maritalOptions}
            value={
              maritalOptions.find((opt) => opt.value === data.maritalStatus) ||
              null
            }
            onChange={(selected) => {
              const val = selected?.value || "";
              onChange("maritalStatus", val);
              if (val === "Never Married") {
                onChange("numberOfChildren", null);
                onChange("childrenLivingTogether", null);
              }
            }}
            placeholder="Select Marital Status"
            isSearchable
            styles={getSelectStyles(true)}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("mobile-marital")}
          />
        </div>

        {/* Mobile Number of Children & Living Together */}
        {data.maritalStatus && data.maritalStatus !== "Never Married" && (
          <>
            <div id="mobile-children">
              <CustomLabel className="mb-3">No. of Children</CustomLabel>
              <Select
                options={childrenOptions}
                value={
                  childrenOptions.find((opt) => opt.value === data.numberOfChildren) || null
                }
                onChange={(selected) => {
                  const val = selected?.value !== undefined ? selected.value : null;
                  onChange("numberOfChildren", val);
                  if (val === 0 || val === null) {
                    onChange("childrenLivingTogether", null);
                  }
                }}
                placeholder="Select"
                isSearchable
                styles={getSelectStyles(true)}
                menuShouldScrollIntoView={false}
                onMenuOpen={() => handleMenuScroll("mobile-children")}
              />
            </div>

            {data.numberOfChildren > 0 && (
              <div id="mobile-living-together">
                <CustomLabel className="mb-3">Children Living Together?</CustomLabel>
                <Select
                  options={livingTogetherOptions}
                  value={
                    livingTogetherOptions.find((opt) => opt.value === data.childrenLivingTogether) || null
                  }
                  onChange={(selected) =>
                    onChange("childrenLivingTogether", selected?.value || "")
                  }
                  placeholder="Select"
                  isSearchable
                  styles={getSelectStyles(true)}
                  menuShouldScrollIntoView={false}
                  onMenuOpen={() => handleMenuScroll("mobile-living-together")}
                />
              </div>
            )}
          </>
        )}

        {/* Mobile Physical Status */}
        <div id="mobile-physical">
          <CustomLabel className="mb-3">{possessiveLabel} Physical Status</CustomLabel>
          <Select
            options={physicalStatusOptions}
            value={
              physicalStatusOptions.find(
                (opt) => opt.value === data.physicalStatus,
              ) || null
            }
            onChange={(selected) =>
              onChange("physicalStatus", selected?.value || "")
            }
            placeholder="Select Physical Status"
            isSearchable
            styles={getSelectStyles(true)}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("mobile-physical")}
          />
        </div>

        {/* Mobile Family Status */}
        <div id="mobile-family">
          <CustomLabel className="mb-3">{possessiveLabel} Family Status</CustomLabel>
          <Select
            options={familyStatusOptions}
            value={
              familyStatusOptions.find(
                (opt) => opt.value === data.familyStatus,
              ) || null
            }
            onChange={(selected) =>
              onChange("familyStatus", selected?.value || "")
            }
            placeholder="Select Family Status"
            isSearchable
            styles={getSelectStyles(true)}
            menuShouldScrollIntoView={false}
            onMenuOpen={() => handleMenuScroll("mobile-family")}
          />
        </div>
      </div>
    </>
  );
};

export default BasicDetails;
