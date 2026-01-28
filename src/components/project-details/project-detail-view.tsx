"use client";

import { useTranslation } from "@/i18n/context";
import { type Project, type Backlink } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { calculateHealthStatus, formatRelativeTime, formatDomainExpiry } from "@/lib/health";
import { ShineBorderButton } from "@/components/ui/shine-border-button";
import { BacklinkDialog } from "@/components/backlink-dialog";
import { BacklinkStatusCell } from "@/components/backlinks/backlink-status-cell";
import { SyncGithubButton } from "@/components/sync-github-button";
import { Wallet, Globe, Calendar, Server, Tag, Activity, Github, ExternalLink, MoreHorizontal, Pencil, Trash2, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, fadeScale, viewportConfig } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { ProjectIcon } from "@/components/project-icon";

interface ProjectDetailViewProps {
    project: Project;
    backlinks: Backlink[];
    backlinkStats: {
        total: number;
        live: number;
        totalCost: number;
    };
    projectExpenses: {
        total: number;
        expenses: Array<{
            id: number;
            name: string;
            amount: number;
        }>;
    };
    resources: any[]; // Use proper type if available, otherwise any for now to unblock
}

const adsenseStatusColors: Record<string, string> = {
    none: "bg-gray-500/10 text-gray-500 border-gray-200",
    reviewing: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    rejected: "bg-red-500/10 text-red-600 border-red-200",
    active: "bg-green-500/10 text-green-600 border-green-200",
    limited: "bg-orange-500/10 text-orange-600 border-orange-200",
    banned: "bg-red-500/10 text-red-600 border-red-200",
};

const backlinkStatusColors: Record<string, string> = {
    planned: "bg-gray-100 text-gray-500 border-gray-200",
    outreach: "bg-blue-50 text-blue-600 border-blue-200",
    live: "bg-green-50 text-green-600 border-green-200",
    removed: "bg-red-50 text-red-600 border-red-200",
};

// 独立的 AdSense 状态卡片组件
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateProject } from "@/lib/actions/projects";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adsenseStatusEnum } from "@/db/schema";

import { SpotlightCard, SpotlightCardContent, SpotlightCardHeader, SpotlightCardTitle } from "@/components/ui/spotlight-card";

