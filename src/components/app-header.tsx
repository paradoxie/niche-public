"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";

interface BreadcrumbData {
    label: string;
    href: string;
}

export function AppHeader() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [dynamicName, setDynamicName] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const segments = pathname.split("/").filter(Boolean);

    const getBreadcrumbName = (segment: string) => {
        switch (segment) {
            case "backlinks": return t("nav.backlinks");
            case "resources": return t("nav.resources");
            case "tools": return t("nav.tools");
            case "expenses": return t("nav.expenses");
            case "analytics": return t("nav.analytics");
            case "projects": return t("nav.projects");
            default: return segment;
        }
    };

    // Fetch dynamic name (project or resource) for detail pages
    useEffect(() => {
        const fetchDynamicName = async () => {
            if (segments[0] === "projects" && segments[1]) {
                try {
                    const res = await fetch(`/api/projects/${segments[1]}`);
                    if (res.ok) {
                        const data = await res.json() as { name?: string };
                        if (data?.name) {
                            setDynamicName(data.name);
                            return;
                        }
                    }
                } catch { }
            }
            if (segments[0] === "resources" && segments[1]) {
                try {
                    const res = await fetch(`/api/resources/${segments[1]}`);
                    if (res.ok) {
                        const data = await res.json() as { name?: string };
                        if (data?.name) {
                            setDynamicName(data.name);
                            return;
                        }
                    }
                } catch { }
            }
            setDynamicName(null);
        };
        fetchDynamicName();
    }, [pathname]);

    const breadcrumbs: BreadcrumbData[] = segments.map((segment, index) => {
        let label = getBreadcrumbName(segment);
        if ((segments[0] === "projects" || segments[0] === "resources") && index === 1 && dynamicName) {
            label = dynamicName;
        }
        return {
            label,
            href: `/${segments.slice(0, index + 1).join("/")}`,
        };
    });

    return (
        <header className={cn(
            "sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between px-4 md:px-6 transition-all duration-300",
            scrolled ? "bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm" : "bg-transparent"
        )}>
            <div className="flex items-center gap-3 md:gap-4">
                {/* Mobile Menu */}
                <MobileNav />

                {/* Modern Breadcrumbs */}
                <nav className="flex items-center text-xs md:text-sm overflow-hidden">
                    <Link
                        href="/"
                        className={cn(
                            "flex items-center hover:scale-110 transition-transform duration-200 shrink-0",
                            breadcrumbs.length === 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Home className="h-4 w-4" />
                        {breadcrumbs.length === 0 && <span className="ml-2 font-medium hidden sm:inline">{t("nav.dashboard")}</span>}
                    </Link>

                    {breadcrumbs.length > 0 && (
                        <ChevronRight className="mx-1 md:mx-2 h-4 w-4 text-muted-foreground/30 shrink-0" />
                    )}

                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        const isMiddle = !isLast && breadcrumbs.length > 2;
                        return (
                            <Fragment key={crumb.href}>
                                {isLast ? (
                                    <span className="font-medium text-foreground bg-primary/5 px-1.5 md:px-2 py-0.5 rounded-md border border-primary/10 truncate max-w-[120px] md:max-w-[200px]">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <>
                                        <Link
                                            href={crumb.href}
                                            className={cn(
                                                "text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4 truncate",
                                                isMiddle && "hidden md:inline max-w-[100px]"
                                            )}
                                        >
                                            {crumb.label}
                                        </Link>
                                        <ChevronRight className={cn("mx-1 md:mx-2 h-4 w-4 text-muted-foreground/30 shrink-0", isMiddle && "hidden md:inline")} />
                                    </>
                                )}
                            </Fragment>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
            </div>
        </header>
    );
}
