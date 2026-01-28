"use server";

import { eq, and, sql, inArray } from "drizzle-orm";
import { presets, type Preset, type PresetType } from "@/db/schema";
import { getDb } from "@/db";

/**
 * 获取指定类型的所有预设
 */
export async function getPresetsByType(type: PresetType): Promise<Preset[]> {
    try {
        const db = getDb();
        return await db.select().from(presets).where(eq(presets.type, type));
    } catch (e) {
        console.error(`Failed to fetch presets for type ${type}:`, e);
        return [];
    }
}

/**
 * 从现有项目中提取指定字段的唯一值
 */
export async function getProjectFieldValues(
    field: "hostingPlatform" | "hostingAccount" | "domainRegistrar"
): Promise<string[]> {
    try {
        const db = getDb();
        const { projects } = await import("@/db/schema");
        const allProjects = await db.select({ value: projects[field] }).from(projects);

        // 提取唯一的非空值
        const uniqueValues = new Set<string>();
        for (const row of allProjects) {
            if (row.value && row.value.trim()) {
                uniqueValues.add(row.value.trim());
            }
        }

        return Array.from(uniqueValues).sort();
    } catch (e) {
        console.error(`Failed to fetch project field values for ${field}:`, e);
        return [];
    }
}

/**
 * 批量获取所有表单相关的预设（一次查询）
 */
export async function getAllFormPresets(): Promise<{
    hostingPlatform: Preset[];
    hostingAccount: Preset[];
    domainRegistrar: Preset[];
}> {
    try {
        const db = getDb();

        // 一次查询获取所有相关类型的预设
        const allPresets = await db
            .select()
            .from(presets)
            .where(inArray(presets.type, ["hosting_platform", "hosting_account", "domain_registrar"]));

        // 按类型分组
        const result = {
            hostingPlatform: [] as Preset[],
            hostingAccount: [] as Preset[],
            domainRegistrar: [] as Preset[],
        };

        allPresets.forEach(preset => {
            if (preset.type === "hosting_platform") result.hostingPlatform.push(preset);
            else if (preset.type === "hosting_account") result.hostingAccount.push(preset);
            else if (preset.type === "domain_registrar") result.domainRegistrar.push(preset);
        });

        return result;
    } catch (e) {
        console.error("Failed to fetch form presets:", e);
        return { hostingPlatform: [], hostingAccount: [], domainRegistrar: [] };
    }
}

/**
 * 批量获取所有项目字段的唯一值（一次查询）
 */
export async function getAllProjectFieldValues(): Promise<{
    hostingPlatform: string[];
    hostingAccount: string[];
    domainRegistrar: string[];
}> {
    try {
        const db = getDb();
        const { projects } = await import("@/db/schema");

        // 一次查询获取所有项目的三个字段
        const allProjects = await db
            .select({
                hostingPlatform: projects.hostingPlatform,
                hostingAccount: projects.hostingAccount,
                domainRegistrar: projects.domainRegistrar,
            })
            .from(projects);

        // 提取每个字段的唯一值
        const hostingPlatformSet = new Set<string>();
        const hostingAccountSet = new Set<string>();
        const domainRegistrarSet = new Set<string>();

        allProjects.forEach(p => {
            if (p.hostingPlatform?.trim()) hostingPlatformSet.add(p.hostingPlatform.trim());
            if (p.hostingAccount?.trim()) hostingAccountSet.add(p.hostingAccount.trim());
            if (p.domainRegistrar?.trim()) domainRegistrarSet.add(p.domainRegistrar.trim());
        });

        return {
            hostingPlatform: Array.from(hostingPlatformSet).sort(),
            hostingAccount: Array.from(hostingAccountSet).sort(),
            domainRegistrar: Array.from(domainRegistrarSet).sort(),
        };
    } catch (e) {
        console.error("Failed to fetch project field values:", e);
        return { hostingPlatform: [], hostingAccount: [], domainRegistrar: [] };
    }
}

/**
 * 创建新预设（如果已存在相同 type+value 则跳过）
 */
export async function createPreset(
    type: PresetType,
    value: string,
    label?: string
): Promise<Preset | null> {
    try {
        const db = getDb();

        // 检查是否已存在
        const existing = await db.select()
            .from(presets)
            .where(and(eq(presets.type, type), eq(presets.value, value)));

        if (existing.length > 0) {
            return existing[0];
        }

        const result = await db.insert(presets).values({
            type,
            value,
            label: label || value,
            createdAt: new Date(),
        }).returning();

        return result[0];
    } catch (e) {
        console.error("Failed to create preset:", e);
        return null;
    }
}

