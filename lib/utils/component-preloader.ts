"use client"

interface PreloadedComponent {
  component: any
  timestamp: number
  error?: Error
}

interface PreloadOptions {
  maxCacheSize?: number
  cacheExpiry?: number
  retryAttempts?: number
  retryDelay?: number
}

const defaultOptions: PreloadOptions = {
  maxCacheSize: 10,
  cacheExpiry: 10 * 60 * 1000, // 10分钟
  retryAttempts: 2,
  retryDelay: 1000
}

class ComponentPreloader {
  private cache = new Map<string, PreloadedComponent>()
  private loadingPromises = new Map<string, Promise<any>>()
  private options: Required<PreloadOptions>

  constructor(options: PreloadOptions = {}) {
    this.options = { ...defaultOptions, ...options }
  }

  // 预加载组件
  async preloadComponent(
    componentId: string, 
    importFn: () => Promise<any>,
    force = false
  ): Promise<any> {
    // 检查缓存
    if (!force && this.cache.has(componentId)) {
      const cached = this.cache.get(componentId)!
      
      // 检查是否过期
      if (Date.now() - cached.timestamp < this.options.cacheExpiry) {
        return cached.component
      } else {
        this.cache.delete(componentId)
      }
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(componentId)) {
      return this.loadingPromises.get(componentId)
    }

    // 开始加载
    const loadPromise = this.loadWithRetry(componentId, importFn)
    this.loadingPromises.set(componentId, loadPromise)

    try {
      const component = await loadPromise
      
      // 缓存成功加载的组件
      this.cacheComponent(componentId, component)
      
      return component
    } catch (error) {
      // 缓存错误信息
      this.cacheComponent(componentId, null, error as Error)
      throw error
    } finally {
      this.loadingPromises.delete(componentId)
    }
  }

  // 带重试的加载
  private async loadWithRetry(
    componentId: string, 
    importFn: () => Promise<any>
  ): Promise<any> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= this.options.retryAttempts; attempt++) {
      try {
        const startTime = performance.now()
        const component = await importFn()
        const loadTime = performance.now() - startTime
        
        // 在开发环境记录加载时间
        if (process.env.NODE_ENV === 'development') {
          console.log(`组件 ${componentId} 加载耗时: ${loadTime.toFixed(2)}ms (尝试 ${attempt + 1})`)
        }
        
        return component
      } catch (error) {
        lastError = error as Error
        
        // 最后一次尝试失败，直接抛出错误
        if (attempt === this.options.retryAttempts) {
          throw error
        }
        
        // 延迟后重试
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay))
      }
    }
    
    throw lastError
  }

  // 缓存组件
  private cacheComponent(componentId: string, component: any, error?: Error) {
    // 检查缓存大小限制
    if (this.cache.size >= this.options.maxCacheSize) {
      // 删除最旧的缓存项
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(componentId, {
      component,
      timestamp: Date.now(),
      error
    })
  }

  // 获取缓存的组件
  getCachedComponent(componentId: string): any | null {
    const cached = this.cache.get(componentId)
    
    if (!cached) return null
    
    // 检查是否过期
    if (Date.now() - cached.timestamp >= this.options.cacheExpiry) {
      this.cache.delete(componentId)
      return null
    }
    
    return cached.component
  }

  // 检查组件是否已缓存
  isCached(componentId: string): boolean {
    return this.getCachedComponent(componentId) !== null
  }

  // 检查组件是否正在加载
  isLoading(componentId: string): boolean {
    return this.loadingPromises.has(componentId)
  }

  // 预热常用组件
  async warmUpComponents(components: Array<{ id: string; importFn: () => Promise<any> }>) {
    const promises = components.map(({ id, importFn }) => 
      this.preloadComponent(id, importFn).catch(error => {
        console.warn(`预热组件 ${id} 失败:`, error)
        return null
      })
    )

    const results = await Promise.allSettled(promises)
    
    // 统计成功和失败的数量
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`组件预热完成: ${successful} 成功, ${failed} 失败`)
    }

    return { successful, failed }
  }

  // 清理缓存
  clearCache(componentId?: string) {
    if (componentId) {
      this.cache.delete(componentId)
    } else {
      this.cache.clear()
    }
  }

  // 获取缓存统计信息
  getCacheStats() {
    const now = Date.now()
    let validCount = 0
    let expiredCount = 0
    let errorCount = 0

    for (const [_id, cached] of this.cache.entries()) {
      if (cached.error) {
        errorCount++
      } else if (now - cached.timestamp >= this.options.cacheExpiry) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      errors: errorCount,
      loading: this.loadingPromises.size
    }
  }
}

// 创建全局预加载器实例
export const componentPreloader = new ComponentPreloader()

// 页面组件映射
export const pageComponentMap = {
  admin: {
    id: 'admin-dashboard',
    importFn: () => import('@/components/admin/admin-dashboard')
  },
  users: {
    id: 'admin-dashboard', // 复用同一个组件
    importFn: () => import('@/components/admin/admin-dashboard')
  },
  browse: {
    id: 'website-browser',
    importFn: () => import('@/components/browse/website-browser')
  },
  favorites: {
    id: 'favorites-page',
    importFn: () => import('@/components/favorites/favorites-page')
  },
  settings: {
    id: 'system-settings-page',
    importFn: () => import('@/components/settings/system-settings-page')
  }
}

// 便捷的预加载函数
export async function preloadPageComponent(page: string): Promise<any> {
  const componentInfo = pageComponentMap[page as keyof typeof pageComponentMap]
  
  if (!componentInfo) {
    console.warn(`未知页面: ${page}`)
    return null
  }

  try {
    return await componentPreloader.preloadComponent(
      componentInfo.id,
      componentInfo.importFn
    )
  } catch (error) {
    console.error(`预加载页面组件 ${page} 失败:`, error)
    return null
  }
}

// 批量预加载页面组件
export async function preloadPages(pages: string[]): Promise<{
  successful: string[]
  failed: string[]
}> {
  const results = await Promise.allSettled(
    pages.map(page => preloadPageComponent(page))
  )

  const successful: string[] = []
  const failed: string[] = []

  results.forEach((result, index) => {
    const page = pages[index]
    if (result.status === 'fulfilled' && result.value !== null) {
      successful.push(page)
    } else {
      failed.push(page)
    }
  })

  return { successful, failed }
}

// 获取预加载统计信息
export function getPreloadStats() {
  return componentPreloader.getCacheStats()
}

// 清理预加载缓存
export function clearPreloadCache(componentId?: string) {
  componentPreloader.clearCache(componentId)
}

// 检查页面组件是否已预加载
export function isPagePreloaded(page: string): boolean {
  const componentInfo = pageComponentMap[page as keyof typeof pageComponentMap]
  return componentInfo ? componentPreloader.isCached(componentInfo.id) : false
}

// 应用启动时的预热
export async function warmUpApplication() {
  const essentialComponents = [
    pageComponentMap.browse,
    pageComponentMap.admin
  ]

  console.log('开始预热应用组件...')
  
  const result = await componentPreloader.warmUpComponents(essentialComponents)
  
  console.log(`应用预热完成: ${result.successful} 个组件加载成功`)
  
  return result
}
