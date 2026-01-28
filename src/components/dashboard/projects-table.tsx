"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { manualUpdateProject, syncGithub } from "@/lib/actions/projects";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Project } from "@/db/schema";
import { HealthStatus } from "@/types";
import { calculateHealthStatus, formatRelativeTime, formatDomainExpiry, formatLaunchDuration, getHealthReasons } from "@/lib/health";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, AlertCircle,
    Filter, Search, LayoutGrid, List as ListIcon, Globe, Calendar, Link2, Rocket, Github, Wrench,
    Egg, ShoppingCart, Skull
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectIcon } from "@/components/project-icon";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { projectStatusEnum } from "@/db/schema";


const adsenseStatusColors: Record<string, string> = {
    none: "bg-muted text-muted-foreground",
    reviewing: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900",
    active: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900",
    limited: "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-200 dark:border-orange-900",
    banned: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900",
};

const healthIcons = {
    danger: AlertCircle,
    warning: AlertTriangle,
    good: CheckCircle2,
};

const healthStyles = {
    danger: "bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20",
    good: "bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/20",
};

// Project status styles and icons (for non-active statuses)
const projectStatusStyles: Record<string, string> = {
    incubating: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    sold: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    dead: "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const projectStatusIcons: Record<string, typeof Egg> = {
    incubating: Egg,
    sold: ShoppingCart,
    dead: Skull,
};

type SortDirection = "asc" | "desc" | null;
type ViewMode = "grid" | "list";

interface ProjectsViewProps {
    projects: Project[];
    backlinkCounts: Record<number, number>;
    initialHealthFilter?: string;
    initialStatusFilter?: string;
    initialAdsenseFilter?: string;
}

