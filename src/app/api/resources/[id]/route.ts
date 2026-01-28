import { NextRequest, NextResponse } from "next/server";
import { getResourceDetail } from "@/app/resources/actions";

export const runtime = "edge";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const resourceId = parseInt(id, 10);

    if (isNaN(resourceId)) {
        return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 });
    }

    const data = await getResourceDetail(resourceId);

    if (!data) {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ name: data.resource.name });
}
