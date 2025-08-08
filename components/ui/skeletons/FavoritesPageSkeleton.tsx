"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageLayoutSkeleton, SearchBarSkeleton } from "./BaseSkeleton"

export function FavoritesPageSkeleton() {
  return (
    <PageLayoutSkeleton className="min-h-screen bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-red-50/50 dark:from-gray-900 dark:via-pink-900/10 dark:to-rose-900/10 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题部分 */}
        <div className="text-center mb-6 space-y-2">
          <Skeleton className="h-10 w-56 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        {/* 移动端搜索框 */}
        <div className="flex items-center justify-center mb-8 lg:hidden">
          <div className="w-full sm:max-w-md">
            <SearchBarSkeleton />
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
          {/* 侧边栏骨架屏 */}
          <div className="lg:w-72 space-y-4">
            {/* 桌面端搜索框 */}
            <div className="hidden lg:block">
              <SearchBarSkeleton />
            </div>

            {/* 分类过滤 */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border bg-white/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-6" />
                  </div>
                ))}
              </div>
            </div>

            {/* 视图切换 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          {/* 主内容区域 */}
          <main className="flex-1">
            {/* 工具栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              
              {/* 移动端分类选择 */}
              <div className="lg:hidden w-full sm:w-auto">
                <Skeleton className="h-10 w-full sm:w-48" />
              </div>
            </div>

            {/* 收藏网站卡片网格 */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl min-h-[240px] flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </PageLayoutSkeleton>
  )
}

// 快速加载版本
export function FavoritesPageSkeletonQuick() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-red-50/50 dark:from-gray-900 dark:via-pink-900/10 dark:to-rose-900/10 pb-16 animate-in fade-in duration-150">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题 */}
        <div className="text-center mb-6">
          <Skeleton className="h-10 w-56 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        {/* 搜索框 */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-full sm:max-w-md">
            <SearchBarSkeleton />
          </div>
        </div>

        {/* 快速网格 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-white/80 dark:bg-gray-800/80 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              
              <div className="flex gap-1">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 空状态骨架屏
export function FavoritesPageEmptySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-red-50/50 dark:from-gray-900 dark:via-pink-900/10 dark:to-rose-900/10 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <Skeleton className="h-10 w-56 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        <div className="flex items-center justify-center mb-8">
          <SearchBarSkeleton className="w-full sm:max-w-md" />
        </div>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
