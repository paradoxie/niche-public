"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type LinkResource, type Preset } from "@/db/schema";
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
import { Plus, Search, Filter, ExternalLink, MoreHorizontal, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { ResourceDialog } from "./resource-dialog";
import { deleteResource } from "@/app/resources/actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryManager } from "@/components/ui/category-manager";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;

interface ResourcesTableProps {
    resources: LinkResource[];
    resourceTypes: Preset[];
}

export function ResourcesTable({ resources, resourceTypes }: ResourcesTableProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<LinkResource | null>(null);
    const { confirm } = useConfirmDialog();

    // 动态类型标签（从 presets 获取）
    const typeLabels: Record<string, string> = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const type of resourceTypes) {
            labels[type.value] = type.label || type.value;
        }
        return labels;
    }, [resourceTypes]);

    const statusConfig: Record<string, { label: string; className: string }> = {
        active: { label: t("common.active"), className: "bg-green-500/10 text-green-600 border-green-200" },
        inactive: { label: t("common.inactive"), className: "bg-muted text-muted-foreground border-muted-foreground/20" },
        pending: { label: t("common.pending"), className: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
    };


    const filteredResources = useMemo(() => {
        return resources.filter((resource) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (
                    !resource.name.toLowerCase().includes(query) &&
                    !resource.url.toLowerCase().includes(query)
                ) {
                    return false;
                }
            }
            if (typeFilter !== "all" && resource.type !== typeFilter) {
                return false;
            }
            if (statusFilter !== "all" && resource.status !== statusFilter) {
                return false;
            }
            return true;
        });
    }, [resources, searchQuery, typeFilter, statusFilter]);

    const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
    const paginatedResources = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredResources.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredResources, currentPage]);

    const handleEdit = (resource: LinkResource) => {
        setEditingResource(resource);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: t("resources.deleteConfirmTitle"),
            description: t("resources.deleteConfirmMessage"),
            confirmText: t("common.delete"),
            cancelText: t("common.cancel"),
            variant: "destructive",
        });
        if (confirmed) {
            await deleteResource(id);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingResource(null);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar - Single Row */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 bg-card p-3 md:p-4 rounded-xl border border-border shadow-sm"
            >
                {/* Search */}
                <div className="relative flex-1 min-w-[150px] group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                        placeholder={t("resources.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-background/50 border-muted-foreground/20 focus:border-primary/50"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[100px] sm:w-[140px] h-9 bg-background/50 text-xs sm:text-sm">
                            <SelectValue placeholder={t("common.type")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("resources.allTypes")}</SelectItem>
                            {resourceTypes.map((type) => (
                                <SelectItem key={type.id} value={type.value}>{type.label || type.value}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <CategoryManager type="resource_type" categories={resourceTypes} />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[100px] sm:w-[130px] h-9 bg-background/50 text-xs sm:text-sm">
                        <SelectValue placeholder={t("common.status")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("resources.allStatus")}</SelectItem>
                        <SelectItem value="active">{t("common.active")}</SelectItem>
                        <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                        <SelectItem value="pending">{t("common.pending")}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Button - Show when filters are applied */}
                {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery("");
                            setTypeFilter("all");
                            setStatusFilter("all");
                            setCurrentPage(1);
                        }}
                        className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                        {t("common.reset")}
                    </Button>
                )}

                {/* Count Badge */}
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap bg-muted/50 px-2 sm:px-3 py-1 rounded-full self-center sm:ml-auto">
                    {t("resources.totalResources", { count: filteredResources.length })}
                </span>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border overflow-hidden bg-card shadow-sm"
            >
                <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[200px]">{t("common.name")}</TableHead>
                                <TableHead className="w-[250px]">{t("common.url")}</TableHead>
                                <TableHead className="w-[100px]">{t("common.type")}</TableHead>
                                <TableHead className="w-[80px] text-center">DA</TableHead>
                                <TableHead className="w-[80px] text-center">DR</TableHead>
                                <TableHead className="w-[80px]">{t("common.price")}</TableHead>
                                <TableHead className="w-[80px]">{t("common.status")}</TableHead>
                                <TableHead className="w-[60px] text-right">{t("common.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {paginatedResources.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                    <Search className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                                <p>{t("resources.noResources")}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedResources.map((resource, index) => (
                                        <motion.tr
                                            key={resource.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-muted/30 border-b border-border/40 last:border-0 transition-colors"
                                        >
                                            <TableCell>
                                                <Link
                                                    href={`/resources/${resource.id}`}
                                                    className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                                >
                                                    {resource.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group/link truncate max-w-[230px]"
                                                >
                                                    <span className="truncate">{resource.url}</span>
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal bg-muted text-muted-foreground hover:bg-muted">
                                                    {typeLabels[resource.type] || resource.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm">
                                                {resource.daScore ? resource.daScore : <span className="text-muted-foreground/30">-</span>}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm">
                                                {resource.drScore ? resource.drScore : <span className="text-muted-foreground/30">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                {resource.isFree ? (
                                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                        {t("common.free")}
                                                    </span>
                                                ) : resource.price ? (
                                                    <span className="text-sm font-mono text-muted-foreground">${resource.price}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/30">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={statusConfig[resource.status]?.className || ""}
                                                >
                                                    {statusConfig[resource.status]?.label || resource.status}
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
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/resources/${resource.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                {t("resources.viewLinks")}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(resource)}>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            {t("common.edit")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(resource.id)}
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
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground">
                        {t("common.pagination", {
                            start: ((currentPage - 1) * ITEMS_PER_PAGE) + 1,
                            end: Math.min(currentPage * ITEMS_PER_PAGE, filteredResources.length),
                            total: filteredResources.length
                        })}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[3rem] text-center">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <ResourceDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                resource={editingResource}
                resourceTypes={resourceTypes}
            />
        </div>
    );
}
