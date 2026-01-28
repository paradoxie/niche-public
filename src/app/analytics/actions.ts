"use server";

import { getDb } from "@/db";
import { expenses, backlinks, projects } from "@/db/schema";
import { eq, desc, and, gte, lte, sql, isNull } from "drizzle-orm";

export type Period = "week" | "month" | "year" | "last_year" | "all" | "custom";

// Helper to get date range from period
function getDateRange(period: Period, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (period === "custom" && customStart && customEnd) {
        return { start: customStart, end: customEnd };
    }

    switch (period) {
        case "week":
            start = new Date(now);
            start.setDate(start.getDate() - 7);
            break;
        case "month":
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case "last_year":
            start = new Date(now.getFullYear() - 1, 0, 1);
            end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
            break;
        case "all":
            start = new Date(0);
            break;
        default: // year
            start = new Date(now.getFullYear(), 0, 1);
    }

    return { start, end };
}

// Weekday labels
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ==================== 支出趋势 (Optimized) ====================

export async function getExpenseTrend(period: Period, customStart?: Date, customEnd?: Date) {
    const db = getDb();
    const { start, end } = getDateRange(period, customStart, customEnd);

    // Fetch all expenses in range at once
    const allExpenses = await db
        .select()
        .from(expenses)
        .where(and(gte(expenses.paidAt, start), lte(expenses.paidAt, end)));

    const data: { label: string; amount: number }[] = [];

    if (period === "week") {
        // Group by day of week
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

            const dayTotal = allExpenses
                .filter(exp => exp.paidAt >= dayStart && exp.paidAt <= dayEnd)
                .reduce((sum, exp) => sum + exp.amount, 0);

            data.push({ label: weekdayLabels[date.getDay()], amount: dayTotal });
        }
    } else if (period === "month") {
        // Group by week
        const now = new Date();
        for (let i = 3; i >= 0; i--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - i * 7);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);

            const weekTotal = allExpenses
                .filter(exp => exp.paidAt >= weekStart && exp.paidAt <= weekEnd)
                .reduce((sum, exp) => sum + exp.amount, 0);

            data.push({ label: `W${4 - i}`, amount: weekTotal });
        }
    } else if (period === "last_year" || period === "year") {
        // Group by month
        const baseYear = period === "last_year" ? new Date().getFullYear() - 1 : new Date().getFullYear();
        for (let m = 0; m < 12; m++) {
            const monthStart = new Date(baseYear, m, 1);
            const monthEnd = new Date(baseYear, m + 1, 0, 23, 59, 59);

            const monthTotal = allExpenses
                .filter(exp => exp.paidAt >= monthStart && exp.paidAt <= monthEnd)
                .reduce((sum, exp) => sum + exp.amount, 0);

            data.push({ label: `${m + 1}`, amount: monthTotal });
        }
    } else if (period === "all") {
        // Group by year
        const years: Record<number, number> = {};
        allExpenses.forEach(exp => {
            const year = exp.paidAt.getFullYear();
            years[year] = (years[year] || 0) + exp.amount;
        });
        Object.entries(years).sort(([a], [b]) => Number(a) - Number(b)).forEach(([year, amount]) => {
            data.push({ label: year, amount });
        });
    } else if (period === "custom") {
        // Group intelligently based on range
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 31) {
            // By day
            for (let i = 0; i <= diffDays; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

                const dayTotal = allExpenses
                    .filter(exp => exp.paidAt >= dayStart && exp.paidAt <= dayEnd)
                    .reduce((sum, exp) => sum + exp.amount, 0);

                data.push({ label: `${date.getMonth() + 1}/${date.getDate()}`, amount: dayTotal });
            }
        } else {
            // By month
            const months: Record<string, number> = {};
            allExpenses.forEach(exp => {
                const key = `${exp.paidAt.getFullYear()}-${exp.paidAt.getMonth() + 1}`;
                months[key] = (months[key] || 0) + exp.amount;
            });
            Object.entries(months).forEach(([key, amount]) => {
                data.push({ label: key, amount });
            });
        }
    }

    return data;
}

// ==================== 外链增长趋势 (Optimized) ====================

