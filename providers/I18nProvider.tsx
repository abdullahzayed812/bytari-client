import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import RNRestart from "react-native-restart";
import ar from "../i18n/ar";
import en from "../i18n/en";
import ku from "../i18n/ku";

export type Language = "ar" | "en" | "ku";

const RTL_LANGUAGES: Set<Language> = new Set(["ar", "ku"]);

const SUPPORTED_LANGUAGES: Set<string> = new Set(["ar", "en", "ku"]);

const allTranslations: Record<Language, Record<string, string>> = { ar, en, ku };

interface I18nContextType {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  changeLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      let initialLanguage: Language = "ar";

      if (savedLanguage && SUPPORTED_LANGUAGES.has(savedLanguage)) {
        initialLanguage = savedLanguage as Language;
      }

      setLanguageState(initialLanguage);

      const shouldBeRTL = RTL_LANGUAGES.has(initialLanguage);
      if (shouldBeRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem("language", lang);
      setLanguageState(lang);

      const shouldBeRTL = RTL_LANGUAGES.has(lang);
      if (shouldBeRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);
        RNRestart.Restart();
      }
      console.log("Language changed to", lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const changeLanguage = async (lang: Language) => {
    await setLanguage(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = allTranslations[language]?.[key] || allTranslations["en"]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        isRTL: RTL_LANGUAGES.has(language),
        setLanguage,
        changeLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
