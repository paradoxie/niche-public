"use client";

import { useState, useRef } from "react";
import { useTranslation } from "@/i18n/context";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Palette,
    Globe,
    Database,
    Info,
    Moon,
    Sun,
    Monitor,
    Download,
    Upload,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp, viewportConfig } from "@/lib/animations";
import { clearAllData } from "./actions";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { t, locale, setLocale } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { confirm } = useConfirmDialog();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // 清除状态消息
    const clearStatusMessage = () => {
        setTimeout(() => setStatusMessage(null), 3000);
    };

    // 导出数据
    const handleExport = async () => {
        setIsExporting(true);
        setStatusMessage(null);
        try {
            // 改为直接调用 API 而不是 Server Action
            const response = await fetch('/api/export-data');
            if (!response.ok) {
                throw new Error(`Export failed: ${response.status}`);
            }
            const data = await response.json();

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const date = new Date().toISOString().split("T")[0];
            a.href = url;
            a.download = `nichestack-backup-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatusMessage({ type: "success", message: t("settings.data.exportSuccess") });
        } catch (error) {
            console.error("Export error:", error);
            setStatusMessage({ type: "error", message: t("settings.data.exportError") });
        } finally {
            setIsExporting(false);
            clearStatusMessage();
        }
    };

    // 导入数据
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 确认导入
        const confirmed = await confirm({
            title: t("settings.data.importConfirmTitle"),
            description: t("settings.data.importConfirmDesc"),
            confirmText: t("common.confirm"),
            cancelText: t("common.cancel"),
            variant: "default",
        });

        if (!confirmed) {
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsImporting(true);
        setStatusMessage(null);

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // 改为调用 API 而不是 Server Action
            const response = await fetch('/api/import-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json() as { success: boolean; message: string };

            if (result.success) {
                setStatusMessage({ type: "success", message: t("settings.data.importSuccess") });
                // 刷新页面以显示新数据
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setStatusMessage({ type: "error", message: result.message });
            }
        } catch (error) {
            console.error("Import error:", error);
            setStatusMessage({ type: "error", message: t("settings.data.importError") });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            clearStatusMessage();
        }
    };

    // 清空数据
    const handleClear = async () => {
        const confirmed = await confirm({
            title: t("settings.data.clearConfirmTitle"),
            description: t("settings.data.clearConfirmDesc"),
            confirmText: t("settings.data.clear"),
            cancelText: t("common.cancel"),
            variant: "destructive",
        });

        if (!confirmed) return;

        setIsClearing(true);
        setStatusMessage(null);

        try {
            const result = await clearAllData();
            if (result.success) {
                setStatusMessage({ type: "success", message: t("settings.data.clearSuccess") });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setStatusMessage({ type: "error", message: result.message });
            }
        } catch (error) {
            console.error("Clear error:", error);
            setStatusMessage({ type: "error", message: t("settings.data.clearError") });
        } finally {
            setIsClearing(false);
            clearStatusMessage();
        }
    };

    return (
        <motion.div
            className="space-y-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportConfig}
        >
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {t("settings.title")}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                    {t("settings.subtitle")}
                </p>
            </div>

            <Separator className="bg-border/50" />

            {/* Status Message */}
            {statusMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-2 p-4 rounded-lg ${statusMessage.type === "success"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                >
                    {statusMessage.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{statusMessage.message}</span>
                </motion.div>
            )}

            {/* Appearance Section */}
            <motion.div variants={fadeSlideUp}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <CardTitle>{t("settings.appearance.title")}</CardTitle>
                                <CardDescription>{t("settings.appearance.subtitle")}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            <Button
                                variant={theme === "light" ? "default" : "outline"}
                                className="h-auto flex-col gap-2 p-4 border-2 data-[state=active]:border-primary"
                                onClick={() => setTheme("light")}
                                data-state={theme === "light" ? "active" : "inactive"}
                            >
                                <Sun className="h-6 w-6" />
                                <span className="font-medium">{t("settings.appearance.light")}</span>
                            </Button>
                            <Button
                                variant={theme === "dark" ? "default" : "outline"}
                                className="h-auto flex-col gap-2 p-4 border-2 data-[state=active]:border-primary"
                                onClick={() => setTheme("dark")}
                                data-state={theme === "dark" ? "active" : "inactive"}
                            >
                                <Moon className="h-6 w-6" />
                                <span className="font-medium">{t("settings.appearance.dark")}</span>
                            </Button>
                            <Button
                                variant={theme === "system" ? "default" : "outline"}
                                className="h-auto flex-col gap-2 p-4 border-2 data-[state=active]:border-primary"
                                onClick={() => setTheme("system")}
                                data-state={theme === "system" ? "active" : "inactive"}
                            >
                                <Monitor className="h-6 w-6" />
                                <span className="font-medium">{t("settings.appearance.system")}</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Language Section */}
            <motion.div variants={fadeSlideUp}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle>{t("settings.language.title")}</CardTitle>
                                <CardDescription>{t("settings.language.subtitle")}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Button
                                variant={locale === "zh" ? "default" : "outline"}
                                className="w-32"
                                onClick={() => setLocale("zh")}
                            >
                                {t("language.zh")}
                            </Button>
                            <Button
                                variant={locale === "en" ? "default" : "outline"}
                                className="w-32"
                                onClick={() => setLocale("en")}
                            >
                                {t("language.en")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Data Management Section */}
            <motion.div variants={fadeSlideUp}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <CardTitle>{t("settings.data.title")}</CardTitle>
                                <CardDescription>{t("settings.data.subtitle")}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Export */}
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                            <div className="space-y-0.5">
                                <div className="font-medium flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    {t("settings.data.export")}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {t("settings.data.backupDesc")}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t("common.loading")}
                                    </>
                                ) : (
                                    t("settings.data.export")
                                )}
                            </Button>
                        </div>

                        {/* Import */}
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                            <div className="space-y-0.5">
                                <div className="font-medium flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    {t("settings.data.import")}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {t("settings.data.restoreDesc")}
                                </div>
                            </div>
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                    id="import-file"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isImporting}
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {t("common.loading")}
                                        </>
                                    ) : (
                                        t("settings.data.import")
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Clear */}
                        <div className="flex items-center justify-between p-4 border border-red-200/50 rounded-lg bg-red-500/5 dark:bg-red-500/10">
                            <div className="space-y-0.5">
                                <div className="font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    {t("settings.data.dangerZone")}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {t("settings.data.clear")}
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleClear}
                                disabled={isClearing}
                            >
                                {isClearing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t("common.loading")}
                                    </>
                                ) : (
                                    t("settings.data.clear")
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* About Section */}
            <motion.div variants={fadeSlideUp}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle>{t("settings.about.title")}</CardTitle>
                                <CardDescription>{t("settings.about.subtitle")}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">NicheStack Manager</span>
                            <Badge variant="secondary">v1.2.0</Badge>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                            &copy; 2024 NicheStack. All rights reserved.
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Logout Section */}
            <motion.div variants={fadeSlideUp}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <CardTitle>{t("settings.logout.title")}</CardTitle>
                                <CardDescription>{t("settings.logout.subtitle")}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full border-red-200/50 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            onClick={async () => {
                                setIsLoggingOut(true);
                                try {
                                    await fetch("/api/auth/logout", { method: "POST" });
                                    router.push("/login");
                                    router.refresh();
                                } catch (error) {
                                    console.error("Logout error:", error);
                                } finally {
                                    setIsLoggingOut(false);
                                }
                            }}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t("common.loading")}
                                </>
                            ) : (
                                <>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {t("settings.logout.button")}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
