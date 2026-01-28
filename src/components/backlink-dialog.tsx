"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createBacklinkSchema, type BacklinkFormValues } from "@/lib/schemas";
import { createBacklink, updateBacklink } from "@/lib/actions/backlinks";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "@/i18n/context";
import { type Backlink } from "@/db/schema";

interface BacklinkDialogProps {
    projectId: number;
    trigger?: React.ReactNode;
    resources?: any[];
    backlinkToEdit?: Backlink;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function BacklinkDialog({
    projectId,
    trigger,
    resources = [],
    backlinkToEdit,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: BacklinkDialogProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

    // Reset form when opening in edit mode
    useEffect(() => {
        if (open && backlinkToEdit) {
            form.reset({
                projectId,
                targetUrl: backlinkToEdit.targetUrl,
                sourceUrl: backlinkToEdit.sourceUrl,
                anchorText: backlinkToEdit.anchorText || "",
                daScore: backlinkToEdit.daScore || 0,
                cost: backlinkToEdit.cost || 0,
                status: backlinkToEdit.status as any,
                resourceId: backlinkToEdit.resourceId || undefined,
            });
        }
    }, [open, backlinkToEdit]);

    const schema = useMemo(() => createBacklinkSchema(t), [t]);

    const form = useForm<BacklinkFormValues>({
        // 使用 as any 绕过复杂的 Resolver 类型不匹配问题，因为 zodResolver 和 react-hook-form 的类型定义有时会有冲突
        resolver: zodResolver(schema) as any,
        defaultValues: {
            projectId,
            targetUrl: "",
            sourceUrl: "",
            anchorText: "",
            daScore: 0,
            cost: 0,
            status: "planned",
            resourceId: undefined,
        },
    });

    // 监听 resourceId 变化，自动填充数据
    const watchedResourceId = form.watch("resourceId");

    // 当选择资源时触发
    const onResourceChange = (resourceIdStr: string) => {
        const id = parseInt(resourceIdStr);
        form.setValue("resourceId", id);

        const resource = resources?.find(r => r.id === id);
        if (resource) {
            if (resource.daScore) form.setValue("daScore", resource.daScore);
            if (resource.price) form.setValue("cost", resource.price);

            // 如果已经填了 targetUrl，且选了资源，自动设为上线
            const currentTargetUrl = form.getValues("targetUrl");
            if (currentTargetUrl) {
                form.setValue("status", "live");
            }
        }
    };

    async function onSubmit(data: BacklinkFormValues) {
        try {
            if (backlinkToEdit) {
                await updateBacklink(backlinkToEdit.id, data);
            } else {
                await createBacklink(data);
            }
            setOpen?.(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error("Submission failed", error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {backlinkToEdit ? t("dialog.editBacklink") : t("dialog.addBacklink")}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {resources && resources.length > 0 && (
                            <FormField
                                control={form.control}
                                name="resourceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand / 资源 (可选)</FormLabel>
                                        <Select
                                            onValueChange={onResourceChange}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="选择外链品牌..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {resources.map((r: any) => (
                                                    <SelectItem key={r.id} value={r.id.toString()}>
                                                        {r.name} ({r.type}) - DA: {r.daScore || '-'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="sourceUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.sourceUrl")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://partner-site.com/post" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="targetUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.targetUrl")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://mysite.com/page"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (e.target.value && watchedResourceId) {
                                                    form.setValue("status", "live");
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="anchorText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.anchorText")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="best keyword" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="daScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.daScore")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("common.price")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("common.status")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("dialog.selectStatus")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="planned">{t("dialog.backlinkStatusPlanned")}</SelectItem>
                                                <SelectItem value="outreach">{t("dialog.backlinkStatusOutreach")}</SelectItem>
                                                <SelectItem value="live">{t("dialog.backlinkStatusLive")}</SelectItem>
                                                <SelectItem value="removed">{t("dialog.backlinkStatusRemoved")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen?.(false)}>{t("common.cancel")}</Button>
                            <Button type="submit">{t("common.save")}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
