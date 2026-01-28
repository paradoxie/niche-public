import { getResourceDetail } from "../actions";
import { ResourceDetailView } from "@/components/resources/resource-detail-view";
import { notFound } from "next/navigation";

export const runtime = "edge";

interface ResourceDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
    const { id } = await params;
    const resourceId = parseInt(id);

    if (isNaN(resourceId)) {
        notFound();
    }

    const data = await getResourceDetail(resourceId);

    if (!data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <ResourceDetailView
                resource={data.resource}
                linkedBacklinks={data.linkedBacklinks}
                unlinkedProjects={data.unlinkedProjects}
            />
        </div>
    );
}

