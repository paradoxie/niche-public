# 脱敏说明 / Desensitization Notes

本目录是 NicheStack Manager 的公开版本，已进行以下脱敏处理：

## 已脱敏内容

1. **数据库配置** (`wrangler.toml`)
   - ✅ 已将真实的 `database_id` 替换为占位符
   - 用户需要创建自己的 D1 数据库

2. **环境变量**
   - ✅ 创建了 `.env.example` 模板
   - ✅ `.gitignore` 已配置忽略 `.env` 文件
   - 不包含任何真实的 token、密码或密钥

3. **GitHub Token**
   - ✅ 代码中不包含任何硬编码的 token
   - 所有 token 存储在数据库中（用户自行添加）

4. **个人数据**
   - ✅ 数据库迁移文件仅包含表结构，无真实数据
   - ✅ 种子数据 (`seed_resources.sql`) 仅包含公开的外链资源示例

## 安全检查清单

- [x] 无真实数据库 ID
- [x] 无 API 密钥或 token
- [x] 无个人邮箱或账号信息
- [x] 无真实项目数据
- [x] 无敏感配置信息
- [x] `.gitignore` 正确配置

## 使用前必须配置

用户在使用前需要：

1. 创建自己的 Cloudflare D1 数据库
2. 更新 `wrangler.toml` 中的 `database_id`
3. （可选）配置 `GITHUB_TOKEN` 环境变量
4. 运行数据库迁移

详见 `README.md` 的快速开始部分。

---

This directory is the public version of NicheStack Manager with the following desensitization:

## Desensitized Content

1. **Database Config** (`wrangler.toml`)
   - ✅ Real `database_id` replaced with placeholder
   - Users need to create their own D1 database

2. **Environment Variables**
   - ✅ Created `.env.example` template
   - ✅ `.gitignore` configured to ignore `.env` files
   - No real tokens, passwords, or secrets included

3. **GitHub Tokens**
   - ✅ No hardcoded tokens in code
   - All tokens stored in database (user-added)

4. **Personal Data**
   - ✅ Migration files contain only table structures, no real data
   - ✅ Seed data contains only public backlink resource examples

## Security Checklist

- [x] No real database IDs
- [x] No API keys or tokens
- [x] No personal emails or account info
- [x] No real project data
- [x] No sensitive configuration
- [x] `.gitignore` properly configured

## Required Configuration

Users must:

1. Create their own Cloudflare D1 database
2. Update `database_id` in `wrangler.toml`
3. (Optional) Configure `GITHUB_TOKEN` environment variable
4. Run database migrations

See Quick Start section in `README.md`.
