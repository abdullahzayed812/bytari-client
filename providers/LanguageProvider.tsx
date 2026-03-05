import React, { createContext, useContext, ReactNode } from "react";
import { useI18n, Language } from "./I18nProvider";

export type { Language };

export const LANGUAGE_LABELS: Record<Language, { name: string; nativeName: string }> = {
    ar: { name: "Arabic", nativeName: "العربية" },
    en: { name: "English", nativeName: "English" },
    ku: { name: "Kurdish", nativeName: "کوردی" },
};

interface LanguageContextType {
    selectedLanguage: Language;
    setSelectedLanguage: (lang: Language) => void;
    getLanguageLabel: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { language, changeLanguage } = useI18n();
    const [selectedLanguage, setSelectedLanguageState] = React.useState<Language>(language);

    React.useEffect(() => {
        setSelectedLanguageState(language);
    }, [language]);

    const setSelectedLanguage = async (lang: Language) => {
        setSelectedLanguageState(lang);
        await changeLanguage(lang);
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
