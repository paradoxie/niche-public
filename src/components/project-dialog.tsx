"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { projectSchema, type ProjectFormValues } from "@/lib/schemas";
import { createProject, updateProject } from "@/lib/actions/projects";
import { createExpense, getProjectDomainExpense } from "@/app/expenses/actions";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Project, type Preset } from "@/db/schema";
import { PresetCombobox } from "@/components/ui/preset-combobox";
import { GitHubAccountSelector } from "@/components/github-account-selector";
import { getAllFormPresets, getAllProjectFieldValues } from "@/lib/actions/presets";
import { Github } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface ProjectDialogProps {
    project?: Project;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ProjectDialog({ project, trigger, open, onOpenChange }: ProjectDialogProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // 预设数据状态
    const [hostingPlatformPresets, setHostingPlatformPresets] = useState<Preset[]>([]);
    const [hostingAccountPresets, setHostingAccountPresets] = useState<Preset[]>([]);
    const [domainRegistrarPresets, setDomainRegistrarPresets] = useState<Preset[]>([]);

    // 加载预设，并合并现有项目中的字段值（优化：2次查询替代3次）
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
                    merged.push({
                        id: -Date.now() - Math.random(),
                        type: "hosting_platform" as any,
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

    // 如果是受控组件模式
    const isControlled = open !== undefined;
    const show = isControlled ? open : isOpen;
    const setShow = isControlled ? onOpenChange! : setIsOpen;

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema) as any,
        defaultValues: {
            name: "",
            siteUrl: "https://",
            nicheCategory: "",
            status: "active",
            monetizationType: "",
            adsenseStatus: "none",
            githubAccountId: null,
            repoOwner: "",
            repoName: "",
            hostingPlatform: "",
            hostingAccount: "",
            domainRegistrar: "",
            domainExpiry: "",
            domainPurchaseDate: "",
            launchedAt: "",
            domainCost: undefined,
            notes: "",
        },
    });

    useEffect(() => {
        if (show && project) {
            form.reset({
                name: project.name || "",
                siteUrl: project.siteUrl || "",
                nicheCategory: project.nicheCategory || "",
                status: (project.status as any) || "active",
                monetizationType: project.monetizationType || "",
                adsenseStatus: (project.adsenseStatus as any) || "none",
                githubAccountId: project.githubAccountId || null,
                repoOwner: project.repoOwner || "",
                repoName: project.repoName || "",
                hostingPlatform: project.hostingPlatform || "",
                hostingAccount: project.hostingAccount || "",
                domainRegistrar: project.domainRegistrar || "",
                domainExpiry: project.domainExpiry ? new Date(project.domainExpiry).toISOString().split('T')[0] : "",
                domainPurchaseDate: project.domainPurchaseDate ? new Date(project.domainPurchaseDate).toISOString().split('T')[0] : "",
                launchedAt: project.launchedAt ? new Date(project.launchedAt).toISOString().split('T')[0] : "",
                domainCost: undefined,
                notes: project.notes || "",
            });
        } else if (show && !project) {
            form.reset({
                name: "",
                siteUrl: "https://",
                nicheCategory: "",
                status: "active",
                monetizationType: "",
                adsenseStatus: "none",
                githubAccountId: null,
                repoOwner: "",
                repoName: "",
                hostingPlatform: "",
                hostingAccount: "",
                domainRegistrar: "",
                domainExpiry: "",
                domainPurchaseDate: "",
                launchedAt: "",
                domainCost: undefined,
                notes: "",
            });
        }
    }, [project, show, form]);

    // 加载项目的域名支出（用于编辑模式回填）
    useEffect(() => {
        async function loadDomainExpense() {
            if (show && project) {
                const domainExpense = await getProjectDomainExpense(project.id);
                if (domainExpense) {
                    form.setValue("domainCost", domainExpense.amount);
                }
            }
        }
        loadDomainExpense();
    }, [show, project, form]);

    async function onSubmit(data: ProjectFormValues) {
        try {
            const formattedData = {
                ...data,
                domainExpiry: data.domainExpiry ? new Date(data.domainExpiry) : undefined,
                domainPurchaseDate: data.domainPurchaseDate ? new Date(data.domainPurchaseDate) : undefined,
                launchedAt: data.launchedAt ? new Date(data.launchedAt) : undefined,
            };

            let savedProject: { id: number } | undefined;

            if (project) {
                await updateProject(project.id, formattedData);
                savedProject = project;
            } else {
                savedProject = await createProject(formattedData);
            }

            // Create domain expense if cost provided for new project
            if (!project && data.domainCost && data.domainCost > 0 && data.domainExpiry && savedProject) {
                await createExpense({
                    name: `${data.name} Domain`,
                    amount: data.domainCost,
                    category: "domain",
                    projectId: savedProject.id,
                    paidAt: new Date(),
                    expiresAt: new Date(data.domainExpiry),
                    notes: data.domainRegistrar ? `Registrar: ${data.domainRegistrar}` : null,
                });
            }

            setShow(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error("Submission failed", error);
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{project ? t("dialog.editProject") : t("dialog.addProject")}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("projects.status")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                        <div className="grid grid-cols-2 gap-4">
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                        {/* GitHub Config */}
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <Github className="h-4 w-4" />
                                {t("dialog.githubConfig")}
                            </h4>

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

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="repoOwner"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("dialog.repoOwner")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="repoName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("dialog.repoName")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="repo-name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
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
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("dialog.notes")}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t("dialog.notesPlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShow(false)}>{t("common.cancel")}</Button>
                            <Button type="submit">{t("common.save")}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    );
}
