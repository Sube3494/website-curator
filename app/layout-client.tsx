'use client'

import React from 'react'
import { Header } from '@/components/layout/header'
import { AuthProvider } from '@/lib/auth-context'
import { ReactQueryProvider } from '@/lib/react-query-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { SystemSettingsProvider } from '@/lib/system-settings-context'
import { UiPreferencesProvider } from '@/lib/ui-preferences'

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SystemSettingsProvider>
            <UiPreferencesProvider>
              <div className="min-h-screen bg-background">
                <Header />
                {children}
              </div>
            </UiPreferencesProvider>
          </SystemSettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ReactQueryProvider>
  )
}
