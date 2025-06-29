"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

interface NetworkStatus {
  isOnline: boolean
  downlink?: number
  effectiveType?: string
}

export function NetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine
  })

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType
      })
    }

    const handleOnline = () => {
      updateNetworkStatus()
      toast.success("网络连接已恢复", {
        description: "您现在可以正常使用所有功能"
      })
    }

    const handleOffline = () => {
      updateNetworkStatus()
      toast.error("网络连接已断开", {
        description: "请检查您的网络连接"
      })
    }

    const handleConnectionChange = () => {
      updateNetworkStatus()
      
      // 如果网络质量很差，给出提示
      const connection = (navigator as any).connection
      if (connection && connection.effectiveType === 'slow-2g') {
        toast.warning("网络连接较慢", {
          description: "某些功能可能会受到影响"
        })
      }
    }

    // 初始化网络状态
    updateNetworkStatus()

    // 添加事件监听器
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // 监听网络连接变化
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    // 清理函数
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  // 监控网络请求失败
  useEffect(() => {
    const originalFetch = window.fetch
    let failureCount = 0
    let lastFailureTime = 0

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // 重置失败计数
        if (response.ok) {
          failureCount = 0
        } else if (response.status >= 500) {
          // 服务器错误
          failureCount++
          const now = Date.now()
          
          // 如果短时间内多次失败，显示警告
          if (failureCount >= 3 && now - lastFailureTime < 30000) {
            toast.error("服务器连接不稳定", {
              description: "正在尝试重新连接..."
            })
          }
          lastFailureTime = now
        }
        
        return response
      } catch (error) {
        failureCount++
        const now = Date.now()
        
        // 网络错误
        if (failureCount >= 2 && now - lastFailureTime < 10000) {
          toast.error("网络请求失败", {
            description: "请检查您的网络连接"
          })
        }
        lastFailureTime = now
        
        throw error
      }
    }

    // 清理函数
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
