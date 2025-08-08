'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUiPreferences } from '@/lib/ui-preferences'
import { AdminDashboardSkeletonQuick } from '@/components/ui/skeletons/AdminDashboardSkeleton'
import { WebsiteBrowserSkeletonQuick } from '@/components/ui/skeletons/WebsiteBrowserSkeleton'
import { FavoritesPageSkeletonQuick } from '@/components/ui/skeletons/FavoritesPageSkeleton'

interface PageTransitionProps {
  children: React.ReactNode
  routeKey: string
  transitionType?: 'fade' | 'slide' | 'scale'
  showSkeleton?: boolean
  skeletonDelay?: number
}

// 过渡效果配置
const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
  }
}

// 骨架屏映射
const skeletonMap: Record<string, React.ComponentType> = {
  admin: AdminDashboardSkeletonQuick,
  users: AdminDashboardSkeletonQuick,
  browse: WebsiteBrowserSkeletonQuick,
  favorites: FavoritesPageSkeletonQuick,
  // 其他页面使用通用骨架屏
  profile: () => <div className="min-h-screen animate-pulse bg-muted/10" />,
  settings: () => <div className="min-h-screen animate-pulse bg-muted/10" />,
  analytics: () => <div className="min-h-screen animate-pulse bg-muted/10" />
}

export function PageTransition({ 
  children, 
  routeKey, 
  transitionType = 'fade',
  showSkeleton = true,
  skeletonDelay = 100
}: PageTransitionProps) {
  const { motionEnabled, motionLevel } = useUiPreferences()
  const [showSkeletonState, setShowSkeletonState] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 动态调整动画时长
  const duration = motionLevel === 'high' ? 0.25 : motionLevel === 'low' ? 0.15 : 0.2
  
  // 获取过渡效果
  const variants = transitionVariants[transitionType] || transitionVariants.fade

  // 骨架屏显示逻辑
  useEffect(() => {
    if (!showSkeleton) return

    const skeletonTimer: NodeJS.Timeout = setTimeout(() => {
      setShowSkeletonState(true)
    }, skeletonDelay)

    // 自动隐藏骨架屏
    const hideTimer: NodeJS.Timeout = setTimeout(() => {
      setShowSkeletonState(false)
      setIsTransitioning(false)
    }, skeletonDelay + duration * 1000 + 50) // 略微延长确保内容准备好

    return () => {
      clearTimeout(skeletonTimer)
      clearTimeout(hideTimer)
      setShowSkeletonState(false)
      setIsTransitioning(false)
    }
  }, [routeKey, showSkeleton, skeletonDelay, duration])

  // 禁用动画时直接返回内容
  if (!motionEnabled) {
    if (showSkeletonState && showSkeleton) {
      const SkeletonComponent = skeletonMap[routeKey]
      return SkeletonComponent ? <SkeletonComponent /> : <>{children}</>
    }
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setIsTransitioning(false)}>
      <motion.div
        key={routeKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ 
          duration, 
          ease: 'easeOut',
          // 为高性能设备提供更平滑的缓动
          ...(motionLevel === 'high' && {
            type: 'spring',
            stiffness: 300,
            damping: 30
          })
        }}
        style={{
          // 启用硬件加速
          willChange: 'opacity, transform',
          // 防止布局抖动
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
        onAnimationStart={() => setIsTransitioning(true)}
        onAnimationComplete={() => {
          setIsTransitioning(false)
          setShowSkeletonState(false)
        }}
      >
        {/* 骨架屏显示逻辑 */}
        {showSkeletonState && showSkeleton ? (() => {
          const SkeletonComponent = skeletonMap[routeKey]
          return SkeletonComponent ? <SkeletonComponent /> : children
        })() : children}
      </motion.div>
    </AnimatePresence>
  )
}

// 预设的页面过渡配置
export const pageTransitionPresets = {
  // 标准页面切换
  standard: {
    transitionType: 'fade' as const,
    showSkeleton: true,
    skeletonDelay: 100
  },
  // 快速切换（用于频繁切换的场景）
  quick: {
    transitionType: 'fade' as const,
    showSkeleton: true,
    skeletonDelay: 50
  },
  // 滑动效果（用于导航感强的场景）
  slide: {
    transitionType: 'slide' as const,
    showSkeleton: true,
    skeletonDelay: 80
  },
  // 无骨架屏（用于轻量页面）
  minimal: {
    transitionType: 'fade' as const,
    showSkeleton: false,
    skeletonDelay: 0
  }
}


