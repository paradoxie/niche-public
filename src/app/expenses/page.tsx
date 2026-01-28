import { getExpenses, getExpenseStats, getMonthlyTrend, getUpcomingExpires } from "./actions";
import { getProjects } from "@/lib/actions/projects";
import { getPresetsByType, initializeDefaultCategories } from "@/lib/actions/presets";
import { ExpensesPageClient } from "./page-client";

export const runtime = "edge";

export default async function ExpensesPage() {
    // 初始化默认分类（如果不存在）
    await initializeDefaultCategories();

    const [expenseData, stats, trend, upcoming, projects, categories] = await Promise.all([
        getExpenses(),
        getExpenseStats(),
        getMonthlyTrend(),
        getUpcomingExpires(30),
        getProjects(),
        getPresetsByType("expense_category"),
    ]);

    return (
        <ExpensesPageClient
            expenses={expenseData}
            stats={stats}
            trend={trend}
            upcoming={upcoming}
            projects={projects}
            categories={categories}
        />
    );
}

