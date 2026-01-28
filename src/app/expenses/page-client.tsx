"use client";

import { type Expense, type Project, type Preset } from "@/db/schema";
import { StatsCards } from "@/components/expenses/stats-cards";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ShineBorderButton } from "@/components/ui/shine-border-button";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { UpcomingExpires } from "@/components/expenses/upcoming-expires";
import { useTranslation } from "@/i18n/context";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, fadeScale, viewportConfig } from "@/lib/animations";

interface ExpensesPageClientProps {
    expenses: Array<{
        expense: Expense;
        project: Project | null;
        paymentMethod: Preset | null;
    }>;
    stats: {
        thisMonth: number;
        thisYear: number;
        globalCost: number;
        projectCost: number;
    };
    trend: Array<{ name: string; amount: number }>;
    upcoming: Array<{
        expense: Expense;
        project: Project | null;
    }>;
    projects: Project[];
    categories: Preset[];
}

export function ExpensesPageClient({ expenses, stats, upcoming, projects, categories }: ExpensesPageClientProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            {/* Header with title and action button */}
            <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">{t("expenses.pageTitle")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("expenses.pageSubtitle")}
                    </p>
                </div>
                <ExpenseDialog
                    projects={projects}
                    categories={categories}
                    trigger={<ShineBorderButton size="sm">{t("common.addExpense")}</ShineBorderButton>}
                />
            </motion.div>

            {/* Stats Cards + Upcoming Expires in one row */}
            <motion.div variants={fadeScale} className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4">
                <div className="lg:col-span-4">
                    <StatsCards
                        stats={{
                            thisMonth: stats.thisMonth,
                            thisYear: stats.thisYear,
                            globalCost: stats.globalCost,
                            projectCost: stats.projectCost,
                        }}
                    />
                </div>
                <div className="lg:col-span-1">
                    <UpcomingExpires items={upcoming} />
                </div>
            </motion.div>

            {/* Expenses Table */}
            <motion.div variants={fadeSlideUp}>
                <ExpensesTable expenses={expenses} projects={projects} categories={categories} />
            </motion.div>
        </motion.div>
    );
}

