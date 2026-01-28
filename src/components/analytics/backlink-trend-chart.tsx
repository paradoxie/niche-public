"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2 } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BacklinkTrendChartProps {
    data: { label: string; count: number; cost: number }[];
}

export function BacklinkTrendChart({ data }: BacklinkTrendChartProps) {
    const { t } = useTranslation();

    return (
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 bg-green-500/10 rounded-md">
                        <Link2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    {t("analytics.backlinkTrend")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                            <CartesianGrid stroke="#f5f5f5" vertical={false} opacity={0.4} />
                            <XAxis
                                dataKey="label"
                                scale="band"
                                fontSize={12}
                                stroke="var(--muted-foreground)"
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickFormatter={(value) => `¥${value}`}
                                tickLine={false}
                                axisLine={false}
                                dx={10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    color: "var(--popover-foreground)",
                                }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="count" barSize={20} fill="var(--primary)" radius={[4, 4, 0, 0]} name={t("analytics.count")} />
                            <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#82ca9d" strokeWidth={3} name={t("analytics.cost")} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
