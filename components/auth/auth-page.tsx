"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { Globe, Sparkles, Star, ArrowLeft } from "lucide-react"
import { useSupabaseAuth } from "@/lib/supabase-auth-context"
import { AccountDisabledModal } from "./account-disabled-modal"

// 定义一个自定义事件，用于退出登录页面
const exitAuthPage = () => {
  const event = new Event("exitAuthPage")
  window.dispatchEvent(event)
}

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showDisabledModal, setShowDisabledModal] = useState(false)
  const { showAccountDisabledDialog } = useSupabaseAuth()

  // 初始化时检查全局状态中是否有禁用标志
  useEffect(() => {
    if (showAccountDisabledDialog) {
      setShowDisabledModal(true)
    }
  }, [showAccountDisabledDialog]);

  const handleGoBack = () => {
    exitAuthPage()
  }

  const handleShowDisabledModal = () => {
    setShowDisabledModal(true)
  }

  const handleCloseDisabledModal = () => {
    setShowDisabledModal(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900" />

      {/* Back Button */}
      <div className="absolute top-6 left-8 sm:top-8 sm:left-10 md:top-10 md:left-12 z-20">
        <div
          onClick={handleGoBack}
          className="p-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
        </div>
      </div>

      {/* Animated Background Elements - Constrained to prevent overflow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Floating Decorative Elements - Smaller and positioned safely */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-4 sm:top-16 sm:left-16 animate-float">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400/60" />
        </div>
        <div className="absolute top-24 right-6 sm:top-32 sm:right-24 animate-float">
          <Star className="h-2 w-2 sm:h-3 sm:w-3 text-blue-400/60" />
        </div>
        <div className="absolute bottom-20 left-6 sm:bottom-24 sm:left-24 animate-float">
          <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400/60" />
        </div>
        <div className="absolute bottom-12 right-4 sm:bottom-16 sm:right-16 animate-float">
          <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-pink-400/60" />
        </div>
      </div>

      {/* Main Content - Compact and properly spaced */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-4 sm:py-6">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Header - Compact spacing */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              网站导航系统
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              发现、整理并分享优质网站资源
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>精选集合</span>
              </div>
              <div className="w-0.5 h-0.5 bg-muted-foreground/50 rounded-full" />
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>个人收藏</span>
              </div>
            </div>
          </div>

          {/* Auth Forms - Compact container */}
          <div className="w-full">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} onAccountDisabled={handleShowDisabledModal} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Copyright Footer - Compact and properly positioned */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
        <div className="container flex items-center justify-center py-2 sm:py-3 px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>by</span>
            <a
              href="https://github.com/Sube3494"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              Sube
            </a>
            <span className="text-[10px] opacity-60">© 2025</span>
          </div>
        </div>
      </footer>

      {/* 账户禁用弹窗 */}
      <AccountDisabledModal open={showDisabledModal} onClose={handleCloseDisabledModal} />
    </div>
  )
}
