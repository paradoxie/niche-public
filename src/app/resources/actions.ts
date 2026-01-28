"use server";

import { getDb } from "@/db";
import { linkResources, backlinks, projects, type NewLinkResource, type LinkResource } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getResources() {
    const db = getDb();
    return await db.select().from(linkResources).orderBy(desc(linkResources.updatedAt));
}

export async function getResourceWithBacklinks(resourceId: number) {
    const db = getDb();
    const resource = await db.select().from(linkResources).where(eq(linkResources.id, resourceId)).get();
    if (!resource) return null;

    const linkedBacklinks = await db
        .select({
            backlink: backlinks,
            project: projects,
        })
        .from(backlinks)
        .leftJoin(projects, eq(backlinks.projectId, projects.id))
        .where(eq(backlinks.resourceId, resourceId));

    return { resource, linkedBacklinks };
}

export async function getResourceStats() {
    const db = getDb();

    // 优化：并行化两个查询
    const [stats, usedCount] = await Promise.all([
        db.select({
            total: sql<number>`count(*)`,
            activeCount: sql<number>`sum(case when ${linkResources.status} = 'active' then 1 else 0 end)`,
            freeCount: sql<number>`sum(case when ${linkResources.isFree} = 1 then 1 else 0 end)`,
        }).from(linkResources).get(),
        db.select({ count: sql<number>`count(distinct ${backlinks.resourceId})` })
            .from(backlinks)
            .where(sql`${backlinks.resourceId} is not null`)
            .get(),
    ]);

    return {
        total: stats?.total || 0,
        activeCount: stats?.activeCount || 0,
        freeCount: stats?.freeCount || 0,
        usedCount: usedCount?.count || 0,
    };
}

export async function createResource(data: Omit<NewLinkResource, "id" | "createdAt" | "updatedAt">) {
    const db = getDb();
    const result = await db.insert(linkResources).values(data).returning();
    revalidatePath("/resources");
    return result[0];
}

export async function updateResource(id: number, data: Partial<Omit<LinkResource, "id" | "createdAt">>) {
    const db = getDb();
    const result = await db
        .update(linkResources)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(linkResources.id, id))
        .returning();
    revalidatePath("/resources");
    return result[0];
}

export async function deleteResource(id: number) {
    const db = getDb();
    await db.delete(linkResources).where(eq(linkResources.id, id));
    revalidatePath("/resources");
}

export async function getResourceDetail(resourceId: number) {
    const db = getDb();

    // 优化：并行查询资源和所有项目
    const [resource, allProjects, linkedBacklinksData] = await Promise.all([
        db.select().from(linkResources).where(eq(linkResources.id, resourceId)).get(),
        db.select().from(projects),
        db.select({
            backlink: backlinks,
            project: projects,
        })
            .from(backlinks)
            .innerJoin(projects, eq(backlinks.projectId, projects.id))
            .where(eq(backlinks.resourceId, resourceId)),
    ]);

    if (!resource) return null;

    // 计算已投放的项目 ID
    const linkedProjectIds = new Set(linkedBacklinksData.map(d => d.project.id));

    // 未投放的项目
    const unlinkedProjects = allProjects.filter(p => !linkedProjectIds.has(p.id));

    return {
        resource,
        linkedBacklinks: linkedBacklinksData,
        unlinkedProjects,
    };
}

export async function linkResourceToProject(resourceId: number, projectId: number, targetUrl: string) {
    const db = getDb();

    // 获取资源信息
    const resource = await db.select().from(linkResources).where(eq(linkResources.id, resourceId)).get();
    if (!resource) throw new Error("Resource not found");

    // 创建外链记录
    const result = await db.insert(backlinks).values({
        projectId,
        resourceId,
        targetUrl,
        sourceUrl: resource.url,
        daScore: resource.daScore,
        status: targetUrl ? "live" : "planned",
        createdAt: new Date(),
    }).returning();

    // 如果资源不是免费的且有价格，自动创建营销支出记录
    if (!resource.isFree && resource.price && resource.price > 0) {
        const { createExpense } = await import("@/app/expenses/actions");
        await createExpense({
            name: `外链投放: ${resource.name}`,
            amount: resource.price,
            category: "marketing",
            projectId,
            paidAt: new Date(),
            expiresAt: null,
            notes: `资源: ${resource.url}`,
        });
    }

    revalidatePath(`/resources/${resourceId}`);
    revalidatePath("/resources");
    revalidatePath("/expenses");
    return result[0];
}

export async function unlinkResourceFromProject(backlinkId: number, resourceId: number) {
    const db = getDb();
    await db.delete(backlinks).where(eq(backlinks.id, backlinkId));
    revalidatePath(`/resources/${resourceId}`);
    revalidatePath("/resources");
}
