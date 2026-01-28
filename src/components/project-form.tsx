"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Globe, Github, Server, DollarSign, FileText, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { PresetCombobox } from "@/components/ui/preset-combobox";
import { GitHubAccountSelector } from "@/components/github-account-selector";
import { GitHubRepoSelector } from "@/components/github-repo-selector";
import { createProjectSchema, type ProjectFormValues } from "@/lib/schemas";
import { createProject, updateProject, deleteProject } from "@/lib/actions/projects";
import { createExpense, getProjectDomainExpense } from "@/app/expenses/actions";
import { getAllFormPresets, getAllProjectFieldValues } from "@/lib/actions/presets";
import { Project, type Preset } from "@/db/schema";
import { useTranslation } from "@/i18n/context";
import { staggerContainer, fadeSlideUp, viewportConfig } from "@/lib/animations";

interface ProjectFormProps {
    project?: Project;
    mode: "create" | "edit";
}

export function ProjectForm({ project, mode }: ProjectFormProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // 预设数据状态
    const [hostingPlatformPresets, setHostingPlatformPresets] = useState<Preset[]>([]);
    const [hostingAccountPresets, setHostingAccountPresets] = useState<Preset[]>([]);
    const [domainRegistrarPresets, setDomainRegistrarPresets] = useState<Preset[]>([]);

    // 加载预设，并合并现有项目中的字段值（优化：2次查询替代6次）
    const loadPresets = useCallback(async () => {
        const [formPresets, projectFieldValues] = await Promise.all([
            getAllFormPresets(),
            getAllProjectFieldValues(),
        ]);

        // 辅助函数：合并预设和项目值（去重）
        const mergeWithProjectValues = (presets: Preset[], projectValues: string[]): Preset[] => {
            const existingValues = new Set(presets.map(p => p.value));
            const merged = [...presets];

            for (const value of projectValues) {
                if (!existingValues.has(value)) {
                    // 创建一个虚拟预设对象用于显示（id 使用负数避免冲突）
                    merged.push({
                        id: -Date.now() - Math.random(),
                        type: "hosting_platform" as any, // 类型不重要，只用于显示
                        value,
                        label: value,
                        createdAt: new Date(),
                    });
                    existingValues.add(value);
                }
            }

            return merged;
        };

        setHostingPlatformPresets(mergeWithProjectValues(formPresets.hostingPlatform, projectFieldValues.hostingPlatform));
        setHostingAccountPresets(mergeWithProjectValues(formPresets.hostingAccount, projectFieldValues.hostingAccount));
        setDomainRegistrarPresets(mergeWithProjectValues(formPresets.domainRegistrar, projectFieldValues.domainRegistrar));
    }, []);

    useEffect(() => {
        loadPresets();
    }, [loadPresets]);

    const schema = useMemo(() => createProjectSchema(t), [t]);

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: project?.name || "",
            siteUrl: project?.siteUrl || "https://",
            nicheCategory: project?.nicheCategory || "",
            status: (project?.status as any) || "active",
            monetizationType: project?.monetizationType || "",
            adsenseStatus: (project?.adsenseStatus as any) || "none",
            githubAccountId: project?.githubAccountId || null,
            repoOwner: project?.repoOwner || "",
            repoName: project?.repoName || "",
            hostingPlatform: project?.hostingPlatform || "",
            hostingAccount: project?.hostingAccount || "",
            domainRegistrar: project?.domainRegistrar || "",
            domainExpiry: project?.domainExpiry ? new Date(project.domainExpiry).toISOString().split('T')[0] : "",
            domainPurchaseDate: project?.domainPurchaseDate ? new Date(project.domainPurchaseDate).toISOString().split('T')[0] : "",
            launchedAt: project?.launchedAt ? new Date(project.launchedAt).toISOString().split('T')[0] : "",
            domainCost: undefined,
            notes: project?.notes || "",
        },
    });

    // 加载项目的域名支出（用于编辑模式回填）
    useEffect(() => {
        async function loadDomainExpense() {
            if (mode === "edit" && project) {
                const domainExpense = await getProjectDomainExpense(project.id);
                if (domainExpense) {
                    form.setValue("domainCost", domainExpense.amount);
                }
            }
        }
        loadDomainExpense();
    }, [mode, project, form]);

    async function onSubmit(data: ProjectFormValues) {
        setIsSubmitting(true);
        try {
            const formattedData = {
                ...data,
                domainExpiry: data.domainExpiry ? new Date(data.domainExpiry) : undefined,
                domainPurchaseDate: data.domainPurchaseDate ? new Date(data.domainPurchaseDate) : undefined,
                launchedAt: data.launchedAt ? new Date(data.launchedAt) : undefined,
            };

            let savedProject: { id: number } | undefined;

            if (mode === "edit" && project) {
                await updateProject(project.id, formattedData);
                savedProject = project;
            } else {
                savedProject = await createProject(formattedData);
            }

            // Create domain expense if cost provided
            if (data.domainCost && data.domainCost > 0 && savedProject) {
                await createExpense({
                    name: `${data.name} Domain`,
                    amount: data.domainCost,
                    category: "domain",
                    projectId: savedProject.id,
                    paidAt: data.domainPurchaseDate ? new Date(data.domainPurchaseDate) : new Date(),
                    expiresAt: data.domainExpiry ? new Date(data.domainExpiry) : null,
                    notes: data.domainRegistrar ? `Registrar: ${data.domainRegistrar}` : null,
                });
            }

            router.push("/projects");
            router.refresh();
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const isEdit = mode === "edit";

    return (
        <motion.div
            className="space-y-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/projects">
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {isEdit ? t("projects.editProject") : t("projects.newProject")}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        {isEdit ? t("projects.editProjectSubtitle") : t("projects.newProjectSubtitle")}
                    </p>
                </div>
            </div>

            <Separator className="bg-border/50" />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <motion.div variants={fadeSlideUp}>
                        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle>{t("projects.basicInfo")}</CardTitle>
                                        <CardDescription>{t("projects.newProjectSubtitle")}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("projects.projectName")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Best Coffee Maker" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="nicheCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("projects.nicheCategory")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Kitchen, Tech..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="siteUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("projects.siteUrl")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("projects.status")}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t("dialog.selectStatus")} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">{t("dialog.statusActive")}</SelectItem>
                                                        <SelectItem value="incubating">{t("dialog.statusIncubating")}</SelectItem>
                                                        <SelectItem value="sold">{t("dialog.statusSold")}</SelectItem>
                                                        <SelectItem value="dead">{t("dialog.statusDead")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="launchedAt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.launchDate")}</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Monetization */}
                    <motion.div variants={fadeSlideUp}>
                        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <CardTitle>{t("projects.monetization")}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="monetizationType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.monetizationType")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Affiliate, AdSense, Sponsor..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="adsenseStatus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.adsenseStatus")}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t("dialog.selectStatus")} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">{t("dialog.adsenseNone")}</SelectItem>
                                                        <SelectItem value="reviewing">{t("dialog.adsenseReviewing")}</SelectItem>
                                                        <SelectItem value="rejected">{t("dialog.adsenseRejected")}</SelectItem>
                                                        <SelectItem value="active">{t("dialog.adsenseActive")}</SelectItem>
                                                        <SelectItem value="limited">{t("dialog.adsenseLimited")}</SelectItem>
                                                        <SelectItem value="banned">{t("dialog.adsenseBanned")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* GitHub Config */}
                    <motion.div variants={fadeSlideUp}>
                        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Github className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle>{t("dialog.githubConfig")}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="githubAccountId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("dialog.githubAccount")}</FormLabel>
                                            <FormControl>
                                                <GitHubAccountSelector
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel>{t("dialog.repository")}</FormLabel>
                                    <FormControl>
                                        <GitHubRepoSelector
                                            accountId={form.watch("githubAccountId") ?? null}
                                            value={form.watch("repoOwner") && form.watch("repoName") ? `${form.watch("repoOwner")}/${form.watch("repoName")}` : undefined}
                                            onChange={(owner, repo) => {
                                                form.setValue("repoOwner", owner);
                                                form.setValue("repoName", repo);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Domain Info */}
                    <motion.div variants={fadeSlideUp}>
                        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <CardTitle>{t("projects.domainInfo")}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="domainRegistrar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.domainRegistrar")}</FormLabel>
                                                <FormControl>
                                                    <PresetCombobox
                                                        presetType="domain_registrar"
                                                        presets={domainRegistrarPresets}
                                                        value={field.value || ""}
                                                        onChange={field.onChange}
                                                        placeholder={t("dialog.selectOrInput")}
                                                        onPresetsChange={loadPresets}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="domainPurchaseDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.domainPurchaseDate")}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            // 自动填充过期日期为一年后
                                                            const val = e.target.value;
                                                            if (val && !form.getValues("domainExpiry")) {
                                                                const date = new Date(val);
                                                                if (!isNaN(date.getTime())) {
                                                                    date.setFullYear(date.getFullYear() + 1);
                                                                    const expiryDate = date.toISOString().split('T')[0];
                                                                    form.setValue("domainExpiry", expiryDate);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="domainExpiry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.domainExpiry")}</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="domainCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("dialog.domainCost")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Hosting Info */}
                    <motion.div variants={fadeSlideUp}>
                        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                                        <Server className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <CardTitle>{t("projects.hostingInfo")}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hostingPlatform"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.hostingPlatform")}</FormLabel>
                                                <FormControl>
                                                    <PresetCombobox
                                                        presetType="hosting_platform"
                                                        presets={hostingPlatformPresets}
                                                        value={field.value || ""}
                                                        onChange={field.onChange}
                                                        placeholder={t("dialog.selectOrInput")}
                                                        onPresetsChange={loadPresets}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hostingAccount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("dialog.hostingAccount")}</FormLabel>
                                                <FormControl>
                                                    <PresetCombobox
                                                        presetType="hosting_account"
                                                        presets={hostingAccountPresets}
                                                        value={field.value || ""}
                                                        onChange={field.onChange}
                                                        placeholder={t("dialog.selectOrInput")}
                                                        onPresetsChange={loadPresets}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notes */}
                    <motion.div variants={fadeSlideUp}>
                        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-500/10 rounded-lg">
                                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <CardTitle>{t("dialog.notes")}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t("dialog.notesPlaceholder")}
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={fadeSlideUp} className="flex justify-between gap-4">
                        {/* Delete Button (only in edit mode) */}
                        {mode === "edit" && project && (
                            <div className="flex items-center">
                                {!showDeleteConfirm ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t("common.delete")}
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                                        <span className="text-sm text-destructive">{t("common.confirmDelete")}</span>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            disabled={isDeleting}
                                            onClick={async () => {
                                                setIsDeleting(true);
                                                try {
                                                    await deleteProject(project.id);
                                                    router.push("/projects");
                                                    router.refresh();
                                                } catch (error) {
                                                    console.error("Delete failed", error);
                                                    setIsDeleting(false);
                                                }
                                            }}
                                        >
                                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.yes")}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            {t("common.no")}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 ml-auto">
                            <Link href="/projects">
                                <Button type="button" variant="outline">
                                    {t("common.cancel")}
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {t("common.save")}
                            </Button>
                        </div>
                    </motion.div>
                </form>
            </Form>
        </motion.div>
    );
}