function AdSenseCard({ project, t }: { project: Project; t: (key: string, params?: any) => string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentStatus, setCurrentStatus] = useState(project.adsenseStatus);

    const handleStatusChange = (newStatus: string) => {
        setCurrentStatus(newStatus as typeof project.adsenseStatus);
        startTransition(async () => {
            await updateProject(project.id, { adsenseStatus: newStatus as typeof project.adsenseStatus });
            router.refresh();
        });
    };

    const statusTextColors: Record<string, string> = {
        none: "text-gray-500",
        reviewing: "text-yellow-600 dark:text-yellow-400",
        rejected: "text-red-600 dark:text-red-400",
        active: "text-green-600 dark:text-green-400",
        limited: "text-orange-600 dark:text-orange-400",
        banned: "text-red-600 dark:text-red-400",
    };

    return (
        <SpotlightCard className="border-border/50 bg-gradient-to-br from-card to-green-500/5 relative overflow-hidden group" spotlightColor="rgba(34, 197, 94, 0.2)">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet className="h-16 w-16" />
            </div>
            <SpotlightCardContent className="p-6">
                <div className="flex flex-col gap-1 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-md bg-green-500/10 ring-1 ring-green-500/20">
                            <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{t("dashboard.adSense")}</p>
                    </div>
                    <div className="mt-1">
                        <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
                            <SelectTrigger className={cn("w-auto border-0 bg-muted/50 px-3 py-1.5 h-auto text-xl font-bold rounded-lg focus:ring-1 focus:ring-primary/50 hover:bg-muted/80 transition-all gap-2", statusTextColors[currentStatus], isPending && "opacity-50")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {adsenseStatusEnum.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {t(`dashboard.adSense${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SpotlightCardContent>
        </SpotlightCard>
    );
}

const PLATFORM_LINKS: Record<string, string> = {
    // Registrars
    "namecheap": "https://www.namecheap.com/myaccount/login/",
    "spaceship": "https://www.spaceship.com/application/sign-in/",
    "godaddy": "https://sso.godaddy.com/",
    "porkbun": "https://porkbun.com/account/login",
    "namesilo": "https://www.namesilo.com/login",
    "aliyun": "https://account.aliyun.com/",
    "cloudflare": "https://dash.cloudflare.com/",
    "dynadot": "https://www.dynadot.com/auth/login",

    // Hosting
    "vercel": "https://vercel.com/dashboard",
    "netlify": "https://app.netlify.com/",
    "digitalocean": "https://cloud.digitalocean.com/",
    "aws": "https://console.aws.amazon.com/",
    "google cloud": "https://console.cloud.google.com/",
    "railway": "https://railway.app/dashboard",
    "render": "https://dashboard.render.com/",
    "heroku": "https://dashboard.heroku.com/apps",
    "github pages": "https://github.com/",
    "cursor": "https://cursor.sh",
};

const getPlatformUrl = (platformName: string | null) => {
    if (!platformName) return "#";
    const key = platformName.toLowerCase().trim();
    // Special handling for key that might be in the map
    if (PLATFORM_LINKS[key]) {
        return PLATFORM_LINKS[key];
    }
    // Fallback to google search if unknown
    return `https://www.google.com/search?q=${encodeURIComponent(platformName + " login")}`;
};

export function ProjectDetailView({
    project,
    backlinks,
    backlinkStats,
    projectExpenses,
    resources
}: ProjectDetailViewProps) {
    const { t, locale } = useTranslation();
    const healthStatus = calculateHealthStatus(project);
    const domainInfo = formatDomainExpiry(project.domainExpiry, t);

    // Format currency based on locale
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).replace('CNY', '¥');
    };

    const currencySymbol = "¥";

    return (
        <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            {/* Header Section */}
            <motion.div variants={fadeSlideUp} className="flex flex-col gap-4 md:flex-row md:gap-6 justify-between items-start md:items-center">
                <div className="flex items-center gap-3 md:gap-4">
                    <ProjectIcon
                        project={project}
                        size={128}
                        className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl text-xl md:text-3xl shadow-lg shadow-primary/20"
                    />
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-1">{project.name}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            {project.siteUrl && (
                                <a href={project.siteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                                    <Globe className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                    <span className="truncate max-w-[150px] md:max-w-none">{new URL(project.siteUrl).hostname}</span>
                                </a>
                            )}
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="outline" className="font-normal text-xs">{project.nicheCategory || t("common.uncategorized")}</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href={`/projects/${project.id}/edit`}>
                        <Button variant="outline" className="flex-1 md:flex-initial"><Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}</Button>
                    </Link>
                </div>
            </motion.div>

            {/* Quick Stats Banner */}
            <motion.div variants={fadeScale} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SpotlightCard className="border-border/50 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden group" spotlightColor="rgba(59, 130, 246, 0.2)">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-16 w-16" />
                    </div>
                    <SpotlightCardContent className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-primary/10 ring-1 ring-primary/20">
                                    <Activity className={cn("h-4 w-4",
                                        healthStatus === "danger" ? "text-red-500" :
                                            healthStatus === "warning" ? "text-yellow-500" :
                                                "text-green-500"
                                    )} />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">{t("projectDetails.health.overall")}</p>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">
                                {healthStatus === "good" ? t("dashboard.healthGood") : healthStatus === "warning" ? t("dashboard.healthWarning") : t("dashboard.healthCritical")}
                            </p>
                        </div>
                    </SpotlightCardContent>
                </SpotlightCard>

                <AdSenseCard project={project} t={t} />

                <SpotlightCard className="border-border/50 bg-gradient-to-br from-card to-purple-500/5 relative overflow-hidden group" spotlightColor="rgba(168, 85, 247, 0.2)">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Tag className="h-16 w-16" />
                    </div>
                    <SpotlightCardContent className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-purple-500/10 ring-1 ring-purple-500/20">
                                    <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">{t("projectDetails.expenses.total")}</p>
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">{currencySymbol}{projectExpenses.total.toLocaleString()}</p>
                        </div>
                    </SpotlightCardContent>
                </SpotlightCard>

                <SpotlightCard className="border-border/50 bg-gradient-to-br from-card to-blue-500/5 relative overflow-hidden group" spotlightColor="rgba(59, 130, 246, 0.2)">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Link2 className="h-16 w-16" />
                    </div>
                    <SpotlightCardContent className="p-6">
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-blue-500/10 ring-1 ring-blue-500/20">
                                    <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">{t("backlinksPage.liveBacklinks")}</p>
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{backlinkStats.live}</p>
                        </div>
                    </SpotlightCardContent>
                </SpotlightCard>
            </motion.div>


            <motion.div variants={fadeSlideUp}>
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 border border-border/50">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">{t("projectDetails.tabs.overview")}</TabsTrigger>
                        <TabsTrigger value="assets" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">{t("projectDetails.tabs.assets")}</TabsTrigger>
                        <TabsTrigger value="backlinks" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">{t("projectDetails.tabs.backlinks")}</TabsTrigger>
                        <TabsTrigger value="expenses" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">{t("projectDetails.expenses.title")}</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Overview */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Tag className="h-5 w-5 text-primary" />
                                        {t("projectDetails.basicInfo.title")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">{t("projectDetails.basicInfo.siteUrl")}</span>
                                        <div className="text-right">
                                            <a href={project.siteUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center justify-end gap-1">
                                                {project.siteUrl ? new URL(project.siteUrl).hostname : t("projectDetails.basicInfo.notSet")}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">{t("projectDetails.basicInfo.status")}</span>
                                        <div className="text-right"><Badge variant="outline">{t(`projects.status${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`)}</Badge></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">{t("projectDetails.basicInfo.monetization")}</span>
                                        <div className="text-right">{project.monetizationType || t("projectDetails.basicInfo.notSet")}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 py-2">
                                        <span className="text-muted-foreground">{t("projectDetails.health.domainExpiry")}</span>
                                        <div className="text-right">
                                            <span className={domainInfo.isDanger ? "text-red-500 font-medium" : domainInfo.isWarning ? "text-yellow-500" : ""}>
                                                {domainInfo.text}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* GitHub & Health */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Github className="h-5 w-5" />
                                            {t("projectDetails.repository.title")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50">
                                            <span className="text-sm font-medium">{project.repoOwner}/{project.repoName}</span>
                                            <a href={`https://github.com/${project.repoOwner}/${project.repoName}`} target="_blank" rel="noopener noreferrer">
                                                <Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                                            </a>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{t("projectDetails.health.lastPush")}:</span>
                                            <span>{formatRelativeTime(project.lastGithubPush, t)}</span>
                                        </div>
                                        <SyncGithubButton projectId={project.id} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Activity className="h-5 w-5 text-green-500" />
                                            {t("projectDetails.notes.title")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/50 min-h-[80px]">
                                            {project.notes || t("projectDetails.notes.none")}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Assets */}
                    <TabsContent value="assets" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-blue-500" />
                                        {t("projectDetails.domainInfo.title")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">{t("projectDetails.domainInfo.registrar")}</span>
                                        <span className="font-medium">{project.domainRegistrar || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">{t("projectDetails.domainInfo.expiry")}</span>
                                        <span className={cn("font-medium", domainInfo.isDanger ? "text-red-500" : "")}>
                                            {project.domainExpiry ? new Date(project.domainExpiry).toLocaleDateString() : "-"}
                                        </span>
                                    </div>
                                    <Button className="w-full mt-2" variant="outline" asChild>
                                        <a href={getPlatformUrl(project.domainRegistrar)} target="_blank" rel="noopener noreferrer">
                                            {t("projectDetails.domainInfo.goTo", { name: project.domainRegistrar || "Registrar" })}
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Server className="h-5 w-5 text-purple-500" />
                                        {t("projectDetails.hosting.title")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">{t("projectDetails.hosting.platform")}</span>
                                        <span className="font-medium">{project.hostingPlatform || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                        <span className="text-muted-foreground">{t("projectDetails.hosting.account")}</span>
                                        <span className="font-medium">{project.hostingAccount || "-"}</span>
                                    </div>
                                    <Button className="w-full mt-2" variant="outline" asChild>
                                        <a href={getPlatformUrl(project.hostingPlatform)} target="_blank" rel="noopener noreferrer">
                                            {t("projectDetails.domainInfo.goTo", { name: project.hostingPlatform || "Hosting" })}
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 3: Backlinks */}
                    <TabsContent value="backlinks" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 text-sm bg-muted/30 px-4 py-2 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-foreground" />
                                    <span className="text-muted-foreground">{t("projectDetails.backlinks.totalLabel")}</span>
                                    <span className="font-bold">{backlinkStats.total}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-muted-foreground">{t("projectDetails.backlinks.liveLabel")}</span>
                                    <span className="font-bold text-green-600">{backlinkStats.live}</span>
                                </div>
                            </div>
                            <BacklinkDialog
                                projectId={project.id}
                                resources={resources}
                                trigger={<ShineBorderButton size="sm">+ {t("projectDetails.backlinks.add")}</ShineBorderButton>}
                            />
                        </div>

                        <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs uppercase tracking-wider">
                                        <TableHead>{t("projectDetails.backlinks.source")}</TableHead>
                                        <TableHead>{t("projectDetails.backlinks.target")}</TableHead>
                                        <TableHead>{t("projectDetails.backlinks.anchor")}</TableHead>
                                        <TableHead className="text-center w-[80px]">{t("projectDetails.backlinks.da")}</TableHead>
                                        <TableHead className="w-[100px] text-right">{t("projectDetails.backlinks.cost")}</TableHead>
                                        <TableHead className="w-[100px]">{t("projectDetails.backlinks.status")}</TableHead>
                                        <TableHead className="w-[80px] text-right">{t("common.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {backlinks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                                                {t("projectDetails.backlinks.noData")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        backlinks.map((backlink) => (
                                            <TableRow key={backlink.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="max-w-[200px]">
                                                    <a href={backlink.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors truncate">
                                                        {new URL(backlink.sourceUrl).hostname}
                                                        <ExternalLink className="h-3 w-3 opacity-50" />
                                                    </a>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                                                    {backlink.targetUrl.replace(project.siteUrl || "", "")}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {backlink.anchorText ? <Badge variant="secondary" className="font-normal bg-muted">{backlink.anchorText}</Badge> : "-"}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-sm">
                                                    {backlink.daScore || "-"}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ${(backlink.cost || 0).toFixed(0)}
                                                </TableCell>
                                                <TableCell>
                                                    <BacklinkStatusCell backlink={backlink} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        <BacklinkDialog
                                                            projectId={project.id}
                                                            resources={resources}
                                                            backlinkToEdit={backlink}
                                                            trigger={
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Tab 4: Expenses */}
                    <TabsContent value="expenses" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-1">
                                <CardHeader>
                                    <CardTitle>{t("projectDetails.expenses.title")}</CardTitle>
                                    <CardDescription>{t("projectDetails.expenses.financialSummary")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">{t("projectDetails.expenses.totalSpent")}</span>
                                        <span className="text-3xl font-bold text-primary">{currencySymbol}{projectExpenses.total.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">{t("projectDetails.expenses.items")}</span>
                                        <span className="text-xl font-medium">{t("projectDetails.expenses.records", { count: projectExpenses.expenses.length })}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>{t("projectDetails.expenses.history")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {projectExpenses.expenses.map((exp) => (
                                            <div key={exp.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/50">
                                                <span className="font-medium">{exp.name}</span>
                                                <span className="font-mono text-muted-foreground">{currencySymbol}{exp.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {projectExpenses.expenses.length === 0 && (
                                            <div className="text-center text-muted-foreground py-8">
                                                {t("projectDetails.expenses.noExpenses")}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </motion.div>
    );
}
