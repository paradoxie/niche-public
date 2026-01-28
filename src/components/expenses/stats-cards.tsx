"use client";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Wallet, Calendar, Building2, FolderKanban } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface StatsCardsProps {
    stats: {
        thisMonth: number;
        thisYear: number;
        globalCost: number;
        projectCost: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const { t } = useTranslation();

    const formatAmount = (amount: number) => {
        return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <SpotlightCard
                spotlightColor="rgba(59, 130, 246, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-muted/20 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Calendar className="h-16 w-16" />
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-blue-500/10 ring-1 ring-blue-500/20">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("expenses.thisMonth")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{formatAmount(stats.thisMonth)}</p>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(34, 197, 94, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-muted/20 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Wallet className="h-16 w-16" />
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-green-500/10 ring-1 ring-green-500/20">
                                <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("expenses.thisYear")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{formatAmount(stats.thisYear)}</p>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(168, 85, 247, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-muted/20 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Building2 className="h-16 w-16" />
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-purple-500/10 ring-1 ring-purple-500/20">
                                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("expenses.globalCost")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{formatAmount(stats.globalCost)}</p>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(249, 115, 22, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-muted/20 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <FolderKanban className="h-16 w-16" />
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-orange-500/10 ring-1 ring-orange-500/20">
                                <FolderKanban className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("expenses.projectCost")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{formatAmount(stats.projectCost)}</p>
                    </div>
                </div>
            </SpotlightCard>
        </div>
    );
}

