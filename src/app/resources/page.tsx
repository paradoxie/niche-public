import { getResources, getResourceStats } from "./actions";
import { getPresetsByType, initializeDefaultCategories } from "@/lib/actions/presets";
import { ResourcesPageClient } from "@/components/resources/resources-page-client";

export const runtime = "edge";

export default async function ResourcesPage() {
    // 初始化默认分类（如果不存在）
    await initializeDefaultCategories();

    const [resources, stats, resourceTypes] = await Promise.all([
        getResources(),
        getResourceStats(),
        getPresetsByType("resource_type"),
    ]);

    return (
        <ResourcesPageClient resources={resources} stats={stats} resourceTypes={resourceTypes} />
    );
}

