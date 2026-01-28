import { getTools, getToolStats } from "./actions";
import { getPresetsByType, initializeDefaultCategories } from "@/lib/actions/presets";
import { ToolsPageClient } from "./page-client";

export const runtime = "edge";

export default async function ToolsPage() {
    // 初始化默认分类（如果不存在）
    await initializeDefaultCategories();

    const [tools, stats, categories] = await Promise.all([
        getTools(),
        getToolStats(),
        getPresetsByType("tool_category"),
    ]);

    return <ToolsPageClient tools={tools} stats={stats} categories={categories} />;
}

