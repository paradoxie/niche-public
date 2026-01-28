"use client";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import type { Expense, Project } from "@/db/schema";
import { useTranslation } from "@/i18n/context";

interface UpcomingExpiresProps {
    items: Array<{
        expense: Expense;
        project: Project | null;
    }>;
}

export function UpcomingExpires({ items }: UpcomingExpiresProps) {
    const { t } = useTranslation();
    const getDaysRemaining = (expiresAt: Date) => {
        const now = new Date();
        return Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getUrgencyColor = (days: number) => {
        if (days <= 7) return "text-red-600 bg-red-500/10";
        if (days <= 14) return "text-orange-600 bg-orange-500/10";
        return "text-yellow-600 bg-yellow-500/10";
    };

    return (
        <SpotlightCard
            spotlightColor="rgba(239, 68, 68, 0.4)"
            className="border-border/50 bg-gradient-to-br from-card to-muted/20 h-full"
        >
            <div className="p-4 md:p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-red-500/10 ring-1 ring-red-500/20">
                        <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{t("home.upcomingExpiry")}</p>
                    {items.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
                    )}
                </div>

                {items.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-2 flex-1 flex items-center justify-center">
                        {t("home.noUpcomingExpiry")}
                    </p>
                ) : (
                    <div className="space-y-2 flex-1 overflow-y-auto max-h-28">
                        {items.slice(0, 3).map(({ expense, project }) => {
                            const days = expense.expiresAt ? getDaysRemaining(expense.expiresAt) : 0;
                            return (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-1.5 rounded-md border border-border/50 text-xs"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{expense.name}</p>
                                        <p className="text-muted-foreground truncate">
                                            {project?.name || t("expenses.globalCost")}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={`${getUrgencyColor(days)} text-xs px-1.5 py-0.5 ml-2 shrink-0`}>
                                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                        {days}d
                                    </Badge>
                                </div>
                            );
                        })}
                        {items.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                                +{items.length - 3} {t("common.items")}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </SpotlightCard>
    );
}
