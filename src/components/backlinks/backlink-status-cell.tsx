"use client";

import { useTransition, useState } from "react";
import { type Backlink } from "@/db/schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateBacklink } from "@/lib/actions/backlinks";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";

interface BacklinkStatusCellProps {
    backlink: Backlink;
}

const backlinkStatusColors: Record<string, string> = {
    planned: "bg-gray-100 text-gray-500 border-gray-200",
    outreach: "bg-blue-50 text-blue-600 border-blue-200",
    live: "bg-green-50 text-green-600 border-green-200",
    removed: "bg-red-50 text-red-600 border-red-200",
};

export function BacklinkStatusCell({ backlink }: BacklinkStatusCellProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentStatus, setCurrentStatus] = useState(backlink.status);

    const handleStatusChange = (newStatus: string) => {
        // Optimistic update
        setCurrentStatus(newStatus as any);

        startTransition(async () => {
            try {
                await updateBacklink(backlink.id, { status: newStatus as any });
                router.refresh();
            } catch (error) {
                // Revert on error
                setCurrentStatus(backlink.status);
                console.error("Failed to update status", error);
            }
        });
    };

    return (
        <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={isPending}
        >
            <SelectTrigger
                className={cn(
                    "h-7 text-xs border-0 shadow-sm w-[100px] justify-between px-2",
                    backlinkStatusColors[currentStatus],
                    isPending && "opacity-70 animate-pulse"
                )}
            >
                <div className="flex items-center gap-1.5 truncate">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                        currentStatus === "live" ? "bg-green-500" :
                            currentStatus === "outreach" ? "bg-blue-500" :
                                currentStatus === "removed" ? "bg-red-500" :
                                    "bg-gray-400"
                    )} />
                    <span className="truncate">
                        {t(`dialog.backlinkStatus${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`)}
                    </span>
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="planned">{t("dialog.backlinkStatusPlanned")}</SelectItem>
                <SelectItem value="outreach">{t("dialog.backlinkStatusOutreach")}</SelectItem>
                <SelectItem value="live">{t("dialog.backlinkStatusLive")}</SelectItem>
                <SelectItem value="removed">{t("dialog.backlinkStatusRemoved")}</SelectItem>
            </SelectContent>
        </Select>
    );
}
