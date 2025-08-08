"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlobalLoadingIndicatorProps {
  isLoading: boolean
  loadingText?: string
  showProgress?: boolean
  progress?: number
  variant?: 'bar' | 'spinner' | 'dots'
  position?: 'top' | 'center'
  delay?: number
}

export function GlobalLoadingIndicator({
  isLoading,
  loadingText,
  showProgress = false,
  progress = 0,
  variant = 'bar',
  position = 'top',
  delay = 100
}: GlobalLoadingIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)

  // 延迟显示，避免快速切换时的闪烁
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isLoading) {
      timer = setTimeout(() => setShowIndicator(true), delay)
    } else {
      setShowIndicator(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isLoading, delay])

  if (variant === 'bar' && position === 'top') {
    return (
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left"
            style={{
              transformOrigin: 'left center'
            }}
          >
            {/* 进度条动画效果 */}
            <motion.div
              className="h-full w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* 如果有具体进度，显示进度条 */}
            {showProgress && (
              <motion.div
                className="absolute top-0 left-0 h-full bg-white/30"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (variant === 'spinner') {
    return (
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 flex items-center justify-center",
              position === 'center' 
                ? "inset-0 bg-black/20 backdrop-blur-sm" 
                : "top-4 right-4"
            )}
          >
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              {loadingText && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {loadingText}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (variant === 'dots') {
    return (
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50",
              position === 'center' 
                ? "inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm" 
                : "top-4 right-4"
            )}
          >
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                ))}
              </div>
              {loadingText && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {loadingText}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return null
}

// 页面切换指示器（简化版，专用于页面过渡）
export function PageTransitionIndicator({ isLoading }: { isLoading: boolean }) {
  return (
    <GlobalLoadingIndicator
      isLoading={isLoading}
      variant="bar"
      position="top"
      delay={50} // 更短的延迟用于页面切换
    />
  )
}

// 带文字的加载指示器
export function LoadingWithText({ 
  isLoading, 
  text = "加载中...",
  variant = 'spinner'
}: {
  isLoading: boolean
  text?: string
  variant?: 'spinner' | 'dots'
}) {
  return (
    <GlobalLoadingIndicator
      isLoading={isLoading}
      loadingText={text}
      variant={variant}
      position="center"
      delay={200}
    />
  )
}

// 进度条指示器
export function ProgressIndicator({ 
  isLoading, 
  progress, 
  text 
}: {
  isLoading: boolean
  progress: number
  text?: string
}) {
  return (
    <GlobalLoadingIndicator
      isLoading={isLoading}
      loadingText={text}
      showProgress={true}
      progress={progress}
      variant="bar"
      position="top"
      delay={0}
    />
  )
}
