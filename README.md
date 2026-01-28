# NicheStack Manager

<div align="center">

**个人站群全生命周期管理系统**

专为管理多个 AdSense/Affiliate 内容站点设计的 ERP 系统

</div>

---

## 📖 项目简介

NicheStack Manager 帮助拥有多个内容站点的开发者/SEOer 解决"遗忘"痛点。一屏掌控代码维护状态、域名资产、AdSense 账号状态及外链建设记录。

## ✨ 核心功能

- 📊 **仪表盘** - 红绿灯机制快速识别需要关注的站点
- 🚀 **项目管理** - 完整的项目生命周期管理
- 🔗 **外链管理** - 记录和追踪外链建设，统计成本
- 💰 **费用追踪** - 管理域名、主机等支出，自动到期提醒
- 📚 **资源库** - 收藏外链资源、SEO 工具
- 📈 **数据分析** - 可视化图表展示关键指标
- 🔄 **GitHub 同步** - 自动同步代码仓库更新时间
- 🌍 **国际化** - 中英文界面
- 🌓 **暗色模式**

## 🛠️ 技术栈

Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Cloudflare D1 + Drizzle ORM

## ☁️ 部署指南 (Cloudflare Pages)

> [!IMPORTANT]
> **本项目专为 Cloudflare Pages 设计。**
> 强烈建议使用 Cloudflare Pages 进行部署，以获得最佳的性能和免费额度体验。其他部署方式（如 Vercel）请自行测试。

### 1. 准备工作

确保你拥有：
- GitHub 账号
- Cloudflare 账号
- Node.js 环境（仅用于执行数据库迁移命令）

### 2. 获取代码

将本项目 Fork 到你的 GitHub 账号，或者克隆到本地：

```bash
git clone https://github.com/paradoxie/niche-public.git
cd niche-public
npm install # 安装依赖以使用部署工具
```

### 3. 创建与配置数据库

本项目使用 Cloudflare D1 数据库。

1.  **登录 Cloudflare** (如果未登录):
    ```bash
    npx wrangler login
    ```

2.  **创建数据库**:
    ```bash
    npx wrangler d1 create nichestack-db
    ```
    *复制命令输出中的 `database_id`。*

3.  **配置项目**:
    打开 `wrangler.toml` 文件，将 `database_id` 替换为你刚才获取的 ID：
    ```toml
    [[d1_databases]]
    binding = "DB"
    database_name = "nichestack-db"
    database_id = "你的数据库ID" # <--- 替换这里
    ```

4.  **初始化数据库表结构**:
    ```bash
    npx wrangler d1 migrations apply nichestack-db --remote
    ```
    *选择 `Yes` 确认执行。*

### 4. 部署到 Cloudflare Pages

推荐使用 Cloudflare Dashboard 进行自动化部署：

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  进入 **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**。
3.  选择你 Fork 的 `niche-public` 仓库。
4.  **配置构建设置**:
    - **框架选择**: Next.js
    - **Build command**: `npx @cloudflare/next-on-pages@1`
    - **Build output directory**: `.vercel/output/static`
5.  **配置环境变量与绑定** (关键步骤):
    - 点击 **Environment variables (advanced)** (如有需要可设置 `ADMIN_PASSWORD` 等)。
    - **极其重要**：部署完成后，进入该 Project 的 **Settings** -> **Functions** -> **D1 database bindings**。
    - 点击 **Add binding**：
        - **Variable name**: `DB` (必须完全一致)
        - **D1 database**: 选择你在第3步创建的 `nichestack-db`。
6.  **重新部署**:
    绑定数据库后，需要手动触发一次 **Redeploy** (在 Deployments 标签页)，让绑定生效。

### 5. 环境变量配置 (可选)

在 Cloudflare Pages 的 **Settings** -> **Environment variables** 中可添加以下变量：

| 变量名 | 说明 | 是否必须 |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | 用于自动同步 GitHub 仓库的最后更新时间。<br>权限要求: `repo` (私有库) 或 `public_repo` (公开库)。 | 否 |
| `ADMIN_PASSWORD` | 简易后的应用访问密码，防止未授权访问。 | 否 |
| `CRON_SECRET` | 用于保护定时任务 API 的密钥 (任意字符串)。 | 否 |

### 6. 配置定时自动同步 (可选)

为了保持项目信息的实时性，可以配置定时任务自动同步 GitHub 仓库的更新时间。

1.  **设置密钥**:
    在 Cloudflare Pages 的环境变量中设置 `CRON_SECRET` (任意字符串)。

2.  **注册账号**:
    访问 [cron-job.org](https://console.cron-job.org/) 并注册账号。

3.  **创建任务 (Create Cronjob)**:
    - **Title**: NicheStack Sync (或任意名称)
    - **URL**: `https://你的域名.pages.dev/api/sync-github`
    - **Execution schedule**: 推荐每天一次 (例如 `Every day at 02:00`)
    - **Advanced -> HTTP Method**: `POST`
    - **Advanced -> HTTP Headers**:
        ```
        Authorization: Bearer 你的CRON_SECRET
        ```

4.  **保存**:
    点击 "Create cronjob" 保存即可。系统将按计划自动触发同步。

---

## 📁 项目结构

```
src/
├── app/              # Next.js 页面和 API 路由
├── components/       # React UI 组件
├── db/               # 数据库 Schema 定义
├── lib/              # 工具函数和 Server Actions
└── i18n/             # 国际化资源
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License

---

<div align="center">
Made with ❤️ for niche site builders
</div>
