'use client'

import { motion, type MotionProps } from 'framer-motion'
import React, { type JSX as ReactJSX } from 'react'
import { useUiPreferences } from '@/lib/ui-preferences'

interface FadeInProps extends MotionProps {
  as?: keyof ReactJSX.IntrinsicElements
  children?: React.ReactNode
}

export function FadeIn({ as = 'div', children, ...props }: FadeInProps) {
  const { motionEnabled, motionLevel } = useUiPreferences()
  const Component: any = motion[as as any] ?? motion.div

  if (!motionEnabled) {
    const Static = as as any
    return <Static {...props}>{children}</Static>
  }

  const duration = motionLevel === 'high' ? 0.35 : motionLevel === 'low' ? 0.2 : 0.28

  return (
    <Component
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </Component>
  )
}


