/**
 * 共享动画变体配置
 * 
 * 优化要点：
 * - 当元素进入视口时触发动画
 * - 淡入、滑入、模糊进入效果
 * - 按元素逐个呈现（交错动画）
 * - 使用 "both" 而非 "forwards"
 * - 不使用 opacity: 0
 */

import { Variants } from "framer-motion";

// 容器动画 - 用于包裹子元素实现交错效果
export const staggerContainer: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        }
    }
};

// 淡入 + 上滑 + 模糊进入效果
export const fadeSlideUp: Variants = {
    hidden: {
        opacity: 0.01,
        y: 24,
        filter: "blur(8px)"
    },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

// 淡入 + 左滑 + 模糊进入效果
export const fadeSlideLeft: Variants = {
    hidden: {
        opacity: 0.01,
        x: 24,
        filter: "blur(8px)"
    },
    show: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

// 淡入 + 缩放 + 模糊进入效果（用于卡片）
export const fadeScale: Variants = {
    hidden: {
        opacity: 0.01,
        scale: 0.95,
        filter: "blur(6px)"
    },
    show: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

// 表格行动画（更轻量）
export const tableRowFade: Variants = {
    hidden: {
        opacity: 0.01,
        x: -12,
        filter: "blur(4px)"
    },
    show: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

// 视口动画配置
export const viewportConfig = {
    once: true,
    margin: "-50px",
    amount: 0.1 as const
};
