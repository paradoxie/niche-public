import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/actions/projects";

export const runtime = "edge";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
        return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = await getProject(projectId);

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ name: project.name });
}
