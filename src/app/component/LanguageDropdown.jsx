"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
import {
  getPreferredLanguage,
  LANGUAGE_EVENT,
  LANGUAGE_OPTIONS,
  setPreferredLanguage,
} from "@/lib/languagePreference";

export default function LanguageDropdown({
  className = "",
  align = "right",
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0]);
  const containerRef = useRef(null);

  useEffect(() => {
    setSelectedLanguage(getPreferredLanguage());

    const handleLanguageChange = (event) => {
      if (event?.detail?.language) {
        setSelectedLanguage(event.detail.language);
        return;
      }

      setSelectedLanguage(getPreferredLanguage());
    };

    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener(LANGUAGE_EVENT, handleLanguageChange);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLanguageSelect = (languageCode) => {
    setPreferredLanguage(languageCode);
    setSelectedLanguage(getPreferredLanguage());
    setIsOpen(false);
  };

  const menuAlignment =
    align === "left" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center rounded-full border border-[#E7C47A] bg-white text-sm font-medium text-[#6E2F2F] shadow-sm transition hover:bg-[#FFF8EA] ${
          compact ? "gap-1.5 px-2.5 py-2" : "gap-2 px-3 py-2"
        }`}
      >
        <Languages size={16} />
        <span>{compact ? selectedLanguage.code.toUpperCase() : selectedLanguage.name}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${menuAlignment} top-[calc(100%+10px)] z-[2500] w-44 overflow-hidden rounded-2xl border border-[#EAD8B4] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]`}
        >
          {LANGUAGE_OPTIONS.map((language) => {
            const isSelected = selectedLanguage.code === language.code;

            return (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageSelect(language.code)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "bg-[#FFF6E2] font-semibold text-[#8A6D3B]"
                    : "text-[#5C4C4C] hover:bg-[#FFF9EF]"
                }`}
              >
                <span>{language.name}</span>
                {isSelected && <span className="text-xs">Selected</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
