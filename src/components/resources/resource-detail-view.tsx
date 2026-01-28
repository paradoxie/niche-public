"use client";

import { useState } from "react";
import { type LinkResource, type Project, type Backlink } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Plus, Trash2, ExternalLink, Link2 } from "lucide-react";
import { linkResourceToProject, unlinkResourceFromProject } from "@/app/resources/actions";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslation } from "@/i18n/context";

interface ResourceDetailViewProps {
    resource: LinkResource;
    linkedBacklinks: Array<{
        backlink: Backlink;
        project: Project;
    }>;
    unlinkedProjects: Project[];
}

export function ResourceDetailView({ resource, linkedBacklinks, unlinkedProjects }: ResourceDetailViewProps) {
    const { t } = useTranslation();
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [targetUrl, setTargetUrl] = useState("");
    const [isLinking, setIsLinking] = useState(false);
    const { confirm } = useConfirmDialog();

    // Use translation keys for type labels
    const typeLabels: Record<string, string> = {
        profile: t("resources.typeProfile"),
        guest_post: t("resources.typeGuestPost"),
        directory: t("resources.typeDirectory"),
        forum: t("resources.typeForum"),
        comment: t("resources.typeComment"),
        social: t("resources.typeSocial"),
        other: t("resources.typeOther"),
    };

    const handleLinkProject = async () => {
        if (!selectedProjectId || !targetUrl) return;

        setIsLinking(true);
        try {
            await linkResourceToProject(resource.id, parseInt(selectedProjectId), targetUrl);
            setLinkDialogOpen(false);
            setSelectedProjectId("");
            setTargetUrl("");
        } catch (error) {
            console.error("Failed to link project:", error);
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlinkProject = async (backlinkId: number) => {
        const confirmed = await confirm({
            title: t("resources.unlinkConfirmTitle"),
            description: t("resources.unlinkConfirmMessage"),
            confirmText: t("resources.unlinkConfirmButton"),
            cancelText: t("resources.keepButton"),
            variant: "destructive",
        });
        if (confirmed) {
            await unlinkResourceFromProject(backlinkId, resource.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Resource Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        {t("resources.resourceInfo")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("common.url")}</p>
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                            >
                                {new URL(resource.url).hostname}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("common.type")}</p>
                            <p className="font-medium">{typeLabels[resource.type] || resource.type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">DA / DR</p>
                            <p className="font-medium">
                                {resource.daScore || "-"} / {resource.drScore || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("common.price")}</p>
                            <p className="font-medium">
                                {resource.isFree ? t("common.free") : resource.price ? `$${resource.price}` : "-"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Linked Projects */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {t("resources.linkedProjects")}
                        <Badge variant="secondary">{linkedBacklinks.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {linkedBacklinks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">{t("resources.noLinkedProjects")}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("projects.projectName")}</TableHead>
                                    <TableHead>{t("resources.targetUrl")}</TableHead>
                                    <TableHead>{t("common.status")}</TableHead>
                                    <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {linkedBacklinks.map(({ backlink, project }) => (
                                    <TableRow key={backlink.id}>
                                        <TableCell>
                                            <span className="font-medium">{project.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <a
                                                href={backlink.targetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[300px]"
                                            >
                                                {backlink.targetUrl}
                                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {t(`dialog.backlinkStatus${backlink.status.charAt(0).toUpperCase() + backlink.status.slice(1)}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUnlinkProject(backlink.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Unlinked Projects */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                        {t("resources.unlinkedProjects")}
                        <Badge variant="outline">{unlinkedProjects.length}</Badge>
                    </CardTitle>
                    {unlinkedProjects.length > 0 && (
                        <Button size="sm" onClick={() => setLinkDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            {t("resources.linkProject")}
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {unlinkedProjects.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">{t("resources.allProjectsLinked")}</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {unlinkedProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setSelectedProjectId(String(project.id));
                                        setLinkDialogOpen(true);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium truncate">{project.name}</span>
                                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    {project.siteUrl && (
                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                            {new URL(project.siteUrl).hostname}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("resources.linkDialogTitle")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("resources.selectProject")}</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("resources.selectProjectPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {unlinkedProjects.map((project) => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("resources.targetUrl")}</Label>
                            <Input
                                placeholder={t("resources.targetUrlPlaceholder")}
                                value={targetUrl}
                                onChange={(e) => setTargetUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("resources.targetUrlHint")}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button
                                onClick={handleLinkProject}
                                disabled={!selectedProjectId || !targetUrl || isLinking}
                            >
                                {isLinking ? t("resources.linking") : t("resources.confirmLink")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
