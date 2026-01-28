"use client";

import { useTranslation } from "@/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, fadeScale, tableRowFade, viewportConfig } from "@/lib/animations";
import { Link2, ExternalLink, Calendar, TrendingUp, Activity, Wallet, Search, Filter, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BacklinkStatusCell } from "@/components/backlinks/backlink-status-cell";
import { BacklinkDialog } from "@/components/backlink-dialog";
import { deleteBacklink } from "@/lib/actions/backlinks";
import { useRouter } from "next/navigation";

interface Backlink {
    id: number;
    projectId: number;
    resourceId: number | null;
    sourceUrl: string;
    targetUrl: string;
    anchorText: string | null;
    daScore: number | null;
    cost: number | null;
    status: "planned" | "outreach" | "live" | "removed";
    acquiredDate: Date | null;
    createdAt: Date;
}

interface BacklinksPageClientProps {
    backlinks: Backlink[];
    projectNames: Record<number, string>;
    resources?: any[];
    totalCost: number;
    liveCount: number;
    monthlyBacklinkCost: number;
}

const backlinkStatusColors: Record<string, string> = {
    planned: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-800",
    outreach: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900",
    live: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-900",
    removed: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900",
};

// 使用共享动画变体
const container = staggerContainer;
const item = fadeSlideUp;
const cardItem = fadeScale;

