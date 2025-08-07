/*
 * @Date: 2025-07-04 16:22:33
 * @Author: Sube
 * @FilePath: react-query-provider.tsx
 * @LastEditTime: 2025-08-05 22:00:15
 * @Description: 
 */
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 数据缓存 3 分钟（减少一些缓存时间以确保数据新鲜）
            staleTime: 3 * 60 * 1000,
            // 缓存保持 5 分钟
            gcTime: 5 * 60 * 1000,
            // 失败重试 1 次
            retry: (failureCount, error) => {
              // 对于网络错误，重试更多次
              if (error instanceof TypeError && error.message.includes('fetch')) {
                return failureCount < 3
              }
              // 对于4xx错误，不重试
              if (error instanceof Error && error.message.includes('4')) {
                return false
              }
              return failureCount < 1
            },
            // 重试延迟
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // 窗口重新获得焦点时重新获取数据
            refetchOnWindowFocus: false,
            // 网络重连时重新获取
            refetchOnReconnect: true,
          },
          mutations: {
            // mutation 失败重试 1 次
            retry: (failureCount, error) => {
              // 对于网络错误，重试
              if (error instanceof TypeError && error.message.includes('fetch')) {
                return failureCount < 2
              }
              return failureCount < 1
            },
            // 快速重试
            retryDelay: 300,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
