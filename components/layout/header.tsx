"use client"

import { Globe, Sun, Moon, LogOut, Shield, Heart, LogIn, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"
import { useQueryClient } from "@tanstack/react-query"
import { websiteKeys } from "@/lib/hooks/use-websites"
import { db } from "@/lib/db-client"
import { useEffect, useState } from "react"

interface HeaderProps {
  onNavigate: (page: string) => void
  currentPage: string
  onShowAuth: () => void
}

export function Header({ onNavigate, currentPage, onShowAuth }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 防止hydration不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }
  const queryClient = useQueryClient()

  // 预加载管理面板数据
  const prefetchAdminData = () => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      // 预加载网站数据 - 通过API调用而不是直接数据库访问
      queryClient.prefetchQuery({
        queryKey: websiteKeys.allWebsites(),
        queryFn: async () => {
          const response = await fetch('/api/websites')
          if (!response.ok) throw new Error('Failed to fetch websites')
          return response.json()
        },
        staleTime: 5 * 60 * 1000,
      })

      // 预加载分类数据 - 通过API调用
      queryClient.prefetchQuery({
        queryKey: websiteKeys.categoriesWithUsage(),
        queryFn: async () => {
          const response = await fetch('/api/categories')
          if (!response.ok) throw new Error('Failed to fetch categories')
          return response.json()
        },
        staleTime: 10 * 60 * 1000,
      })
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
      <div className="container flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={() => onNavigate("browse")}
          className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105 group"
        >
          <div className="p-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              网站导航
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">发现 & 整理</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {/* GitHub按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open('https://github.com/Sube3494', '_blank')}
            className="h-10 w-10 rounded-full hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 hover:scale-110"
          >
            <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* 主题切换按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:scale-110"
          >
            {!mounted ? (
              // 在hydration完成前显示默认图标，避免不匹配
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : theme === "light" ? (
              <Moon className="h-5 w-5 text-orange-600" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:scale-110 transition-all duration-300"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-gradient-to-r from-emerald-400 to-cyan-400 ring-offset-2 ring-offset-background">
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-semibold">
                      {user?.avatar || user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${user?.role === "super_admin"
                          ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-orange-300"
                          : user?.role === "admin"
                            ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300"
                            : "bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 dark:from-emerald-900/30 dark:to-cyan-900/30 dark:text-emerald-300"
                          }`}
                      >
                        {user?.role === "super_admin" ? "超级管理员" : user?.role === "admin" ? "管理员" : "用户"}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onNavigate("favorites")}
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20"
                >
                  <Heart className="mr-3 h-4 w-4 text-pink-600" />
                  <span>我的收藏</span>
                </DropdownMenuItem>

                {(user?.role === "admin" || user?.role === "super_admin") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onNavigate("admin")}
                      onMouseEnter={prefetchAdminData}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20"
                    >
                      <Shield className="mr-3 h-4 w-4 text-purple-600" />
                      <span>管理面板</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={onShowAuth}
              className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <LogIn className="h-4 w-4 mr-2" />
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
