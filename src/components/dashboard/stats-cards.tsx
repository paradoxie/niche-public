"use client";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { DashboardStats } from "@/types";
import { Package, Banknote, Link as LinkIcon, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
    stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const { t } = useTranslation();

    const cards = [
        {
            title: t("dashboard.totalProjects"),
            value: stats.totalProjects,
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            gradient: "from-blue-500/20 to-blue-500/5",
            spotlightColor: "rgba(59, 130, 246, 0.4)",
            trend: "+2 this month" // Placeholder trend
        },
        {
            title: t("dashboard.adSenseActiveCount"),
            value: stats.activeAdsense,
            icon: Banknote,
            color: "text-green-500",
            bg: "bg-green-500/10",
            gradient: "from-green-500/20 to-green-500/5",
            spotlightColor: "rgba(34, 197, 94, 0.4)",
            trend: "Stable"
        },
        {
            title: t("dashboard.monthlyBacklinkCost"),
            value: `$${stats.monthlyBacklinkCost.toFixed(0)}`,
            icon: LinkIcon,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            gradient: "from-purple-500/20 to-purple-500/5",
            spotlightColor: "rgba(168, 85, 247, 0.4)",
            trend: "-5% vs last month"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {cards.map((card, i) => (
                <SpotlightCard
                    key={i}
                    spotlightColor={card.spotlightColor}
                    className="border-border/50 hover:border-border transition-all duration-300 overflow-hidden"
                >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none", card.gradient)} />

                    <div className="p-4 md:p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-muted-foreground">{card.title}</p>
                                <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 tracking-tight">{card.value}</h3>
                                {/* Optional Trend Indicator */}
                                {/* 
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                    {card.trend}
                                </p>
                                */}
                            </div>
                            <div className={cn("p-2 md:p-3 rounded-lg md:rounded-xl", card.bg)}>
                                <card.icon className={cn("h-5 w-5 md:h-6 md:w-6", card.color)} />
                            </div>
                        </div>
                    </div>
                </SpotlightCard>
            ))}
        </div>
    );
}

