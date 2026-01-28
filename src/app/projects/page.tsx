import { getProjects } from "@/lib/actions/projects";
import { getBacklinks } from "@/lib/actions/backlinks";
import { ProjectsPageClient } from "./page-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
    const [projects, backlinks] = await Promise.all([
        getProjects(),
        getBacklinks(),
    ]);

    // Calculate backlink counts per project (live status only)
    const backlinkCounts: Record<number, number> = {};
    for (const backlink of backlinks) {
        if (backlink.status === "live") {
            backlinkCounts[backlink.projectId] = (backlinkCounts[backlink.projectId] || 0) + 1;
        }
    }

    return <ProjectsPageClient projects={projects} backlinkCounts={backlinkCounts} />;
}
