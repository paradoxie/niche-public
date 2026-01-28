import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { projects, githubAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// 验证 Cron 请求的密钥（防止被恶意调用）
const CRON_SECRET = process.env.CRON_SECRET;

interface GitHubRepo {
    pushed_at: string;
}

async function syncProjectGithub(repoOwner: string, repoName: string, githubToken?: string) {
    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NicheStack-Manager",
    };

    // 如果有 GitHub Token，使用认证请求（5000次/小时）
    if (githubToken) {
        headers["Authorization"] = `Bearer ${githubToken}`;
    }

    const response = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}`,
        { headers }
    );

    if (!response.ok) {
        console.error(`GitHub API error for ${repoOwner}/${repoName}:`, response.status);
        return null;
    }

    const repoData = await response.json() as GitHubRepo;
    return new Date(repoData.pushed_at);
}

export async function POST(request: Request) {
    // 验证请求来源
    const authHeader = request.headers.get("Authorization");
    const { env } = getRequestContext();
    const cronSecret = env.CRON_SECRET || CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getDb();
        const globalToken = env.GITHUB_TOKEN;

        // 获取所有有 GitHub 仓库配置的项目
        const allProjects = await db.select().from(projects);
        const projectsWithGithub = allProjects.filter(
            p => p.repoOwner && p.repoName
        );

        // 获取所有 GitHub 账号用于查找 Token
        const allAccounts = await db.select().from(githubAccounts);
        const accountMap = new Map(allAccounts.map(a => [a.id, a]));

        const results = [];

        for (const project of projectsWithGithub) {
            try {
                // 优先使用项目关联的账号 Token，fallback 到全局 Token
                let token = globalToken;
                if (project.githubAccountId && accountMap.has(project.githubAccountId)) {
                    token = accountMap.get(project.githubAccountId)!.token;
                }

                const pushedAt = await syncProjectGithub(
                    project.repoOwner!,
                    project.repoName!,
                    token
                );

                if (pushedAt) {
                    await db.update(projects)
                        .set({ lastGithubPush: pushedAt, updatedAt: new Date() })
                        .where(eq(projects.id, project.id));

                    results.push({
                        id: project.id,
                        name: project.name,
                        status: "synced",
                        pushedAt: pushedAt.toISOString(),
                    });
                } else {
                    results.push({
                        id: project.id,
                        name: project.name,
                        status: "failed",
                    });
                }
            } catch (error) {
                results.push({
                    id: project.id,
                    name: project.name,
                    status: "error",
                    error: String(error),
                });
            }

            // 添加小延迟，避免触发 GitHub 速率限制
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return NextResponse.json({
            success: true,
            synced: results.filter(r => r.status === "synced").length,
            failed: results.filter(r => r.status !== "synced").length,
            results,
        });
    } catch (error) {
        console.error("Sync all projects failed:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}

// 用于手动测试
export async function GET() {
    return NextResponse.json({
        message: "GitHub Sync API",
        usage: "POST to this endpoint with Authorization: Bearer <CRON_SECRET> to trigger sync",
    });
}
