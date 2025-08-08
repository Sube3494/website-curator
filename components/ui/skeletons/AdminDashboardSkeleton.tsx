"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { StatsCardSkeleton } from "@/components/ui/admin-skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageLayoutSkeleton, SearchBarSkeleton, TableSkeleton } from "./BaseSkeleton"

export function AdminDashboardSkeleton() {
  return (
    <PageLayoutSkeleton>
      <div className="container px-2 sm:px-4 py-4 sm:py-6">
        {/* 标题部分骨架屏 */}
        <div className="mb-8 text-center space-y-2">
          <Skeleton className="h-10 w-48 mx-auto" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* 统计卡片网格骨架屏 */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* 标签页内容骨架屏 */}
        <div className="space-y-6">
          {/* 标签页导航 */}
          <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-lg w-fit">
            {["网站管理", "分类管理", "用户管理", "系统设置"].map((tab, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-md" />
            ))}
          </div>

          {/* 标签页内容区域 */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
              
              {/* 搜索和过滤区域 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <SearchBarSkeleton className="flex-1" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* 数据表格骨架屏 */}
              <TableSkeleton rows={8} columns={6} />
              
              {/* 分页骨架屏 */}
              <div className="flex items-center justify-between mt-6">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayoutSkeleton>
  )
}

// 快速加载的简化版本（用于快速切换）
export function AdminDashboardSkeletonQuick() {
  return (
    <div className="container px-2 sm:px-4 py-4 sm:py-6 animate-in fade-in duration-150">
      {/* 标题 */}
      <div className="mb-8 text-center">
        <Skeleton className="h-10 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* 内容区域 */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
          <SearchBarSkeleton />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded border">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
