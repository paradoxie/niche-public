import { getProject } from "@/lib/actions/projects";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/project-form";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: PageProps) {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    const project = await getProject(projectId);
    if (!project) {
        notFound();
    }

    return <ProjectForm project={project} mode="edit" />;
}
