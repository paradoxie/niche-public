# 📄 产品需求文档 (PRD): NicheStack Manager (Full Version)

## 1. 项目概述 (Overview)
*   **产品名称**: NicheStack Manager
*   **产品定位**: 个人站群全生命周期管理系统 (AdSense/Affiliate Niche Sites ERP)。
*   **核心价值**: 解决多站点管理中的“遗忘”痛点，集成代码维护状态、域名资产监控、AdSense 账号状态及外链建设记录，实现“一屏掌控资产健康度”。
*   **目标用户**: 拥有 5-100 个内容站点的个人开发者/SEOer。
*   **技术架构**:
    *   **Frontend**: Next.js 14 (App Router) + Tailwind CSS (Shadcn UI).
    *   **Backend**: Cloudflare Pages Functions (Serverless).
    *   **Database**: Cloudflare D1 (SQLite) + Drizzle ORM.
    *   **Auth**: Cloudflare Zero Trust (Access) - *网关层鉴权，应用层免登录开发*。

---

## 2. 数据模型 (Database Schema)

这是系统的核心。请严格按照以下结构设计 Drizzle ORM Schema。

### 2.1 主表: `projects` (项目资产表)
*   **基础信息**:
    *   `id`: Int (PK)
    *   `name`: String (项目名称，如 "Best Coffee Maker")
    *   `site_url`: String (线上地址)
    *   `niche_category`: String (赛道，如 "Outdoor", "Tech")
    *   `status`: Enum (`active` 正常, `sold` 已售, `dead` 废弃, `incubating` 孵化中)
*   **技术与维护**:
    *   `repo_owner`: String (GitHub 用户名)
    *   `repo_name`: String (GitHub 仓库名)
    *   `last_github_push`: DateTime (自动同步的代码更新时间)
    *   `last_content_update`: DateTime (人工录入的内容更新时间)
*   **资产与部署**:
    *   `domain_expiry`: Date (域名过期日)
    *   `domain_registrar`: String (注册商，如 Namecheap)
    *   `hosting_platform`: String (Vercel/Netlify/VPS)
    *   `hosting_account`: String (关联的部署账号邮箱，用于防关联查询)
*   **盈利状态**:
    *   `monetization_type`: String (AdSense, Amazon, Hybrid)
    *   `adsense_status`: Enum (`none` 未申请, `reviewing` 审核中, `active` 正常, `limited` 流量限制, `banned` 封号)
    *   `notes`: Text (Markdown 格式备注)

### 2.2 子表: `backlinks` (外链建设记录表)
*   `id`: Int (PK)
*   `project_id`: Int (FK -> projects.id)
*   `target_url`: String (我方受链页面)
*   `source_url`: String (对方外链页面)
*   `anchor_text`: String (锚文本)
*   `da_score`: Int (对方网站 DA 值，可选)
*   `cost`: Decimal (费用，0 代表免费)
*   `status`: Enum (`planned` 计划中, `outreach` 已联系, `live` 已上线, `removed` 已丢失)
*   `acquired_date`: Date (上线日期)

---

## 3. 功能模块详情 (Feature Requirements)

### 3.1 首页仪表盘 (Dashboard)
**目标**: 3秒内判断哪个站需要“抢救”。

*   **全局统计卡片**:
    *   总项目数 / AdSense 正常数 / 本月外链花费。
*   **项目概览列表 (核心视图)**:
    *   **显示模式**: 紧凑型表格 (Table)。
    *   **列定义**:
        *   `Project`: 名称 + Niche 标签 + 链接图标。
        *   `Health`: **红绿灯机制** (算法见下文 3.4)。
        *   `AdSense`: 显示状态徽章。如果状态是 `Banned` 或 `Limited`，显示高亮红色。
        *   `Code Status`: 显示 "3 days ago" (自动同步)。
        *   `Domain`: 显示过期倒计时。如果 < 30天，显示 ⚠️ 图标。
        *   `Backlinks`: 显示已上线外链数量 (Count of `live` links)。
        *   `Action`: "详情" 按钮。

### 3.2 项目详情页 (Project Detail View)
**目标**: 该站点的“指挥中心”，包含所有元数据。采用 **Tabs (选项卡)** 布局。

*   **Tab 1: 概览 (Overview)**
    *   显示所有基础字段。
    *   提供 "Edit Metadata" 表单，修改 Niche、部署账号、备注等。
    *   **Action**: "Sync GitHub" 按钮 (手动触发更新时间)。
