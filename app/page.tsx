"use client"

import { useState, useEffect } from "react"
import { useSupabaseAuth } from "@/lib/supabase-auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import { SystemSettingsProvider } from "@/lib/system-settings-context"
import { SupabaseWebsitesProvider } from "@/lib/supabase-websites-context"
import { AuthPage } from "@/components/auth/auth-page"
import { Header } from "@/components/layout/header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { WebsiteBrowser } from "@/components/browse/website-browser"
import { FavoritesPage } from "@/components/favorites/favorites-page"
import { SupabaseAuthProvider } from "@/lib/supabase-auth-context"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { PerformanceMonitor } from "@/components/ui/performance-monitor"
import { Toaster } from "sonner"
import { SystemSettingsPage } from "@/components/settings/system-settings-page"

function AppContent() {
  const { user } = useSupabaseAuth()
  const [currentPage, setCurrentPage] = useState("browse")
  const [showAuth, setShowAuth] = useState(false)

  // 增强版的页面导航处理函数
  const handleNavigate = (page: string) => {
    // 检查是否有权限访问此页面
    if ((page === "admin" || page === "users") && !(user?.role === "admin" || user?.role === "super_admin")) {
      setShowAuth(true)
      return
    }

    // 检查是否需要登录才能访问此页面
    if ((page === "favorites" || page === "profile" || page === "settings") && !user) {
      setShowAuth(true)
      return
    }

    // 直接设置当前页面，不经过其他中间状态
    setCurrentPage(page)
  }

  // Handle login success redirect
  useEffect(() => {
    const handleLoginSuccess = () => {
      setShowAuth(false)
      // 登录成功后保持在当前页面，除非是第一次登录
      if (currentPage === "browse") {
        setCurrentPage("browse")
      }
    }

    window.addEventListener("loginSuccess", handleLoginSuccess)
    return () => window.removeEventListener("loginSuccess", handleLoginSuccess)
  }, [currentPage])

  // 处理退出登录页面的事件
  useEffect(() => {
    const handleExitAuth = () => {
      setShowAuth(false)
      // 保持在当前页面，不强制跳转到browse
    }

    window.addEventListener("exitAuthPage", handleExitAuth)
    return () => window.removeEventListener("exitAuthPage", handleExitAuth)
  }, [])

  // Handle user state changes - auto redirect when user logs in
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false)
      // 登录成功后不强制跳转到browse
    }
  }, [user, showAuth])

  // Show auth page if explicitly requested
  if (showAuth) {
    return <AuthPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "browse":
        return <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
      case "favorites":
        return user ? <FavoritesPage /> : <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
      case "admin":
        return (user?.role === "admin" || user?.role === "super_admin") ? <AdminDashboard /> : <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
      case "users":
        return (user?.role === "admin" || user?.role === "super_admin") ? <AdminDashboard /> : <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
      case "analytics":
        return (user?.role === "admin" || user?.role === "super_admin") ? (
          <div className="container py-8 animate-in fade-in duration-500">
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                数据分析面板
              </h1>
              <p className="text-muted-foreground">即将推出 - 高级数据分析与洞察</p>
            </div>
          </div>
        ) : (
          <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
        )
      case "profile":
        return user ? (
          <div className="container py-8 animate-in fade-in duration-500">
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                个人资料设置
              </h1>
              <p className="text-muted-foreground">即将推出 - 管理您的个人资料和偏好</p>
            </div>
          </div>
        ) : (
          <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
        )
      case "settings":
        return user ? (
          <div className="container py-8 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                系统偏好设置
              </h1>
              <p className="text-muted-foreground">自定义系统功能和用户体验</p>
            </div>

            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <SystemSettingsPage />
            )}
          </div>
        ) : (
          <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
        )
      default:
        return <WebsiteBrowser onShowAuth={() => setShowAuth(true)} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={handleNavigate} currentPage={currentPage} onShowAuth={() => setShowAuth(true)} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <PerformanceMonitor />
      <Toaster position="top-right" richColors />
    </div>
  )
}

export default function App() {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <SupabaseAuthProvider>
          <SystemSettingsProvider>
            <SupabaseWebsitesProvider>
              <AppContent />
            </SupabaseWebsitesProvider>
          </SystemSettingsProvider>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
