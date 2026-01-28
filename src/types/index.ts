import { Project, Backlink } from "@/db/schema";

// 健康度状态
export type HealthStatus = "danger" | "warning" | "good";

// 项目 + 计算字段
export interface ProjectWithHealth extends Project {
    healthStatus: HealthStatus;
    backlinkCount: number;
    liveBacklinkCount: number;
}

// 表单数据类型
export interface ProjectFormData {
    name: string;
    siteUrl?: string;
    nicheCategory?: string;
    status: typeof import("@/db/schema").projectStatusEnum[number];
    repoOwner?: string;
    repoName?: string;
    lastContentUpdate?: Date;
    domainExpiry?: Date;
    domainRegistrar?: string;
    hostingPlatform?: string;
    hostingAccount?: string;
    monetizationType?: string;
    adsenseStatus: typeof import("@/db/schema").adsenseStatusEnum[number];
    notes?: string;
}

export interface BacklinkFormData {
    projectId: number;
    targetUrl: string;
    sourceUrl: string;
    anchorText?: string;
    daScore?: number;
    cost?: number;
    status: typeof import("@/db/schema").backlinkStatusEnum[number];
    acquiredDate?: Date;
}

// 仪表盘统计
export interface DashboardStats {
    totalProjects: number;
    activeAdsense: number;
    monthlyBacklinkCost: number;
}
