/**
 * 网站图标获取服务
 * 基于VitePress项目的简单可靠方案
 */

/**
 * VitePress风格的图标获取函数（学习自您的VitePress项目）
 * 这是最简单可靠的方案
 */
export function getVitePressStyleFavicon(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
    // 关键：使用 domain_url 参数而不是 domain
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${url.origin}`
  } catch (error) {
    console.error('Invalid URL:', websiteUrl, error)
    return generateFallbackIcon(websiteUrl)
  }
}

/**
 * 生成备用图标（基于域名首字母）
 */
export function generateFallbackIcon(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
    const domain = url.hostname
    const firstLetter = domain.charAt(0).toUpperCase()

    // 使用不同的颜色方案
    const colors = [
      { bg: '6366f1', text: 'ffffff' }, // 蓝色
      { bg: 'ef4444', text: 'ffffff' }, // 红色
      { bg: '10b981', text: 'ffffff' }, // 绿色
      { bg: 'f59e0b', text: 'ffffff' }, // 黄色
      { bg: '8b5cf6', text: 'ffffff' }, // 紫色
      { bg: 'ec4899', text: 'ffffff' }, // 粉色
    ]

    // 根据域名选择颜色
    const colorIndex = domain.length % colors.length
    const color = colors[colorIndex]

    return `https://via.placeholder.com/64x64/${color.bg}/${color.text}?text=${firstLetter}`
  } catch {
    // 如果URL解析失败，使用默认图标
    return `https://via.placeholder.com/64x64/6366f1/ffffff?text=W`
  }
}