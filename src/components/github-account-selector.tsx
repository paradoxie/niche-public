"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import {
    getGitHubAccounts,
    createGitHubAccount,
    updateGitHubAccount,
    deleteGitHubAccount
} from "@/lib/actions/github-accounts";
import type { GitHubAccount } from "@/db/schema";

import { useTranslation } from "@/i18n/context";

interface GitHubAccountSelectorProps {
    value?: number | null;
    onChange: (accountId: number | null) => void;
}

export function GitHubAccountSelector({ value, onChange }: GitHubAccountSelectorProps) {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState<GitHubAccount[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<GitHubAccount | null>(null);
    const [showToken, setShowToken] = useState(false);

    // 表单状态
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const loadAccounts = useCallback(async () => {
        const data = await getGitHubAccounts();
        setAccounts(data);
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const resetForm = () => {
        setEditingAccount(null);
        setUsername("");
        setToken("");
        setExpiresAt("");
        setNotes("");
        setShowToken(false);
    };

    const handleEdit = (account: GitHubAccount) => {
        setEditingAccount(account);
        setUsername(account.username);
        setToken(account.token);
        setExpiresAt(account.tokenExpiresAt
            ? new Date(account.tokenExpiresAt).toISOString().split('T')[0]
            : "");
        setNotes(account.notes || "");
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!username.trim() || !token.trim()) return;

        setIsSaving(true);
        try {
            const data = {
                username: username.trim(),
                token: token.trim(),
                tokenExpiresAt: expiresAt ? new Date(expiresAt) : null,
                notes: notes.trim() || null,
            };

            if (editingAccount) {
                await updateGitHubAccount(editingAccount.id, data);
            } else {
                await createGitHubAccount(data);
            }

            await loadAccounts();
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save GitHub account:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t("github.deleteConfirm"))) return;

        try {
            await deleteGitHubAccount(id);
            await loadAccounts();
            if (value === id) {
                onChange(null);
            }
        } catch (error) {
            console.error("Failed to delete GitHub account:", error);
        }
    };

    const selectedAccount = accounts.find(a => a.id === value);

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Select
                    value={value?.toString() || "none"}
                    onValueChange={(v) => onChange(v === "none" ? null : parseInt(v))}
                >
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t("github.selectAccount")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">{t("github.none")}</SelectItem>
                        {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                                <span className="flex items-center gap-2">
                                    {account.username}
                                    {account.tokenExpiresAt && new Date(account.tokenExpiresAt) < new Date() && (
                                        <span className="text-xs text-destructive">({t("github.expired")})</span>
                                    )}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" title={t("github.manageAccounts")}>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingAccount ? t("github.editAccount") : t("github.addAccount")}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("github.username")}</Label>
                                <Input
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("github.token")}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type={showToken ? "text" : "password"}
                                        placeholder="ghp_xxxx..."
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowToken(!showToken)}
                                    >
                                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("github.tokenExpiry")}</Label>
                                <Input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("github.notes")}</Label>
                                <Input
                                    placeholder="e.g. Main Account, Work Account..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setDialogOpen(false); resetForm(); }}
                                >
                                    {t("common.cancel")}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving || !username.trim() || !token.trim()}
                                >
                                    {isSaving ? t("common.saving") : t("common.save")}
                                </Button>
                            </div>
                        </div>

                        {/* 已有账号列表 */}
                        {accounts.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <Label className="text-muted-foreground">{t("github.existingAccounts")}</Label>
                                <div className="mt-2 space-y-2">
                                    {accounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className="flex items-center justify-between p-2 rounded bg-muted/50"
                                        >
                                            <div>
                                                <span className="font-medium">{account.username}</span>
                                                {account.tokenExpiresAt && (
                                                    <span className={`ml-2 text-xs ${new Date(account.tokenExpiresAt) < new Date()
                                                        ? 'text-destructive'
                                                        : 'text-muted-foreground'
                                                        }`}>
                                                        {new Date(account.tokenExpiresAt) < new Date()
                                                            ? t("github.expired")
                                                            : t("github.expiresOn", { date: new Date(account.tokenExpiresAt).toLocaleDateString() })
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(account)}
                                                >
                                                    {t("github.edit")}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(account.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* 显示过期警告 */}
            {selectedAccount?.tokenExpiresAt && new Date(selectedAccount.tokenExpiresAt) < new Date() && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t("github.tokenExpiredMessage")}
                </p>
            )}
        </div>
    );
}
