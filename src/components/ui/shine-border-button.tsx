"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";

interface ShineBorderButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    className?: string;
    children: React.ReactNode;
}

export function ShineBorderButton({
    className,
    children,
    variant = "default",
    size = "default",
    ...props
}: ShineBorderButtonProps) {
    return (
        <div className={cn("group relative inline-flex rounded-full p-[1px] overflow-hidden shadow-sm hover:shadow-md transition-shadow", className)}>
            {/* Moving Border Gradient */}
            <div
                className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#E2E8F0_50%,#0ea5e9_50%,#E2E8F0_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:bg-[conic-gradient(from_90deg_at_50%_50%,#1e293b_0%,#1e293b_50%,#38bdf8_50%,#1e293b_100%)]"
            />

            {/* Inner Button covering the center */}
            <Button
                variant={variant}
                size={size}
                className={cn(
                    "relative h-full w-full rounded-full border-0 transition-colors",
                    // Ensure background is solid to mask the spinner behind
                    "bg-white hover:bg-white/90 dark:bg-slate-950 dark:hover:bg-slate-900",
                    // Text colors need to override because we are manually setting bg
                    variant === "default" && "text-foreground border border-input/0",
                    // Re-apply standard variants if needed, but the bg needs to be solid for this effect to work as a "border"
                    // So we mostly rely on the wrapper for the "border" look and the button for the content
                    className
                )}
                {...props}
            >
                {children}
            </Button>
        </div>
    );
}
