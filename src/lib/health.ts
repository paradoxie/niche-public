import { type Project } from "@/db/schema";
import { type HealthStatus } from "@/types";

/**
 * 健康度着色算法
 * 🔴 Danger: 域名 < 15天 OR AdSense=Banned OR 更新 > 90天
 * 🟡 Warning: 域名 < 30天 OR 更新 > 30天 OR AdSense=Limited
 * 🟢 Good: 其他
 */
export function calculateHealthStatus(project: Project): HealthStatus {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // 获取最近更新时间 (lastGithubPush, lastContentUpdate 或 lastManualUpdate 较新的那个)
    const lastGithubPush = project.lastGithubPush?.getTime() || 0;
    const lastContentUpdate = project.lastContentUpdate?.getTime() || 0;
    const lastManualUpdate = project.lastManualUpdate?.getTime() || 0;
    const lastUpdate = Math.max(lastGithubPush, lastContentUpdate, lastManualUpdate);
    const daysSinceUpdate = lastUpdate ? Math.floor((now - lastUpdate) / DAY_MS) : 999;

    // 域名过期天数
    const domainExpiry = project.domainExpiry?.getTime() || Infinity;
    const daysUntilExpiry = Math.floor((domainExpiry - now) / DAY_MS);

    // Danger 条件
    if (daysUntilExpiry < 15) return "danger";
    if (project.adsenseStatus === "banned") return "danger";
    if (daysSinceUpdate > 60) return "danger";

    // Warning 条件
    if (daysUntilExpiry < 30) return "warning";
    if (daysSinceUpdate > 14) return "warning";
    if (project.adsenseStatus === "limited") return "warning";

    // Good
    return "good";
}

/**
 * 获取健康状态的原因列表（用于 Tooltip 显示）
 */
export function getHealthReasons(project: Project, t: (key: string, params?: any) => string): string[] {
    const reasons: string[] = [];
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // 获取最近更新时间 (lastGithubPush, lastContentUpdate 或 lastManualUpdate 较新的那个)
    const lastGithubPush = project.lastGithubPush?.getTime() || 0;
    const lastContentUpdate = project.lastContentUpdate?.getTime() || 0;
    const lastManualUpdate = project.lastManualUpdate?.getTime() || 0;
    const lastUpdate = Math.max(lastGithubPush, lastContentUpdate, lastManualUpdate);
    const daysSinceUpdate = lastUpdate ? Math.floor((now - lastUpdate) / DAY_MS) : null;

    // 域名过期天数
    const domainExpiry = project.domainExpiry?.getTime();
    const daysUntilExpiry = domainExpiry ? Math.floor((domainExpiry - now) / DAY_MS) : null;

    // 域名相关原因
    if (daysUntilExpiry !== null) {
        if (daysUntilExpiry < 0) {
            reasons.push(t("health.domainExpired"));
        } else if (daysUntilExpiry < 15) {
            reasons.push(t("health.domainExpiring", { days: daysUntilExpiry }));
        } else if (daysUntilExpiry < 30) {
            reasons.push(t("health.domainExpiringSoon", { days: daysUntilExpiry }));
        }
    }

    // 更新相关原因
    if (daysSinceUpdate !== null) {
        if (daysSinceUpdate > 60) {
            reasons.push(t("health.noUpdateLong", { days: daysSinceUpdate }));
        } else if (daysSinceUpdate > 14) {
            reasons.push(t("health.noUpdateMedium", { days: daysSinceUpdate }));
        }
    }

    // AdSense 相关原因
    if (project.adsenseStatus === "banned") {
        reasons.push(t("health.adsenseBanned"));
    } else if (project.adsenseStatus === "limited") {
        reasons.push(t("health.adsenseLimited"));
    }

    return reasons;
}

/**
 * 格式化相对时间（按日历日比较，而非24小时）
 */
export function formatRelativeTime(date: Date | null | undefined, t: (key: string, params?: any) => string): string {
    if (!date) return t("time.never");

    const now = new Date();
    const target = new Date(date);

    // 使用本地日期进行比较（只比较年月日）
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    const DAY_MS = 24 * 60 * 60 * 1000;
    const daysDiff = Math.floor((todayStart.getTime() - targetDay.getTime()) / DAY_MS);

    if (daysDiff === 0) return t("time.today");
    if (daysDiff === 1) return t("time.yesterday");
    if (daysDiff < 7) return t("time.daysAgo", { count: daysDiff });
    if (daysDiff < 30) return t("time.weeksAgo", { count: Math.floor(daysDiff / 7) });
    if (daysDiff < 365) return t("time.monthsAgo", { count: Math.floor(daysDiff / 30) });
    return t("time.yearsAgo", { count: Math.floor(daysDiff / 365) });
}

/**
 * 格式化域名过期倒计时
 */
export function formatDomainExpiry(date: Date | null | undefined, t: (key: string, params?: any) => string): { text: string; isWarning: boolean; isDanger: boolean } {
    if (!date) return { text: t("time.notSet"), isWarning: false, isDanger: false };

    const now = Date.now();
    const diff = date.getTime() - now;
    const DAY_MS = 24 * 60 * 60 * 1000;
    const days = Math.floor(diff / DAY_MS);

    if (days < 0) return { text: t("time.expired"), isWarning: true, isDanger: true };
    if (days < 15) return { text: `⚠️ ${t("time.daysLeft", { count: days })}`, isWarning: true, isDanger: true };
    if (days < 30) return { text: `⚠️ ${t("time.daysLeft", { count: days })}`, isWarning: true, isDanger: false };
    if (days < 90) return { text: t("time.daysLeft", { count: days }), isWarning: false, isDanger: false };
    if (days < 365) return { text: t("time.monthsLeft", { count: Math.floor(days / 30) }), isWarning: false, isDanger: false };

    // 大于1年，显示具体年/月/日
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = (days % 365) % 30;

    const parts = [];
    if (years > 0) parts.push(`${years}${t("time.yearUnit")}`);
    if (months > 0) parts.push(`${months}${t("time.monthUnit")}`);
    if (remainingDays > 0) parts.push(`${remainingDays}${t("time.dayUnit")}`);

    return { text: parts.join(""), isWarning: false, isDanger: false };
}

/**
 * 格式化上线时长
 */
export function formatLaunchDuration(launchedAt: Date | null | undefined, t: (key: string, params?: any) => string): string {
    if (!launchedAt) return "";

    const now = new Date();
    const diff = now.getTime() - launchedAt.getTime();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const totalDays = Math.floor(diff / DAY_MS);

    if (totalDays < 0) return t("time.notLaunched");

    const launchDate = new Date(launchedAt);
    let years = now.getFullYear() - launchDate.getFullYear();
    let months = now.getMonth() - launchDate.getMonth();
    let days = now.getDate() - launchDate.getDate();

    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    if (years > 0) {
        return t("time.durationYearsMonthsDays", { years, months, days });
    } else if (months > 0) {
        return t("time.durationMonthsDays", { months, days });
    } else {
        return t("time.durationDays", { count: totalDays });
    }
}
