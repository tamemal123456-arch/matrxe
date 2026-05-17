import ar from "./ar";
import en from "./en";

export type Language = "ar" | "en";
export type TranslationKey = keyof typeof ar;

const translations: Record<Language, Record<string, string>> = { ar, en };

let currentLang: Language = "ar";

export function setLanguage(lang: Language) {
  currentLang = lang;
  document.documentElement.lang = lang === "ar" ? "ar" : "en";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  localStorage.setItem("matrxe_lang", lang);
  window.dispatchEvent(new Event("languagechange"));
}

export function getLanguage(): Language {
  return currentLang;
}

export function t(key: TranslationKey, vars?: Record<string, string>): string {
  let text = translations[currentLang][key] || translations["ar"][key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export function initLanguage() {
  const saved = localStorage.getItem("matrxe_lang") as Language | null;
  if (saved && (saved === "ar" || saved === "en")) {
    setLanguage(saved);
  } else {
    const browserLang = navigator.language.startsWith("ar") ? "ar" : "en";
    setLanguage(browserLang);
  }
}

export function useI18n() {
  return { t, setLanguage, getLanguage, currentLang };
}
