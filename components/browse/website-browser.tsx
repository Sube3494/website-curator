"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Search, ExternalLink, Tag, Calendar, Heart, LogIn, X, Hash, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { useAllSystemSettings } from "@/lib/hooks/use-system-settings"
import { useApprovedWebsites, useCategories } from "@/lib/hooks/use-websites"
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/lib/hooks/use-favorites"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SimpleFavicon } from "@/components/ui/simple-favicon"
import { WebsiteGridSkeleton } from "@/components/ui/website-card-skeleton"
import { NoSearchResults, NoWebsites } from "@/components/ui/empty-state"
// import { NetworkError } from "@/components/ui/error-boundary"
import { SubmitWebsiteDialog } from "./submit-website-dialog"
import { Sidebar } from "@/components/layout/sidebar"
import { FilterPanel } from "./filter-panel"
import { cn } from "@/lib/utils"
import { StaggerList } from "@/components/ui/motion/stagger-list"
import { toast } from "sonner"

// 使用类型
import type { Website, Category } from "@/lib/db-types"

// 默认颜色作为后备方案
const defaultCategoryColors = {
  Development: "from-emerald-500 to-teal-500",
  Design: "from-pink-500 to-rose-500",
  Content: "from-purple-500 to-indigo-500",
  Resources: "from-orange-500 to-amber-500",
  Tools: "from-cyan-500 to-blue-500",
  Learning: "from-violet-500 to-purple-500",
}

interface WebsiteBrowserProps {
  onShowAuth: () => void
}

