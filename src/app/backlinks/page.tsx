import { getBacklinks, getMonthlyBacklinkCost } from "@/lib/actions/backlinks";
import { getProjects } from "@/lib/actions/projects";
import { getResources } from "@/app/resources/actions";
import { BacklinksPageClient } from "@/components/backlinks/backlinks-page-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function BacklinksPoolPage() {
    const backlinks = await getBacklinks();
    const projects = await getProjects();
    const resources = await getResources();
    const monthlyBacklinkCost = await getMonthlyBacklinkCost();

    const projectNames: Record<number, string> = {};
    for (const project of projects) {
        projectNames[project.id] = project.name;
    }

    const totalCost = backlinks.reduce((sum, b) => sum + (b.cost || 0), 0);
    const liveCount = backlinks.filter((b) => b.status === "live").length;

    return (
        <BacklinksPageClient
            backlinks={backlinks}
            projectNames={projectNames}
            resources={resources}
            totalCost={totalCost}
            liveCount={liveCount}
            monthlyBacklinkCost={monthlyBacklinkCost}
        />
    );
}
