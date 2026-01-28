"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Calendar, CalendarDays, CalendarRange, Clock, Infinity as InfinityIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "@/i18n/context";

interface PeriodSelectorProps {
    value: "week" | "month" | "year" | "last_year" | "all" | "custom";
    onChange: (value: "week" | "month" | "year" | "last_year" | "all" | "custom") => void;
    customDate?: DateRange;
    onCustomDateChange?: (date: DateRange | undefined) => void;
}

export function PeriodSelector({ value, onChange, customDate, onCustomDateChange }: PeriodSelectorProps) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-2">
            <Tabs value={value} onValueChange={(v) => onChange(v as any)}>
                <TabsList className="grid w-full grid-flow-col gap-1">
                    <TabsTrigger value="week" className="px-3">{t("analytics.periodWeek")}</TabsTrigger>
                    <TabsTrigger value="month" className="px-3">{t("analytics.periodMonth")}</TabsTrigger>
                    <TabsTrigger value="year" className="px-3">{t("analytics.periodYear")}</TabsTrigger>
                    <TabsTrigger value="last_year" className="px-3">{t("analytics.periodLastYear")}</TabsTrigger>
                    <TabsTrigger value="all" className="px-3">{t("analytics.periodAll")}</TabsTrigger>
                    <TabsTrigger value="custom" className="px-3">{t("analytics.periodCustom")}</TabsTrigger>
                </TabsList>
            </Tabs>

            {value === "custom" && (
                <DatePickerWithRange
                    date={customDate}
                    onDateChange={onCustomDateChange}
                    className="w-[240px]"
                />
            )}
        </div>
    );
}
