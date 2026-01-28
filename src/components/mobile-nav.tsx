"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    Link as LinkIcon,
    Database,
    Wrench,
    Wallet,
    Settings,
    BarChart3,
    FolderKanban,
    Menu,
    X,
} from "lucide-react";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { t } = useTranslation();

    // Close on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    const navItems = [
        {
            title: t("nav.dashboard"),
            items: [
                { title: t("nav.dashboard"), href: "/", icon: LayoutDashboard },
                { title: t("nav.projects"), href: "/projects", icon: FolderKanban },
                { title: t("nav.analytics"), href: "/analytics", icon: BarChart3 },
            ],
        },
        {
            title: t("nav.backlinks"),
            items: [
                { title: t("nav.backlinks"), href: "/backlinks", icon: LinkIcon },
                { title: t("nav.resources"), href: "/resources", icon: Database },
                { title: t("nav.tools"), href: "/tools", icon: Wrench },
            ],
        },
        {
            title: t("nav.expenses"),
            items: [
                { title: t("nav.expenses"), href: "/expenses", icon: Wallet },
            ],
        },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-6 border-b border-border/40">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                            NS
                        </div>
                        <div className="text-left">
                            <h2 className="text-lg font-bold tracking-tight">{t("nav.appName")}</h2>
                            <p className="text-xs text-muted-foreground font-normal">{t("nav.adminWorkspace")}</p>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    <nav className="space-y-6">
                        {navItems.map((group, i) => (
                            <div key={i}>
                                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                                                    isActive
                                                        ? "text-primary bg-primary/10 border-l-2 border-primary"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                )}
                                            >
                                                <item.icon className={cn(
                                                    "h-5 w-5",
                                                    isActive ? "text-primary" : "text-muted-foreground"
                                                )} />
                                                <span>{item.title}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-border/40">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                            P
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="font-medium text-sm">Paradox</span>
                            <span className="text-xs text-muted-foreground">Admin</span>
                        </div>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}
