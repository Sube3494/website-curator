# Vercel 部署指南

## 🚀 快速部署

### 第一步：准备代码仓库

1. **推送代码到 GitHub**：
   ```bash
   git add .
   git commit -m "准备部署到 Vercel"
   git push origin main
   ```

2. **确保项目结构正确**：
   ```
   ├── app/                 # Next.js App Router
   ├── components/          # React 组件
   ├── lib/                 # 工具库
   ├── public/              # 静态资源
   ├── package.json         # 依赖配置
   ├── next.config.mjs      # Next.js 配置
   └── .env.example         # 环境变量示例
   ```

### 第二步：连接 Vercel

1. **访问 [Vercel](https://vercel.com)**
2. **使用 GitHub 账号登录**
3. **点击 "New Project"**
4. **选择您的 GitHub 仓库**
5. **点击 "Import"**

### 第三步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 🔑 必需的环境变量

```env
# 应用域名（Vercel 会自动分配）
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 数据库配置
MYSQL_HOST=your-database-host
MYSQL_USER=your-database-user
MYSQL_PASSWORD=your-database-password
MYSQL_DATABASE=website_curator

# JWT 密钥（生成强密钥）
JWT_SECRET=your-very-strong-jwt-secret-at-least-64-characters-long

# 邮件服务配置
EMAIL_FROM=your-email@qq.com
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@qq.com
EMAIL_PASS=your-qq-authorization-code
```

#### 📝 环境变量配置步骤

1. **在 Vercel 项目页面**，点击 "Settings"
2. **选择 "Environment Variables"**
3. **逐一添加上述环境变量**
4. **确保选择正确的环境**（Production/Preview/Development）

### 第四步：数据库配置

#### 选项1：使用 PlanetScale（推荐）

```env
# PlanetScale 连接字符串
DATABASE_URL=mysql://username:password@host.planetscale.com/database_name?sslaccept=strict
```

#### 选项2：使用其他 MySQL 服务

- **阿里云 RDS**
- **腾讯云 CDB**
- **AWS RDS**
- **Google Cloud SQL**

### 第五步：部署配置

#### 创建 `vercel.json`（可选）

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 🔧 高级配置

### 自定义域名

1. **在 Vercel 项目设置中**，选择 "Domains"
2. **添加您的自定义域名**
3. **配置 DNS 记录**：
   ```
   Type: CNAME
   Name: www (或 @)
   Value: cname.vercel-dns.com
   ```
4. **更新环境变量**：
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

### 性能优化

#### 1. 启用边缘函数
```javascript
// app/api/websites/route.ts
export const runtime = 'edge'
```

#### 2. 配置缓存策略
```javascript
// next.config.mjs
const nextConfig = {
  headers: async () => [
    {
      source: '/api/websites',
      headers: [
        {
          key: 'Cache-Control',
          value: 's-maxage=60, stale-while-revalidate'
        }
      ]
    }
  ]
}
```

### 环境管理

#### 开发环境
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### 预览环境
```env
NEXT_PUBLIC_APP_URL=https://your-app-git-branch.vercel.app
NODE_ENV=preview
```

#### 生产环境
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## 🛠️ 部署后配置

### 1. 数据库初始化

如果是新数据库，需要运行初始化脚本：

```sql
-- 在您的数据库中执行
SOURCE database-init-mysql.sql;
```

### 2. 测试功能

- ✅ 访问应用主页
- ✅ 测试用户注册/登录
- ✅ 测试忘记密码功能
- ✅ 测试邮件发送
- ✅ 测试管理员功能

### 3. 监控和日志

在 Vercel 控制台中：
- **查看部署日志**
- **监控函数执行**
- **检查错误报告**

## 🔍 故障排除

### 常见问题

#### 1. 邮件链接指向错误域名
```env
# 确保设置正确的域名
NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
```

#### 2. 数据库连接失败
- 检查数据库服务器是否允许外部连接
- 验证数据库凭据
- 确认网络安全组设置

#### 3. 构建失败
```bash
# 本地测试构建
pnpm build
```

#### 4. 环境变量未生效
- 确保在正确的环境中设置
- 重新部署应用
- 检查变量名拼写

### 调试技巧

1. **查看 Vercel 函数日志**
2. **使用 Vercel CLI 本地测试**：
   ```bash
   npm i -g vercel
   vercel dev
   ```
3. **检查网络请求**：使用浏览器开发者工具

## 📊 性能监控

### 设置分析

在 `next.config.mjs` 中启用分析：

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Vercel Analytics
  analytics: {
    id: 'your-analytics-id'
  }
}
```

### 监控指标

- **页面加载时间**
- **API 响应时间**
- **错误率**
- **用户活跃度**

## 🔄 持续部署

### 自动部署

Vercel 会自动：
- **监听 GitHub 推送**
- **运行构建流程**
- **部署到生产环境**

### 分支部署

- `main` 分支 → 生产环境
- 其他分支 → 预览环境

### 回滚策略

在 Vercel 控制台中可以：
- **查看部署历史**
- **一键回滚到之前版本**
- **比较不同版本**

## 📋 部署检查清单

### 部署前检查

- [ ] 代码已推送到 GitHub
- [ ] 数据库已准备就绪
- [ ] QQ 邮箱授权码已获取
- [ ] 环境变量已准备

### Vercel 配置检查

- [ ] 项目已连接到 GitHub
- [ ] 环境变量已正确设置
- [ ] 构建命令配置正确
- [ ] 域名配置完成（如需要）

### 部署后验证

- [ ] 应用可以正常访问
- [ ] 用户注册/登录功能正常
- [ ] 忘记密码邮件发送正常
- [ ] 邮件链接指向正确域名
- [ ] 管理员功能正常
- [ ] 数据库连接正常

## 🛠️ 快速配置命令

运行以下命令生成 Vercel 环境变量配置：

```bash
pnpm run setup:vercel
```

这将生成一个包含所有必需环境变量的配置文件，您可以直接复制到 Vercel 控制台中。

---

## 📞 支持

如果遇到问题：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 检查项目的 GitHub Issues
3. 联系项目维护者：sube@sube.top
