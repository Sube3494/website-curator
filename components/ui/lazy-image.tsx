"use client"

import { useState, useRef, useEffect } from "react"
import { Globe } from "lucide-react"

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
  const [attemptedProxy, setAttemptedProxy] = useState<'none' | 'google' | 'custom'>('none')
  const imgRef = useRef<HTMLImageElement>(null)

  const imgSrc = (() => {
    if (!isFavicon || !hasError) return src;

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
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    if (isFavicon) {
      if (attemptedProxy === 'none') {
        setAttemptedProxy('google')
        setHasError(true)
      } else if (attemptedProxy === 'google') {
        setAttemptedProxy('custom')
        setHasError(true)
      } else {
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
    } catch (e) {
      try {
        let domain = url
          .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
          .split("/")[0]
          .split("?")[0]
        return domain
      } catch (err) {
        return url
      }
    }
  }

  const renderFallback = () => {
    if (isFavicon && attemptedProxy !== 'custom') {
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

  if (hasError && (!isFavicon || attemptedProxy === 'custom')) {
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
        />
      )}
      {!isLoaded && isInView && !hasError && (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />
      )}
    </div>
  )
}