/**
 * 删除预设
 */
export async function deletePreset(id: number): Promise<boolean> {
    try {
        const db = getDb();
        const result = await db.delete(presets).where(eq(presets.id, id)).returning();
        return result.length > 0;
    } catch (e) {
        console.error(`Failed to delete preset ${id}:`, e);
        return false;
    }
}

/**
 * 初始化默认分类（优化版：一次查询 + 批量插入）
 */
export async function initializeDefaultCategories(): Promise<void> {
    const db = getDb();

    // 默认支出分类
    const defaultExpenseCategories = [
        { type: "expense_category" as PresetType, value: "subscription", label: "订阅" },
        { type: "expense_category" as PresetType, value: "domain", label: "域名" },
        { type: "expense_category" as PresetType, value: "hosting", label: "主机" },
        { type: "expense_category" as PresetType, value: "marketing", label: "营销" },
        { type: "expense_category" as PresetType, value: "tool", label: "工具" },
        { type: "expense_category" as PresetType, value: "other", label: "其他" },
    ];

    // 默认工具分类
    const defaultToolCategories = [
        { type: "tool_category" as PresetType, value: "content_inspiration", label: "内容灵感" },
        { type: "tool_category" as PresetType, value: "keyword_research", label: "关键词研究" },
        { type: "tool_category" as PresetType, value: "competitor_analysis", label: "竞品分析" },
        { type: "tool_category" as PresetType, value: "trend_insight", label: "趋势洞察" },
        { type: "tool_category" as PresetType, value: "domain_tools", label: "域名工具" },
        { type: "tool_category" as PresetType, value: "seo_tools", label: "SEO工具" },
        { type: "tool_category" as PresetType, value: "analytics", label: "数据分析" },
        { type: "tool_category" as PresetType, value: "other", label: "其他" },
    ];

    // 默认资源类型
    const defaultResourceTypes = [
        { type: "resource_type" as PresetType, value: "profile", label: "个人简介" },
        { type: "resource_type" as PresetType, value: "guest_post", label: "客座文章" },
        { type: "resource_type" as PresetType, value: "directory", label: "目录提交" },
        { type: "resource_type" as PresetType, value: "forum", label: "论坛签名" },
        { type: "resource_type" as PresetType, value: "comment", label: "博客评论" },
        { type: "resource_type" as PresetType, value: "social", label: "社交媒体" },
        { type: "resource_type" as PresetType, value: "other", label: "其他" },
    ];

    const allDefaults = [...defaultExpenseCategories, ...defaultToolCategories, ...defaultResourceTypes];

    try {
        // 一次查询获取所有现有预设
        const existingPresets = await db.select().from(presets);
        const existingKeys = new Set(existingPresets.map(p => `${p.type}:${p.value}`));

        // 找出需要插入的预设
        const toInsert = allDefaults.filter(d => !existingKeys.has(`${d.type}:${d.value}`));

        // 批量插入（如果有）
        if (toInsert.length > 0) {
            await db.insert(presets).values(
                toInsert.map(d => ({
                    type: d.type,
                    value: d.value,
                    label: d.label,
                    createdAt: new Date(),
                }))
            );
        }
    } catch (e) {
        console.error("Failed to initialize default categories:", e);
    }
}

/**
 * 检查分类是否正在被使用
 */
export async function isCategoryInUse(type: PresetType, value: string): Promise<boolean> {
    try {
        const db = getDb();

        if (type === "expense_category") {
            const { expenses } = await import("@/db/schema");
            const result = await db.select().from(expenses).where(eq(expenses.category, value)).limit(1);
            return result.length > 0;
        }

        if (type === "tool_category") {
            const { siteTools } = await import("@/db/schema");
            const result = await db.select().from(siteTools).where(eq(siteTools.category, value)).limit(1);
            return result.length > 0;
        }

        if (type === "resource_type") {
            const { linkResources } = await import("@/db/schema");
            const result = await db.select().from(linkResources).where(eq(linkResources.type, value)).limit(1);
            return result.length > 0;
        }

        return false;
    } catch (e) {
        console.error(`Failed to check if category ${value} is in use:`, e);
        return true; // 安全起见，返回 true 防止误删
    }
}

