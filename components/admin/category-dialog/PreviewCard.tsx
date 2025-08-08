"use client"

import React from "react"

export interface PreviewCardProps {
  title?: string
  fromHex?: string
  toHex?: string
  name?: string
  className?: string
}

export function PreviewCard({ title = "预览", fromHex = "#10b981", toHex = "#06b6d4", name = "分类名称", className }: PreviewCardProps) {
  return (
    <div className={className}>
      <div className="rounded-2xl border bg-white/80 dark:bg-gray-800/80 p-4 shadow">
        <p className="text-sm font-medium mb-3 text-muted-foreground">{title}</p>
        <div className="h-12 w-full rounded-full shadow-inner" style={{ background: `linear-gradient(90deg, ${fromHex}, ${toHex})` }} />
        <div className="mt-4 rounded-xl border bg-background p-4">
          <div className="text-sm font-semibold">{name || "分类名称"}</div>
          <p className="text-xs text-muted-foreground mt-1">将应用到浏览页的徽标、标签和筛选项。</p>
        </div>
      </div>
    </div>
  )
}

export default PreviewCard


