"use client";

import { useState, useMemo } from "react";
import { type SiteTool, type Preset } from "@/db/schema";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, ExternalLink, MoreHorizontal, Pencil, Trash2, Sparkles } from "lucide-react";
import { ToolDialog } from "./tool-dialog";
import { deleteTool, seedInitialTools } from "@/app/tools/actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryManager } from "@/components/ui/category-manager";
import { motion, AnimatePresence } from "framer-motion";

interface ToolsTableProps {
    tools: SiteTool[];
    categories: Preset[];
}

const costConfig: Record<string, { label: string; className: string }> = {
    free: { label: "Free", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900" },
    paid: { label: "Paid", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900" },
    freemium: { label: "Freemium", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900" },
};

export function ToolsTable({ tools, categories }: ToolsTableProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [costFilter, setCostFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<SiteTool | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);
    const { confirm } = useConfirmDialog();

    // 动态分类标签（从 presets 获取）
    const categoryLabels: Record<string, string> = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const cat of categories) {
            labels[cat.value] = cat.label || cat.value;
        }
        return labels;
    }, [categories]);

    const displayCostConfig = {
        free: { label: t("tools.costFree"), className: costConfig.free.className },
        paid: { label: t("tools.costPaid"), className: costConfig.paid.className },
        freemium: { label: t("tools.costFreemium"), className: costConfig.freemium.className },
    };


    const filteredTools = useMemo(() => {
        return tools.filter((tool) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (
                    !tool.name.toLowerCase().includes(query) &&
                    !tool.url.toLowerCase().includes(query) &&
                    !(tool.purpose?.toLowerCase().includes(query))
                ) {
                    return false;
                }
            }
            if (categoryFilter !== "all" && tool.category !== categoryFilter) {
                return false;
            }
            if (costFilter !== "all" && tool.cost !== costFilter) {
                return false;
            }
            return true;
        });
    }, [tools, searchQuery, categoryFilter, costFilter]);

    const handleEdit = (tool: SiteTool) => {
        setEditingTool(tool);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: t("tools.deleteConfirmTitle"),
            description: t("tools.deleteConfirmMessage"),
            confirmText: t("common.delete"),
            cancelText: t("common.cancel"),
            variant: "destructive",
        });
        if (confirmed) {
            await deleteTool(id);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingTool(null);
    };

    const handleSeedData = async () => {
        const confirmed = await confirm({
            title: t("tools.seedConfirmTitle"),
            description: t("tools.seedConfirmMessage"),
            confirmText: t("tools.import"),
            cancelText: t("common.cancel"),
        });
        if (confirmed) {
            setIsSeeding(true);
            try {
                await seedInitialTools();
            } catch (error) {
                console.error("Failed to seed data:", error);
            } finally {
                setIsSeeding(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar - Single Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 bg-card p-3 md:p-4 rounded-xl border border-border shadow-sm">
                {/* Search */}
                <div className="relative flex-1 min-w-[150px] group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                        placeholder={t("tools.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-background/50 border-muted-foreground/20 focus:border-primary/50"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[100px] sm:w-[140px] h-9 bg-background/50 text-xs sm:text-sm">
                            <SelectValue placeholder={t("expenses.category")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("tools.allCategories")}</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.value}>{cat.label || cat.value}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <CategoryManager type="tool_category" categories={categories} />
                </div>

                <Select value={costFilter} onValueChange={setCostFilter}>
                    <SelectTrigger className="w-[100px] sm:w-[120px] h-9 bg-background/50 text-xs sm:text-sm">
                        <SelectValue placeholder={t("tools.cost")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("tools.allCosts")}</SelectItem>
                        <SelectItem value="free">{t("tools.costFree")}</SelectItem>
                        <SelectItem value="paid">{t("tools.costPaid")}</SelectItem>
                        <SelectItem value="freemium">{t("tools.costFreemium")}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Button - Show when filters are applied */}
                {(searchQuery || categoryFilter !== "all" || costFilter !== "all") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter("all");
                            setCostFilter("all");
                        }}
                        className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                        {t("common.reset")}
                    </Button>
                )}

                {/* Count Badge and Seed Button */}
                <div className="flex items-center gap-2 self-center sm:ml-auto">
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap bg-muted/50 px-2 sm:px-3 py-1 rounded-full">
                        {t("tools.totalCount", { count: filteredTools.length })}
                    </span>
                    {tools.length === 0 && (
                        <Button variant="outline" size="sm" onClick={handleSeedData} disabled={isSeeding} className="h-9">
                            <Sparkles className="h-4 w-4 mr-1" />
                            {isSeeding ? t("tools.seeding") : t("tools.seedExample")}
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="min-w-[700px]">
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs uppercase tracking-wider">
                                <TableHead className="w-[120px]">{t("expenses.category")}</TableHead>
                                <TableHead className="w-[180px]">{t("tools.toolName")}</TableHead>
                                <TableHead className="w-[200px]">{t("tools.link")}</TableHead>
                                <TableHead>{t("tools.purpose")}</TableHead>
                                <TableHead className="w-[100px]">{t("tools.cost")}</TableHead>
                                <TableHead className="w-[60px] text-right">{t("common.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {filteredTools.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                    <Search className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                                <p>{t("tools.noTools")}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTools.map((tool, index) => (
                                        <motion.tr
                                            key={tool.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-muted/30 border-b border-border/40 last:border-0 transition-colors"
                                        >
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal border-0 bg-muted text-muted-foreground shadow-sm">
                                                    {categoryLabels[tool.category] || tool.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <a
                                                    href={tool.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium hover:text-primary transition-colors flex items-center gap-1 group/link"
                                                >
                                                    {tool.name}
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                                    <span className="truncate max-w-[180px]">{new URL(tool.url).hostname}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground line-clamp-1">
                                                    {tool.purpose || "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={displayCostConfig[tool.cost as keyof typeof displayCostConfig]?.className || ""}
                                                >
                                                    {displayCostConfig[tool.cost as keyof typeof displayCostConfig]?.label || tool.cost}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(tool)}>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            {t("common.edit")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(tool.id)}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {t("common.delete")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ToolDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                tool={editingTool}
            />
        </div>
    );
}
