"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { WebsiteGridSkeleton } from "@/components/ui/website-card-skeleton"
import { PageLayoutSkeleton, SearchBarSkeleton } from "./BaseSkeleton"

export function WebsiteBrowserSkeleton() {
  return (
    <PageLayoutSkeleton className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-cyan-50/30 to-blue-50/50 dark:from-gray-900 dark:via-emerald-900/10 dark:to-cyan-900/10 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题部分 */}
        <div className="text-center mb-6 space-y-2">
          <Skeleton className="h-10 w-64 mx-auto" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* 搜索和过滤区域 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 侧边栏骨架屏 */}
          <div className="lg:w-64 space-y-4">
            {/* 搜索框 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <SearchBarSkeleton />
            </div>

            {/* 分类过滤 */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
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

            {/* 标签过滤 */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 space-y-4">
            {/* 工具栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>

            {/* 网站卡片网格 */}
            <WebsiteGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </PageLayoutSkeleton>
  )
}

// 快速加载版本（用于页面切换时的快速反馈）
export function WebsiteBrowserSkeletonQuick() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-cyan-50/30 to-blue-50/50 dark:from-gray-900 dark:via-emerald-900/10 dark:to-cyan-900/10 pb-16 animate-in fade-in duration-150">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题 */}
        <div className="text-center mb-6">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        {/* 简化布局 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 侧边栏简化 */}
          <div className="lg:w-64 space-y-4">
            <SearchBarSkeleton />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* 主内容区域简化 */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-white/80 dark:bg-gray-800/80 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 移动端优化的骨架屏
export function WebsiteBrowserSkeletonMobile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-cyan-50/30 to-blue-50/50 dark:from-gray-900 dark:via-emerald-900/10 dark:to-cyan-900/10 pb-16">
      <div className="px-4 py-6">
        {/* 移动端标题 */}
        <div className="text-center mb-4">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-3 w-36 mx-auto" />
        </div>

        {/* 移动端搜索 */}
        <div className="mb-4">
          <SearchBarSkeleton />
        </div>

        {/* 移动端过滤按钮 */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* 移动端网站列表 */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border gap-3">
              <Skeleton className="h-10 w-10 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-1">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
