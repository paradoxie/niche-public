"use client";

import { useTranslation } from "@/i18n/context";
import { ResourcesTable } from "@/components/resources/resources-table";
import { StatsCards } from "@/components/resources/stats-cards";
import { ResourceDialog } from "@/components/resources/resource-dialog";
import { ShineBorderButton } from "@/components/ui/shine-border-button";
import type { LinkResource, Preset } from "@/db/schema";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, fadeScale, viewportConfig } from "@/lib/animations";

interface ResourcesPageClientProps {
    resources: LinkResource[];
    stats: {
        total: number;
        activeCount: number;
        freeCount: number;
        usedCount: number;
    };
    resourceTypes: Preset[];
}

export function ResourcesPageClient({ resources, stats, resourceTypes }: ResourcesPageClientProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">{t("resources.pageTitle")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("resources.pageSubtitle")}
                    </p>
                </div>
                <ResourceDialog trigger={<ShineBorderButton size="sm">+ {t("resources.addResource")}</ShineBorderButton>} resourceTypes={resourceTypes} />
            </motion.div>
            <motion.div variants={fadeScale}>
                <StatsCards stats={stats} />
            </motion.div>
            <motion.div variants={fadeSlideUp}>
                <ResourcesTable resources={resources} resourceTypes={resourceTypes} />
            </motion.div>
        </motion.div>
    );
}


