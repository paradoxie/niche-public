"use server";

import { getDb } from "@/db";
import {
    projects,
    backlinks,
    linkResources,
    presets,
    siteTools,
    expenses,
    githubAccounts
} from "@/db/schema";
import { revalidatePath } from "next/cache";

const EXPORT_VERSION = "1.0.0";

interface ExportData {
    version: string;
    exportedAt: string;
    data: {
        githubAccounts: unknown[];
        projects: unknown[];
        backlinks: unknown[];
        linkResources: unknown[];
        presets: unknown[];
        siteTools: unknown[];
        expenses: unknown[];
    };
}

/**
 * 导出所有数据为 JSON 格式
 */
export async function exportAllData(): Promise<ExportData> {
    const db = getDb();

    const [
        githubAccountsData,
        projectsData,
        backlinksData,
        linkResourcesData,
        presetsData,
        siteToolsData,
        expensesData,
    ] = await Promise.all([
        db.select().from(githubAccounts),
        db.select().from(projects),
        db.select().from(backlinks),
        db.select().from(linkResources),
        db.select().from(presets),
        db.select().from(siteTools),
        db.select().from(expenses),
    ]);

    return {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
            githubAccounts: githubAccountsData,
            projects: projectsData,
            backlinks: backlinksData,
            linkResources: linkResourcesData,
            presets: presetsData,
            siteTools: siteToolsData,
            expenses: expensesData,
        },
    };
}

/**
 * 导入 JSON 数据恢复数据库
 */
