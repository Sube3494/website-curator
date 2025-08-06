"use client"

import { useState } from "react"
import { getVitePressStyleFavicon } from "@/lib/favicon-service"

interface SimpleFaviconProps {
  websiteUrl: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}

export function SimpleFavicon({
  websiteUrl,
  alt,
  className = "w-7 h-7 object-contain",
  fallback = <span className="text-xl">🌐</span>
}: SimpleFaviconProps) {
  const [hasError, setHasError] = useState(false)
  
  // 直接使用VitePress风格的图标URL
  const faviconUrl = getVitePressStyleFavicon(websiteUrl)

  if (hasError) {
    return <>{fallback}</>
  }

  return (
    <img
      src={faviconUrl}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}
