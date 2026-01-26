import React, { createContext, useContext, ReactNode } from "react";
import { useI18n } from "./I18nProvider";

export type Language = "ar" | "en" | "ku" | "fr" | "tr" | "de" | "fa";

export const LANGUAGE_LABELS: Record<Language, { name: string; nativeName: string }> = {
    ar: { name: "Arabic", nativeName: "العربية" },
    en: { name: "English", nativeName: "English" },
    ku: { name: "Kurdish", nativeName: "کوردی" },
    fr: { name: "French", nativeName: "Français" },
    tr: { name: "Turkish", nativeName: "Türkçe" },
    de: { name: "German", nativeName: "Deutsch" },
    fa: { name: "Persian", nativeName: "فارسی" },
};

interface LanguageContextType {
    selectedLanguage: Language;
    setSelectedLanguage: (lang: Language) => void;
    getLanguageLabel: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { language, changeLanguage } = useI18n();
    const [selectedLanguage, setSelectedLanguageState] = React.useState<Language>(language as Language);

    // Sync with I18nProvider language
    React.useEffect(() => {
        setSelectedLanguageState(language as Language);
    }, [language]);

    const setSelectedLanguage = async (lang: Language) => {
        setSelectedLanguageState(lang);
        // Only change language in I18nProvider if it's ar or en (supported languages)
        if (lang === "ar" || lang === "en") {
            await changeLanguage(lang);
        }
    };

    const getLanguageLabel = (lang: Language): string => {
        return LANGUAGE_LABELS[lang]?.nativeName || lang;
    };

    return (
        <LanguageContext.Provider
            value={{
                selectedLanguage,
                setSelectedLanguage,
                getLanguageLabel,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