*   **Tab 2: 资产与部署 (Assets)**
    *   域名注册商信息、过期时间修改。
    *   部署平台账号记录。
    *   **Quick Links**: 预留按钮位，一键跳转到 Vercel/Namecheap 后台 (需手动填链接)。
*   **Tab 3: 外链管理 (Backlinks Manager)**
    *   **功能**: 类似于简易版 Excel。
    *   **列表**: 展示该项目所有外链。
    *   **新增**: 弹窗录入 (Source URL, Target URL, Cost, Status)。
    *   **统计**: 底部显示该项目总外链投入成本。

### 3.3 全局外链池 (Backlink Pool - 可选)
*   一个独立的页面，汇总所有项目的 `backlinks` 表。方便查看最近通过哪些渠道做了外链。

### 3.4 自动化与逻辑规则 (Logic & Automation)

**A. 健康度着色算法 (Health Coloring)**
前端根据以下逻辑渲染每一行的背景色或左侧边框色：
1.  🔴 **Danger**: (`Domain Expiry` < 15 days) OR (`AdSense` == Banned) OR (`Last Update` > 90 days).
2.  🟡 **Warning**: (`Domain Expiry` < 30 days) OR (`Last Update` > 30 days) OR (`AdSense` == Limited).
3.  🟢 **Good**: 其他情况。
*(注: Last Update 取 `last_github_push` 和 `last_content_update` 中较新的那个)*

**B. GitHub 同步逻辑**
*   创建一个 API Route `/api/sync/github`。
*   逻辑：接收 `project_id` -> 查库得 `repo` -> Fetch `api.github.com/repos/{owner}/{name}` -> Update DB `last_github_push`。
*   *UI 交互*: 在详情页点击按钮时触发，或者在首页加一个 "Sync All" 按钮（前端并发请求）。

---

## 4. UI/UX 规范 (Design Guidelines)
*   **风格**: 现代化极简风(本项目禁止使用渐变配色)、信息密度高 (Data-dense)。不要太多的留白，因为是管理后台。
*   **组件库**: 使用 **Shadcn UI** (基于 Radix UI + Tailwind)。
    *   Table:用于列表。
    *   Badge: 用于 AdSense 状态 (Green/Yellow/Red)。
    *   Tabs: 用于详情页切换。
    *   Dialog: 用于新增项目/新增外链。
*   **暗色模式**: 必须支持 (Dark Mode)，程序员标配。

---

## 5. 开发路线图 (Implementation Steps for AI)

请按此顺序指令 AI 生成代码：

**Step 1: 初始化与数据库**
> "创建一个 Next.js + Cloudflare Pages 项目。安装 Drizzle ORM 和 D1。请根据 PRD 中的 Schema 部分，编写 `schema.ts` 文件，包含 `projects` 和 `backlinks` 两个表及其关系定义。"

**Step 2: 后端 API (Server Actions/Route Handlers)**
> "编写 CRUD 接口。
> 1. Projects 的增删改查。
> 2. Backlinks 的增删改查（关联 project_id）。
> 3. 一个 `syncGithub(projectId)` 的 Server Action，用于调用 GitHub API 并更新数据库。"

**Step 3: 首页看板开发**
> "使用 Shadcn UI 的 Table 组件开发 Dashboard。获取 Projects 数据，实现 PRD 中描述的'健康度着色算法'。列出项目名、AdSense 状态、更新时间、域名过期警告。"

**Step 4: 详情页开发**
> "开发 `/projects/[id]` 页面。使用 Tabs 组件分为 'Overview', 'Assets', 'Backlinks'。
> - Overview: 表单修改项目详情。
> - Backlinks: 列出该项目的外链，并提供'Add Backlink' 的弹窗表单。"

---

### 💡 给 Claude/ChatGPT 的最终提示词 (Final Prompt)

**复制下面的内容给 AI，它就能为你干活了：**

> 我需要你作为全栈工程师，帮我编写一个名为 "NicheStack Manager" 的个人站群管理系统。
>
> **上下文**：
> - 我是一个拥有多个 AdSense 网站的站长，需要一个集中化 Dashboard 来防止项目被遗忘，并管理资产。
> - **技术栈**：Next.js 14 (App Router), Tailwind CSS (Shadcn UI), Cloudflare Pages, Cloudflare D1 (SQLite), Drizzle ORM。
> - **部署环境**：Cloudflare Pages，使用 Cloudflare Access 做鉴权（所以代码里不需要做登录功能）。