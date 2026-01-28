"use client";

import { useTranslation, type Locale } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
    const { locale, setLocale, t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Switch language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setLocale("zh")}
                    className={locale === "zh" ? "bg-accent" : ""}
                >
                    {t("language.zh")}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setLocale("en")}
                    className={locale === "en" ? "bg-accent" : ""}
                >
                    {t("language.en")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
