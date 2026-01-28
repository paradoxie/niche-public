import { ProjectForm } from "@/components/project-form";

export const runtime = "edge";

export default function NewProjectPage() {
    return <ProjectForm mode="create" />;
}
