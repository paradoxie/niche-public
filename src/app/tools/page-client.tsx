"use client";

import { type SiteTool, type Preset } from "@/db/schema";
import { ToolsTable } from "@/components/tools/tools-table";
import { StatsCards } from "@/components/tools/stats-cards";
import { ToolDialog } from "@/components/tools/tool-dialog";
import { ShineBorderButton } from "@/components/ui/shine-border-button";
import { useTranslation } from "@/i18n/context";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, fadeScale, viewportConfig } from "@/lib/animations";

interface ToolsPageClientProps {
    tools: SiteTool[];
    stats: {
        total: number;
        freeCount: number;
        paidCount: number;
        freemiumCount: number;
    };
    categories: Preset[];
}

export function ToolsPageClient({ tools, stats, categories }: ToolsPageClientProps) {
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
                    <h2 className="text-2xl font-semibold tracking-tight">{t("tools.pageTitle")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("tools.pageSubtitle")}
                    </p>
                </div>
                <ToolDialog trigger={<ShineBorderButton size="sm">+ {t("tools.addTool")}</ShineBorderButton>} categories={categories} />
            </motion.div>
            <motion.div variants={fadeScale}>
                <StatsCards stats={stats} />
            </motion.div>
            <motion.div variants={fadeSlideUp}>
                <ToolsTable tools={tools} categories={categories} />
            </motion.div>
        </motion.div>
    );
}


