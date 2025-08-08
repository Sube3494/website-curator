'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSystemSetting } from '@/lib/hooks/use-system-settings'

type MotionLevel = 'low' | 'medium' | 'high'

interface UiPreferencesContextValue {
  motionEnabled: boolean
  setMotionEnabled: (value: boolean) => void
  motionLevel: MotionLevel
  setMotionLevel: (value: MotionLevel) => void
}

const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null)

export function UiPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [motionEnabled, setMotionEnabled] = useState(true)
  const [motionLevel, setMotionLevel] = useState<MotionLevel>('medium')
  const { data: animSetting } = useSystemSetting('enable_animation')

  // 初始化：尊重 prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    // 环境变量可强制关闭动画（用于测试或性能排查）
    const envDisable = process.env.NEXT_PUBLIC_DISABLE_ANIMATIONS === '1'
    if (media.matches || envDisable) {
      setMotionEnabled(false)
    }
    const handleChange = () => setMotionEnabled(!media.matches)
    media.addEventListener?.('change', handleChange)
    return () => media.removeEventListener?.('change', handleChange)
  }, [])

  // 后台系统设置优先生效（仅管理员可改）
  useEffect(() => {
    if (animSetting && typeof animSetting === 'object' && 'value' in animSetting) {
      const enabled = Boolean((animSetting as any).value?.enabled)
      setMotionEnabled(enabled)
    }
  }, [animSetting])

  const value = useMemo<UiPreferencesContextValue>(
    () => ({ motionEnabled, setMotionEnabled, motionLevel, setMotionLevel }),
    [motionEnabled, motionLevel]
  )

  return (
    <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>
  )
}

export function useUiPreferences(): UiPreferencesContextValue {
  const ctx = useContext(UiPreferencesContext)
  if (!ctx) throw new Error('useUiPreferences must be used within UiPreferencesProvider')
  return ctx
}


