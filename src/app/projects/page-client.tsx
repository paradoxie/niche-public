"use client";

import { type Project } from "@/db/schema";
import { ProjectsView } from "@/components/dashboard/projects-table";
import { ShineBorderButton } from "@/components/ui/shine-border-button";
import { useTranslation } from "@/i18n/context";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, viewportConfig } from "@/lib/animations";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { calculateHealthStatus } from "@/lib/health";
import { CheckCircle2, AlertTriangle, AlertCircle, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface ProjectsPageClientProps {
    projects: Project[];
    backlinkCounts: Record<number, number>;
}

export function ProjectsPageClient({ projects, backlinkCounts }: ProjectsPageClientProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Stats calculation
    const stats = useMemo(() => {
        return {
            total: projects.length,
            good: projects.filter((p) => calculateHealthStatus(p) === "good").length,
            warning: projects.filter((p) => calculateHealthStatus(p) === "warning").length,
            danger: projects.filter((p) => calculateHealthStatus(p) === "danger").length,
        };
    }, [projects]);

    // 从 URL 获取筛选参数
    const initialHealthFilter = searchParams.get("health") || "all";
    const initialStatusFilter = searchParams.get("status") || undefined;
    const initialAdsenseFilter = searchParams.get("adsense") || undefined;

    const handleHealthFilter = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === "all") {
            params.delete("health");
        } else {
            params.set("health", status);
        }
        router.push(`/projects?${params.toString()}`);
    };

    return (
        <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            <motion.div variants={fadeSlideUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">{t("projects.projectList")}</h2>
                        <p className="text-sm text-muted-foreground md:hidden">
                            {t("projects.manageProjects")}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {/* Total */}
                        <div
                            onClick={() => handleHealthFilter("all")}
                            className={cn(
                                "flex flex-col items-start justify-center px-4 py-2 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-all min-w-[100px]",
                                initialHealthFilter === "all" && "border-primary/50 bg-primary/5 shadow-sm"
                            )}
                        >
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase font-medium">
                                <LayoutGrid className="h-3 w-3" /> {t("dashboard.allStatus")}
                            </span>
                            <span className="text-lg font-bold tracking-tight">{stats.total}</span>
                        </div>

                        {/* Good */}
                        <div
                            onClick={() => handleHealthFilter("good")}
                            className={cn(
                                "flex flex-col items-start justify-center px-4 py-2 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-all min-w-[100px]",
                                initialHealthFilter === "good" && "border-green-500/50 bg-green-500/10 shadow-sm"
                            )}
                        >
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase font-medium">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> {t("dashboard.healthGood")}
                            </span>
                            <span className="text-lg font-bold tracking-tight">{stats.good}</span>
                        </div>

                        {/* Warning */}
                        <div
                            onClick={() => handleHealthFilter("warning")}
                            className={cn(
                                "flex flex-col items-start justify-center px-4 py-2 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-all min-w-[100px]",
                                initialHealthFilter === "warning" && "border-yellow-500/50 bg-yellow-500/10 shadow-sm"
                            )}
                        >
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase font-medium">
                                <AlertTriangle className="h-3 w-3 text-yellow-500" /> {t("dashboard.healthWarning")}
                            </span>
                            <span className="text-lg font-bold tracking-tight">{stats.warning}</span>
                        </div>

                        {/* Danger */}
                        <div
                            onClick={() => handleHealthFilter("danger")}
                            className={cn(
                                "flex flex-col items-start justify-center px-4 py-2 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-all min-w-[100px]",
                                initialHealthFilter === "danger" && "border-red-500/50 bg-red-500/10 shadow-sm"
                            )}
                        >
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase font-medium">
                                <AlertCircle className="h-3 w-3 text-red-500" /> {t("dashboard.healthDanger")}
                            </span>
                            <span className="text-lg font-bold tracking-tight">{stats.danger}</span>
                        </div>
                    </div>
                </div>

                <Link href="/projects/new">
                    <ShineBorderButton size="sm">+ {t("projects.addProject")}</ShineBorderButton>
                </Link>
            </motion.div>
            <motion.div variants={fadeSlideUp}>
                <ProjectsView
                    projects={projects}
                    backlinkCounts={backlinkCounts}
                    initialHealthFilter={initialHealthFilter}
                    initialStatusFilter={initialStatusFilter}
                    initialAdsenseFilter={initialAdsenseFilter}
                />
            </motion.div>
        </motion.div>
    );
}
