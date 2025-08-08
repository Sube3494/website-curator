'use client'

import React, { useId } from 'react'

export interface GradientBarProps {
  from: string
  to: string
  className?: string
  direction?: 'to-right' | 'to-left'
  rounded?: boolean
}

export function GradientBar({ from, to, className, direction = 'to-right' }: GradientBarProps) {
  const id = useId().replace(/:/g, '')
  const gradientId = `grad-${id}`
  const x1 = direction === 'to-right' ? '0%' : '100%'
  const x2 = direction === 'to-right' ? '100%' : '0%'

  return (
    <svg className={className} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1={x1} y1="0%" x2={x2} y2="0%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="10" fill={`url(#${gradientId})`} rx="8" ry="8" />
    </svg>
  )
}

export default GradientBar


