"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslation } from "@/i18n/context";
import { Settings2, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { createPreset, deletePreset, isCategoryInUse } from "@/lib/actions/presets";
import type { Preset, PresetType } from "@/db/schema";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
    type: PresetType;
    categories: Preset[];
    onCategoriesChange?: () => void;
}

export function CategoryManager({ type, categories, onCategoriesChange }: CategoryManagerProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { confirm } = useConfirmDialog();
    const [open, setOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const title = type === "expense_category"
        ? t("categories.manageExpenseCategories")
        : type === "tool_category"
            ? t("categories.manageToolCategories")
            : t("categories.manageResourceTypes");

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        setError(null);

        startTransition(async () => {
            const result = await createPreset(type, newCategory.trim(), newCategory.trim());
            if (result) {
                setNewCategory("");
                router.refresh();
                onCategoriesChange?.();
            } else {
                setError(t("categories.addError"));
            }
        });
    };

    const handleDelete = async (category: Preset) => {
        setError(null);

        // 检查是否正在使用
        const inUse = await isCategoryInUse(type, category.value);
        if (inUse) {
            setError(t("categories.inUseError"));
            return;
        }

        const confirmed = await confirm({
            title: t("categories.deleteTitle"),
            description: t("categories.deleteConfirm", { name: category.label || category.value }),
            confirmText: t("common.delete"),
            cancelText: t("common.cancel"),
            variant: "destructive",
        });

        if (!confirmed) return;

        startTransition(async () => {
            const success = await deletePreset(category.id);
            if (success) {
                router.refresh();
                onCategoriesChange?.();
            } else {
                setError(t("categories.deleteError"));
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    {/* 添加新分类 */}
                    <div className="flex gap-2">
                        <Input
                            placeholder={t("categories.newCategoryPlaceholder")}
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            className="flex-1"
                        />
                        <Button onClick={handleAdd} disabled={isPending || !newCategory.trim()}>
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {/* 分类列表 */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t("categories.noCategories")}
                            </p>
                        ) : (
                            categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-2 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-normal">
                                            {cat.value}
                                        </Badge>
                                        {cat.label && cat.label !== cat.value && (
                                            <span className="text-sm text-muted-foreground">{cat.label}</span>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(cat)}
                                        disabled={isPending}
                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
