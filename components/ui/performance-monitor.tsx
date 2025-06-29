"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  cacheHits: number
  totalRequests: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHits: 0,
    totalRequests: 0,
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const startTime = performance.now()
    
    // 监听页面加载完成
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    }

    // 监听渲染完成
    const handleRender = () => {
      const renderTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, renderTime }))
    }

    // 模拟缓存命中统计（在实际应用中，这些数据应该来自 React Query）
    const updateCacheStats = () => {
      // 这里可以集成 React Query 的缓存统计
      setMetrics(prev => ({
        ...prev,
        cacheHits: prev.cacheHits + Math.floor(Math.random() * 3),
        totalRequests: prev.totalRequests + 1,
      }))
    }

    window.addEventListener('load', handleLoad)
    document.addEventListener('DOMContentLoaded', handleRender)
    
    // 定期更新缓存统计
    const interval = setInterval(updateCacheStats, 2000)

    return () => {
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('DOMContentLoaded', handleRender)
      clearInterval(interval)
    }
  }, [])

  // 开发环境下显示性能监控
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  if (!isVisible) return null

  const cacheHitRate = metrics.totalRequests > 0 
    ? ((metrics.cacheHits / metrics.totalRequests) * 100).toFixed(1)
    : '0'

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs space-y-1 backdrop-blur-sm">
      <div className="font-semibold text-green-400">性能监控</div>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="text-white border-white/30">
          加载: {metrics.loadTime.toFixed(0)}ms
        </Badge>
        <Badge variant="outline" className="text-white border-white/30">
          渲染: {metrics.renderTime.toFixed(0)}ms
        </Badge>
        <Badge variant="outline" className="text-white border-white/30">
          缓存命中率: {cacheHitRate}%
        </Badge>
      </div>
      <div className="text-gray-400 text-xs">
        请求: {metrics.totalRequests} | 缓存: {metrics.cacheHits}
      </div>
    </div>
  )
}
