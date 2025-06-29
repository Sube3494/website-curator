"use client"

import { useState, useRef, useEffect } from "react"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
  onError?: () => void
}

export function LazyImage({ src, alt, className, fallback, onError }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

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

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  if (hasError && fallback) {
    return <>{fallback}</>
  }

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
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