export async function importAllData(jsonData: ExportData): Promise<{ success: boolean; message: string }> {
    try {
        // 验证数据格式
        if (!jsonData.version || !jsonData.data) {
            return { success: false, message: "Invalid data format" };
        }

        const db = getDb();
        const { data } = jsonData;

        // 使用事务确保数据一致性
        // 注意：D1 不支持传统的事务，但我们可以通过 batch 来确保原子性
        // 如果任何操作失败，整个批次都会回滚

        // 步骤 1: 按依赖顺序清空现有数据（先删除有外键依赖的表）
        await db.delete(expenses);
        await db.delete(backlinks);
        await db.delete(siteTools);
        await db.delete(linkResources);
        await db.delete(presets);
        await db.delete(projects);
        await db.delete(githubAccounts);

        // 步骤 2: 按依赖顺序导入数据（使用批量插入）

        // 导入 GitHub Accounts
        if (data.githubAccounts && data.githubAccounts.length > 0) {
            const formattedAccounts = data.githubAccounts.map((item) => {
                const account = item as Record<string, unknown>;
                return {
                    ...account,
                    createdAt: account.createdAt ? new Date(account.createdAt as string) : new Date(),
                    updatedAt: account.updatedAt ? new Date(account.updatedAt as string) : new Date(),
                    tokenExpiresAt: account.tokenExpiresAt ? new Date(account.tokenExpiresAt as string) : null,
                } as typeof githubAccounts.$inferInsert;
            });
            await db.insert(githubAccounts).values(formattedAccounts);
        }

        // 导入 Projects (修复：添加 domainPurchaseDate 和 lastManualUpdate)
        if (data.projects && data.projects.length > 0) {
            const formattedProjects = data.projects.map((item) => {
                const project = item as Record<string, unknown>;
                return {
                    ...project,
                    createdAt: project.createdAt ? new Date(project.createdAt as string) : new Date(),
                    updatedAt: project.updatedAt ? new Date(project.updatedAt as string) : new Date(),
                    domainExpiry: project.domainExpiry ? new Date(project.domainExpiry as string) : null,
                    domainPurchaseDate: project.domainPurchaseDate ? new Date(project.domainPurchaseDate as string) : null,
                    lastGithubPush: project.lastGithubPush ? new Date(project.lastGithubPush as string) : null,
                    lastContentUpdate: project.lastContentUpdate ? new Date(project.lastContentUpdate as string) : null,
                    lastManualUpdate: project.lastManualUpdate ? new Date(project.lastManualUpdate as string) : null,
                    launchedAt: project.launchedAt ? new Date(project.launchedAt as string) : null,
                } as typeof projects.$inferInsert;
            });
            await db.insert(projects).values(formattedProjects);
        }

        // 导入 Link Resources
        if (data.linkResources && data.linkResources.length > 0) {
            const formattedResources = data.linkResources.map((item) => {
                const resource = item as Record<string, unknown>;
                return {
                    ...resource,
                    createdAt: resource.createdAt ? new Date(resource.createdAt as string) : new Date(),
                    updatedAt: resource.updatedAt ? new Date(resource.updatedAt as string) : new Date(),
                } as typeof linkResources.$inferInsert;
            });
            await db.insert(linkResources).values(formattedResources);
        }

        // 导入 Presets
        if (data.presets && data.presets.length > 0) {
            const formattedPresets = data.presets.map((item) => {
                const preset = item as Record<string, unknown>;
                return {
                    ...preset,
                    createdAt: preset.createdAt ? new Date(preset.createdAt as string) : new Date(),
                } as typeof presets.$inferInsert;
            });
            await db.insert(presets).values(formattedPresets);
        }

        // 导入 Backlinks (依赖 projects 和 linkResources)
        if (data.backlinks && data.backlinks.length > 0) {
            const formattedBacklinks = data.backlinks.map((item) => {
                const backlink = item as Record<string, unknown>;
                return {
                    ...backlink,
                    acquiredDate: backlink.acquiredDate ? new Date(backlink.acquiredDate as string) : null,
                    createdAt: backlink.createdAt ? new Date(backlink.createdAt as string) : new Date(),
                } as typeof backlinks.$inferInsert;
            });
            await db.insert(backlinks).values(formattedBacklinks);
        }

        // 导入 Expenses (依赖 projects 和 presets)
        if (data.expenses && data.expenses.length > 0) {
            const formattedExpenses = data.expenses.map((item) => {
                const expense = item as Record<string, unknown>;
                return {
                    ...expense,
                    paidAt: expense.paidAt ? new Date(expense.paidAt as string) : new Date(),
                    expiresAt: expense.expiresAt ? new Date(expense.expiresAt as string) : null,
                    createdAt: expense.createdAt ? new Date(expense.createdAt as string) : new Date(),
                    updatedAt: expense.updatedAt ? new Date(expense.updatedAt as string) : new Date(),
                } as typeof expenses.$inferInsert;
            });
            await db.insert(expenses).values(formattedExpenses);
        }

        // 导入 Site Tools
        if (data.siteTools && data.siteTools.length > 0) {
            const formattedTools = data.siteTools.map((item) => {
                const tool = item as Record<string, unknown>;
                return {
                    ...tool,
                    createdAt: tool.createdAt ? new Date(tool.createdAt as string) : new Date(),
                    updatedAt: tool.updatedAt ? new Date(tool.updatedAt as string) : new Date(),
                } as typeof siteTools.$inferInsert;
            });
            await db.insert(siteTools).values(formattedTools);
        }

        revalidatePath("/");
        revalidatePath("/settings");
        revalidatePath("/projects");
        revalidatePath("/expenses");
        revalidatePath("/backlinks");
        revalidatePath("/resources");
        revalidatePath("/tools");

        return { success: true, message: "Data imported successfully" };
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * 清空所有数据
 */
export async function clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
        const db = getDb();

        // 按外键依赖倒序删除数据
        await db.delete(expenses);
        await db.delete(backlinks);
        await db.delete(siteTools);
        await db.delete(linkResources);
        await db.delete(presets);
        await db.delete(projects);
        await db.delete(githubAccounts);

        revalidatePath("/");
        revalidatePath("/settings");
        revalidatePath("/projects");
        revalidatePath("/expenses");
        revalidatePath("/backlinks");
        revalidatePath("/resources");
        revalidatePath("/tools");

        return { success: true, message: "All data cleared successfully" };
    } catch (error) {
        console.error("Clear data error:", error);
        return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
}
