"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProjectCostBarProps {
    data: { name: string; amount: number }[];
}

export function ProjectCostBar({ data }: ProjectCostBarProps) {
    const { t } = useTranslation();

    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/10 rounded-md">
                        <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    {t("analytics.projectCostTop5")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                        {t("common.noData")}
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.4} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                                    tickFormatter={(value) => value === "fixed_cost" ? t("expenses.globalCost") : value}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)/20' }}
                                    contentStyle={{
                                        backgroundColor: "var(--popover)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius)",
                                        color: "var(--popover-foreground)",
                                    }}
                                    labelFormatter={(label) => label === "fixed_cost" ? t("expenses.globalCost") : label}
                                    formatter={(value: number | undefined) => {
                                        if (value === undefined) return ["", t("common.cost")];
                                        return [`¥${value.toLocaleString()}`, t("common.cost")];
                                    }}
                                />
                                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 3 ? "var(--primary)" : "var(--muted-foreground)/50"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
