/*
 * @Date: 2025-06-28 16:38:54
 * @Author: Sube
 * @FilePath: layout.tsx
 * @LastEditTime: 2025-06-29 13:39:14
 * @Description: 
 */
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "网站导航 - 发现和整理优秀网站",
  description:
    "一个全面的网站导航平台，用于收集、整理和发现优秀网站，具备用户认证和管理功能。",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
