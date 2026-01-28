"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Expense, type Project, type Preset } from "@/db/schema";
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
import { createExpense, updateExpense, getPaymentMethods, createPaymentMethod } from "@/app/expenses/actions";
import { Plus } from "lucide-react";
import { useTranslation } from "@/i18n/context";

/* Schema definition moved inside ExpenseDialog to access t() */

type ExpenseFormValues = {
    name: string;
    amount: number;
    category: string;
    projectId?: string | null;
    paymentMethodId?: string | null;
    paidAt: string;
    expiresAt?: string | null;
    notes?: string | null;
};

interface ExpenseDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    expense?: Expense | null;
    projects?: Project[];
    trigger?: React.ReactNode;
    categories?: Preset[];
}

export function ExpenseDialog({ open, onOpenChange, expense, projects = [], trigger, categories = [] }: ExpenseDialogProps) {
    const { t } = useTranslation();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const finalOpen = isControlled ? open : internalOpen;
    const finalOnOpenChange = isControlled ? onOpenChange : setInternalOpen;

    const [paymentMethods, setPaymentMethods] = useState<Array<{ id: number; value: string }>>([]);
    const [newPaymentMethod, setNewPaymentMethod] = useState("");
    const [showNewPaymentInput, setShowNewPaymentInput] = useState(false);

    const expenseSchema = z.object({
        name: z.string().min(1, t("dialog.validationNameRequired")),
        amount: z.number().positive(t("dialog.validationAmountPositive")),
        category: z.string().min(1, "Category is required"),
        projectId: z.string().optional().nullable(),
        paymentMethodId: z.string().optional().nullable(),
        paidAt: z.string().min(1, t("dialog.validationDateRequired")),
        expiresAt: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    });

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            name: "",
            amount: 0,
            category: "other",
            projectId: null,
            paymentMethodId: null,
            paidAt: new Date().toISOString().split("T")[0],
            expiresAt: null,
            notes: "",
        },
    });

    // 动态分类标签（从 presets 获取）
    const categoryLabels: Record<string, string> = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const cat of categories) {
            labels[cat.value] = cat.label || cat.value;
        }
        return labels;
    }, [categories]);

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    useEffect(() => {
        if (expense) {
            form.reset({
                name: expense.name,
                amount: expense.amount,
                category: expense.category,
                projectId: expense.projectId ? String(expense.projectId) : null,
                paymentMethodId: expense.paymentMethodId ? String(expense.paymentMethodId) : null,
                paidAt: new Date(expense.paidAt).toISOString().split("T")[0],
                expiresAt: expense.expiresAt ? new Date(expense.expiresAt).toISOString().split("T")[0] : null,
                notes: expense.notes || "",
            });
        } else {
            form.reset({
                name: "",
                amount: 0,
                category: "other",
                projectId: null,
                paymentMethodId: null,
                paidAt: new Date().toISOString().split("T")[0],
                expiresAt: null,
                notes: "",
            });
        }
    }, [expense, form]);

    const loadPaymentMethods = async () => {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
    };

    const handleAddPaymentMethod = async () => {
        if (!newPaymentMethod.trim()) return;
        const method = await createPaymentMethod(newPaymentMethod.trim());
        setPaymentMethods((prev) => [...prev, method]);
        form.setValue("paymentMethodId", String(method.id));
        setNewPaymentMethod("");
        setShowNewPaymentInput(false);
    };

    const onSubmit = async (data: ExpenseFormValues) => {
        try {
            const payload = {
                name: data.name,
                amount: data.amount,
                category: data.category,
                projectId: data.projectId && data.projectId !== "none" ? parseInt(data.projectId) : null,
                paymentMethodId: data.paymentMethodId && data.paymentMethodId !== "none" ? parseInt(data.paymentMethodId) : null,
                paidAt: new Date(data.paidAt),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                notes: data.notes || null,
            };

            if (expense) {
                await updateExpense(expense.id, payload);
            } else {
                await createExpense(payload);
            }
            finalOnOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Failed to save expense:", error);
        }
    };

    return (
        <Dialog open={finalOpen} onOpenChange={finalOnOpenChange}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogHeader>
                        <DialogTitle>{expense ? t("dialog.editExpense") : t("dialog.addExpense")}</DialogTitle>
                    </DialogHeader>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.expenseName")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("dialog.expenseNamePlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        < div className="grid grid-cols-2 gap-4" >
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.expenseAmount")} (¥)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.expenseCategory")}</FormLabel>
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
                        </div >

                        <FormField
                            control={form.control}
                            name="projectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.expenseProject")}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("dialog.selectProject")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">{t("dialog.noProject")}</SelectItem>
                                            {projects.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
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
                            name="paymentMethodId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.expensePaymentMethod")}</FormLabel>
                                    <div className="flex gap-2">
                                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                                            <FormControl>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder={t("dialog.selectPaymentMethod")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">{t("dialog.noPaymentMethod")}</SelectItem>
                                                {paymentMethods.map((m) => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        {m.value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowNewPaymentInput(!showNewPaymentInput)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {showNewPaymentInput && (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder={t("dialog.newPaymentMethod")}
                                                value={newPaymentMethod}
                                                onChange={(e) => setNewPaymentMethod(e.target.value)}
                                            />
                                            <Button type="button" size="sm" onClick={handleAddPaymentMethod}>
                                                {t("dialog.addPaymentMethod")}
                                            </Button>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="paidAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.expenseDate")}</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expiresAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dialog.expenseExpires")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.expenseNotes")}</FormLabel>
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
                                {form.formState.isSubmitting ? t("common.saving") : expense ? t("common.update") : t("common.add")}
                            </Button>
                        </div>
                    </form >
                </Form >
            </DialogContent >
        </Dialog >
    );
}
