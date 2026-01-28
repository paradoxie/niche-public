import { z } from "zod";
import { projectStatusEnum, adsenseStatusEnum, backlinkStatusEnum } from "@/db/schema";

export const createProjectSchema = (t: (key: string) => string) => z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    // 允许为空字符串，如果不为空则必须是 URL
    siteUrl: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
        message: t("validation.urlInvalid"),
    }),
    nicheCategory: z.string().optional(),
    status: z.enum(projectStatusEnum),
    monetizationType: z.string().optional(),
    adsenseStatus: z.enum(adsenseStatusEnum),
    githubAccountId: z.number().nullable().optional(),
    repoOwner: z.string().optional(),
    repoName: z.string().optional(),
    hostingPlatform: z.string().optional(),
    hostingAccount: z.string().optional(),
    domainRegistrar: z.string().optional(),
    domainExpiry: z.string().optional(),
    domainPurchaseDate: z.string().optional(),
    launchedAt: z.string().optional(),
    domainCost: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
});

export const createBacklinkSchema = (t: (key: string) => string) => z.object({
    projectId: z.number(),
    targetUrl: z.string().url(t("validation.urlInvalid")).min(1, t("validation.urlInvalid")),
    sourceUrl: z.string().url(t("validation.urlInvalid")).min(1, t("validation.urlInvalid")),
    anchorText: z.string().optional(),
    daScore: z.coerce.number().min(0).optional(),
    cost: z.coerce.number().min(0).optional(),
    status: z.enum(backlinkStatusEnum),
    resourceId: z.number().optional(),
});

// Backward compatibility types - need a dummy schema instance to infer types
const dummyT = (key: string) => key;
export const projectSchema = createProjectSchema(dummyT);
export const backlinkSchema = createBacklinkSchema(dummyT);

export type ProjectFormValues = z.infer<typeof projectSchema>;
export type BacklinkFormValues = z.infer<typeof backlinkSchema>;
