# Public 静态资源目录

这个目录包含了网站的静态资源文件。

## 文件说明

### 图标和 Logo
- `favicon.svg` - 网站图标（SVG 格式，现代浏览器支持）
- `favicon.ico` - 网站图标（ICO 格式，兼容性更好）
- `logo.svg` - 网站 Logo
- `icon-192.png` - PWA 应用图标 (192x192)
- `icon-512.png` - PWA 应用图标 (512x512)

### 默认图片
- `default-avatar.svg` - 用户默认头像
- `default-website-icon.svg` - 网站默认图标（当网站没有 favicon 时使用）

### 配置文件
- `manifest.json` - PWA 应用清单文件
- `robots.txt` - 搜索引擎爬虫规则
- `sitemap.xml` - 网站地图

## 使用方法

在 Next.js 中，这些文件可以通过根路径直接访问：

```jsx
// 使用 Logo
<img src="/logo.svg" alt="Website Curator" />

// 使用默认头像
<img src="/default-avatar.svg" alt="User Avatar" />

// 使用默认网站图标
<img src="/default-website-icon.svg" alt="Website" />
```

## 注意事项

- PNG 图标文件目前是空文件，需要使用图像编辑工具创建实际的图标
- 部署时记得更新 `sitemap.xml` 和 `robots.txt` 中的域名
- 可以根据需要添加更多静态资源文件
