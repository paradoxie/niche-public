"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/context";
import {
    LayoutDashboard,
    Link as LinkIcon,
    Database,
    Wrench,
    Wallet,
    Settings,
    BarChart3,
    FolderKanban,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function AppSidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    const navItems = [
        {
            title: t("nav.dashboard"),
            items: [
                {
                    title: t("nav.dashboard"),
                    href: "/",
                    icon: LayoutDashboard,
                },
                {
                    title: t("nav.projects"),
                    href: "/projects",
                    icon: FolderKanban,
                },
                {
                    title: t("nav.analytics"),
                    href: "/analytics",
                    icon: BarChart3,
                },
            ],
        },
        {
            title: t("nav.backlinks"),
            items: [
                {
                    title: t("nav.backlinks"),
                    href: "/backlinks",
                    icon: LinkIcon,
                },
                {
                    title: t("nav.resources"),
                    href: "/resources",
                    icon: Database,
                },
                {
                    title: t("nav.tools"),
                    href: "/tools",
                    icon: Wrench,
                },
            ],
        },
        {
            title: t("nav.expenses"),
            items: [
                {
                    title: t("nav.expenses"),
                    href: "/expenses",
                    icon: Wallet,
                },
            ],
        },
    ];

    return (
        <aside className="hidden md:flex w-72 flex-col border-r border-border/40 bg-sidebar/50 backdrop-blur-xl h-screen sticky top-0 z-40 transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        NS
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">{t("nav.appName")}</h2>
                        <p className="text-xs text-muted-foreground">{t("nav.adminWorkspace")}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                <nav className="space-y-8">
                    {navItems.map((group, i) => (
                        <div key={i}>
                            <h3 className="mb-3 px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                                    const isHovered = hoveredPath === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onMouseEnter={() => setHoveredPath(item.href)}
                                            onMouseLeave={() => setHoveredPath(null)}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                                                isActive
                                                    ? "text-primary"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {/* Hover Background */}
                                            {isHovered && !isActive && (
                                                <motion.div
                                                    layoutId="sidebar-hover"
                                                    className="absolute inset-0 bg-muted/40 rounded-xl z-0"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            )}

                                            {/* Active Background */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active"
                                                    className="absolute inset-0 bg-primary/10 rounded-xl z-0 shadow-sm"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                >
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full" />
                                                </motion.div>
                                            )}

                                            <motion.div
                                                animate={{
                                                    x: isActive || isHovered ? 4 : 0,
                                                    scale: isActive ? 1.05 : 1
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className="relative z-10 flex items-center justify-center"
                                            >
                                                <item.icon className={cn(
                                                    "h-5 w-5 transition-colors",
                                                    isActive ? "text-primary fill-primary/20" : "text-muted-foreground group-hover:text-foreground"
                                                )} />
                                            </motion.div>

                                            <motion.span
                                                animate={{ x: isActive || isHovered ? 4 : 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className="relative z-10"
                                            >
                                                {item.title}
                                            </motion.span>

                                            {isActive && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="ml-auto relative z-10"
                                                >
                                                    <ChevronRight className="h-4 w-4 text-primary opacity-50" />
                                                </motion.div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-border/40 bg-sidebar/30 backdrop-blur-md">
                <Link href="/settings" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium shadow-md">
                        P
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">Paradox</span>
                        <span className="text-xs text-muted-foreground truncate">Admin</span>
                    </div>
                    <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
            </div>
        </aside>
    );
}
