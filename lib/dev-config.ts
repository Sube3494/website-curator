/**
 * 开发环境配置
 * 用于控制开发时的行为，减少不必要的网络请求和错误
 */

export const DEV_CONFIG = {
  // 是否在开发环境禁用favicon获取
  DISABLE_FAVICON_IN_DEV: process.env.NODE_ENV === 'development' && process.env.DISABLE_FAVICON === 'true',
  
  // 是否显示详细的网络错误日志
  SHOW_NETWORK_ERRORS: process.env.NODE_ENV === 'development' && process.env.SHOW_NETWORK_ERRORS === 'true',
  
  // 是否使用模拟的favicon
  USE_MOCK_FAVICON: process.env.NODE_ENV === 'development' && process.env.USE_MOCK_FAVICON === 'true',
  
  // 模拟favicon的延迟时间（毫秒）
  MOCK_FAVICON_DELAY: parseInt(process.env.MOCK_FAVICON_DELAY || '0'),
  
  // 是否在控制台显示性能警告
  SHOW_PERFORMANCE_WARNINGS: process.env.NODE_ENV === 'development',
}

/**
 * 获取模拟的favicon URL
 */
export function getMockFaviconUrl(originalUrl: string): string {
  // 使用一个简单的占位符服务
  const domain = extractDomain(originalUrl)
  return `https://via.placeholder.com/32x32/6366f1/ffffff?text=${domain.charAt(0).toUpperCase()}`
}

/**
 * 从URL提取域名
 */
function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0]
  }
}

/**
 * 开发环境日志工具
 */
export const devLog = {
  warn: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.SHOW_PERFORMANCE_WARNINGS) {
      console.warn(`[DEV] ${message}`, ...args)
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.SHOW_NETWORK_ERRORS) {
      console.error(`[DEV] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[DEV] ${message}`, ...args)
    }
  }
}

/**
 * 检查是否应该跳过favicon获取
 */
export function shouldSkipFavicon(): boolean {
  return DEV_CONFIG.DISABLE_FAVICON_IN_DEV
}

/**
 * 获取favicon URL（开发环境优化版本）
 */
export function getOptimizedFaviconUrl(originalUrl: string): string | null {
  if (DEV_CONFIG.DISABLE_FAVICON_IN_DEV) {
    return null
  }
  
  if (DEV_CONFIG.USE_MOCK_FAVICON) {
    return getMockFaviconUrl(originalUrl)
  }
  
  return originalUrl
}
