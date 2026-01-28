import { AnalyticsClient } from "@/components/analytics/analytics-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <AnalyticsClient />
        </div>
    );
}
