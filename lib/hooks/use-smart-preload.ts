"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/db-client'
import { websiteKeys } from '@/lib/hooks/use-websites'

interface PreloadConfig {
  enabled?: boolean
  preloadDelay?: number
  maxPreloadItems?: number
  userBehaviorTracking?: boolean
}

interface UserBehavior {
  lastVisitedPages: string[]
  pageTransitionTimes: Record<string, number>
  frequentTransitions: Record<string, string[]>
}

const defaultConfig: PreloadConfig = {
  enabled: true,
  preloadDelay: 500,
  maxPreloadItems: 3,
  userBehaviorTracking: true
}

// 页面间的预测映射
const pagePredictionMap: Record<string, string[]> = {
  browse: ['favorites', 'admin', 'submit'],
  favorites: ['browse', 'profile'],
  admin: ['browse', 'users', 'analytics'],
  users: ['admin', 'browse'],
  profile: ['favorites', 'settings', 'browse'],
  settings: ['profile', 'browse'],
  analytics: ['admin', 'browse']
}

// 数据预取策略映射
const dataPreloadMap: Record<string, () => Promise<any>[]> = {
  browse: () => [
    db.getApprovedWebsites(),
    db.getCategories()
  ],
  favorites: () => [
    db.getApprovedWebsites(),
    db.getCategories()
  ],
  admin: () => [
    db.getWebsites(),
    db.getCategoriesWithUsageCount(),
    db.getAllUsers?.() || Promise.resolve([])
  ],
  users: () => [
    db.getAllUsers?.() || Promise.resolve([]),
    db.getWebsites()
  ]
}

// 用户行为存储
class UserBehaviorTracker {
  private storageKey = 'website-curator-user-behavior'
  private maxHistorySize = 10

  getBehavior(): UserBehavior {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {
        lastVisitedPages: [],
        pageTransitionTimes: {},
        frequentTransitions: {}
      }
    } catch {
      return {
        lastVisitedPages: [],
        pageTransitionTimes: {},
        frequentTransitions: {}
      }
    }
  }

  trackPageVisit(page: string, transitionTime?: number) {
    try {
      const behavior = this.getBehavior()
      
      // 更新最近访问页面
      behavior.lastVisitedPages = [
        page,
        ...behavior.lastVisitedPages.filter(p => p !== page)
      ].slice(0, this.maxHistorySize)

      // 记录页面切换时间
      if (transitionTime) {
        behavior.pageTransitionTimes[page] = transitionTime
      }

      // 分析频繁的页面切换模式
      if (behavior.lastVisitedPages.length >= 2) {
        const fromPage = behavior.lastVisitedPages[1]
        const toPage = behavior.lastVisitedPages[0]
        
        if (!behavior.frequentTransitions[fromPage]) {
          behavior.frequentTransitions[fromPage] = []
        }
        
        behavior.frequentTransitions[fromPage] = [
          toPage,
          ...behavior.frequentTransitions[fromPage].filter(p => p !== toPage)
        ].slice(0, 3)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(behavior))
    } catch (error) {
      console.warn('无法保存用户行为数据:', error)
    }
  }

  getPredictedNextPages(currentPage: string): string[] {
    const behavior = this.getBehavior()
    const fromBehavior = behavior.frequentTransitions[currentPage] || []
    const fromDefault = pagePredictionMap[currentPage] || []
    
    // 优先使用用户行为数据，然后是默认预测
    return [...new Set([...fromBehavior, ...fromDefault])]
  }
}

const behaviorTracker = new UserBehaviorTracker()

