"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface BaseSkeletonProps {
  className?: string
  children?: React.ReactNode
}

// 页面标题骨架屏
export function PageTitleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>
  )
}

// 搜索栏骨架屏
export function SearchBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Skeleton className="h-10 flex-1 max-w-md" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-10" />
    </div>
  )
}

// 统计卡片骨架屏
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}

// 数据表格骨架屏
export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* 表格头部 */}
      <div className="flex items-center gap-4 pb-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                "h-4",
                colIndex === 0 ? "w-32" : colIndex === 1 ? "w-48" : "w-20"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// 页面布局骨架屏容器
export function PageLayoutSkeleton({ 
  children, 
  className 
}: BaseSkeletonProps) {
  return (
    <div className={cn(
      "min-h-screen animate-in fade-in duration-200",
      className
    )}>
      {children}
    </div>
  )
}

// 内容区域骨架屏
export function ContentAreaSkeleton({ 
  children, 
  className 
}: BaseSkeletonProps) {
  return (
    <div className={cn("container py-6 space-y-6", className)}>
      {children}
    </div>
  )
}

// 卡片网格骨架屏
export function CardGridSkeleton({ 
  count = 6,
  columns = 3,
  className 
}: { 
  count?: number
  columns?: number
  className?: string 
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={cn(`grid ${gridCols} gap-6`, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
