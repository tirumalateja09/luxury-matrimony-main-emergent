export const LANGUAGE_OPTIONS = [
  { name: "English", code: "en" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Kannada", code: "kn" },
  { name: "Malayalam", code: "ml" },
];

export const LANGUAGE_STORAGE_KEY = "preferredLanguage";
export const LANGUAGE_EVENT = "preferredLanguageChanged";
const GOOGLE_TRANSLATE_COOKIE = "googtrans";

const dispatchNativeChangeEvent = (element) => {
  if (!element) return;

  element.dispatchEvent(new Event("change", { bubbles: true }));
};

const setGoogleTranslateCookie = (languageCode) => {
  document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=/en/${languageCode}; path=/;`;
};

const applyGoogleTranslateLanguage = (languageCode, attempt = 0) => {
  if (typeof document === "undefined") return;

  const combo = document.querySelector(".goog-te-combo");

  if (!combo) {
    if (attempt < 20) {
      window.setTimeout(
        () => applyGoogleTranslateLanguage(languageCode, attempt + 1),
        250,
      );
    }
    return;
  }

  if (combo.value !== languageCode) {
    combo.value = languageCode;
    dispatchNativeChangeEvent(combo);
  }
};

export const getPreferredLanguage = () => {
  if (typeof window === "undefined") return LANGUAGE_OPTIONS[0];

  const savedCode =
    window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || LANGUAGE_OPTIONS[0].code;

  return (
    LANGUAGE_OPTIONS.find((language) => language.code === savedCode) ||
    LANGUAGE_OPTIONS[0]
  );
};

export const getLanguageNameFromCode = (languageCode) =>
  LANGUAGE_OPTIONS.find((language) => language.code === languageCode)?.name;

export const setPreferredLanguage = (languageCode) => {
  if (typeof window === "undefined") return;

  const selectedLanguage =
    LANGUAGE_OPTIONS.find((language) => language.code === languageCode) ||
    LANGUAGE_OPTIONS[0];

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage.code);
  setGoogleTranslateCookie(selectedLanguage.code);
  applyGoogleTranslateLanguage(selectedLanguage.code);
  window.dispatchEvent(
    new CustomEvent(LANGUAGE_EVENT, {
      detail: { language: selectedLanguage },
    }),
  );
};