export function WebsiteBrowser({ onShowAuth }: WebsiteBrowserProps) {
  const { user } = useAuth()
  const { data: systemSettings = [] } = useAllSystemSettings()
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // 将系统设置数组转换为对象格式
  type ClientSetting = { key: string; value: unknown; description?: string }
  const settings = useMemo(() => {
    const array = (systemSettings as Array<ClientSetting>) || []
    const aggregated = array.reduce<Record<string, unknown>>((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
    return aggregated
  }, [systemSettings])
  const allowWebsiteSubmissionEnabled = Boolean(
    (settings["allow_website_submission"] as { enabled?: boolean } | undefined)?.enabled,
  )

  // 使用 React Query hooks
  const { data: approvedWebsites = [], isLoading: websitesLoading } = useApprovedWebsites()
  const { data: dbCategories = [] } = useCategories()
  const { data: favorites = [] } = useFavorites(user?.id || null)
  const addFavoriteMutation = useAddFavorite(user?.id || null)
  const removeFavoriteMutation = useRemoveFavorite(user?.id || null)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [pendingFavoriteWebsite, setPendingFavoriteWebsite] = useState<Website | null>(null)

  // 标签过滤
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<Array<{ id: string, name: string, count: number }>>([])

  // 使用服务器状态作为收藏状态的唯一来源
  const favoriteIds = useMemo(() => {
    if (!favorites || !Array.isArray(favorites)) return new Set<string>()
    return new Set(favorites.map(fav => fav.id))
  }, [favorites])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 收集所有可用的标签
  useEffect(() => {
    if (approvedWebsites.length > 0) {
      type TagLike = string | { id?: string; name?: string }
      const tagMap = new Map<string, { name: string; count: number }>()

      approvedWebsites.forEach((website: Website) => {
        if (website.tags && Array.isArray(website.tags)) {
          website.tags.forEach((tag: TagLike) => {
            const tagId = typeof tag === 'string' ? tag : tag.id || tag.name
            const tagName = typeof tag === 'string' ? tag : tag.name

            if (tagId && tagName) {
              if (tagMap.has(tagId)) {
                const existing = tagMap.get(tagId)!
                tagMap.set(tagId, { name: existing.name, count: existing.count + 1 })
              } else {
                tagMap.set(tagId, { name: tagName, count: 1 })
              }
            }
          })
        }
      })

      const tagsArray = Array.from(tagMap.entries()).map(([id, { name, count }]) => ({
        id,
        name,
        count
      }))

      // 按标签使用频率排序
      tagsArray.sort((a, b) => b.count - a.count)

      setAvailableTags(tagsArray)
    }
  }, [approvedWebsites])

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K 聚焦搜索框
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="搜索网站"]') as HTMLInputElement
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

  // 合并分类数据
  const categories = ["All", ...dbCategories.map((cat: Category | { name: string }) => (cat as any).name)]

  // 获取分类颜色的函数
  const getCategoryColor = (categoryName: string) => {
    if (categoryName === "All") {
      return {
        className: "from-emerald-500 to-cyan-500",
        style: undefined
      }
    }

    const dbCategory = dbCategories.find(
      (cat: Category | { name: string; color_from?: string; color_to?: string }) =>
        (cat as any).name === categoryName,
    ) as (Category & { color_from?: string; color_to?: string }) | undefined
    if (dbCategory && dbCategory.color_from && dbCategory.color_to) {
      // 如果是十六进制颜色，使用内联样式
      if (dbCategory.color_from.startsWith('#') || dbCategory.color_to.startsWith('#')) {
        return {
          className: "",
          style: { background: `linear-gradient(to right, ${dbCategory.color_from}, ${dbCategory.color_to})` }
        }
      }
      // 如果是Tailwind类名，使用类名
      return {
        className: `from-${dbCategory.color_from} to-${dbCategory.color_to}`,
        style: undefined
      }
    }

    // 后备方案：使用默认颜色
    const defaultColor = defaultCategoryColors[categoryName as keyof typeof defaultCategoryColors] || "from-emerald-500 to-cyan-500"
    return {
      className: defaultColor,
      style: undefined
    }
  }

  // 根据筛选条件过滤网站
  const filteredWebsites = useMemo(() => {
    type TagLike = string | { id?: string; name?: string }
    return approvedWebsites.filter((website: Website) => {
      // 匹配搜索查询
      const matchesSearch =
        website.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        website.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (website.tags &&
          website.tags.some((tag: TagLike) => {
            const tagName = typeof tag === 'string' ? tag : tag.name
            return !!tagName && tagName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          }))

      // 匹配选中的分类
      const categoryName = website.category?.name || 'Unknown'
      const matchesCategory = selectedCategory === "All" || categoryName === selectedCategory

      // 匹配选中的标签
      const matchesTags =
        selectedTags.length === 0 ||
        (website.tags &&
          website.tags.some((tag: TagLike) => {
            const tagId = typeof tag === 'string' ? tag : tag.id || tag.name
            return typeof tagId === 'string' && selectedTags.includes(tagId)
          }))

      return matchesSearch && matchesCategory && matchesTags
    })
  }, [approvedWebsites, debouncedSearchQuery, selectedCategory, selectedTags])

  const getCategoryCount = (category: string) => {
    if (category === "All") return approvedWebsites.length
    return approvedWebsites.filter((site: Website) => site.category?.name === category).length
  }

  // 检查是否已收藏的辅助函数
  const isFavorited = useCallback((websiteId: string) => {
    return favoriteIds.has(websiteId)
  }, [favoriteIds])

  // 收藏总数
  const realTimeFavoritesCount = favorites?.length || 0

  const handleFavoriteClick = useCallback(
    async (website: Website, event: React.MouseEvent) => {
      // Prevent event bubbling and default behavior
      event.preventDefault()
      event.stopPropagation()

      if (!user) {
        setPendingFavoriteWebsite(website)
        setShowLoginDialog(true)
        return
      }

      const isCurrentlyFavorited = isFavorited(website.id)

      if (isCurrentlyFavorited) {
        // 移除收藏
        removeFavoriteMutation.mutate(website.id, {
          onError: (error) => {
            console.error('移除收藏失败:', error)
            toast.error("移除收藏失败，请重试")
          },
          onSuccess: () => {
            toast.success(`已从收藏中移除 ${website.title}`)
          }
        })
      } else {
        // 添加收藏
        addFavoriteMutation.mutate(website, {
          onError: (error) => {
            console.error('添加收藏失败:', error)
            toast.error("添加收藏失败，请重试")
          },
          onSuccess: () => {
            toast.success(`已收藏 ${website.title}`)
          }
        })
      }
    },
    [user, isFavorited, addFavoriteMutation, removeFavoriteMutation],
  )

  const handleLoginDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setShowLoginDialog(false)
      setPendingFavoriteWebsite(null)
    }
  }, [])

  const handleSignInClick = useCallback(() => {
    setShowLoginDialog(false)
    setPendingFavoriteWebsite(null)
    onShowAuth()
  }, [onShowAuth])

  // 处理标签选择
  const handleTagSelect = useCallback((tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }, [])

  // 清除所有选中的标签
  const handleClearTags = useCallback(() => {
    setSelectedTags([])
  }, [])

  // 返回列表视图或网格视图的类名
  const getViewModeClasses = () => {
    if (viewMode === "list") {
      return "flex flex-col gap-4"
    }
    return "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
  }

  // 网站卡片渲染 - 根据视图模式返回不同布局
  const renderWebsiteCard = (website: Website) => {
    if (viewMode === "list") {
      return (
        <Card
          key={website.id}
          className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:scale-[1.01] overflow-hidden"
        >
          <div className="flex p-4 h-full">
            <div className="shrink-0 flex items-start mr-4">
              <div className="w-10 h-10 p-1.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-sm">
                <SimpleFavicon
                  websiteUrl={website.url}
                  alt={`${website.title} icon`}
                  className="w-7 h-7 object-contain"
                  fallback={<span className="text-xl">🌐</span>}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base leading-tight group-hover:text-emerald-600 transition-colors duration-200 font-medium">
                    {website.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {new URL(website.url).hostname}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleFavoriteClick(website, e)}
                    className={`hover:scale-110 transition-all duration-200 ${isFavorited(website.id)
                      ? "text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                      : "text-gray-400 hover:text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                      }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited(website.id) ? "fill-current" : ""}`} />
                  </Button>
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`访问 ${website.title}`}
                    aria-label={`访问 ${website.title}`}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:scale-110 transition-all duration-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {website.description || '暂无描述'}
              </p>

              <div className="flex flex-wrap items-center justify-between mt-3 gap-y-2">
                <div className="flex items-center gap-2">
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

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <span>{new Date(website.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 标签区域 */}
                {website.tags && Array.isArray(website.tags) && website.tags.length > 0 && (
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
                )}
              </div>
            </div>
          </div>
        </Card>
      )
    }

    // 默认网格视图
    return (
      <Card
        key={website.id}
        className="group hover:shadow-xl transition-all duration-200 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:scale-[1.02] overflow-hidden min-h-[240px] flex flex-col"
      >
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 p-1.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <SimpleFavicon
                  websiteUrl={website.url}
                  alt={`${website.title} icon`}
                  className="w-7 h-7 object-contain"
                  fallback={<span className="text-xl">🌐</span>}
                />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base leading-tight group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
                  {website.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate mt-1">
                  {new URL(website.url).hostname}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleFavoriteClick(website, e)}
                className={`hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 ${isFavorited(website.id)
                  ? "text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                  : "text-gray-400 hover:text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                  }`}
              >
                <Heart className={`h-4 w-4 ${isFavorited(website.id) ? "fill-current" : ""}`} />
              </Button>
              <a
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`访问 ${website.title}`}
                aria-label={`访问 ${website.title}`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
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
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-cyan-50/30 to-blue-50/50 dark:from-gray-900 dark:via-emerald-900/10 dark:to-cyan-900/10 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题部分 - 居中 */}
        <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent animate-wave-gradient mb-2">
            发现优秀网站
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {searchQuery
              ? `"${searchQuery}" 的搜索结果`
              : user
                ? `浏览并收藏我们精心策展的网站集合`
                : `浏览我们精心策展的优秀网站集合`}
          </p>

        </div>

        {/* 提交网站按钮和操作区 */}
        <div className="flex items-center justify-center mb-8 gap-4 flex-wrap">
          {/* 移动设备搜索框 */}
          <div className="relative w-full sm:max-w-md lg:hidden">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="搜索网站..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:shadow-xl"
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

          {/* 标签过滤面板 */}
          <FilterPanel
            selectedTags={selectedTags}
            onSelectTag={handleTagSelect}
            onRemoveTag={(tagId) => handleTagSelect(tagId)}
            onClearTags={handleClearTags}
            availableTags={availableTags}
            className="order-1 sm:order-none"
          />

          {/* 提交网站按钮 */}
          {user ? (
            // 用户已登录，根据设置显示提交按钮或登录按钮
            allowWebsiteSubmissionEnabled ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                提交网站
              </Button>
            ) : null
          ) : (
            <Button
              onClick={onShowAuth}
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Heart className="h-4 w-4 mr-2" />
              登录以保存收藏
            </Button>
          )}
        </div>

        {/* 主内容区域 - 响应式布局 */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
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
              realTimeFavoritesCount={realTimeFavoritesCount}
              websitesTotal={approvedWebsites.length}
              className="hidden lg:flex h-[calc(100vh-180px)]"
            />
          </div>

          {/* 主内容 */}
          <main className="flex-1 min-w-0 transition-all duration-300">
            {/* 移动端分类选择器 */}
            <div className="lg:hidden mb-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const colorInfo = getCategoryColor(category)
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{category}</span>
                          <Badge variant="secondary" className="ml-2">
                            {getCategoryCount(category)}
                          </Badge>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {websitesLoading ? (
              <WebsiteGridSkeleton count={6} />
            ) : filteredWebsites.length === 0 ? (
              debouncedSearchQuery || selectedCategory !== "All" || selectedTags.length > 0 ? (
                <NoSearchResults onClear={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  setSelectedTags([])
                }} />
              ) : (
                <NoWebsites />
              )
            ) : (
              <StaggerList
                items={filteredWebsites}
                className={getViewModeClasses()}
                getKey={(w: Website) => w.id}
                renderItem={(w: Website) => renderWebsiteCard(w)}
              />
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

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={handleLoginDialogClose}>
        <DialogContent
          className="sm:max-w-[400px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 bg-white dark:bg-gray-800 border shadow-lg rounded-lg"
          onPointerDownOutside={(e) => {
            e.preventDefault()
            handleLoginDialogClose(false)
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            handleLoginDialogClose(false)
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              需要登录
            </DialogTitle>
            <DialogDescription className="text-center">
              {pendingFavoriteWebsite
                ? `请登录以将 "${pendingFavoriteWebsite.title}" 添加到您的收藏夹。`
                : "请登录以保存网站到您的收藏夹。"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleSignInClick}
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              登录
            </Button>
            <Button variant="outline" onClick={() => handleLoginDialogClose(false)}>
              继续浏览
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 提交网站对话框 */}
      <SubmitWebsiteDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
      />
    </div>
  )
}