export function ProjectsView({ projects, backlinkCounts, initialHealthFilter, initialStatusFilter, initialAdsenseFilter }: ProjectsViewProps) {
    const { t } = useTranslation();
    const router = useRouter(); // Initialize router
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    // Filters & Sort
    const [healthFilter, setHealthFilter] = useState<string>(initialHealthFilter || "all");
    const [adsenseFilter, setAdsenseFilter] = useState<string>(initialAdsenseFilter || "all");
    const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || "all");

    // Sync filters with props (for external control like URL params or Stats Cards)
    useEffect(() => {
        if (initialHealthFilter) setHealthFilter(initialHealthFilter);
    }, [initialHealthFilter]);

    useEffect(() => {
        if (initialAdsenseFilter) setAdsenseFilter(initialAdsenseFilter);
    }, [initialAdsenseFilter]);

    useEffect(() => {
        if (initialStatusFilter) setStatusFilter(initialStatusFilter);
    }, [initialStatusFilter]);

    const [searchQuery, setSearchQuery] = useState("");
    const [updateSortDir, setUpdateSortDir] = useState<SortDirection>(null);

    const getLastUpdate = (project: Project) => {
        const githubTime = project.lastGithubPush?.getTime() || 0;
        const contentTime = project.lastContentUpdate?.getTime() || 0;
        const manualTime = project.lastManualUpdate?.getTime() || 0;
        return Math.max(githubTime, contentTime, manualTime) || null;
    };

    const filteredProjects = useMemo(() => {
        let result = projects.map(project => ({
            project,
            health: calculateHealthStatus(project),
            lastUpdate: getLastUpdate(project)
        }));

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.project.name.toLowerCase().includes(query) ||
                item.project.siteUrl?.toLowerCase().includes(query) ||
                item.project.nicheCategory?.toLowerCase().includes(query)
            );
        }

        if (healthFilter !== "all") {
            result = result.filter(item => item.health === healthFilter);
        }

        if (adsenseFilter !== "all") {
            result = result.filter(item => item.project.adsenseStatus === adsenseFilter);
        }

        if (statusFilter !== "all") {
            result = result.filter(item => item.project.status === statusFilter);
        }

        if (updateSortDir) {
            result.sort((a, b) => {
                const aTime = a.lastUpdate || 0;
                const bTime = b.lastUpdate || 0;
                return updateSortDir === "asc" ? aTime - bTime : bTime - aTime;
            });
        }

        return result;
    }, [projects, healthFilter, adsenseFilter, statusFilter, updateSortDir, searchQuery]);

    const toggleUpdateSort = () => {
        setUpdateSortDir(prev => {
            if (prev === "desc") return "asc";
            return "desc";
        });
    };

    const adsenseStatusMap: Record<string, string> = {
        none: t("dashboard.adSenseNone"),
        reviewing: t("dashboard.adSenseReviewing"),
        rejected: t("dashboard.adSenseRejected"),
        active: t("dashboard.adSenseActive"),
        limited: t("dashboard.adSenseLimited"),
        banned: t("dashboard.adSenseBanned"),
    };

    const healthLabels: Record<string, string> = {
        danger: t("dashboard.healthDanger"),
        warning: t("dashboard.healthWarning"),
        good: t("dashboard.healthGood"),
    };

    return (
        <div className="space-y-6">
            {/* Toolbar - Single Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 bg-card p-3 md:p-4 rounded-xl border border-border shadow-sm">
                {/* Search */}
                <div className="relative flex-1 min-w-[150px] group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                        placeholder={t("dashboard.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
                    />
                </div>

                {/* GitHub Sort Button */}
                <Button
                    variant={updateSortDir ? "secondary" : "outline"}
                    size="sm"
                    onClick={toggleUpdateSort}
                    className={cn("h-9 px-3 text-xs gap-1.5", updateSortDir && "bg-primary/10 text-primary border-primary/30")}
                >
                    <Github className="h-3.5 w-3.5" />
                    {updateSortDir === "desc" ? (
                        <ArrowDown className="h-3.5 w-3.5" />
                    ) : updateSortDir === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowUpDown className="h-3.5 w-3.5" />
                    )}
                </Button>

                {/* Filters */}
                <Select value={healthFilter} onValueChange={setHealthFilter}>
                    <SelectTrigger className="w-[100px] sm:w-[120px] h-9 bg-background/50 text-xs sm:text-sm">
                        <SelectValue placeholder={t("dashboard.health")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("dashboard.allHealth")}</SelectItem>
                        <SelectItem value="good">{t("dashboard.healthGood")}</SelectItem>
                        <SelectItem value="warning">{t("dashboard.healthWarning")}</SelectItem>
                        <SelectItem value="danger">{t("dashboard.healthDanger")}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={adsenseFilter} onValueChange={setAdsenseFilter}>
                    <SelectTrigger className="w-[100px] sm:w-[120px] h-9 bg-background/50 text-xs sm:text-sm">
                        <SelectValue placeholder={t("dashboard.adSense")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("dashboard.allStatus")}</SelectItem>
                        <SelectItem value="active">{t("dashboard.adSenseActive")}</SelectItem>
                        <SelectItem value="reviewing">{t("dashboard.adSenseReviewing")}</SelectItem>
                        <SelectItem value="rejected">{t("dashboard.adSenseRejected")}</SelectItem>
                        <SelectItem value="limited">{t("dashboard.adSenseLimited")}</SelectItem>
                        <SelectItem value="banned">{t("dashboard.adSenseBanned")}</SelectItem>
                        <SelectItem value="none">{t("dashboard.adSenseNone")}</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[100px] sm:w-[120px] h-9 bg-background/50 text-xs sm:text-sm">
                        <SelectValue placeholder={t("projects.status")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("dashboard.allStatus")}</SelectItem>
                        {projectStatusEnum.map((status) => (
                            <SelectItem key={status} value={status}>
                                {t(`projects.status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* GitHub Sort Button */}


                {/* Reset Button - Show when filters are applied */}
                {(searchQuery || healthFilter !== "all" || adsenseFilter !== "all" || statusFilter !== "all" || updateSortDir) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery("");
                            setHealthFilter("all");
                            setAdsenseFilter("all");
                            setStatusFilter("all");
                            setUpdateSortDir(null);
                        }}
                        className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                        {t("common.reset")}
                    </Button>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50 self-center sm:ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={cn("h-7 px-2", viewMode === "grid" && "bg-background shadow-sm text-primary")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={cn("h-7 px-2", viewMode === "list" && "bg-background shadow-sm text-primary")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {viewMode === "grid" ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {filteredProjects.map(({ project, health, lastUpdate }) => {
                            const HealthIcon = healthIcons[health];
                            const domainInfo = formatDomainExpiry(project.domainExpiry, t);
                            const healthReasons = getHealthReasons(project, t);
                            const faviconUrl = project.siteUrl
                                ? `https://www.google.com/s2/favicons?domain=${new URL(project.siteUrl).hostname}&sz=64`
                                : null;

                            return (
                                <motion.div
                                    key={project.id}
                                    layout
                                    layoutId={`project-card-${project.id}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 350, damping: 30 },
                                        opacity: { duration: 0.2 },
                                        scale: { duration: 0.2 }
                                    }}
                                >
                                    <Link href={`/projects/${project.id}`} className="block h-full">
                                        <SpotlightCard className="group relative h-full flex flex-col">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-3">
                                                    <ProjectIcon
                                                        project={project}
                                                        className="h-10 w-10 rounded-lg text-base"
                                                    />
                                                    {/* Health Badge with Tooltip */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="outline" className={cn("border-0 h-6 px-2 text-[10px] cursor-help", healthStyles[health])}>
                                                                <HealthIcon className="h-3 w-3 mr-1" />
                                                                {healthLabels[health]}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" className="max-w-[280px] p-3 bg-popover border-border">
                                                            <div className="space-y-2">
                                                                {/* Good Status */}
                                                                <div className={cn(
                                                                    "flex items-start gap-2 p-2 rounded-md transition-all",
                                                                    health === "good"
                                                                        ? "bg-green-100 dark:bg-green-500/20 ring-1 ring-green-300 dark:ring-green-500/40"
                                                                        : "opacity-40"
                                                                )}>
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            <span className="font-medium text-sm text-foreground">{t("health.statusGood")}</span>
                                                                            {health === "good" && <span className="text-[10px] px-1.5 py-0.5 bg-green-200 dark:bg-green-500/30 text-green-700 dark:text-green-300 rounded-full font-medium">{t("health.currentStatus")}</span>}
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">{t("health.statusGoodDesc")}</p>
                                                                    </div>
                                                                </div>
                                                                {/* Warning Status */}
                                                                <div className={cn(
                                                                    "flex items-start gap-2 p-2 rounded-md transition-all",
                                                                    health === "warning"
                                                                        ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-300 dark:ring-yellow-500/40"
                                                                        : "opacity-40"
                                                                )}>
                                                                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            <span className="font-medium text-sm text-foreground">{t("health.statusWarning")}</span>
                                                                            {health === "warning" && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-200 dark:bg-yellow-500/30 text-yellow-700 dark:text-yellow-300 rounded-full font-medium">{t("health.currentStatus")}</span>}
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">{t("health.statusWarningDesc")}</p>
                                                                    </div>
                                                                </div>
                                                                {/* Danger Status */}
                                                                <div className={cn(
                                                                    "flex items-start gap-2 p-2 rounded-md transition-all",
                                                                    health === "danger"
                                                                        ? "bg-red-100 dark:bg-red-500/20 ring-1 ring-red-300 dark:ring-red-500/40"
                                                                        : "opacity-40"
                                                                )}>
                                                                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            <span className="font-medium text-sm text-foreground">{t("health.statusDanger")}</span>
                                                                            {health === "danger" && <span className="text-[10px] px-1.5 py-0.5 bg-red-200 dark:bg-red-500/30 text-red-700 dark:text-red-300 rounded-full font-medium">{t("health.currentStatus")}</span>}
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">{t("health.statusDangerDesc")}</p>
                                                                    </div>
                                                                </div>
                                                                {/* Current Issues */}
                                                                {healthReasons.length > 0 && (
                                                                    <div className="border-t border-border pt-2 mt-2">
                                                                        <p className="text-xs font-medium text-muted-foreground mb-1">{health === "good" ? "" : "Issues:"}</p>
                                                                        <ul className="space-y-0.5 text-xs">
                                                                            {healthReasons.map((reason, i) => (
                                                                                <li key={i} className="text-foreground">• {reason}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>

                                                <div className="mb-3">
                                                    <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors leading-tight mb-1">{project.name}</h3>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                            {project.siteUrl ? (
                                                                <a href={project.siteUrl} target="_blank" onClick={(e) => e.stopPropagation()} className="text-xs text-muted-foreground truncate hover:text-primary hover:underline block flex-1">
                                                                    {new URL(project.siteUrl).hostname}
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground truncate">{t("home.noUrlConfigured")}</span>
                                                            )}
                                                        </div>
                                                        {/* AdSense Badge with Pulse Animation for Active */}
                                                        <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal border-0 shrink-0 flex items-center gap-1", adsenseStatusColors[project.adsenseStatus])}>
                                                            {project.adsenseStatus === "active" && (
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                                </span>
                                                            )}
                                                            {adsenseStatusMap[project.adsenseStatus]}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-auto">
                                                    {/* Show status badge for non-active projects */}
                                                    {project.status !== "active" && (
                                                        <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-normal flex items-center gap-1", projectStatusStyles[project.status])}>
                                                            {(() => {
                                                                const StatusIcon = projectStatusIcons[project.status];
                                                                return StatusIcon ? <StatusIcon className="h-3 w-3" /> : null;
                                                            })()}
                                                            {t(`projects.status${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`)}
                                                        </Badge>
                                                    )}
                                                    {project.nicheCategory && (
                                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-secondary/50">
                                                            {project.nicheCategory}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="px-4 py-3 bg-muted/30 border-t border-border/50 grid grid-cols-2 gap-y-2 gap-x-1 text-[10px] sm:text-xs">
                                                <div className="flex items-center gap-1.5 text-muted-foreground" title={t("nav.backlinks")}>
                                                    <Link2 className="h-3.5 w-3.5" />
                                                    <span>{backlinkCounts[project.id] || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground justify-self-end">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span className={domainInfo.isDanger ? "text-red-500 font-medium" : ""}>{domainInfo.text}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground" title={t("dashboard.launchDuration")}>
                                                    <Rocket className="h-3.5 w-3.5" />
                                                    <span>{formatLaunchDuration(project.launchedAt, t) || "-"}</span>
                                                </div>
                                                {project.githubAccountId ? (
                                                    <div
                                                        role="button"
                                                        className="flex items-center gap-1.5 text-muted-foreground justify-self-end hover:text-primary transition-colors cursor-pointer"
                                                        title={t("dashboard.lastPush")}
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            await syncGithub(project.id);
                                                            router.refresh();
                                                        }}
                                                    >
                                                        <Github className="h-3.5 w-3.5" />
                                                        <span>{project.lastGithubPush ? formatRelativeTime(project.lastGithubPush, t) : "-"}</span>
                                                    </div>
                                                ) : (
                                                    <div
                                                        role="button"
                                                        className="flex items-center gap-1.5 text-muted-foreground justify-self-end hover:text-primary transition-colors cursor-pointer"
                                                        title={t("dashboard.manualCheckIn")}
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            await manualUpdateProject(project.id);
                                                            router.refresh();
                                                        }}
                                                    >
                                                        <Wrench className="h-3.5 w-3.5" />
                                                        <span>{project.lastManualUpdate ? formatRelativeTime(project.lastManualUpdate, t) : t("common.update")}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </SpotlightCard>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl border border-border overflow-hidden bg-card"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>{t("dashboard.projectName")}</TableHead>
                                    <TableHead>{t("dashboard.health")}</TableHead>
                                    <TableHead>{t("dashboard.adSense")}</TableHead>
                                    <TableHead>{t("dashboard.domainExpiry")}</TableHead>
                                    <TableHead className="text-right">{t("dashboard.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProjects.map(({ project, health }) => {
                                    const HealthIcon = healthIcons[health];
                                    const domainInfo = formatDomainExpiry(project.domainExpiry, t);

                                    return (
                                        <TableRow key={project.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary hover:underline">
                                                    {project.name}
                                                </Link>
                                                {project.siteUrl && (
                                                    <a href={project.siteUrl} target="_blank" className="ml-2 text-muted-foreground hover:text-primary">
                                                        <Globe className="h-3 w-3 inline" />
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <HealthIcon className={cn("h-4 w-4", health === "good" ? "text-green-500" : health === "warning" ? "text-yellow-500" : "text-red-500")} />
                                                    <span className="text-sm">{healthLabels[health]}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("font-normal border-0", adsenseStatusColors[project.adsenseStatus])}>
                                                    {adsenseStatusMap[project.adsenseStatus]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn("text-sm", domainInfo.isDanger && "text-red-500 font-medium")}>
                                                    {domainInfo.text}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!project.githubAccountId && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        await manualUpdateProject(project.id);
                                                                        router.refresh();
                                                                    }}
                                                                >
                                                                    <Wrench className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t("dashboard.manualCheckIn")}</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <Link href={`/projects/${project.id}`}>
                                                        <Button size="sm" variant="ghost">{t("common.view")}</Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