export async function getBacklinkTrend(period: Period, customStart?: Date, customEnd?: Date) {
    const db = getDb();
    const { start, end } = getDateRange(period, customStart, customEnd);

    const allBacklinks = await db
        .select()
        .from(backlinks)
        .where(and(gte(backlinks.createdAt, start), lte(backlinks.createdAt, end)));

    const data: { label: string; count: number; cost: number }[] = [];

    if (period === "week") {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

            const dayBacklinks = allBacklinks.filter(b => b.createdAt >= dayStart && b.createdAt <= dayEnd);
            data.push({
                label: weekdayLabels[date.getDay()],
                count: dayBacklinks.length,
                cost: dayBacklinks.reduce((sum, b) => sum + (b.cost || 0), 0),
            });
        }
    } else if (period === "month") {
        const now = new Date();
        for (let i = 3; i >= 0; i--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - i * 7);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);

            const weekBacklinks = allBacklinks.filter(b => b.createdAt >= weekStart && b.createdAt <= weekEnd);
            data.push({
                label: `W${4 - i}`,
                count: weekBacklinks.length,
                cost: weekBacklinks.reduce((sum, b) => sum + (b.cost || 0), 0),
            });
        }
    } else if (period === "last_year" || period === "year") {
        const baseYear = period === "last_year" ? new Date().getFullYear() - 1 : new Date().getFullYear();
        for (let m = 0; m < 12; m++) {
            const monthStart = new Date(baseYear, m, 1);
            const monthEnd = new Date(baseYear, m + 1, 0, 23, 59, 59);

            const monthBacklinks = allBacklinks.filter(b => b.createdAt >= monthStart && b.createdAt <= monthEnd);
            data.push({
                label: `${m + 1}`,
                count: monthBacklinks.length,
                cost: monthBacklinks.reduce((sum, b) => sum + (b.cost || 0), 0),
            });
        }
    } else if (period === "all") {
        const years: Record<number, { count: number; cost: number }> = {};
        allBacklinks.forEach(b => {
            const year = b.createdAt.getFullYear();
            if (!years[year]) years[year] = { count: 0, cost: 0 };
            years[year].count++;
            years[year].cost += b.cost || 0;
        });
        Object.entries(years).sort(([a], [b]) => Number(a) - Number(b)).forEach(([year, { count, cost }]) => {
            data.push({ label: year, count, cost });
        });
    } else if (period === "custom") {
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 31) {
            for (let i = 0; i <= diffDays; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

                const dayBacklinks = allBacklinks.filter(b => b.createdAt >= dayStart && b.createdAt <= dayEnd);
                data.push({
                    label: `${date.getMonth() + 1}/${date.getDate()}`,
                    count: dayBacklinks.length,
                    cost: dayBacklinks.reduce((sum, b) => sum + (b.cost || 0), 0),
                });
            }
        } else {
            const months: Record<string, { count: number; cost: number }> = {};
            allBacklinks.forEach(b => {
                const key = `${b.createdAt.getFullYear()}-${b.createdAt.getMonth() + 1}`;
                if (!months[key]) months[key] = { count: 0, cost: 0 };
                months[key].count++;
                months[key].cost += b.cost || 0;
            });
            Object.entries(months).forEach(([key, { count, cost }]) => {
                data.push({ label: key, count, cost });
            });
        }
    }

    return data;
}

// ==================== 项目成本对比 ====================

export async function getProjectCostComparison() {
    const db = getDb();

    const allExpenses = await db
        .select({
            projectId: expenses.projectId,
            projectName: projects.name,
            amount: expenses.amount,
        })
        .from(expenses)
        .leftJoin(projects, eq(expenses.projectId, projects.id));

    const projectCosts: Record<string, { name: string; total: number }> = {};

    allExpenses.forEach((exp) => {
        if (exp.projectId === null) {
            if (!projectCosts["global"]) {
                projectCosts["global"] = { name: "fixed_cost", total: 0 };
            }
            projectCosts["global"].total += exp.amount;
        } else {
            const key = String(exp.projectId);
            if (!projectCosts[key]) {
                projectCosts[key] = { name: exp.projectName || `Project ${exp.projectId}`, total: 0 };
            }
            projectCosts[key].total += exp.amount;
        }
    });

    const sorted = Object.values(projectCosts)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    return sorted.map((p) => ({ name: p.name, amount: p.total }));
}

// ==================== 支出分类占比 ====================

export async function getCategoryBreakdown(period: Period, customStart?: Date, customEnd?: Date) {
    const db = getDb();
    const { start, end } = getDateRange(period, customStart, customEnd);

    const periodExpenses = await db
        .select()
        .from(expenses)
        .where(and(gte(expenses.paidAt, start), lte(expenses.paidAt, end)));

    const categoryTotals: Record<string, number> = {};

    periodExpenses.forEach((exp) => {
        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += exp.amount;
    });

    const categoryLabels: Record<string, string> = {
        subscription: "Subscription",
        domain: "Domain",
        hosting: "Hosting",
        marketing: "Marketing",
        tool: "Tool",
        other: "Other",
    };

    return Object.entries(categoryTotals).map(([category, amount]) => ({
        category: categoryLabels[category] || category,
        amount,
    }));
}

// ==================== 汇总统计 ====================

export async function getAnalyticsSummary(period: Period, customStart?: Date, customEnd?: Date) {
    const db = getDb();
    const { start, end } = getDateRange(period, customStart, customEnd);

    const [periodExpenses, periodBacklinks] = await Promise.all([
        db.select().from(expenses).where(and(gte(expenses.paidAt, start), lte(expenses.paidAt, end))),
        db.select().from(backlinks).where(and(gte(backlinks.createdAt, start), lte(backlinks.createdAt, end))),
    ]);

    const totalCost = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const backlinkCount = periodBacklinks.length;
    const backlinkCost = periodBacklinks.reduce((sum, b) => sum + (b.cost || 0), 0);
    const liveBacklinks = periodBacklinks.filter((b) => b.status === "live").length;

    return {
        totalCost,
        expenseCount: periodExpenses.length,
        backlinkCount,
        backlinkCost,
        liveBacklinks,
    };
}
