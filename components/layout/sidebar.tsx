"use client"

import { useState, useEffect } from "react"
import { Globe, Search, Tag, Heart, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface SidebarProps {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  getCategoryCount: (category: string) => void
  getCategoryColor: (categoryName: string) => { className: string; style?: React.CSSProperties | undefined }
  isCollapsed?: boolean
  setIsCollapsed?: (isCollapsed: boolean) => void
  className?: string
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  realTimeFavoritesCount?: number
  websitesTotal: number
}

export function Sidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  getCategoryCount,
  getCategoryColor,
  isCollapsed = false,
  setIsCollapsed,
  className,
  viewMode,
  setViewMode,
  realTimeFavoritesCount,
  websitesTotal
}: SidebarProps) {
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动设备
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // 在移动设备上默认折叠侧边栏
      if (window.innerWidth < 1024 && setIsCollapsed) {
        setIsCollapsed(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [setIsCollapsed])

  // 折叠时的侧边栏
  if (isCollapsed) {
    return (
      <aside
        id="main-sidebar"
        role="navigation"
        aria-label="侧边栏导航"
        className={cn("flex flex-col h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-lg border-0 overflow-hidden transition-all duration-300 w-16", className)}>
        {/* 展开按钮 */}
        {setIsCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="m-2 p-0 h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="展开侧边栏"
            aria-controls="main-sidebar"
            aria-expanded={false}
            title="展开侧边栏"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {/* 视图切换 - 保留此功能 */}
        <div className="flex flex-col gap-2 m-2 mt-4">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="p-0 h-10 w-10 rounded-full"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            aria-label="切换到网格视图"
            title="网格视图"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="p-0 h-10 w-10 rounded-full"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            aria-label="切换到列表视图"
            title="列表视图"
          >
            <LayoutList className="h-5 w-5" />
          </Button>
        </div>

        {/* 移除重复的图标按钮 */}
      </aside>
    )
  }

  // 展开的侧边栏
  return (
    <aside
      id="main-sidebar"
      role="navigation"
      aria-label="侧边栏导航"
      className={cn("flex flex-col h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-lg border-0 overflow-hidden transition-all duration-300 w-72", className)}>
      {/* 顶部区域：搜索和折叠按钮 */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索网站..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-10 bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm"
            aria-label="搜索网站"
          />
        </div>
        {setIsCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="ml-2 p-0 h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="折叠侧边栏"
            aria-controls="main-sidebar"
            aria-expanded={true}
            title="折叠侧边栏"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* 视图切换 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <span className="text-sm font-medium">视图模式</span>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            aria-label="切换到网格视图"
            title="网格视图"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            aria-label="切换到列表视图"
            title="列表视图"
          >
            <LayoutList className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 分类选择 */}
      <div className="flex-1 overflow-y-auto">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-600" />
              分类
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 px-4">
            {categories.map((category) => {
              const colorInfo = getCategoryColor(category)
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 min-h-10 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] ${selectedCategory === category
                    ? `bg-gradient-to-r ${colorInfo.className} text-white shadow-md`
                    : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700"
                    }`}
                  style={selectedCategory === category ? colorInfo.style : undefined}
                  aria-current={selectedCategory === category ? 'true' : undefined}
                  aria-label={`选择分类 ${category}`}
                >
                  <span className="font-medium">{category}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${selectedCategory === category ? "bg-white/20 text-white" : ""}`}
                    aria-label={`${category} 数量`}
                  >
                    {getCategoryCount(category)}
                  </Badge>
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* 底部统计信息 */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">网站总数</span>
          <span className="font-bold text-emerald-600">{websitesTotal}</span>
        </div>
        {user && realTimeFavoritesCount !== undefined && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">我的收藏</span>
            <span className="font-bold text-pink-600">{realTimeFavoritesCount}</span>
          </div>
        )}
      </div>
    </aside>
  )
} 