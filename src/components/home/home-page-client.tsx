"use client";

import { useTranslation } from "@/i18n/context";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Wallet, Clock, AlertTriangle, Link2, Database, Wrench, FolderOpen, ChevronRight, TrendingUp, ArrowRight, AlertCircle, CheckCircle2, Egg } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, fadeScale, viewportConfig } from "@/lib/animations";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from "@/lib/utils";
import { ProjectDialog } from "@/components/project-dialog";
import { ShineBorderButton } from "@/components/ui/shine-border-button";
import { type Project } from "@/db/schema";
import { calculateHealthStatus } from "@/lib/health";

interface HomePageClientProps {
    stats: {
        totalProjects: number;
        activeAdsense: number;
        monthlyBacklinkCost: number;
    };
    expenseStats: {
        thisMonth: number;
        thisYear: number;
    };
    upcomingExpires: Array<{
        expense: {
            id: number;
            name: string;
            expiresAt: Date | null;
        };
    }>;
    backlinks: Array<{ status: string }>;
    resourceStats: {
        total: number;
        activeCount: number;
    };
    toolStats: {
        total: number;
        freeCount: number;
    };
    projects: Project[];
    trend: Array<{ name: string; amount: number }>;
}

// 使用共享动画变体
const container = staggerContainer;
const item = fadeSlideUp;
const cardItem = fadeScale;

