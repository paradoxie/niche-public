"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from "next-themes";

interface ExpenseTrendChartProps {
    data: { label: string; amount: number }[];
    title?: string;
}

export function ExpenseTrendChart({ data, title }: ExpenseTrendChartProps) {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const displayTitle = title || t("analytics.expenseTrend");

    return (
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    {displayTitle}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                            <XAxis
                                dataKey="label"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickFormatter={(value) => `¥${value}`}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    color: "var(--popover-foreground)",
                                }}
                                formatter={(value: number | string | Array<number | string> | undefined) => {
                                    if (value === undefined) return ["", ""];
                                    return [`¥${Number(value).toLocaleString()}`, t("expenses.amount")];
                                }}
                                labelStyle={{ color: "var(--muted-foreground)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
