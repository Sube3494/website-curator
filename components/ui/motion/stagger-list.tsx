'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUiPreferences } from '@/lib/ui-preferences'

interface StaggerListProps<T> {
  items: T[]
  getKey: (item: T, index: number) => React.Key
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export function StaggerList<T>({ items, getKey, renderItem, className }: StaggerListProps<T>) {
  const { motionEnabled, motionLevel } = useUiPreferences()
  const base = { opacity: 0, y: 8 }
  const visible = { opacity: 1, y: 0 }
  const duration = motionLevel === 'high' ? 0.28 : motionLevel === 'low' ? 0.16 : 0.22
  const stagger = motionLevel === 'high' ? 0.06 : motionLevel === 'low' ? 0.03 : 0.045

  if (!motionEnabled) {
    return <div className={className}>{items.map((it, i) => <div key={getKey(it, i)}>{renderItem(it, i)}</div>)}</div>
  }

  return (
    <AnimatePresence initial={false}>
      <motion.div
        className={className}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: stagger } },
        }}
      >
        {items.map((it, i) => (
          <motion.div
            key={getKey(it, i)}
            variants={{ hidden: base, show: visible }}
            transition={{ duration, ease: 'easeOut' }}
          >
            {renderItem(it, i)}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}


