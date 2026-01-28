import { getProject } from "@/lib/actions/projects";
import { getBacklinksWithStats } from "@/lib/actions/backlinks";
import { getResources } from "@/app/resources/actions";
import { getProjectExpenses } from "@/app/expenses/actions";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/project-details/project-detail-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: PageProps) {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    // 优化：全部并行查询（3次查询代替4次）
    const [project, backlinkData, projectExpenses, resources] = await Promise.all([
        getProject(projectId),
        getBacklinksWithStats(projectId),
        getProjectExpenses(projectId),
        getResources(),
    ]);

    if (!project) {
        notFound();
    }

    return (
        <ProjectDetailView
            project={project}
            backlinks={backlinkData.backlinks}
            backlinkStats={backlinkData.stats}
            projectExpenses={projectExpenses}
            resources={resources}
        />
    );
}
