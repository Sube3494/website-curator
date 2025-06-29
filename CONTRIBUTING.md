# 贡献指南

感谢您对 Website Curator 项目的关注！我们欢迎所有形式的贡献。

## 🚀 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议：

1. 检查 [Issues](https://github.com/Sube3494/website-curator/issues) 确保问题未被报告
2. 创建新的 Issue，详细描述问题或建议
3. 使用适当的标签标记 Issue

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/Sube3494/website-curator.git
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **设置开发环境**
   ```bash
   pnpm install
   cp .env.example .env.local
   # 配置您的 Supabase 环境变量
   ```

4. **进行更改**
   - 遵循现有的代码风格
   - 添加必要的测试
   - 确保所有测试通过

5. **测试您的更改**
   ```bash
   pnpm test
   pnpm dev # 本地测试
   ```

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **推送到您的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建 Pull Request**
   - 提供清晰的 PR 描述
   - 链接相关的 Issues
   - 等待代码审查

## 📝 代码规范

### 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### 代码风格

- 使用 TypeScript
- 遵循 ESLint 配置
- 使用 Prettier 格式化代码
- 组件使用 PascalCase
- 文件名使用 kebab-case

### 目录结构

```
components/
├── admin/          # 管理员相关组件
├── auth/           # 认证相关组件
├── browse/         # 浏览页面组件
├── favorites/      # 收藏页面组件
├── layout/         # 布局组件
├── settings/       # 设置组件
└── ui/             # 基础 UI 组件
```

## 🧪 测试

- 为新功能添加测试
- 确保所有现有测试通过
- 使用 Playwright 进行 E2E 测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test tests/your-test.spec.ts
```

## 📋 开发流程

1. **Issue 讨论** - 在开始开发前，先在 Issue 中讨论实现方案
2. **代码开发** - 按照代码规范进行开发
3. **测试验证** - 确保功能正常且测试通过
4. **文档更新** - 更新相关文档
5. **代码审查** - 提交 PR 等待审查
6. **合并发布** - 审查通过后合并到主分支

## 🤝 社区准则

- 保持友善和尊重
- 欢迎新手贡献者
- 提供建设性的反馈
- 遵循项目的技术决策

## 📞 联系方式

如有任何问题，可以通过以下方式联系：

- GitHub Issues
- 邮箱：sube@sube.top

感谢您的贡献！🎉
