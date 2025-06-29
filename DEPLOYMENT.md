# 🚀 部署指南

本文档介绍如何将 Website Curator 部署到各种平台。

## 📋 部署前准备

### 1. Supabase 设置

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 获取项目 URL 和 Anon Key
3. 在 Supabase SQL 编辑器中运行 `database-init.sql` 脚本
   - 这个脚本包含完整的数据库结构、初始数据和权限设置
   - 脚本是幂等的，可以安全地重复运行

### 2. 环境变量

确保设置以下环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 Vercel 部署（推荐）

### 自动部署

1. 将代码推送到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 导入您的 GitHub 仓库
5. 配置环境变量
6. 点击 "Deploy"

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 重新部署
vercel --prod
```

## 🐳 Docker 部署

### 创建 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t website-curator .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  website-curator
```

## ☁️ 其他平台部署

### Netlify

1. 连接 GitHub 仓库
2. 设置构建命令：`pnpm build`
3. 设置发布目录：`out`
4. 配置环境变量
5. 部署

### Railway

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### DigitalOcean App Platform

1. 创建新应用
2. 连接 GitHub 仓库
3. 配置环境变量
4. 部署

## 🔧 生产环境优化

### 性能优化

1. **启用压缩**
   ```javascript
   // next.config.mjs
   const nextConfig = {
     compress: true,
     // ...
   }
   ```

2. **图片优化**
   ```javascript
   // next.config.mjs
   const nextConfig = {
     images: {
       domains: ['your-domain.com'],
       formats: ['image/webp', 'image/avif'],
     },
   }
   ```

3. **缓存策略**
   - 配置 CDN
   - 设置适当的缓存头

### 安全配置

1. **环境变量安全**
   - 不要在客户端暴露敏感信息
   - 使用 `NEXT_PUBLIC_` 前缀仅用于公开信息

2. **HTTPS**
   - 确保生产环境使用 HTTPS
   - 配置安全头

3. **数据库安全**
   - 启用 RLS (Row Level Security)
   - 定期备份数据

## 📊 监控和日志

### 错误监控

推荐使用：
- Sentry
- LogRocket
- Bugsnag

### 性能监控

- Vercel Analytics
- Google Analytics
- Web Vitals

## 🔄 CI/CD 配置

项目已配置完整的 GitHub Actions CI/CD 流水线，包含以下功能：

### 🎯 流水线功能

**✅ 基础功能（默认启用）**
- 代码规范检查 (ESLint)
- TypeScript 类型检查
- 应用构建测试
- 构建产物上传

**🔧 可选功能（需要配置）**
- 安全漏洞扫描
- 自动部署到 Vercel

### ⚙️ 配置 GitHub Variables

在仓库设置中配置以下变量来启用可选功能：

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 在 "Variables" 标签页添加：

```
ENABLE_SECURITY_SCAN=true     # 启用安全扫描
ENABLE_AUTO_DEPLOY=true       # 启用自动部署
```

### 🔐 配置 GitHub Secrets

**生产环境部署需要：**
```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

**Vercel 自动部署需要：**
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### 📋 获取 Vercel 配置信息

1. **VERCEL_TOKEN**
   - 访问 [Vercel Tokens](https://vercel.com/account/tokens)
   - 创建新的 Token

2. **VERCEL_ORG_ID 和 VERCEL_PROJECT_ID**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel

   # 登录并链接项目
   vercel link

   # 查看项目信息
   vercel project ls
   ```

### 🚀 流水线触发条件

- **推送到 main 分支**: 运行完整流水线
- **推送到 develop 分支**: 运行代码检查和构建
- **Pull Request**: 运行代码检查和构建

### 📊 流水线状态

可以在 GitHub 仓库的 "Actions" 标签页查看流水线运行状态和日志。

## 🆘 故障排除

### 常见问题

1. **构建失败**
   - 检查环境变量是否正确设置
   - 确保所有依赖都已安装

2. **数据库连接问题**
   - 验证 Supabase URL 和 Key
   - 检查网络连接

3. **权限问题**
   - 确保 RLS 策略正确配置
   - 检查用户角色设置

### 日志查看

```bash
# Vercel 日志
vercel logs

# Docker 日志
docker logs container_name
```

---

如需更多帮助，请查看 [Issues](https://github.com/Sube3494/website-curator/issues) 或联系维护者。
