"use client";

import { Button } from "@/components/ui/button";
import { syncGithub } from "@/lib/actions/projects";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SyncGithubButtonProps {
    projectId: number;
}

export function SyncGithubButton({ projectId }: SyncGithubButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSync() {
        setLoading(true);
        try {
            await syncGithub(projectId);
            router.refresh();
        } catch (error) {
            console.error("Sync failed", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={handleSync}
            disabled={loading}
        >
            {loading ? "🔄 Syncing..." : "🔄 Sync GitHub"}
        </Button>
    );
}
