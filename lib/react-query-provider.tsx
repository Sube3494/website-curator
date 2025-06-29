"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
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
            retry: 1,
            // 窗口重新获得焦点时重新获取数据
            refetchOnWindowFocus: false,
          },
          mutations: {
            // mutation 失败重试 1 次
            retry: 1,
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
