import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ==================== Enum Values ====================
export const projectStatusEnum = ["active", "sold", "dead", "incubating"] as const;
export const adsenseStatusEnum = ["none", "reviewing", "rejected", "active", "limited", "banned"] as const;
export const backlinkStatusEnum = ["planned", "outreach", "live", "removed"] as const;

// ==================== GitHub Accounts Table ====================
export const githubAccounts = sqliteTable("github_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  token: text("token").notNull(),
  tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== Projects Table ====================
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 基础信息
  name: text("name").notNull(),
  siteUrl: text("site_url"),
  nicheCategory: text("niche_category"),
  status: text("status", { enum: projectStatusEnum }).default("active").notNull(),

  // 技术与维护
  githubAccountId: integer("github_account_id").references(() => githubAccounts.id, { onDelete: "set null" }),
  repoOwner: text("repo_owner"),
  repoName: text("repo_name"),
  lastGithubPush: integer("last_github_push", { mode: "timestamp" }),
  lastContentUpdate: integer("last_content_update", { mode: "timestamp" }),
  lastManualUpdate: integer("last_manual_update", { mode: "timestamp" }),

  // 资产与部署
  domainExpiry: integer("domain_expiry", { mode: "timestamp" }),
  domainPurchaseDate: integer("domain_purchase_date", { mode: "timestamp" }),
  domainRegistrar: text("domain_registrar"),
  hostingPlatform: text("hosting_platform"),
  hostingAccount: text("hosting_account"),

  // 盈利状态
  monetizationType: text("monetization_type"),
  adsenseStatus: text("adsense_status", { enum: adsenseStatusEnum }).default("none").notNull(),
  notes: text("notes"),

  // 时间戳
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  launchedAt: integer("launched_at", { mode: "timestamp" }),
});

// ==================== Backlinks Table ====================
export const backlinks = sqliteTable("backlinks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  resourceId: integer("resource_id").references(() => linkResources.id, { onDelete: "set null" }),

  targetUrl: text("target_url").notNull(),
  sourceUrl: text("source_url").notNull(),
  anchorText: text("anchor_text"),
  daScore: integer("da_score"),
  cost: real("cost").default(0),
  status: text("status", { enum: backlinkStatusEnum }).default("planned").notNull(),
  acquiredDate: integer("acquired_date", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== Link Resources Table ====================
export const resourceTypeEnum = ["profile", "guest_post", "directory", "forum", "comment", "social", "other"] as const;
export const resourceStatusEnum = ["active", "inactive", "pending"] as const;

export const linkResources = sqliteTable("link_resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").default("other").notNull(),
  daScore: integer("da_score"),
  drScore: integer("dr_score"),
  price: real("price").default(0),
  isFree: integer("is_free", { mode: "boolean" }).default(true),
  status: text("status", { enum: resourceStatusEnum }).default("active").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== Relations ====================
export const githubAccountsRelations = relations(githubAccounts, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  backlinks: many(backlinks),
  githubAccount: one(githubAccounts, {
    fields: [projects.githubAccountId],
    references: [githubAccounts.id],
  }),
}));

export const backlinksRelations = relations(backlinks, ({ one }) => ({
  project: one(projects, {
    fields: [backlinks.projectId],
    references: [projects.id],
  }),
  resource: one(linkResources, {
    fields: [backlinks.resourceId],
    references: [linkResources.id],
  }),
}));

export const linkResourcesRelations = relations(linkResources, ({ many }) => ({
  backlinks: many(backlinks),
}));

// ==================== Presets Table ====================
export const presetTypeEnum = ["hosting_platform", "hosting_account", "domain_registrar", "payment_method", "expense_category", "tool_category", "resource_type"] as const;

export const presets = sqliteTable("presets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: presetTypeEnum }).notNull(),
  value: text("value").notNull(),
  label: text("label"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== Site Tools Table ====================
export const toolCategoryEnum = [
  "content_inspiration",
  "keyword_research",
  "competitor_analysis",
  "trend_insight",
  "domain_tools",
  "seo_tools",
  "analytics",
  "other"
] as const;

export const toolCostEnum = ["free", "paid", "freemium"] as const;

export const siteTools = sqliteTable("site_tools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  purpose: text("purpose"),
  cost: text("cost", { enum: toolCostEnum }).default("free").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== Expenses Table ====================
export const expenseCategoryEnum = [
  "subscription",
  "domain",
  "hosting",
  "marketing",
  "tool",
  "other"
] as const;

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  paymentMethodId: integer("payment_method_id").references(() => presets.id, { onDelete: "set null" }),
  paidAt: integer("paid_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  project: one(projects, {
    fields: [expenses.projectId],
    references: [projects.id],
  }),
  paymentMethod: one(presets, {
    fields: [expenses.paymentMethodId],
    references: [presets.id],
  }),
}));

// ==================== Types ====================
export type GitHubAccount = typeof githubAccounts.$inferSelect;
export type NewGitHubAccount = typeof githubAccounts.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Backlink = typeof backlinks.$inferSelect;
export type NewBacklink = typeof backlinks.$inferInsert;
export type LinkResource = typeof linkResources.$inferSelect;
export type NewLinkResource = typeof linkResources.$inferInsert;
export type Preset = typeof presets.$inferSelect;
export type NewPreset = typeof presets.$inferInsert;
export type PresetType = typeof presetTypeEnum[number];
export type ResourceType = typeof resourceTypeEnum[number];
export type ResourceStatus = typeof resourceStatusEnum[number];
export type SiteTool = typeof siteTools.$inferSelect;
export type NewSiteTool = typeof siteTools.$inferInsert;
export type ToolCategory = typeof toolCategoryEnum[number];
export type ToolCost = typeof toolCostEnum[number];
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type ExpenseCategory = typeof expenseCategoryEnum[number];

