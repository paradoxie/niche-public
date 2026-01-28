"use server";

import { eq, desc } from "drizzle-orm";
import { githubAccounts, type GitHubAccount, type NewGitHubAccount } from "@/db/schema";
import { getDb } from "@/db";

/**
 * 获取所有 GitHub 账号
 */
export async function getGitHubAccounts(): Promise<GitHubAccount[]> {
    try {
        const db = getDb();
        return await db.select().from(githubAccounts).orderBy(desc(githubAccounts.updatedAt));
    } catch (e) {
        console.error("Failed to fetch GitHub accounts:", e);
        return [];
    }
}

/**
 * 获取单个 GitHub 账号
 */
export async function getGitHubAccount(id: number): Promise<GitHubAccount | undefined> {
    try {
        const db = getDb();
        const result = await db.select().from(githubAccounts).where(eq(githubAccounts.id, id));
        return result[0];
    } catch (e) {
        console.error(`Failed to fetch GitHub account ${id}:`, e);
        return undefined;
    }
}

/**
 * 创建 GitHub 账号
 */
export async function createGitHubAccount(
    data: Omit<NewGitHubAccount, "id" | "createdAt" | "updatedAt">
): Promise<GitHubAccount> {
    const db = getDb();
    const result = await db.insert(githubAccounts).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();
    return result[0];
}

/**
 * 更新 GitHub 账号
 */
export async function updateGitHubAccount(
    id: number,
    data: Partial<Omit<NewGitHubAccount, "id" | "createdAt">>
): Promise<GitHubAccount | undefined> {
    const db = getDb();
    const result = await db.update(githubAccounts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(githubAccounts.id, id))
        .returning();
    return result[0];
}

/**
 * 删除 GitHub 账号
 */
export async function deleteGitHubAccount(id: number): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(githubAccounts).where(eq(githubAccounts.id, id)).returning();
    return result.length > 0;
}

/**
 * 获取 GitHub 账号的仓库列表
 */
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
    };
    private: boolean;
    html_url: string;
    description: string | null;
    updated_at: string;
}

export async function getGitHubRepos(accountId: number): Promise<GitHubRepo[]> {
    try {
        const account = await getGitHubAccount(accountId);
        if (!account) {
            console.error("GitHub account not found");
            return [];
        }

        const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
            headers: {
                "Authorization": `Bearer ${account.token}`,
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "NicheStack-Manager"
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch repos:", response.status, response.statusText);
            return [];
        }

        const repos: GitHubRepo[] = await response.json();
        return repos;
    } catch (e) {
        console.error("Failed to fetch GitHub repos:", e);
        return [];
    }
}
