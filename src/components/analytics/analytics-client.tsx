"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { ExpenseTrendChart } from "@/components/analytics/expense-trend-chart";
import { BacklinkTrendChart } from "@/components/analytics/backlink-trend-chart";
import { CategoryPieChart } from "@/components/analytics/category-pie-chart";
import { ProjectCostBar } from "@/components/analytics/project-cost-bar";
import { Wallet, Link2, TrendingUp, Receipt } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
    getExpenseTrend,
    getBacklinkTrend,
    getProjectCostComparison,
    getCategoryBreakdown,
    getAnalyticsSummary,
    type Period,
} from "@/app/analytics/actions";
import { useTranslation } from "@/i18n/context";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, fadeScale, viewportConfig } from "@/lib/animations";

export function AnalyticsClient() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<Period>("month");
    const [customDate, setCustomDate] = useState<DateRange | undefined>();
    const [isPending, startTransition] = useTransition();

    const [expenseTrend, setExpenseTrend] = useState<{ label: string; amount: number }[]>([]);
    const [backlinkTrend, setBacklinkTrend] = useState<{ label: string; count: number; cost: number }[]>([]);
    const [projectCosts, setProjectCosts] = useState<{ name: string; amount: number }[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<{ category: string; amount: number }[]>([]);
    const [summary, setSummary] = useState({
        totalCost: 0,
        expenseCount: 0,
        backlinkCount: 0,
        backlinkCost: 0,
        liveBacklinks: 0,
    });

    const loadData = (p: Period, start?: Date, end?: Date) => {
        startTransition(async () => {
            const [expense, backlink, projects, categories, sum] = await Promise.all([
                getExpenseTrend(p, start, end),
                getBacklinkTrend(p, start, end),
                getProjectCostComparison(),
                getCategoryBreakdown(p, start, end),
                getAnalyticsSummary(p, start, end),
            ]);
            setExpenseTrend(expense);
            setBacklinkTrend(backlink);
            setProjectCosts(projects);
            setCategoryBreakdown(categories);
            setSummary(sum);
        });
    };

    useEffect(() => {
        if (period === "custom") {
            if (customDate?.from && customDate?.to) {
                loadData(period, customDate.from, customDate.to);
            }
        } else {
            loadData(period);
        }
    }, [period, customDate]);

    const handlePeriodChange = (p: Period) => {
        setPeriod(p);
    };

    const periodLabel = (() => {
        if (period === "week") return t("analytics.periodWeek");
        if (period === "month") return t("analytics.periodMonth");
        if (period === "year") return t("analytics.periodYear");
        if (period === "last_year") return t("analytics.periodLastYear");
        if (period === "all") return t("analytics.periodAll");
        if (period === "custom") return t("analytics.periodCustom");
        return "";
    })();

    return (
        <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            {/* Header Section */}
            <motion.div variants={fadeSlideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{t("analytics.title")}</h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        {t("analytics.subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isPending && (
                        <Badge variant="outline" className="animate-pulse bg-muted/50">
                            {t("analytics.updating")}
                        </Badge>
                    )}
                    <PeriodSelector
                        value={period}
                        onChange={handlePeriodChange}
                        customDate={customDate}
                        onCustomDateChange={setCustomDate}
                    />
                </div>
            </motion.div>

            {/* Summary Cards - Premium Design */}
            <motion.div variants={fadeScale} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-all duration-300 border border-border/50 bg-gradient-to-br from-card to-blue-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="h-24 w-24" />
                    </div>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-blue-500/10 ring-1 ring-blue-500/20">
                                    <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{periodLabel}{t("analytics.totalCost")}</span>
                            </div>
                            <span className="text-2xl md:text-3xl font-bold tracking-tight">¥{summary.totalCost.toLocaleString()}</span>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t("analytics.expenseCount", { count: summary.expenseCount })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border border-border/50 bg-gradient-to-br from-card to-green-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Link2 className="h-24 w-24" />
                    </div>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-green-500/10 ring-1 ring-green-500/20">
                                    <Link2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{periodLabel}{t("analytics.newBacklinks")}</span>
                            </div>
                            <span className="text-2xl md:text-3xl font-bold tracking-tight">{summary.backlinkCount}</span>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-600 font-medium">{t("analytics.liveBacklinksCount", { count: summary.liveBacklinks })}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border border-border/50 bg-gradient-to-br from-card to-orange-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Receipt className="h-24 w-24" />
                    </div>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-orange-500/10 ring-1 ring-orange-500/20">
                                    <Receipt className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{periodLabel}{t("analytics.backlinkInvestment")}</span>
                            </div>
                            <span className="text-2xl md:text-3xl font-bold tracking-tight">${summary.backlinkCost.toLocaleString()}</span>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[150px] leading-tight">
                                {t("analytics.backlinkInvestmentDesc")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border border-border/50 bg-gradient-to-br from-card to-purple-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-purple-500/10 ring-1 ring-purple-500/20">
                                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{t("analytics.dailyAverage")}</span>
                            </div>
                            <span className="text-3xl font-bold tracking-tight">
                                ¥{(summary.totalCost / (period === "week" ? 7 : period === "month" ? 30 : period === "year" ? 365 : 1)).toFixed(0)}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t("analytics.basedOnPeriod", { period: periodLabel })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Charts Section - Enhanced Grid */}
            <motion.div variants={fadeSlideUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpenseTrendChart data={expenseTrend} />
                <BacklinkTrendChart data={backlinkTrend} />
            </motion.div>

            <motion.div variants={fadeSlideUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <CategoryPieChart data={categoryBreakdown} />
                </div>
                <div className="lg:col-span-2">
                    <ProjectCostBar data={projectCosts} />
                </div>
            </motion.div>
        </motion.div>
    );
}
