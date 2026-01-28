"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.ComponentProps<"div"> {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

/**
 * SpotlightCard - 带有手电筒光斑效果的卡片组件
 * 当鼠标悬停或移动时，卡片的背景和边框会显示跟随鼠标的光斑效果
 * 支持白天/夜间模式的不同呈现
 */
export function SpotlightCard({
    children,
    className,
    spotlightColor,
    ...props
}: SpotlightCardProps) {
    const divRef = React.useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = React.useState(0);
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
        setIsHovered(false);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
                isHovered && "shadow-lg",
                className
            )}
            {...props}
        >
            {/* 光斑背景效果 - 白天模式 */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 dark:hidden"
                style={{
                    opacity: opacity * 0.15,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor || "rgba(59, 130, 246, 0.4)"}, transparent 40%)`,
                }}
            />

            {/* 光斑背景效果 - 夜间模式 */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hidden dark:block"
                style={{
                    opacity: opacity * 0.2,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor || "rgba(56, 189, 248, 0.3)"}, transparent 40%)`,
                }}
            />

            {/* 边框光斑效果 - 白天模式 */}
            <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 dark:hidden"
                style={{
                    opacity: opacity * 0.6,
                    background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, ${spotlightColor || "rgba(59, 130, 246, 0.15)"}, transparent 40%)`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "xor",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />

            {/* 边框光斑效果 - 夜间模式 */}
            <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 hidden dark:block"
                style={{
                    opacity: opacity * 0.8,
                    background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, ${spotlightColor || "rgba(56, 189, 248, 0.25)"}, transparent 40%)`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "xor",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />

            {/* 内容 */}
            <div className="relative z-10 h-full flex flex-col">{children}</div>
        </div>
    );
}

/**
 * SpotlightCardContent - 光斑卡片的内容区域
 */
export function SpotlightCardContent({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("p-6", className)}
            {...props}
        />
    );
}

/**
 * SpotlightCardHeader - 光斑卡片的头部
 */
export function SpotlightCardHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("px-6 pt-6", className)}
            {...props}
        />
    );
}

/**
 * SpotlightCardTitle - 光斑卡片的标题
 */
export function SpotlightCardTitle({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    );
}

/**
 * SpotlightCardDescription - 光斑卡片的描述
 */
export function SpotlightCardDescription({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}
