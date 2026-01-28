"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from "next-themes";

interface TrendChartProps {
    data: { name: string; amount: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
    const { t } = useTranslation();
    const { theme } = useTheme();

    return (
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    {t("expenses.monthlyTrend")}
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
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                            <XAxis
                                dataKey="name"
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
                                fill="url(#colorAmount)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