export function useSmartPreload(currentPage: string, config: PreloadConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config }
  const queryClient = useQueryClient()
  const preloadTimerRef = useRef<NodeJS.Timeout>()
  const visitStartTimeRef = useRef<number>(Date.now())

  // 预加载数据
  const preloadData = useCallback(async (page: string) => {
    const preloadFunctions = dataPreloadMap[page]
    if (!preloadFunctions) return

    try {
      const promises = preloadFunctions()
      
      // 为不同类型的数据使用不同的查询键和配置
      for (const [index, promise] of promises.entries()) {
        let queryKey: any[]
        let staleTime = 5 * 60 * 1000 // 默认5分钟

        // 根据页面和数据类型确定查询键
        if (page === 'browse' || page === 'favorites') {
          queryKey = index === 0 ? websiteKeys.approved() : websiteKeys.categories()
        } else if (page === 'admin' || page === 'users') {
          if (index === 0) {
            queryKey = websiteKeys.allWebsites()
          } else if (index === 1) {
            queryKey = websiteKeys.categoriesWithUsage()
          } else {
            queryKey = ['users', 'all'] // 注意：这里应该使用 userKeys.allUsers() 来保持一致性
            staleTime = 2 * 60 * 1000 // 用户数据更短的缓存时间
          }
        } else {
          continue
        }

        // 使用prefetchQuery进行预取
        queryClient.prefetchQuery({
          queryKey,
          queryFn: () => promise,
          staleTime,
          // 预取的数据在后台静默进行，不影响UI
          meta: { preloaded: true }
        })
      }
    } catch (error) {
      console.warn(`预加载 ${page} 数据失败:`, error)
    }
  }, [queryClient])

  // 预加载组件（通过动态import）
  const preloadComponent = useCallback(async (page: string) => {
    try {
      switch (page) {
        case 'admin':
        case 'users':
          await import('@/components/admin/admin-dashboard')
          break
        case 'browse':
          await import('@/components/browse/website-browser')
          break
        case 'favorites':
          await import('@/components/favorites/favorites-page')
          break
        case 'settings':
          await import('@/components/settings/system-settings-page')
          break
        default:
          break
      }
    } catch (error) {
      console.warn(`预加载 ${page} 组件失败:`, error)
    }
  }, [])

  // 智能预加载逻辑
  const performSmartPreload = useCallback(() => {
    if (!finalConfig.enabled) return

    const predictedPages = finalConfig.userBehaviorTracking
      ? behaviorTracker.getPredictedNextPages(currentPage)
      : pagePredictionMap[currentPage] || []

    // 限制预加载数量，避免过度消耗资源
    const pagesToPreload = predictedPages.slice(0, finalConfig.maxPreloadItems)

    pagesToPreload.forEach((page, index) => {
      // 为不同页面设置不同的延迟，优先级越高延迟越短
      const delay = finalConfig.preloadDelay! + (index * 200)
      
      setTimeout(() => {
        preloadData(page)
        preloadComponent(page)
      }, delay)
    })
  }, [currentPage, finalConfig, preloadData, preloadComponent])

  // 跟踪页面访问
  useEffect(() => {
    visitStartTimeRef.current = Date.now()

    if (finalConfig.userBehaviorTracking) {
      behaviorTracker.trackPageVisit(currentPage)
    }

    return () => {
      // 记录页面停留时间
      const stayDuration = Date.now() - visitStartTimeRef.current
      if (finalConfig.userBehaviorTracking && stayDuration > 1000) {
        behaviorTracker.trackPageVisit(currentPage, stayDuration)
      }
    }
  }, [currentPage, finalConfig.userBehaviorTracking])

  // 执行智能预加载
  useEffect(() => {
    // 清除之前的计时器
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current)
    }

    // 延迟执行预加载，确保当前页面加载完成
    preloadTimerRef.current = setTimeout(() => {
      performSmartPreload()
    }, finalConfig.preloadDelay)

    return () => {
      if (preloadTimerRef.current) {
        clearTimeout(preloadTimerRef.current)
      }
    }
  }, [performSmartPreload, finalConfig.preloadDelay])

  // 返回预加载控制函数
  return {
    preloadPage: useCallback((page: string) => {
      preloadData(page)
      preloadComponent(page)
    }, [preloadData, preloadComponent]),
    
    clearPreloadCache: useCallback(() => {
      // 清除预加载的查询缓存
      queryClient.removeQueries({
        predicate: (query) => query.meta?.preloaded === true
      })
    }, [queryClient]),

    getBehaviorData: () => finalConfig.userBehaviorTracking 
      ? behaviorTracker.getBehavior() 
      : null
  }
}

// 性能监控Hook
export function usePreloadPerformance() {
  const performanceDataRef = useRef<Record<string, number>>({})

  const measurePreloadTime = useCallback((page: string, startTime: number) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    performanceDataRef.current[page] = duration
    
    // 在开发环境下记录性能数据
    if (process.env.NODE_ENV === 'development') {
      console.log(`预加载 ${page} 耗时: ${duration.toFixed(2)}ms`)
    }
  }, [])

  const getPerformanceData = useCallback(() => {
    return { ...performanceDataRef.current }
  }, [])

  return { measurePreloadTime, getPerformanceData }
}
