"use client";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Globe, CheckCircle, DollarSign, Link2 } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface StatsCardsProps {
    stats: {
        total: number;
        activeCount: number;
        freeCount: number;
        usedCount: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SpotlightCard
                spotlightColor="rgba(59, 130, 246, 0.4)"
                className="border-border/50"
            >
                <div className="pt-6 px-6 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/10">
                            <Globe className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("stats.totalResources")}</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(34, 197, 94, 0.4)"
                className="border-border/50"
            >
                <div className="pt-6 px-6 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-500/10">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("stats.activeResources")}</p>
                            <p className="text-2xl font-bold">{stats.activeCount}</p>
                        </div>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(16, 185, 129, 0.4)"
                className="border-border/50"
            >
                <div className="pt-6 px-6 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-emerald-500/10">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("stats.freeResources")}</p>
                            <p className="text-2xl font-bold">{stats.freeCount}</p>
                        </div>
                    </div>
                </div>
            </SpotlightCard>

            <SpotlightCard
                spotlightColor="rgba(168, 85, 247, 0.4)"
                className="border-border/50"
            >
                <div className="pt-6 px-6 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/10">
                            <Link2 className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("stats.usedResources")}</p>
                            <p className="text-2xl font-bold">{stats.usedCount}</p>
                        </div>
                    </div>
                </div>
            </SpotlightCard>
        </div>
    );
}

