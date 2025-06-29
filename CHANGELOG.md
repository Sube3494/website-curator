<!--
 * @Date: 2025-06-29 21:10:07
 * @Author: Sube
 * @FilePath: CHANGELOG.md
 * @LastEditTime: 2025-06-29 21:10:46
 * @Description: 
-->
# 更新日志

本文件记录了项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划中
- 网站图标自动获取功能
- 批量导入网站功能
- 网站统计和分析
- API 接口文档
- 移动端 PWA 支持

## [1.0.0] - 2025-06-29

### 新增
- 🎉 项目初始发布
- 🔐 完整的用户认证系统（基于 Supabase Auth）
- 👥 三级用户权限管理（user, admin, super_admin）
- 📝 网站提交和审核功能
- 🏷️ 分类和标签管理系统
- ⭐ 用户收藏功能
- 🔍 网站搜索功能
- 🎨 明暗主题切换
- 📱 响应式设计
- ⚙️ 系统设置管理
- 🧪 完整的测试套件（Playwright）

### 技术特性
- Next.js 15 + React 19
- Supabase 数据库和认证
- Tailwind CSS + shadcn/ui
- React Query 状态管理
- TypeScript 类型安全
- Row Level Security (RLS)
- 性能优化（乐观更新）

### 安全特性
- 数据库 RLS 策略
- 用户权限控制
- 输入验证和清理
- 安全的会话管理
- 环境变量保护

### 用户界面
- 现代化设计
- 流畅的动画效果
- 直观的用户体验
- 无障碍访问支持
- 移动端优化

### 管理功能
- 用户管理面板
- 网站审核系统
- 分类管理
- 系统设置
- 数据统计

---

## 版本说明

### 版本号规则
- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型
- **新增** - 新功能
- **变更** - 对现有功能的变更
- **弃用** - 即将移除的功能
- **移除** - 已移除的功能
- **修复** - 问题修复
- **安全** - 安全相关的修复

### 贡献指南
如需贡献代码或报告问题，请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 支持
如有问题或需要帮助，请：
- 查看 [Issues](https://github.com/Sube3494/website-curator/issues)
- 发送邮件至 sube@sube.top
