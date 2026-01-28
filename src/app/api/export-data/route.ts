import { NextResponse } from "next/server";
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

export const runtime = "edge";

const EXPORT_VERSION = "1.0.0";

/**
 * 导出所有数据为 JSON 格式
 */
export async function GET() {
    try {
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

        const exportData = {
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

        return NextResponse.json(exportData);
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Export failed", details: String(error) },
            { status: 500 }
        );
    }
}
