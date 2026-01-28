"use server";

import { getDb } from "@/db";
import { siteTools, type NewSiteTool, type SiteTool } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTools() {
    const db = getDb();
    return await db.select().from(siteTools).orderBy(desc(siteTools.updatedAt));
}

export async function getTool(id: number) {
    const db = getDb();
    const result = await db.select().from(siteTools).where(eq(siteTools.id, id)).get();
    return result;
}

export async function createTool(data: Omit<NewSiteTool, "id" | "createdAt" | "updatedAt">) {
    const db = getDb();
    const result = await db.insert(siteTools).values(data).returning();
    revalidatePath("/tools");
    return result[0];
}

export async function updateTool(id: number, data: Partial<Omit<SiteTool, "id" | "createdAt">>) {
    const db = getDb();
    const result = await db
        .update(siteTools)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteTools.id, id))
        .returning();
    revalidatePath("/tools");
    return result[0];
}

export async function deleteTool(id: number) {
    const db = getDb();
    await db.delete(siteTools).where(eq(siteTools.id, id));
    revalidatePath("/tools");
}

export async function getToolStats() {
    const db = getDb();
    const allTools = await db.select().from(siteTools);

    const categoryCount: Record<string, number> = {};
    let freeCount = 0;
    let paidCount = 0;
    let freemiumCount = 0;

    allTools.forEach((tool) => {
        categoryCount[tool.category] = (categoryCount[tool.category] || 0) + 1;
        if (tool.cost === "free") freeCount++;
        else if (tool.cost === "paid") paidCount++;
        else freemiumCount++;
    });

    return {
        total: allTools.length,
        freeCount,
        paidCount,
        freemiumCount,
        categoryCount,
    };
}

// 初始化工具数据
export async function seedInitialTools() {
    const db = getDb();

    const initialTools: Omit<NewSiteTool, "id" | "createdAt" | "updatedAt">[] = [
        {
            name: "小互",
            url: "https://xiaohu.ai/feed",
            category: "content_inspiration",
            purpose: "发现AI和科技领域的最新话题与讨论",
            cost: "free",
        },
        {
            name: "Github Trending",
            url: "https://github.com/trending?since=daily",
            category: "content_inspiration",
            purpose: "发现技术圈最新的热门项目和趋势",
            cost: "free",
        },
        {
            name: "Semrush",
            url: "https://semrush.com/",
            category: "keyword_research",
            purpose: "核心关键词研究、推断和竞争对手分析",
            cost: "paid",
        },
        {
            name: "Ahrefs",
            url: "https://ahrefs.com/",
            category: "competitor_analysis",
            purpose: "分析竞品网站的流量、外链和热门页面",
            cost: "freemium",
        },
        {
            name: "Google Trends",
            url: "https://trends.google.com/trends",
            category: "trend_insight",
            purpose: "查看关键词的搜索趋势和季节性变化",
            cost: "free",
        },
        {
            name: "Query.domains",
            url: "https://query.domains/",
            category: "domain_tools",
            purpose: "查询新词相关的域名是否近期被注册，分析对手动态",
            cost: "freemium",
        },
        {
            name: "Spaceship",
            url: "https://spaceship.com/",
            category: "domain_tools",
            purpose: "查询域名价格和进行购买",
            cost: "paid",
        },
        {
            name: "Wayback Machine",
            url: "https://web.archive.org/",
            category: "domain_tools",
            purpose: "查询域名历史，避免使用有不良记录的域名",
            cost: "free",
        },
    ];

    for (const tool of initialTools) {
        await db.insert(siteTools).values(tool);
    }

    revalidatePath("/tools");
    return initialTools.length;
}
