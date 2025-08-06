"use client"

import { useState, useRef, useEffect } from "react"
import { Globe } from "lucide-react"
import { shouldSkipFavicon, getOptimizedFaviconUrl, devLog } from "@/lib/dev-config"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
  onError?: () => void
  isFavicon?: boolean
}

export function LazyImage({
  src,
  alt,
  className,
  fallback,
  onError,
  isFavicon = false
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [attemptedProxy, setAttemptedProxy] = useState<'none' | 'google' | 'custom' | 'failed'>('none')
  const [retryCount, setRetryCount] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const maxRetries = 1 // 减少重试次数，避免过多请求

  const imgSrc = (() => {
    if (!isFavicon || !hasError) {
      // 在开发环境中优化favicon URL
      if (isFavicon) {
        const optimizedUrl = getOptimizedFaviconUrl(src)
        if (optimizedUrl === null && shouldSkipFavicon()) {
          return null // 开发环境跳过favicon
        }
        return optimizedUrl || src
      }
      return src
    }

    // 如果重试次数过多，直接返回fallback
    if (retryCount >= maxRetries) {
      return null;
    }

    if (attemptedProxy === 'none') {
      return `https://www.google.com/s2/favicons?domain=${extractDomain(src)}`;
    } else if (attemptedProxy === 'google') {
      return `/api/favicon?url=${encodeURIComponent(src)}`;
    }

    return src;
  })();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setHasError(false)
    setAttemptedProxy('none')
    setIsLoaded(false)
    setRetryCount(0)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    setRetryCount(0) // 重置重试计数
  }

  const handleError = () => {
    if (isFavicon) {
      // 在开发环境记录favicon错误
      devLog.warn(`Favicon加载失败: ${imgSrc}`)

      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)

      // 如果重试次数过多，停止尝试
      if (newRetryCount >= maxRetries) {
        setAttemptedProxy('failed')
        setHasError(true)
        onError?.()
        return
      }

      // 简化fallback策略，减少请求次数
      if (attemptedProxy === 'none') {
        setAttemptedProxy('google')
        setHasError(true)
      } else {
        // 直接失败，不再尝试自定义API
        setAttemptedProxy('failed')
        setHasError(true)
        onError?.()
      }
    } else {
      setHasError(true)
      onError?.()
    }
  }

  function extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname
    } catch (_e) {
      try {
        const domain = url
          .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
          .split("/")[0]
          .split("?")[0]
        return domain
      } catch (_err) {
        return url
      }
    }
  }

  const renderFallback = () => {
    if (isFavicon && attemptedProxy !== 'failed') {
      return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />
    }

    if (fallback) {
      return fallback
    }

    if (isFavicon) {
      return <Globe className="h-full w-full text-gray-400" />
    }

    return <div className={`bg-gray-200 dark:bg-gray-700 ${className}`} />
  }

  // 如果没有有效的图片源或已经失败，显示fallback
  if (!imgSrc || (hasError && (!isFavicon || attemptedProxy === 'failed'))) {
    return renderFallback()
  }

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={imgSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"
            } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          // 添加错误处理属性
          onAbort={() => {
            if (isFavicon) {
              console.warn('Favicon加载被中止:', imgSrc)
            }
          }}
        />
      )}
      {!isLoaded && isInView && !hasError && (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />
      )}
    </div>
  )
}
