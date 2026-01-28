"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // 登录页面不显示 Sidebar 和 Header
    if (pathname === "/login") {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-1 bg-muted/10 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
