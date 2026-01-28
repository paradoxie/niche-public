"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryPieChartProps {
    data: { category: string; amount: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
    const { t } = useTranslation();
    const total = data.reduce((sum, d) => sum + d.amount, 0);

    const categoryLabels: Record<string, string> = {
        subscription: t("expenses.categorySubscription"),
        domain: t("expenses.categoryDomain"),
        hosting: t("expenses.categoryHosting"),
        marketing: t("expenses.categoryMarketing"),
        tool: t("expenses.categoryTool"),
        other: t("expenses.categoryOther"),
    };

    const translatedData = data.map(d => ({
        ...d,
        name: categoryLabels[d.category.toLowerCase()] || d.category
    }));

    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/10 rounded-md">
                        <PieIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    {t("analytics.expenseCategory")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {total === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                        {t("common.noData")}
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={translatedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="amount"
                                    nameKey="name"
                                >
                                    {translatedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--popover)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius)",
                                        color: "var(--popover-foreground)",
                                    }}
                                    formatter={(value: number | undefined) => {
                                        if (value === undefined) return ["", ""];
                                        return [`¥${value.toLocaleString()}`, t("analytics.amount")];
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
