"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import zhLocale from "./locales/zh.json";
import enLocale from "./locales/en.json";

export type Locale = "zh" | "en";

type LocaleMessages = typeof zhLocale;

const locales: Record<Locale, LocaleMessages> = {
    zh: zhLocale,
    en: enLocale,
};

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split(".");
    let result: unknown = obj;
    for (const key of keys) {
        if (result && typeof result === "object" && key in result) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return path; // Return key if not found
        }
    }
    return typeof result === "string" ? result : path;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>("zh");

    const t = useCallback(
        (key: string, params?: Record<string, string | number>): string => {
            let value = getNestedValue(locales[locale] as unknown as Record<string, unknown>, key);
            if (params) {
                Object.entries(params).forEach(([paramKey, paramValue]) => {
                    value = value.replace(`{${paramKey}}`, String(paramValue));
                });
            }
            return value;
        },
        [locale]
    );

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("useTranslation must be used within a LocaleProvider");
    }
    return context;
}
