"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface PageTransitionState {
  isTransitioning: boolean
  fromPage: string | null
  toPage: string | null
  transitionStartTime: number | null
  error: Error | null
}

interface TransitionOptions {
  minTransitionTime?: number // 最小过渡时间，确保用户能看到反馈
  maxTransitionTime?: number // 最大过渡时间，防止无限加载
  debounceTime?: number // 防抖时间，避免快速连续切换
}

const defaultOptions: TransitionOptions = {
  minTransitionTime: 100,
  maxTransitionTime: 3000,
  debounceTime: 100
}

export function usePageTransition(currentPage: string, options: TransitionOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  const [state, setState] = useState<PageTransitionState>({
    isTransitioning: false,
    fromPage: null,
    toPage: null,
    transitionStartTime: null,
    error: null
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const debounceRef = useRef<NodeJS.Timeout>()
  const previousPageRef = useRef<string>(currentPage)

  // 开始过渡
  const startTransition = useCallback((toPage: string) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // 防抖处理
    debounceRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isTransitioning: true,
        fromPage: previousPageRef.current,
        toPage,
        transitionStartTime: Date.now(),
        error: null
      }))

      // 设置最大过渡时间
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isTransitioning: false,
          error: new Error(`页面切换超时: ${toPage}`)
        }))
      }, opts.maxTransitionTime)
    }, opts.debounceTime)
  }, [opts.debounceTime, opts.maxTransitionTime])

  // 完成过渡
  const completeTransition = useCallback(() => {
    const now = Date.now()
    const elapsed = state.transitionStartTime ? now - state.transitionStartTime : 0
    const remainingTime = Math.max(0, opts.minTransitionTime! - elapsed)

    // 确保最小过渡时间
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isTransitioning: false,
        fromPage: null,
        toPage: null,
        transitionStartTime: null,
        error: null
      }))

      // 清除定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }, remainingTime)
  }, [state.transitionStartTime, opts.minTransitionTime])

  // 设置错误状态
  const setTransitionError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isTransitioning: false,
      error
    }))
  }, [])

  // 监听页面变化
  useEffect(() => {
    if (currentPage !== previousPageRef.current) {
      startTransition(currentPage)
      previousPageRef.current = currentPage
    }
  }, [currentPage, startTransition])

  // 自动完成过渡（当组件实际渲染完成时）
  useEffect(() => {
    if (state.isTransitioning && state.toPage === currentPage) {
      // 延迟一帧确保渲染完成
      const rafId = requestAnimationFrame(() => {
        completeTransition()
      })

      return () => cancelAnimationFrame(rafId)
    }
  }, [state.isTransitioning, state.toPage, currentPage, completeTransition])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // 计算过渡进度
  const progress = state.transitionStartTime 
    ? Math.min(100, ((Date.now() - state.transitionStartTime) / opts.maxTransitionTime!) * 100)
    : 0

  return {
    isTransitioning: state.isTransitioning,
    fromPage: state.fromPage,
    toPage: state.toPage,
    error: state.error,
    progress,
    
    // 手动控制方法
    startTransition,
    completeTransition,
    setTransitionError,

    // 状态查询方法
    getTransitionDuration: () => state.transitionStartTime 
      ? Date.now() - state.transitionStartTime 
      : 0,
    
    isTransitioningTo: (page: string) => state.isTransitioning && state.toPage === page,
    isTransitioningFrom: (page: string) => state.isTransitioning && state.fromPage === page
  }
}

// 全局页面切换状态（如果需要跨组件共享）
let globalTransitionState: PageTransitionState = {
  isTransitioning: false,
  fromPage: null,
  toPage: null,
  transitionStartTime: null,
  error: null
}

const globalStateListeners = new Set<(state: PageTransitionState) => void>()

export function useGlobalPageTransition() {
  const [state, setState] = useState(globalTransitionState)

  useEffect(() => {
    const listener = (newState: PageTransitionState) => setState(newState)
    globalStateListeners.add(listener)

    return () => {
      globalStateListeners.delete(listener)
    }
  }, [])

  const updateGlobalState = useCallback((updates: Partial<PageTransitionState>) => {
    globalTransitionState = { ...globalTransitionState, ...updates }
    globalStateListeners.forEach(listener => listener(globalTransitionState))
  }, [])

  return {
    ...state,
    updateGlobalState
  }
}

// 性能统计Hook
export function useTransitionPerformance() {
  const performanceDataRef = useRef<Array<{
    fromPage: string
    toPage: string
    duration: number
    timestamp: number
  }>>([])

  const recordTransition = useCallback((fromPage: string, toPage: string, duration: number) => {
    performanceDataRef.current.push({
      fromPage,
      toPage,
      duration,
      timestamp: Date.now()
    })

    // 只保留最近50条记录
    if (performanceDataRef.current.length > 50) {
      performanceDataRef.current.shift()
    }

    // 开发环境下记录性能数据
    if (process.env.NODE_ENV === 'development') {
      console.log(`页面切换 ${fromPage} → ${toPage}: ${duration}ms`)
    }
  }, [])

  const getAverageTransitionTime = useCallback((fromPage?: string, toPage?: string) => {
    let records = performanceDataRef.current

    if (fromPage || toPage) {
      records = records.filter(record => 
        (!fromPage || record.fromPage === fromPage) &&
        (!toPage || record.toPage === toPage)
      )
    }

    if (records.length === 0) return 0

    return records.reduce((sum, record) => sum + record.duration, 0) / records.length
  }, [])

  const getPerformanceReport = useCallback(() => {
    const records = performanceDataRef.current
    if (records.length === 0) return null

    const avgDuration = records.reduce((sum, r) => sum + r.duration, 0) / records.length
    const minDuration = Math.min(...records.map(r => r.duration))
    const maxDuration = Math.max(...records.map(r => r.duration))

    // 统计各页面切换性能
    const pageStats: Record<string, { count: number; avgDuration: number }> = {}
    records.forEach(record => {
      const key = `${record.fromPage} → ${record.toPage}`
      if (!pageStats[key]) {
        pageStats[key] = { count: 0, avgDuration: 0 }
      }
      pageStats[key].count++
      pageStats[key].avgDuration = (pageStats[key].avgDuration * (pageStats[key].count - 1) + record.duration) / pageStats[key].count
    })

    return {
      totalRecords: records.length,
      avgDuration: Math.round(avgDuration),
      minDuration,
      maxDuration,
      pageStats
    }
  }, [])

  return {
    recordTransition,
    getAverageTransitionTime,
    getPerformanceReport
  }
}
