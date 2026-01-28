"use client";

import { useState, useMemo } from "react";
import { type Expense, type Project, type Preset } from "@/db/schema";
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
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ExpenseDialog } from "./expense-dialog";
import { deleteExpense } from "@/app/expenses/actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryManager } from "@/components/ui/category-manager";
import { motion, AnimatePresence } from "framer-motion";

interface ExpensesTableProps {
    expenses: Array<{
        expense: Expense;
        project: Project | null;
        paymentMethod: Preset | null;
    }>;
    projects: Project[];
    categories: Preset[];
}

const categoryColors: Record<string, string> = {
    subscription: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    domain: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900",
    hosting: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900",
    marketing: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900",
    tool: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900",
    other: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export function ExpensesTable({ expenses, projects, categories }: ExpensesTableProps) {
    const { t, locale } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const { confirm } = useConfirmDialog();

    // 动态分类标签（从 presets 获取）
    const categoryLabels: Record<string, string> = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const cat of categories) {
            labels[cat.value] = cat.label || cat.value;
        }
        return labels;
    }, [categories]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(({ expense, project }) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (
                    !expense.name.toLowerCase().includes(query) &&
                    !(project?.name?.toLowerCase().includes(query))
                ) {
                    return false;
                }
            }
            if (categoryFilter !== "all" && expense.category !== categoryFilter) {
                return false;
            }
            if (projectFilter === "global" && expense.projectId !== null) {
                return false;
            }
            if (projectFilter !== "all" && projectFilter !== "global" && expense.projectId !== parseInt(projectFilter)) {
                return false;
            }
            return true;
        });
    }, [expenses, searchQuery, categoryFilter, projectFilter]);

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: t("expenses.deleteConfirmTitle"),
            description: t("expenses.deleteConfirmMessage"),
            confirmText: t("common.delete"),
            cancelText: t("common.cancel"),
            variant: "destructive",
        });
        if (confirmed) {
            await deleteExpense(id);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingExpense(null);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(locale === "en" ? "en-US" : "zh-CN");
    };

    const formatAmount = (amount: number) => {
        return `¥${amount.toLocaleString(locale === "en" ? "en-US" : "zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6">
            {/* Toolbar - Single Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 bg-card p-3 md:p-4 rounded-xl border border-border shadow-sm">
                {/* Search */}
                <div className="relative flex-1 min-w-[150px] group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                        placeholder={t("expenses.searchPlaceholder")}
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
                            <SelectItem value="all">{t("expenses.allCategories")}</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.value}>{cat.label || cat.value}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <CategoryManager type="expense_category" categories={categories} />
                </div>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-[100px] sm:w-[140px] h-9 bg-background/50 text-xs sm:text-sm">
                        <SelectValue placeholder={t("expenses.project")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("expenses.allProjects")}</SelectItem>
                        <SelectItem value="global">{t("expenses.globalCost")}</SelectItem>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Reset Button - Show when filters are applied */}
                {(searchQuery || categoryFilter !== "all" || projectFilter !== "all") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter("all");
                            setProjectFilter("all");
                        }}
                        className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                        {t("common.reset")}
                    </Button>
                )}

                {/* Count Badge */}
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap bg-muted/50 px-2 sm:px-3 py-1 rounded-full self-center sm:ml-auto">
                    {t("expenses.totalCount", { count: filteredExpenses.length })}
                </span>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="min-w-[700px]">
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs uppercase tracking-wider">
                                <TableHead className="w-[120px]">{t("expenses.category")}</TableHead>
                                <TableHead>{t("common.name")}</TableHead>
                                <TableHead className="w-[120px] text-right">{t("expenses.amount")}</TableHead>
                                <TableHead className="w-[150px]">{t("expenses.project")}</TableHead>
                                <TableHead className="w-[120px]">{t("expenses.paidAt")}</TableHead>
                                <TableHead className="w-[120px]">{t("expenses.expiresAt")}</TableHead>
                                <TableHead className="w-[60px] text-right">{t("common.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="wait">
                                {filteredExpenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                    <Search className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                                <p>{t("expenses.noExpenses")}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredExpenses.map(({ expense, project, paymentMethod }, index) => (
                                        <motion.tr
                                            key={expense.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-muted/30 border-b border-border/40 last:border-0 transition-colors"
                                        >
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`${categoryColors[expense.category as keyof typeof categoryColors] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"} border-0 shadow-sm`}
                                                >
                                                    {categoryLabels[expense.category] || expense.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium group-hover:text-primary transition-colors">{expense.name}</span>
                                                    {paymentMethod && (
                                                        <span className="text-xs text-muted-foreground">
                                                            via {paymentMethod.value}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono font-medium text-right">
                                                {formatAmount(expense.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {project ? (
                                                    <Badge variant="outline" className="font-normal text-muted-foreground">
                                                        {project.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">{t("expenses.globalCost")}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(expense.paidAt)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {expense.expiresAt ? formatDate(expense.expiresAt) : <span className="text-emerald-500 text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{t("expenses.perpetual")}</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(expense)}>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            {t("common.edit")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(expense.id)}
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

            <ExpenseDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                expense={editingExpense}
                projects={projects}
                categories={categories}
            />
        </div>
    );
}
