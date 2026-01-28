"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type LinkResource, type Preset, resourceStatusEnum } from "@/db/schema";
import { useTranslation } from "@/i18n/context";
import { createResource, updateResource } from "@/app/resources/actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";


const resourceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Please enter a valid URL"),
    type: z.string().min(1, "Type is required"),
    daScore: z.number().min(0).max(100).optional().nullable(),
    drScore: z.number().min(0).max(100).optional().nullable(),
    price: z.number().min(0).optional().nullable(),
    isFree: z.boolean(),
    status: z.enum(resourceStatusEnum),
    notes: z.string().optional().nullable(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface ResourceDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    resource?: LinkResource | null;
    trigger?: React.ReactNode;
    resourceTypes?: Preset[];
}

export function ResourceDialog({ open, onOpenChange, resource, trigger, resourceTypes = [] }: ResourceDialogProps) {
    const { t } = useTranslation();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const finalOpen = isControlled ? open : internalOpen;
    const finalOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

    // 动态类型标签（从 presets 获取）
    const typeLabels: Record<string, string> = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const type of resourceTypes) {
            labels[type.value] = type.label || type.value;
        }
        return labels;
    }, [resourceTypes]);
    const form = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema),
        defaultValues: {
            name: "",
            url: "",
            type: "other",
            daScore: null,
            drScore: null,
            price: null,
            isFree: true,
            status: "active",
            notes: "",
        },
    });

    useEffect(() => {
        if (resource) {
            form.reset({
                name: resource.name,
                url: resource.url,
                type: resource.type,
                daScore: resource.daScore,
                drScore: resource.drScore,
                price: resource.price,
                isFree: resource.isFree ?? true,
                status: resource.status,
                notes: resource.notes || "",
            });
        } else {
            form.reset({
                name: "",
                url: "",
                type: "other",
                daScore: null,
                drScore: null,
                price: null,
                isFree: true,
                status: "active",
                notes: "",
            });
        }
    }, [resource, form]);

    const onSubmit = async (data: ResourceFormValues) => {
        try {
            if (resource) {
                await updateResource(resource.id, data);
            } else {
                await createResource(data);
            }
            finalOnOpenChange(false);
        } catch (error) {
            console.error("Failed to save resource:", error);
        }
    };

    const isFree = form.watch("isFree");

    return (
        <Dialog open={finalOpen} onOpenChange={finalOnOpenChange}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{resource ? t("dialog.editResource") : t("dialog.addResource")}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.resourceName")} *</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("dialog.resourceName")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.resourceUrl")} *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/signup" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.resourceType")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("common.type")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {resourceTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.value}>
                                                        {type.label || type.value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("common.status")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">{t("common.active")}</SelectItem>
                                                <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                                                <SelectItem value="pending">{t("common.pending")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="daScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("resources.daScore")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0-100"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="drScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("resources.drScore")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0-100"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <FormField
                                control={form.control}
                                name="isFree"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormLabel className="mt-0">{t("dialog.isFree")}</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {!isFree && (
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormLabel className="mt-0">{t("common.price")} ($)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="w-24"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.resourceNotes")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t("dialog.resourceNotes")}
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => finalOnOpenChange(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button type="submit">{resource ? t("common.save") : t("common.add")}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
