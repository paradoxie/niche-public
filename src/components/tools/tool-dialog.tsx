"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type SiteTool, type Preset, toolCostEnum } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createTool, updateTool } from "@/app/tools/actions";

// Schema moved inside component or handled manually for validation messages
/*
const toolSchema = z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Please enter a valid URL"),
    category: z.enum(toolCategoryEnum),
    purpose: z.string().optional().nullable(),
    cost: z.enum(toolCostEnum),
    notes: z.string().optional().nullable(),
});
*/

// Handled below in ToolFormValues type definition and inner schema

interface ToolDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    tool?: SiteTool | null;
    trigger?: React.ReactNode;
    categories?: Preset[];
}

import { useTranslation } from "@/i18n/context";

/* Schema definition moved inside ToolDialog to access t() */

type ToolFormValues = {
    name: string;
    url: string;
    category: string;
    purpose?: string | null;
    cost: "free" | "paid" | "freemium";
    notes?: string | null;
};

export function ToolDialog({ open, onOpenChange, tool, trigger, categories = [] }: ToolDialogProps) {
    const { t } = useTranslation();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const finalOpen = isControlled ? open : internalOpen;
    const finalOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

    // 动态分类列表
    const categoryValues = useMemo(() =>
        categories.length > 0 ? categories.map(c => c.value) : ["other"],
        [categories]
    );

    const toolSchema = z.object({
        name: z.string().min(1, t("dialog.validationToolNameRequired")),
        url: z.string().url(t("dialog.validationUrlInvalid")),
        category: z.string().min(1, "Category is required"),
        purpose: z.string().optional().nullable(),
        cost: z.enum(toolCostEnum),
        notes: z.string().optional().nullable(),
    });

    // 动态分类标签（从 presets 获取）
    const categoryLabels: Record<string, string> = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const cat of categories) {
            labels[cat.value] = cat.label || cat.value;
        }
        return labels;
    }, [categories]);

    const costLabels: Record<string, string> = {
        free: t("tools.costFree"),
        paid: t("tools.costPaid"),
        freemium: t("tools.costFreemium"),
    };

    const form = useForm<ToolFormValues>({
        resolver: zodResolver(toolSchema),
        defaultValues: {
            name: "",
            url: "",
            category: "other",
            purpose: "",
            cost: "free",
            notes: "",
        },
    });

    useEffect(() => {
        if (tool) {
            form.reset({
                name: tool.name,
                url: tool.url,
                category: tool.category,
                purpose: tool.purpose || "",
                cost: tool.cost,
                notes: tool.notes || "",
            });
        } else {
            form.reset({
                name: "",
                url: "",
                category: "other",
                purpose: "",
                cost: "free",
                notes: "",
            });
        }
    }, [tool, form]);

    const onSubmit = async (data: ToolFormValues) => {
        try {
            if (tool) {
                await updateTool(tool.id, data);
            } else {
                await createTool(data);
            }
            finalOnOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Failed to save tool:", error);
        }
    };

    return (
        <Dialog open={finalOpen} onOpenChange={finalOnOpenChange}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogHeader>
                        <DialogTitle>{tool ? t("dialog.editTool") : t("dialog.addTool")}</DialogTitle>
                    </DialogHeader>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.toolName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("dialog.toolNamePlaceholder")} {...field} />
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
                                    <FormLabel>{t("dialog.toolUrl")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("dialog.toolUrlPlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.toolCategory")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("dialog.selectCategory")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.value}>
                                                        {cat.label || cat.value}
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
                                name="cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.toolCost")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("dialog.selectCost")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {toolCostEnum.map((cost) => (
                                                    <SelectItem key={cost} value={cost}>
                                                        {costLabels[cost]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.toolPurpose")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t("dialog.toolPurposePlaceholder")}
                                            className="resize-none"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.toolNotes")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t("dialog.expenseNotesPlaceholder")}
                                            className="resize-none"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => finalOnOpenChange(false)}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? t("common.saving") : tool ? t("common.update") : t("common.add")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
