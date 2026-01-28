# NicheStack Manager

<div align="center">

**个人站群全生命周期管理系统**

专为管理多个 AdSense/Affiliate 内容站点设计的 ERP 系统

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 📖 项目简介

NicheStack Manager 帮助拥有多个内容站点的开发者/SEOer 解决"遗忘"痛点。一屏掌控代码维护状态、域名资产、AdSense 账号状态及外链建设记录。

### ✨ 核心功能

- 📊 **仪表盘** - 红绿灯机制快速识别需要关注的站点
- 🚀 **项目管理** - 完整的项目生命周期管理
- 🔗 **外链管理** - 记录和追踪外链建设，统计成本
- 💰 **费用追踪** - 管理域名、主机等支出，自动到期提醒
- 📚 **资源库** - 收藏外链资源、SEO 工具
- 📈 **数据分析** - 可视化图表展示关键指标
- 🔄 **GitHub 同步** - 自动同步代码仓库更新时间
- 🌍 **国际化** - 中英文界面
- 🌓 **暗色模式**

### 🛠️ 技术栈

Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Cloudflare D1 + Drizzle ORM

### 🚀 快速开始

#### 1. 克隆项目

```bash
git clone https://github.com/yourusername/nichestack-manager.git
cd nichestack-manager
npm install
```

#### 2. 配置数据库

```bash
# 创建 D1 数据库
wrangler d1 create nichestack-db

# 会输出 database_id，复制它
```

编辑 `wrangler.toml`，替换 `database_id`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "nichestack-db"
database_id = "你的数据库ID"  # 粘贴这里
```

#### 3. 运行迁移

```bash
# 本地开发
wrangler d1 migrations apply nichestack-db --local

# 生产环境
wrangler d1 migrations apply nichestack-db --remote
```

#### 4. 启动开发

```bash
npm run dev
```

访问 http://localhost:3000

### 📦 部署到 Cloudflare Pages

**方式一：命令行部署**

```bash
npm run pages:build
wrangler pages deploy
```

**方式二：GitHub 自动部署（推荐）**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Create → Pages → Connect to Git
3. 选择仓库，配置：
   - Build command: `npm run pages:build`
   - Build output: `.vercel/output/static`
4. Settings → Functions → D1 database bindings：
   - Variable name: `DB`
   - D1 database: 选择你的数据库

### 🔐 环境变量（可选）

在 Cloudflare Pages 设置中添加：

| 变量 | 说明 | 必需 |
|------|------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token，用于同步仓库 | 否 |
| `ADMIN_PASSWORD` | 简单密码保护 | 否 |

#### 配置 GitHub 自动同步

如果你的项目托管在 GitHub，可以配置自动同步代码更新时间：

1. **创建 GitHub Token**
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo`（私有仓库）或 `public_repo`（仅公开仓库）
   - 生成并复制 token

2. **添加 GitHub 账号**
   - 在应用的"设置"页面添加 GitHub 账号
   - 输入用户名和 token
   - 系统会自动获取该账号下的仓库列表

3. **关联项目**
   - 在项目编辑页面选择 GitHub 账号和仓库
   - 点击"同步 GitHub"按钮即可更新最后推送时间

4. **配置定时自动同步（可选）**
   - 在 Cloudflare Pages 环境变量中设置 `CRON_SECRET`（任意字符串）
   - 访问 https://console.cron-job.org 注册账号
   - 创建新任务：
     - URL: `https://your-domain.pages.dev/api/sync-github`
     - Method: `POST`
     - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
     - Schedule: 每天一次（如 `0 2 * * *`）
   - 系统会自动同步所有项目的 GitHub 仓库更新时间

### 📁 项目结构

```
src/
├── app/              # Next.js 页面和 API
├── components/       # React 组件
├── db/              # 数据库 schema
├── lib/             # 工具函数和 Server Actions
└── i18n/            # 国际化
```

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 📄 开源协议

MIT License

---

## English

### 📖 Introduction

NicheStack Manager helps developers/SEOers managing multiple content sites solve the "forgetting" problem. Monitor code status, domain assets, AdSense accounts, and backlinks in one screen.

### ✨ Features

- 📊 **Dashboard** - Traffic light system for quick health checks
- 🚀 **Project Management** - Complete lifecycle management
- 🔗 **Backlink Tracking** - Record and track backlinks with costs
- 💰 **Expense Tracking** - Manage expenses with expiry reminders
- 📚 **Resource Library** - Collect backlink sources and SEO tools
- 📈 **Analytics** - Visualize key metrics
- 🔄 **GitHub Sync** - Auto-sync repository updates
- 🌍 **i18n** - English and Chinese
- 🌓 **Dark Mode**

### 🛠️ Tech Stack

Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Cloudflare D1 + Drizzle ORM

### 🚀 Quick Start

#### 1. Clone & Install

```bash
git clone https://github.com/yourusername/nichestack-manager.git
cd nichestack-manager
npm install
```

#### 2. Setup Database

```bash
# Create D1 database
wrangler d1 create nichestack-db

# Copy the database_id from output
```

Edit `wrangler.toml` and replace `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "nichestack-db"
database_id = "your-database-id"  # Paste here
```

#### 3. Run Migrations

```bash
# Local development
wrangler d1 migrations apply nichestack-db --local

# Production
wrangler d1 migrations apply nichestack-db --remote
```

#### 4. Start Development

```bash
npm run dev
```

Visit http://localhost:3000

### 📦 Deploy to Cloudflare Pages

**Option 1: CLI Deploy**

```bash
npm run pages:build
wrangler pages deploy
```

**Option 2: GitHub Auto-Deploy (Recommended)**

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Create → Pages → Connect to Git
3. Select repository, configure:
   - Build command: `npm run pages:build`
   - Build output: `.vercel/output/static`
4. Settings → Functions → D1 database bindings:
   - Variable name: `DB`
   - D1 database: Select your database

### 🔐 Environment Variables (Optional)

Add in Cloudflare Pages settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token for repo sync | No |
| `ADMIN_PASSWORD` | Simple password protection | No |

#### Setup GitHub Auto-Sync

If your projects are hosted on GitHub, you can configure automatic code update tracking:

1. **Create GitHub Token**
   - Visit https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (private repos) or `public_repo` (public only)
   - Generate and copy the token

2. **Add GitHub Account**
   - Go to Settings page in the app
   - Add your GitHub account with username and token
   - System will automatically fetch your repositories

3. **Link Projects**
   - In project edit page, select GitHub account and repository
   - Click "Sync GitHub" button to update last push time

4. **Setup Automatic Sync (Optional)**
   - Set `CRON_SECRET` in Cloudflare Pages environment variables (any random string)
   - Register at https://console.cron-job.org
   - Create new job:
     - URL: `https://your-domain.pages.dev/api/sync-github`
     - Method: `POST`
     - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
     - Schedule: Daily (e.g., `0 2 * * *`)
   - System will automatically sync all projects' GitHub repository update times

### 📁 Project Structure

```
src/
├── app/              # Next.js pages and APIs
├── components/       # React components
├── db/              # Database schema
├── lib/             # Utils and Server Actions
└── i18n/            # Internationalization
```

### 🤝 Contributing

Issues and Pull Requests are welcome!

### 📄 License

MIT License

---

<div align="center">
Made with ❤️ for niche site builders
</div>
