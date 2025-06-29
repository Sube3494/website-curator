"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, RefreshCcw, Database } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {icon && (
          <div className="mb-6 p-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface NoSearchResultsProps {
  onClear?: () => void
}

export function NoSearchResults({ onClear }: NoSearchResultsProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-bold mb-2">未找到符合条件的网站</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        没有找到符合您当前筛选条件的网站。请尝试修改搜索关键词或筛选条件。
      </p>
      {onClear && (
        <Button
          onClick={onClear}
          variant="outline"
          className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 border-0 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          清除所有筛选
        </Button>
      )}
    </Card>
  )
}

export function NoFavorites() {
  return (
    <EmptyState
      icon={<span className="text-4xl">❤️</span>}
      title="还没有收藏的网站"
      description="浏览网站并点击心形图标来添加到您的收藏夹"
    />
  )
}

export function NoWebsites() {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <Database className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-bold mb-2">暂无网站</h3>
      <p className="text-muted-foreground mb-2 max-w-md">
        目前还没有任何网站添加到系统中。请联系管理员添加内容，或稍后再查看。
      </p>
      <p className="text-sm text-muted-foreground">
        网站管理员可以从管理面板添加网站。
      </p>
    </Card>
  )
}
