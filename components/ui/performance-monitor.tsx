"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  totalFetches: number
  freshQueries: number
  totalQueries: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    totalFetches: 0,
    freshQueries: 0,
    totalQueries: 0,
  })
  const [isVisible, setIsVisible] = useState(false)
  const queryClient = useQueryClient()
  const isFetching = useIsFetching()
  const prevFetchStatuses = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    const startTime = performance.now()

    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    }

    const handleRender = () => {
      const renderTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, renderTime }))
    }

    window.addEventListener('load', handleLoad)
    document.addEventListener('DOMContentLoaded', handleRender)

    // 以轮询方式采集指标，避免在他处渲染阶段触发 setState
    const collect = () => {
      try {
        const queries: any[] = queryClient.getQueryCache().findAll()
        const now = Date.now()
        let total = 0
        let fresh = 0
        let totalFetches = 0
        for (const qq of queries) {
          const hasData = qq.state?.data !== undefined
          if (qq.state?.fetchStatus === 'fetching') {
            totalFetches += 1
          }
          if (!hasData) continue
          total += 1
          let staleTime = qq.options?.staleTime
          if (typeof staleTime === 'function') {
            try { staleTime = staleTime() } catch { staleTime = 0 }
          }
          if (staleTime === undefined || staleTime === null) staleTime = 0
          const updatedAt = qq.state?.dataUpdatedAt || 0
          const isFresh = staleTime === Infinity || (now - updatedAt < staleTime)
          if (isFresh) fresh += 1
        }
        setMetrics(prev => ({ ...prev, freshQueries: fresh, totalQueries: total, totalFetches }))
      } catch {}
    }

    collect()
    const interval = setInterval(collect, 2000)

    return () => {
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('DOMContentLoaded', handleRender)
      clearInterval(interval)
    }
  }, [queryClient])

  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  const freshRatio = useMemo(() => {
    return metrics.totalQueries > 0
      ? ((metrics.freshQueries / metrics.totalQueries) * 100).toFixed(1)
      : '0'
  }, [metrics.freshQueries, metrics.totalQueries])

  if (!isVisible) return null

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
          活跃请求: {isFetching}
        </Badge>
        <Badge variant="outline" className="text-white border-white/30">
          累计网络请求: {metrics.totalFetches}
        </Badge>
        <Badge variant="outline" className="text-white border-white/30">
          新鲜度: {freshRatio}% ({metrics.freshQueries}/{metrics.totalQueries})
        </Badge>
      </div>
    </div>
  )
}
