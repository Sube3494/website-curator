"use client"

interface DeviceCapabilities {
  isLowEnd: boolean
  supportsWillChange: boolean
  supportsTransform3d: boolean
  hasReducedMotion: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
}

interface OptimizedTransitionConfig {
  duration: number
  easing: string
  useTransform3d: boolean
  useWillChange: boolean
  enableGPUAcceleration: boolean
  respectReducedMotion: boolean
}

class TransitionOptimizer {
  private deviceCapabilities: DeviceCapabilities
  private performanceData: Map<string, number[]> = new Map()

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities()
  }

  // 检测设备能力
  private detectDeviceCapabilities(): DeviceCapabilities {
    const capabilities: DeviceCapabilities = {
      isLowEnd: false,
      supportsWillChange: false,
      supportsTransform3d: false,
      hasReducedMotion: false
    }

    // 检查是否在浏览器环境中
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      // 服务器端渲染时的默认值
      return capabilities
    }

    // 检测设备内存
    if ('deviceMemory' in navigator) {
      capabilities.deviceMemory = (navigator as any).deviceMemory
      capabilities.isLowEnd = capabilities.deviceMemory <= 4
    }

    // 检测CPU核心数
    if ('hardwareConcurrency' in navigator) {
      capabilities.hardwareConcurrency = navigator.hardwareConcurrency
      capabilities.isLowEnd = capabilities.isLowEnd || navigator.hardwareConcurrency <= 2
    }

    // 检测CSS特性支持
    if (typeof CSS !== 'undefined') {
      capabilities.supportsWillChange = CSS.supports('will-change', 'transform')
      capabilities.supportsTransform3d = CSS.supports('transform', 'translate3d(0,0,0)')
    }

    // 检测用户偏好设置
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      capabilities.hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    // 如果没有现代特性支持，认为是低端设备
    if (!capabilities.supportsWillChange || !capabilities.supportsTransform3d) {
      capabilities.isLowEnd = true
    }

    return capabilities
  }

  // 根据设备能力优化过渡配置
  optimizeTransitionConfig(
    baseConfig: Partial<OptimizedTransitionConfig> = {}
  ): OptimizedTransitionConfig {
    const defaultConfig: OptimizedTransitionConfig = {
      duration: 0.2,
      easing: 'ease-out',
      useTransform3d: true,
      useWillChange: true,
      enableGPUAcceleration: true,
      respectReducedMotion: true
    }

    const config = { ...defaultConfig, ...baseConfig }

    // 根据设备能力调整配置
    if (this.deviceCapabilities.isLowEnd) {
      config.duration = Math.max(config.duration * 0.7, 0.1) // 缩短动画时长
      config.useTransform3d = false
      config.enableGPUAcceleration = false
    }

    if (!this.deviceCapabilities.supportsWillChange) {
      config.useWillChange = false
    }

    if (!this.deviceCapabilities.supportsTransform3d) {
      config.useTransform3d = false
      config.enableGPUAcceleration = false
    }

    if (this.deviceCapabilities.hasReducedMotion && config.respectReducedMotion) {
      config.duration = 0.01 // 几乎瞬时完成
      config.enableGPUAcceleration = false
    }

    return config
  }

  // 生成优化的CSS样式
  generateOptimizedStyles(config: OptimizedTransitionConfig): React.CSSProperties {
    const styles: React.CSSProperties = {}

    // 基础过渡属性
    styles.transition = `opacity ${config.duration}s ${config.easing}`

    // 性能优化属性
    if (config.useWillChange) {
      styles.willChange = 'opacity, transform'
    }

    if (config.enableGPUAcceleration) {
      styles.backfaceVisibility = 'hidden'
      styles.perspective = 1000
    }

    if (config.useTransform3d) {
      styles.transform = 'translate3d(0, 0, 0)'
    }

    return styles
  }

  // 记录过渡性能数据
  recordTransitionPerformance(transitionType: string, startTime: number, endTime: number) {
    const duration = endTime - startTime
    
    if (!this.performanceData.has(transitionType)) {
      this.performanceData.set(transitionType, [])
    }

    const records = this.performanceData.get(transitionType)!
    records.push(duration)

    // 保持最近20条记录
    if (records.length > 20) {
      records.shift()
    }

    // 在开发环境记录性能数据
    if (process.env.NODE_ENV === 'development') {
      const avg = records.reduce((a, b) => a + b, 0) / records.length
      console.log(`过渡 ${transitionType} 性能: ${duration.toFixed(2)}ms (平均: ${avg.toFixed(2)}ms)`)
    }
  }

  // 获取性能统计
  getPerformanceStats(transitionType?: string) {
    if (transitionType) {
      const records = this.performanceData.get(transitionType) || []
      if (records.length === 0) return null

      const avg = records.reduce((a, b) => a + b, 0) / records.length
      const min = Math.min(...records)
      const max = Math.max(...records)

      return { avg, min, max, count: records.length }
    }

    // 返回所有过渡类型的统计
    const stats: Record<string, any> = {}
    for (const [type, records] of this.performanceData.entries()) {
      if (records.length > 0) {
        const avg = records.reduce((a, b) => a + b, 0) / records.length
        const min = Math.min(...records)
        const max = Math.max(...records)
        stats[type] = { avg, min, max, count: records.length }
      }
    }

    return stats
  }

  // 动态调整配置
  adaptiveOptimization(transitionType: string): OptimizedTransitionConfig {
    const stats = this.getPerformanceStats(transitionType)
    const config = this.optimizeTransitionConfig()

    // 如果过渡性能较差，进一步优化
    if (stats && stats.avg > 100) { // 如果平均耗时超过100ms
      config.duration *= 0.8 // 缩短20%的时长
      config.enableGPUAcceleration = false // 禁用GPU加速
      
      if (stats.avg > 200) { // 如果严重性能问题
        config.duration *= 0.5 // 进一步缩短
        config.useWillChange = false
      }
    }

    return config
  }

  // 获取设备能力信息
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities }
  }

  // 清理性能数据
  clearPerformanceData(transitionType?: string) {
    if (transitionType) {
      this.performanceData.delete(transitionType)
    } else {
      this.performanceData.clear()
    }
  }
}

