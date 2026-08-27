import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import en from "./en.json";
import fr from "./fr.json";

const STORAGE_KEY = "portfolio-lang";
export const SUPPORTED_LOCALES = ["en", "fr"];
const DEFAULT_LOCALE = "en";
const dictionaries = { en, fr };

function detectInitialLocale() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;

  const browserLocales = window.navigator.languages || [
    window.navigator.language,
  ];
  for (const lang of browserLocales) {
    const short = String(lang).slice(0, 2).toLowerCase();
    if (SUPPORTED_LOCALES.includes(short)) return short;
  }

  return DEFAULT_LOCALE;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitialLocale);

  const setLocale = (next) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  /* `index.html` ships a static `lang="en"`; without this it keeps claiming
     English after a switch, which misleads screen readers (pronunciation) and
     translation tooling alike. */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useMemo(() => {
    const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
    return (key, vars) => {
      const str = dict[key] ?? key;
      if (!vars) return str;
      return Object.keys(vars).reduce(
        (acc, name) => acc.replaceAll(`{${name}}`, vars[name]),
        str,
      );
    };
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, supportedLocales: SUPPORTED_LOCALES, t }),
    [locale, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
