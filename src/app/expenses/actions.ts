"use server";

import { getDb } from "@/db";
import { expenses, projects, presets, type NewExpense, type Expense } from "@/db/schema";
import { eq, desc, and, gte, lte, sql, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================== CRUD Operations ====================

export async function getExpenses(filters?: {
    category?: string;
    projectId?: number | "global";
    year?: number;
    month?: number;
}) {
    const db = getDb();

    const conditions = [];

    if (filters?.category && filters.category !== "all") {
        conditions.push(eq(expenses.category, filters.category as Expense["category"]));
    }

    if (filters?.projectId === "global") {
        conditions.push(isNull(expenses.projectId));
    } else if (filters?.projectId) {
        conditions.push(eq(expenses.projectId, filters.projectId));
    }

    if (filters?.year) {
        const startDate = new Date(filters.year, filters.month ? filters.month - 1 : 0, 1);
        const endDate = filters.month
            ? new Date(filters.year, filters.month, 0, 23, 59, 59)
            : new Date(filters.year, 11, 31, 23, 59, 59);
        conditions.push(gte(expenses.paidAt, startDate));
        conditions.push(lte(expenses.paidAt, endDate));
    }

    const result = await db
        .select({
            expense: expenses,
            project: projects,
            paymentMethod: presets,
        })
        .from(expenses)
        .leftJoin(projects, eq(expenses.projectId, projects.id))
        .leftJoin(presets, eq(expenses.paymentMethodId, presets.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(expenses.paidAt));

    return result;
}

export async function createExpense(data: Omit<NewExpense, "id" | "createdAt" | "updatedAt">) {
    const db = getDb();
    const result = await db.insert(expenses).values(data).returning();
    const newExpense = result[0];

    // 如果是域名相关的支出，且有关联项目和过期时间，自动更新项目的域名过期时间
    if (newExpense.category === "domain" && newExpense.projectId && newExpense.expiresAt) {
        await db.update(projects)
            .set({
                domainExpiry: newExpense.expiresAt,
                updatedAt: new Date()
            })
            .where(eq(projects.id, newExpense.projectId));

        revalidatePath("/projects");
    }

    revalidatePath("/expenses");
    revalidatePath("/");
    return newExpense;
}

export async function updateExpense(id: number, data: Partial<Omit<Expense, "id" | "createdAt">>) {
    const db = getDb();
    const result = await db
        .update(expenses)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(expenses.id, id))
        .returning();

    const updatedExpense = result[0];

    // 如果是域名相关的支出，且有关联项目和过期时间，自动更新项目的域名过期时间
    // 这里我们检查更新后的 expense 对象，因为它包含了最新的数据
    if (updatedExpense && updatedExpense.category === "domain" && updatedExpense.projectId && updatedExpense.expiresAt) {
        await db.update(projects)
            .set({
                domainExpiry: updatedExpense.expiresAt,
                updatedAt: new Date()
            })
            .where(eq(projects.id, updatedExpense.projectId));

        revalidatePath("/projects");
    }

    revalidatePath("/expenses");
    revalidatePath("/");
    return updatedExpense;
}

export async function deleteExpense(id: number) {
    const db = getDb();
    await db.delete(expenses).where(eq(expenses.id, id));
    revalidatePath("/expenses");
    revalidatePath("/");
}

// ==================== Statistics ====================

export async function getExpenseStats() {
    const db = getDb();
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    const allExpenses = await db.select().from(expenses);

    let totalThisMonth = 0;
    let totalThisYear = 0;
    let totalGlobal = 0;
    let totalProject = 0;

    allExpenses.forEach((exp) => {
        const paidAt = exp.paidAt;

        if (paidAt >= thisMonthStart) {
            totalThisMonth += exp.amount;
        }
        if (paidAt >= thisYearStart) {
            totalThisYear += exp.amount;
        }
        if (exp.projectId === null) {
            totalGlobal += exp.amount;
        } else {
            totalProject += exp.amount;
        }
    });

    return {
        thisMonth: totalThisMonth,
        thisYear: totalThisYear,
        globalCost: totalGlobal,
        projectCost: totalProject,
        total: allExpenses.length,
    };
}

export async function getMonthlyTrend() {
    const db = getDb();
    const now = new Date();

    // 计算12个月前的起始日期
    const yearStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // 一次查询获取过去12个月的所有支出
    const allExpenses = await db
        .select()
        .from(expenses)
        .where(gte(expenses.paidAt, yearStart));

    // 在内存中按月分组
    const monthlyTotals: Record<string, number> = {};

    // 初始化所有月份为0
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
        const key = `${date.getFullYear()}-${monthStr}`;
        monthlyTotals[key] = 0;
    }

    // 累加每笔支出到对应月份
    allExpenses.forEach(exp => {
        const paidAt = exp.paidAt;
        const monthStr = (paidAt.getMonth() + 1).toString().padStart(2, '0');
        const key = `${paidAt.getFullYear()}-${monthStr}`;
        if (key in monthlyTotals) {
            monthlyTotals[key] += exp.amount;
        }
    });

    // 转换为数组格式
    const months: { name: string; amount: number }[] = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
        const key = `${date.getFullYear()}-${monthStr}`;
        months.push({ name: key, amount: monthlyTotals[key] });
    }

    return months;
}

export async function getUpcomingExpires(days: number = 30) {
    const db = getDb();
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const result = await db
        .select({
            expense: expenses,
            project: projects,
        })
        .from(expenses)
        .leftJoin(projects, eq(expenses.projectId, projects.id))
        .where(and(
            gte(expenses.expiresAt, now),
            lte(expenses.expiresAt, futureDate)
        ))
        .orderBy(expenses.expiresAt);

    return result;
}

export async function getProjectExpenses(projectId: number) {
    const db = getDb();
    const result = await db
        .select()
        .from(expenses)
        .where(eq(expenses.projectId, projectId))
        .orderBy(desc(expenses.paidAt));

    const total = result.reduce((sum, exp) => sum + exp.amount, 0);

    return { expenses: result, total };
}

export async function getProjectDomainExpense(projectId: number) {
    const db = getDb();
    const result = await db
        .select()
        .from(expenses)
        .where(and(
            eq(expenses.projectId, projectId),
            eq(expenses.category, "domain")
        ))
        .orderBy(desc(expenses.paidAt))
        .limit(1);

    return result[0] || null;
}

// ==================== Payment Methods ====================

export async function getPaymentMethods() {
    const db = getDb();
    return await db
        .select()
        .from(presets)
        .where(eq(presets.type, "payment_method"));
}

export async function createPaymentMethod(value: string) {
    const db = getDb();
    const result = await db.insert(presets).values({
        type: "payment_method",
        value,
        label: value,
    }).returning();
    return result[0];
}
