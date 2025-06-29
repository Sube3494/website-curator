# 🌐 Website Curator

一个现代化的网站收藏和管理平台，基于 Next.js 和 Supabase 构建。

## ✨ 功能特性

- 🔐 **用户认证系统** - 基于 Supabase Auth 的完整用户管理
- 📝 **网站提交与审核** - 用户可提交网站，管理员审核发布
- 🏷️ **分类和标签管理** - 灵活的网站分类和标签系统
- ⭐ **收藏功能** - 用户可收藏喜欢的网站
- 🎨 **主题切换** - 支持明暗主题切换
- 📱 **响应式设计** - 完美适配各种设备
- 🔍 **搜索功能** - 快速搜索网站内容
- 👥 **用户管理** - 完整的用户权限管理系统
- ⚙️ **系统设置** - 灵活的系统配置管理

## 🛠️ 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **状态管理**: React Query (TanStack Query)
- **表单处理**: React Hook Form + Zod
- **测试**: Playwright
- **包管理**: pnpm

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- pnpm
- Supabase 账户

### 1. 克隆项目

```bash
git clone https://github.com/Sube3494/website-curator.git
cd website-curator
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 数据库设置

1. 在 Supabase 中创建新项目
2. 在 Supabase SQL 编辑器中运行 `database-init.sql` 脚本
   - 这个脚本包含了完整的数据库结构、初始数据和权限设置
   - 脚本是幂等的，可以安全地重复运行

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
├── app/                    # Next.js App Router
├── components/             # React 组件
│   ├── admin/             # 管理员组件
│   ├── auth/              # 认证组件
│   ├── browse/            # 浏览页面组件
│   ├── favorites/         # 收藏页面组件
│   ├── layout/            # 布局组件
│   ├── settings/          # 设置组件
│   └── ui/                # UI 基础组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具库和配置
├── public/                # 静态资源
├── tests/                 # 测试文件
└── database-init.sql      # 数据库初始化脚本
```

## 🔧 开发指南

### 数据库架构

主要数据表：
- `users` - 用户信息
- `categories` - 网站分类
- `websites` - 网站数据
- `tags` - 标签
- `favorites` - 用户收藏
- `system_settings` - 系统设置

### 权限系统

- `user` - 普通用户
- `admin` - 管理员
- `super_admin` - 超级管理员

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并显示 UI
pnpm test:ui

# 运行测试（有头模式）
pnpm test:headed
```

## 📦 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署

### 其他平台

项目支持部署到任何支持 Next.js 的平台。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**Sube** - [GitHub](https://github.com/Sube3494)

## 📚 文档

- 📖 [部署指南](DEPLOYMENT.md) - 详细的部署说明
- 🤝 [贡献指南](CONTRIBUTING.md) - 如何参与项目开发
- 🔒 [安全政策](SECURITY.md) - 安全相关信息
- 📝 [更新日志](CHANGELOG.md) - 版本更新记录
- ⚖️ [许可证](LICENSE) - MIT 许可证

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

如果这个项目对您有帮助，请给个 ⭐️！
