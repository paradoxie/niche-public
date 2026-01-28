"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, RefreshCw, GitBranch, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getGitHubRepos, type GitHubRepo } from "@/lib/actions/github-accounts";
import { useTranslation } from "@/i18n/context";

interface GitHubRepoSelectorProps {
    accountId: number | null;
    value?: string; // format: "owner/repo"
    onChange: (owner: string, repo: string) => void;
}

export function GitHubRepoSelector({ accountId, value, onChange }: GitHubRepoSelectorProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const loadRepos = useCallback(async () => {
        if (!accountId) {
            setRepos([]);
            setLoaded(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getGitHubRepos(accountId);
            setRepos(data);
            setLoaded(true);
        } catch (error) {
            console.error("Failed to load repos:", error);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    // 当账号变化时重置
    useEffect(() => {
        setRepos([]);
        setLoaded(false);
    }, [accountId]);

    // 打开下拉框时加载仓库
    useEffect(() => {
        if (open && !loaded && accountId) {
            loadRepos();
        }
    }, [open, loaded, accountId, loadRepos]);

    const selectedRepo = repos.find(r => r.full_name === value);

    if (!accountId) {
        return (
            <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border border-dashed">
                {t("github.selectAccountFirst")}
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="flex-1 justify-between font-normal"
                    >
                        {value ? (
                            <span className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                                {value}
                                {selectedRepo?.private && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">{t("github.selectRepo")}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={t("github.searchRepos")} />
                        <CommandList>
                            {loading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>{t("github.noReposFound")}</CommandEmpty>
                                    <CommandGroup>
                                        {repos.map((repo) => (
                                            <CommandItem
                                                key={repo.id}
                                                value={repo.full_name}
                                                onSelect={() => {
                                                    onChange(repo.owner.login, repo.name);
                                                    setOpen(false);
                                                }}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <Check
                                                        className={cn(
                                                            "h-4 w-4 shrink-0",
                                                            value === repo.full_name ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium truncate">{repo.name}</span>
                                                            {repo.private ? (
                                                                <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                                                            ) : (
                                                                <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                                                            )}
                                                        </div>
                                                        {repo.description && (
                                                            <p className="text-xs text-muted-foreground truncate">{repo.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={loadRepos}
                disabled={loading}
                title={t("github.refreshRepos")}
            >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
        </div>
    );
}
