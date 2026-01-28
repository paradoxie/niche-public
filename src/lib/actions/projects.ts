"use server";

import { eq, desc } from "drizzle-orm";
import { projects, githubAccounts, type Project, type NewProject } from "@/db/schema";
import { getDb } from "@/db";

// ==================== CRUD Operations ====================

export async function getProjects(): Promise<Project[]> {
    try {
        const db = getDb();
        return await db.select().from(projects).orderBy(desc(projects.updatedAt));
    } catch (e) {
        console.error("Failed to fetch projects:", e);
        return [];
    }
}

export async function getProject(id: number): Promise<Project | undefined> {
    try {
        const db = getDb();
        const result = await db.select().from(projects).where(eq(projects.id, id));
        return result[0];
    } catch (e) {
        console.error(`Failed to fetch project ${id}:`, e);
        return undefined;
    }
}

export async function createProject(data: Omit<NewProject, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const db = getDb();
    const result = await db.insert(projects).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();
    return result[0];
}

export async function updateProject(
    id: number,
    data: Partial<Omit<NewProject, "id" | "createdAt">>
): Promise<Project | undefined> {
    const db = getDb();
    const result = await db.update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
    return result[0];
}

export async function deleteProject(id: number): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
}

// ==================== GitHub Sync ====================

export async function syncGithub(id: number): Promise<Project | undefined> {
    const db = getDb();
    // Fetch project with linked GitHub account info
    const projectResult = await db.select({
        project: projects,
        githubAccount: githubAccounts
    })
        .from(projects)
        .leftJoin(githubAccounts, eq(projects.githubAccountId, githubAccounts.id))
        .where(eq(projects.id, id));

    if (projectResult.length === 0) {
        return undefined;
    }

    const { project, githubAccount } = projectResult[0];

    if (!project.repoOwner || !project.repoName) {
        return undefined;
    }

    try {
        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "NicheStack-Manager"
        };

        if (githubAccount?.token) {
            headers["Authorization"] = `Bearer ${githubAccount.token}`;
        }

        const response = await fetch(
            `https://api.github.com/repos/${project.repoOwner}/${project.repoName}`,
            {
                headers,
                next: { revalidate: 0 },
            }
        );

        if (!response.ok) {
            console.error("GitHub API error:", response.status, await response.text());
            return project;
        }

        const repoData = await response.json() as { pushed_at: string };
        const pushedAt = new Date(repoData.pushed_at);

        return await updateProject(id, { lastGithubPush: pushedAt });
    } catch (error) {
        console.error("GitHub sync error:", error);
        return project;
    }
}
// ==================== Manual Maintenance ====================

export async function manualUpdateProject(id: number): Promise<Project | undefined> {
    const db = getDb();
    const result = await db.update(projects)
        .set({
            lastManualUpdate: new Date(),
            updatedAt: new Date()
        })
        .where(eq(projects.id, id))
        .returning();
    return result[0];
}