export function BacklinksPageClient({
    backlinks,
    projectNames,
    resources = [],
    totalCost,
    liveCount,
    monthlyBacklinkCost
}: BacklinksPageClientProps) {
    const { t, locale } = useTranslation();
    const router = useRouter();

    // Filters State
    const [searchQuery, setSearchQuery] = useState("");
    const [projectFilter, setProjectFilter] = useState("all");
    const [resourceFilter, setResourceFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Memoized filtered data
    const filteredBacklinks = useMemo(() => {
        return backlinks.filter(backlink => {
            // Search Query
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                !query ||
                backlink.sourceUrl.toLowerCase().includes(query) ||
                backlink.targetUrl.toLowerCase().includes(query) ||
                (backlink.anchorText && backlink.anchorText.toLowerCase().includes(query));

            // Project Filter
            const matchesProject =
                projectFilter === "all" ||
                backlink.projectId.toString() === projectFilter;

            // Resource Filter
            const matchesResource =
                resourceFilter === "all" ||
                (resourceFilter === "none" && !backlink.resourceId) ||
                (backlink.resourceId && backlink.resourceId.toString() === resourceFilter);

            // Status Filter
            const matchesStatus =
                statusFilter === "all" ||
                backlink.status === statusFilter;

            return matchesSearch && matchesProject && matchesResource && matchesStatus;
        });
    }, [backlinks, searchQuery, projectFilter, resourceFilter, statusFilter]);

    // Unique Projects for Filter
    const uniqueProjectIds = useMemo(() => {
        return Array.from(new Set(backlinks.map(b => b.projectId)));
    }, [backlinks]);

    const handleDelete = async (id: number) => {
        if (confirm(t("common.deleteConfirm"))) {
            await deleteBacklink(id);
            router.refresh();
        }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        {t("backlinksPage.pageTitle")}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">{t("backlinksPage.pageSubtitle")}</p>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SpotlightCard
                    spotlightColor="rgba(59, 130, 246, 0.4)"
                    className="border-border/50 bg-gradient-to-br from-card to-primary/5 overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <Link2 className="h-16 w-16" />
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-primary/10 ring-1 ring-primary/20">
                                    <Link2 className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">{t("backlinksPage.totalBacklinks")}</p>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{backlinks.length}</p>
                        </div>
                    </div>
                </SpotlightCard>
                <SpotlightCard
                    spotlightColor="rgba(34, 197, 94, 0.4)"
                    className="border-border/50 bg-gradient-to-br from-card to-green-500/5 overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <Activity className="h-16 w-16" />
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-green-500/10 ring-1 ring-green-500/20">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">{t("backlinksPage.liveCount")}</p>
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">{liveCount}</p>
                        </div>
                    </div>
                </SpotlightCard>
                <SpotlightCard
                    spotlightColor="rgba(168, 85, 247, 0.4)"
                    className="border-border/50 bg-gradient-to-br from-card to-purple-500/5 overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <Wallet className="h-16 w-16" />
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-purple-500/10 ring-1 ring-purple-500/20">
                                    <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">{t("backlinksPage.totalCost")}</p>
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">${totalCost.toLocaleString()}</p>
                        </div>
                    </div>
                </SpotlightCard>
                <SpotlightCard
                    spotlightColor="rgba(249, 115, 22, 0.4)"
                    className="border-border/50 bg-gradient-to-br from-card to-orange-500/5 overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <TrendingUp className="h-16 w-16" />
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-orange-500/10 ring-1 ring-orange-500/20">
                                    <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">{t("backlinksPage.monthlyCost")}</p>
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">${monthlyBacklinkCost.toLocaleString()}</p>
                        </div>
                    </div>
                </SpotlightCard>
            </motion.div>

            {/* Filter Bar */}
            <motion.div variants={item} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border/60 bg-card shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("common.search") + " (URL, Anchor)..."}
                        className="pl-9 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4">
                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                        <SelectTrigger className="w-[140px] md:w-[180px]">
                            <SelectValue placeholder={t("backlinksPage.project")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("common.allProjects")}</SelectItem>
                            {uniqueProjectIds.map(id => (
                                <SelectItem key={id} value={id.toString()}>
                                    {projectNames[id] || `#${id}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={resourceFilter} onValueChange={setResourceFilter}>
                        <SelectTrigger className="w-[140px] md:w-[180px]">
                            <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("common.allResources")}</SelectItem>
                            {resources.map((r: any) => (
                                <SelectItem key={r.id} value={r.id.toString()}>
                                    {r.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px] md:w-[140px]">
                            <SelectValue placeholder={t("common.status")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("common.all")}</SelectItem>
                            <SelectItem value="planned">{t("dialog.backlinkStatusPlanned")}</SelectItem>
                            <SelectItem value="outreach">{t("dialog.backlinkStatusOutreach")}</SelectItem>
                            <SelectItem value="live">{t("dialog.backlinkStatusLive")}</SelectItem>
                            <SelectItem value="removed">{t("dialog.backlinkStatusRemoved")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Backlink Table */}
            <motion.div
                variants={item}
                className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <Table className="min-w-[900px]">
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs uppercase tracking-wider">
                                <TableHead className="w-[160px]">{t("backlinksPage.project")}</TableHead>
                                <TableHead className="w-[250px]">{t("backlinksPage.sourcePage")}</TableHead>
                                <TableHead>{t("backlinksPage.anchorText")}</TableHead>
                                <TableHead className="text-center w-[60px]">{t("backlinksPage.da")}</TableHead>
                                <TableHead className="text-right w-[80px]">{t("backlinksPage.cost")}</TableHead>
                                <TableHead className="w-[120px]">{t("backlinksPage.status")}</TableHead>
                                <TableHead className="text-right w-[100px]">{t("backlinksPage.date")}</TableHead>
                                <TableHead className="text-right w-[80px]">{t("common.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBacklinks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12 flex flex-col items-center justify-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                                            <Link2 className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                        <p>{t("backlinksPage.noData")}</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBacklinks.map((backlink, index) => (
                                    <motion.tr
                                        key={backlink.id}
                                        variants={tableRowFade}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: "-20px" }}
                                        transition={{ delay: index * 0.03 }}
                                        className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                <Link href={`/projects/${backlink.projectId}`} className="font-medium hover:text-primary transition-colors truncate max-w-[140px] block">
                                                    {projectNames[backlink.projectId] || `#${backlink.projectId}`}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <a href={backlink.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors max-w-[220px] truncate">
                                                    {new URL(backlink.sourceUrl).hostname}
                                                    <ExternalLink className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                                <span className="text-xs text-muted-foreground truncate max-w-[220px] opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {backlink.sourceUrl}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {backlink.anchorText ? (
                                                <Badge variant="outline" className="font-normal text-muted-foreground max-w-[150px] truncate block">
                                                    {backlink.anchorText}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground/30">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {backlink.daScore ? (
                                                <span className="font-mono font-medium">{backlink.daScore}</span>
                                            ) : (
                                                <span className="text-muted-foreground/30">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {backlink.cost ? `$${backlink.cost}` : <span className="text-muted-foreground/30">-</span>}
                                        </TableCell>
                                        <TableCell>
                                            <BacklinkStatusCell backlink={backlink} />
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {backlink.acquiredDate ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Calendar className="h-3 w-3 opacity-50" />
                                                    {new Date(backlink.acquiredDate).toLocaleDateString(locale === "en" ? "en-US" : "zh-CN")}
                                                </div>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                                <BacklinkDialog
                                                    projectId={backlink.projectId}
                                                    resources={resources}
                                                    backlinkToEdit={backlink}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                                    onClick={() => handleDelete(backlink.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </motion.div>
        </motion.div>
    );
}
