"use server";

import { eq, desc, sql, and, gte } from "drizzle-orm";
import { backlinks, type Backlink, type NewBacklink } from "@/db/schema";
import { getDb } from "@/db";

// ==================== CRUD Operations ====================

export async function getBacklinks(projectId?: number): Promise<Backlink[]> {
    const db = getDb();
    if (projectId !== undefined) {
        return await db.select().from(backlinks).where(eq(backlinks.projectId, projectId)).orderBy(desc(backlinks.createdAt));
    }
    return await db.select().from(backlinks).orderBy(desc(backlinks.createdAt));
}

export async function getBacklink(id: number): Promise<Backlink | undefined> {
    const db = getDb();
    const result = await db.select().from(backlinks).where(eq(backlinks.id, id));
    return result[0];
}

import { revalidatePath } from "next/cache";

// ... existing imports

export async function createBacklink(
    data: Omit<NewBacklink, "id" | "createdAt">
): Promise<Backlink> {
    const db = getDb();
    const result = await db.insert(backlinks).values({
        ...data,
        createdAt: new Date(),
    }).returning();

    if (result[0]) {
        revalidatePath(`/projects/${result[0].projectId}`);
    }

    return result[0];
}

export async function updateBacklink(
    id: number,
    data: Partial<Omit<NewBacklink, "id" | "createdAt">>
): Promise<Backlink | undefined> {
    const db = getDb();
    const result = await db.update(backlinks)
        .set(data)
        .where(eq(backlinks.id, id))
        .returning();

    if (result[0]) {
        revalidatePath(`/projects/${result[0].projectId}`);
    }

    return result[0];
}

export async function deleteBacklink(id: number): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(backlinks).where(eq(backlinks.id, id)).returning();

    if (result[0]) {
        revalidatePath(`/projects/${result[0].projectId}`);
    }

    return result.length > 0;
}

// ==================== Statistics ====================

export async function getBacklinkStats(projectId: number): Promise<{
    total: number;
    live: number;
    totalCost: number;
}> {
    const db = getDb();

    // 由于 D1 的聚合查询可能需要特定语法，这里先用简单的数组过滤方式（数据量不大时）
    // 或者使用多次查询以确保兼容性

    // 1. 获取该项目所有外链
    const projectBacklinks = await db.select().from(backlinks).where(eq(backlinks.projectId, projectId));

    const total = projectBacklinks.length;
    const live = projectBacklinks.filter((b) => b.status === "live").length;
    const totalCost = projectBacklinks.reduce((sum, b) => sum + (b.cost || 0), 0);

    return { total, live, totalCost };
}

/**
 * 优化版：一次查询获取 backlinks 和统计信息
 */
export async function getBacklinksWithStats(projectId: number): Promise<{
    backlinks: Backlink[];
    stats: { total: number; live: number; totalCost: number };
}> {
    const db = getDb();

    // 一次查询获取所有数据
    const projectBacklinks = await db
        .select()
        .from(backlinks)
        .where(eq(backlinks.projectId, projectId))
        .orderBy(desc(backlinks.createdAt));

    // 在内存中计算统计信息
    const stats = {
        total: projectBacklinks.length,
        live: projectBacklinks.filter((b) => b.status === "live").length,
        totalCost: projectBacklinks.reduce((sum, b) => sum + (b.cost || 0), 0),
    };

    return { backlinks: projectBacklinks, stats };
}

export async function getMonthlyBacklinkCost(): Promise<number> {
    const db = getDb();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await db
        .select({ cost: backlinks.cost })
        .from(backlinks)
        .where(gte(backlinks.createdAt, startOfMonth));

    return result.reduce((sum, r) => sum + (r.cost || 0), 0);
}