// 全局优化器实例
export const transitionOptimizer = new TransitionOptimizer()

// Framer Motion 变体生成器
export function createOptimizedVariants(transitionType: 'fade' | 'slide' | 'scale' = 'fade') {
  const config = transitionOptimizer.optimizeTransitionConfig()
  
  const baseTransition = {
    duration: config.duration,
    ease: config.easing as any
  }

  // 为高性能设备添加弹簧动画
  const springTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    duration: config.duration
  }

  const transition = !transitionOptimizer.getDeviceCapabilities().isLowEnd && config.enableGPUAcceleration
    ? springTransition
    : baseTransition

  switch (transitionType) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition
      }
    case 'slide':
      return {
        initial: { opacity: 0, x: config.useTransform3d ? 20 : 0 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: config.useTransform3d ? -20 : 0 },
        transition
      }
    case 'scale':
      return {
        initial: { opacity: 0, scale: config.useTransform3d ? 0.95 : 1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: config.useTransform3d ? 1.05 : 1 },
        transition
      }
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition
      }
  }
}

// 性能监控装饰器
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  transitionType: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()
    
    try {
      const result = fn(...args)
      
      // 如果是Promise，等待完成后记录
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const endTime = performance.now()
          transitionOptimizer.recordTransitionPerformance(transitionType, startTime, endTime)
        })
      } else {
        const endTime = performance.now()
        transitionOptimizer.recordTransitionPerformance(transitionType, startTime, endTime)
        return result
      }
    } catch (error) {
      const endTime = performance.now()
      transitionOptimizer.recordTransitionPerformance(transitionType, startTime, endTime)
      throw error
    }
  }) as T
}

// 获取优化建议
export function getOptimizationRecommendations(): string[] {
  const capabilities = transitionOptimizer.getDeviceCapabilities()
  const recommendations: string[] = []

  if (capabilities.isLowEnd) {
    recommendations.push('检测到低端设备，建议使用简化的过渡效果')
  }

  if (capabilities.hasReducedMotion) {
    recommendations.push('用户偏好减少动画，建议最小化动效')
  }

  if (!capabilities.supportsTransform3d) {
    recommendations.push('设备不支持3D变换，建议使用2D动画')
  }

  const stats = transitionOptimizer.getPerformanceStats()
  for (const [type, data] of Object.entries(stats)) {
    if (data.avg > 100) {
      recommendations.push(`${type} 过渡性能较差 (${data.avg.toFixed(2)}ms)，建议优化`)
    }
  }

  return recommendations
}

// 导出类型定义
export type { DeviceCapabilities, OptimizedTransitionConfig }
