"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Search, Heart, ExternalLink, Tag, Calendar, Trash2, Hash, X, LayoutGrid, LayoutList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSupabaseAuth } from "@/lib/supabase-auth-context"
import { useFavorites, useRemoveFavorite } from "@/lib/hooks/use-favorites"
import { toast } from "sonner"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Website as SupabaseWebsite } from "@/lib/supabase"

const categories = ["All", "Development", "Design", "Content", "Resources", "Tools", "Learning"]

const categoryColors = {
  Development: "from-emerald-500 to-teal-500",
  Design: "from-pink-500 to-rose-500",
  Content: "from-purple-500 to-indigo-500",
  Resources: "from-orange-500 to-amber-500",
  Tools: "from-cyan-500 to-blue-500",
  Learning: "from-violet-500 to-purple-500",
}

export function FavoritesPage() {
  const { user } = useSupabaseAuth()
  const { data: favorites = [], isLoading } = useFavorites(user?.id || null)
  const removeFavoriteMutation = useRemoveFavorite(user?.id || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // 本地收藏状态 - 提供即时UI反馈
  const [localFavorites, setLocalFavorites] = useState<SupabaseWebsite[]>(favorites)

  // 同步服务器状态到本地状态
  useEffect(() => {
    setLocalFavorites(favorites)
  }, [favorites])

  const handleRemoveFavorite = useCallback((websiteId: string, websiteTitle?: string) => {
    // 立即更新本地状态 - 真正的即时反馈
    const removedWebsite = localFavorites.find(w => w.id === websiteId)
    setLocalFavorites(prev => prev.filter(w => w.id !== websiteId))

    // 后台同步服务器
    removeFavoriteMutation.mutate(websiteId, {
      onError: () => {
        // 错误时回滚本地状态
        if (removedWebsite) {
          setLocalFavorites(prev => [...prev, removedWebsite])
        }
        toast.error("移除收藏失败，请重试")
      },
      onSuccess: () => {
        toast.success(`已从收藏中移除 ${websiteTitle || '网站'}`)
      }
    })
  }, [removeFavoriteMutation, localFavorites])

  const filteredFavorites = useMemo(() => {
    return localFavorites.filter((website) => {
      const matchesSearch =
        website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        website.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (website.tags && website.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase())))

      const categoryName = website.category?.name || 'Unknown'
      const matchesCategory = selectedCategory === "All" || categoryName === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [localFavorites, searchQuery, selectedCategory])

  const getCategoryCount = (category: string) => {
    if (category === "All") return localFavorites.length
    return localFavorites.filter((site) => site.category?.name === category).length
  }

  // 获取分类颜色
  const getCategoryColor = (categoryName: string) => {
    if (categoryName === "All") {
      return {
        className: "from-pink-500 to-rose-500",
        style: undefined
      }
    }

    // 使用预设颜色
    const defaultColor = categoryColors[categoryName as keyof typeof categoryColors] || "from-pink-500 to-rose-500"
    return {
      className: defaultColor,
      style: undefined
    }
  }

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K 聚焦搜索框
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="搜索您的收藏"]') as HTMLInputElement
        searchInput?.focus()
      }

      // Escape 清除搜索
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery("")
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery])

  // 返回列表视图或网格视图的类名
  const getViewModeClasses = () => {
    if (viewMode === "list") {
      return "flex flex-col gap-4"
    }
    return "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-red-50/50 dark:from-gray-900 dark:via-pink-900/10 dark:to-rose-900/10 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题部分 - 居中 */}
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-500 via-pink-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent animate-wave-gradient mb-2">
            我的收藏网站
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {searchQuery
              ? `"${searchQuery}" 的搜索结果`
              : `您的个人收藏网站集合`}
          </p>
        </div>

        {/* 搜索框 - 移动设备 */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-full sm:max-w-md lg:hidden">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="搜索您的收藏..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-pink-500 focus:shadow-xl"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110"
                title="清除搜索 (Esc)"
                aria-label="清除搜索内容"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300" />
              </Button>
            )}
          </div>
        </div>

        {/* 主内容区域 - 响应式布局 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 侧边栏 */}
          <div className={cn(
            "lg:sticky lg:top-20 lg:self-start transition-all duration-300",
            isCollapsed ? "lg:w-16" : "lg:w-72"
          )}>
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              getCategoryCount={getCategoryCount}
              getCategoryColor={getCategoryColor}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              viewMode={viewMode}
              setViewMode={setViewMode}
              realTimeFavoritesCount={localFavorites.length}
              websitesTotal={localFavorites.length}
              className="hidden lg:flex h-[calc(100vh-180px)]"
            />
          </div>

          {/* 主内容 */}
          <main className="flex-1 min-w-0 transition-all duration-300">
            {filteredFavorites.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 mb-4">
                    <Heart className="h-12 w-12 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    {searchQuery ? "未找到收藏" : "暂无收藏"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? "尝试调整搜索关键词"
                      : "开始浏览并保存网站到您的收藏夹"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={getViewModeClasses()}>
                {filteredFavorites.map((website) => (
                  <Card
                    key={website.id}
                    className="group hover:shadow-xl transition-all duration-200 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:scale-[1.02] overflow-hidden min-h-[240px] flex flex-col"
                  >
                    <CardHeader className="pb-2 flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 p-1.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            {website.favicon ? (
                              <img
                                src={website.favicon || "/placeholder.svg"}
                                alt={`${website.title} icon`}
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  const parent = target.parentElement!
                                  parent.innerHTML = '<span class="text-xl">🌐</span>'
                                }}
                              />
                            ) : (
                              <span className="text-xl">🌐</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base leading-tight group-hover:text-pink-600 transition-colors duration-200 line-clamp-2">
                              {website.title}
                            </CardTitle>
                            <CardDescription className="text-xs truncate mt-1">{new URL(website.url).hostname}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 ml-2">
                          <a href={website.url} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:scale-110 transition-all duration-200"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>从收藏中移除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要将"{website.title}"从您的收藏中移除吗？您可以随时重新添加。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveFavorite(website.id, website.title)}
                                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                                >
                                  移除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-2 pt-0">
                      {/* 描述区域 - 自适应高度 */}
                      <div className="flex-1">
                        <div className="relative">
                          <p className={`text-sm text-muted-foreground leading-snug ${website.description && website.description.length > 60
                            ? 'line-clamp-5'
                            : website.description && website.description.length > 30
                              ? 'line-clamp-4'
                              : 'line-clamp-3'
                            }`}>
                            {website.description || '暂无描述'}
                          </p>
                          {website.description && website.description.length > 60 && (
                            <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-5"></div>
                          )}
                        </div>
                      </div>

                      {/* 底部固定区域 */}
                      <div className="space-y-3 flex-shrink-0">
                        {/* 分类和日期 */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-emerald-600" />
                            {(() => {
                              const categoryName = typeof website.category === 'string' ? website.category : website.category?.name || 'Unknown'
                              const colorInfo = getCategoryColor(categoryName)
                              return (
                                <Badge
                                  className={`bg-gradient-to-r ${colorInfo.className} text-white text-xs px-2 py-0.5 border-0`}
                                  style={colorInfo.style}
                                >
                                  {categoryName}
                                </Badge>
                              )
                            })()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            <span>{new Date(website.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* 标签区域 */}
                        <div className="min-h-[24px] flex items-center">
                          {website.tags && Array.isArray(website.tags) && website.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {website.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={typeof tag === 'string' ? `${tag}-${index}` : tag.id || `tag-${index}`}
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors duration-200 font-medium"
                                >
                                  {typeof tag === 'string' ? tag : tag.name || 'Unknown'}
                                </Badge>
                              ))}
                              {website.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                  +{website.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                              <Hash className="h-3 w-3" />
                              <span>暂无标签</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Copyright Footer - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-center py-3 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <span className="text-xs opacity-60">© 2025</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