export function HomePageClient({
    stats,
    expenseStats,
    upcomingExpires,
    backlinks,
    resourceStats,
    toolStats,
    projects,
    trend
}: HomePageClientProps) {
    const { t } = useTranslation();

    const liveBacklinks = backlinks.filter((b) => b.status === "live").length;
    const pendingBacklinks = backlinks.filter((b) => b.status === "outreach" || b.status === "planned").length;

    const backlinkData = [
        { name: t("home.live"), value: liveBacklinks, color: '#22c55e' },
        { name: t("home.pending"), value: pendingBacklinks, color: '#3b82f6' },
        { name: t("home.other"), value: backlinks.length - liveBacklinks - pendingBacklinks, color: '#94a3b8' },
    ];

    // 计算健康状态统计
    const healthStats = {
        danger: projects.filter(p => calculateHealthStatus(p) === "danger").length,
        warning: projects.filter(p => calculateHealthStatus(p) === "warning").length,
        good: projects.filter(p => calculateHealthStatus(p) === "good").length,
    };

    // 计算项目状态统计
    const statusStats = {
        incubating: projects.filter(p => p.status === "incubating").length,
        adsenseRejected: projects.filter(p => p.adsenseStatus === "rejected").length,
    };

    const getDaysRemaining = (expiresAt: Date) => {
        const now = new Date();
        return Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <motion.div
            className="space-y-6 max-w-7xl mx-auto"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            {/* Header Section */}
            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        {t("home.overview")}
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">{t("home.welcomeBack")}</p>
                </div>
                <ProjectDialog trigger={<ShineBorderButton size="sm">+ {t("home.newProject")}</ShineBorderButton>} />
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={item}>
                <StatsCards stats={stats} />
            </motion.div>

            {/* 待办模块 - Project Health Overview */}
            <motion.div variants={item}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">{t("home.todoOverview")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* 危急项目 */}
                    <Link href="/projects?health=danger" className="block h-full group">
                        <SpotlightCard
                            spotlightColor="rgba(239, 68, 68, 0.4)"
                            className="h-full border-border/50 hover:border-red-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-500/5 opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none" />
                            <div className="p-4 relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-red-600 transition-colors">{t("dashboard.healthDanger")}</p>
                                        <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 tracking-tight text-red-600">{healthStats.danger}</h3>
                                    </div>
                                    <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-red-500/10 text-red-500">
                                        <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* 警告项目 */}
                    <Link href="/projects?health=warning" className="block h-full group">
                        <SpotlightCard
                            spotlightColor="rgba(234, 179, 8, 0.4)"
                            className="h-full border-border/50 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none" />
                            <div className="p-4 relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-yellow-600 transition-colors">{t("dashboard.healthWarning")}</p>
                                        <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 tracking-tight text-yellow-600">{healthStats.warning}</h3>
                                    </div>
                                    <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-yellow-500/10 text-yellow-500">
                                        <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* 孵化中项目 */}
                    <Link href="/projects?status=incubating" className="block h-full group">
                        <SpotlightCard
                            spotlightColor="rgba(168, 85, 247, 0.4)"
                            className="h-full border-border/50 hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-500/5 opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none" />
                            <div className="p-4 relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-purple-600 transition-colors">{t("projects.statusIncubating")}</p>
                                        <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 tracking-tight text-purple-600">{statusStats.incubating}</h3>
                                    </div>
                                    <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-purple-500/10 text-purple-500">
                                        <Egg className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </Link>

                    {/* AdSense 被拒绝 */}
                    <Link href="/projects?adsense=rejected" className="block h-full group">
                        <SpotlightCard
                            spotlightColor="rgba(249, 115, 22, 0.4)"
                            className="h-full border-border/50 hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-500/5 opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none" />
                            <div className="p-4 relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-orange-600 transition-colors">{t("dashboard.adSenseRejected")}</p>
                                        <h3 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 tracking-tight text-orange-600">{statusStats.adsenseRejected}</h3>
                                    </div>
                                    <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-orange-500/10 text-orange-500">
                                        <Wallet className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </Link>
                </div>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Charts) */}
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    {/* Cost Trend Chart */}
                    <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.4)" className="border-border/50 shadow-sm hover:shadow-md transition-shadow h-[300px] md:h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Wallet className="h-5 w-5 text-primary" />
                                {t("home.costOverview")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trend}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} tickFormatter={(value) => `¥${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-popover)', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: 'var(--color-foreground)' }}
                                        formatter={(value: number | string | Array<number | string> | undefined) => {
                                            if (value === undefined) return ["", ""];
                                            return [`¥${Number(value).toLocaleString()}`, t("expenses.amount")];
                                        }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" name={t("expenses.amount")} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </SpotlightCard>

                    {/* Resources & Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SpotlightCard
                            spotlightColor="rgba(249, 115, 22, 0.4)"
                            className="group cursor-pointer border-border/50"
                            onClick={() => window.location.href = '/resources'}
                        >
                            <div className="p-6 flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                                    <Database className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">{t("home.linkResources")}</p>
                                    <p className="text-2xl font-bold">{resourceStats.total}</p>
                                </div>
                                <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                        </SpotlightCard>
                        <SpotlightCard
                            spotlightColor="rgba(99, 102, 241, 0.4)"
                            className="group cursor-pointer border-border/50"
                            onClick={() => window.location.href = '/tools'}
                        >
                            <div className="p-6 flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                    <Wrench className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">{t("home.siteTools")}</p>
                                    <p className="text-2xl font-bold">{toolStats.total}</p>
                                </div>
                                <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                        </SpotlightCard>
                    </div>
                </motion.div>

                {/* Right Column (Widgets) */}
                <motion.div variants={item} className="space-y-6">
                    {/* Backlink Stats */}
                    <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.4)" className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Link2 className="h-5 w-5 text-blue-500" />
                                {t("home.backlinkMatrix")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[160px] md:h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={backlinkData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px' }}
                                            formatter={(val: number | string | Array<number | string> | undefined) => {
                                                if (val === undefined) return ["", ""];
                                                return [val, t("analytics.count")];
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} name={t("analytics.count")}>
                                            {backlinkData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                                <div className="bg-muted/30 p-2 rounded-lg">
                                    <span className="text-2xl font-bold text-green-600">{liveBacklinks}</span>
                                    <p className="text-xs text-muted-foreground">{t("home.live")}</p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded-lg">
                                    <span className="text-2xl font-bold text-foreground">{backlinks.length}</span>
                                    <p className="text-xs text-muted-foreground">{t("home.total")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </SpotlightCard>

                    {/* Upcoming Expiry */}
                    <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.4)" className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-red-500" />
                                {t("home.upcomingExpiry")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingExpires.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>{t("home.noUpcomingPayments")}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingExpires.slice(0, 4).map(({ expense }) => {
                                        const days = expense.expiresAt ? getDaysRemaining(expense.expiresAt) : 0;
                                        return (
                                            <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 group hover:bg-muted/70 transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                                                    <span className="text-sm font-medium truncate">{expense.name}</span>
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    "ml-2 whitespace-nowrap",
                                                    days <= 7 ? "text-red-500 border-red-200 bg-red-50" : "text-orange-500 border-orange-200 bg-orange-50"
                                                )}>
                                                    {t("home.daysRemaining", { days })}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </SpotlightCard>
                </motion.div>
            </div>

        </motion.div>
    );
}
