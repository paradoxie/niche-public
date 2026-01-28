"use client";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Wrench, DollarSign, Gift, Zap } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface StatsCardsProps {
    stats: {
        total: number;
        freeCount: number;
        paidCount: number;
        freemiumCount: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SpotlightCard
                spotlightColor="rgba(59, 130, 246, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-blue-500/5 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Wrench className="h-16 w-16" />
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-blue-500/10 ring-1 ring-blue-500/20">
                                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("tools.allTools")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(34, 197, 94, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-green-500/5 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Gift className="h-16 w-16" />
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-green-500/10 ring-1 ring-green-500/20">
                                <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("tools.freeTools")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{stats.freeCount}</p>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(249, 115, 22, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-orange-500/5 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Zap className="h-16 w-16" />
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-orange-500/10 ring-1 ring-orange-500/20">
                                <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("tools.freemiumTools")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{stats.freemiumCount}</p>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(168, 85, 247, 0.4)"
                className="border-border/50 bg-gradient-to-br from-card to-purple-500/5 overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <DollarSign className="h-16 w-16" />
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-md bg-purple-500/10 ring-1 ring-purple-500/20">
                                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{t("tools.paidTools")}</p>
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{stats.paidCount}</p>
                    </div>
                </div>
            </SpotlightCard>
        </div>
    );
}

