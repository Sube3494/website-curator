"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="mb-6 p-4 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              出现了一些问题
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              页面加载时遇到错误，请尝试刷新页面或稍后再试
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新页面
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// 网络错误组件
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="mb-6 p-4 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20">
          <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          网络连接错误
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          无法连接到服务器，请检查您的网络连接并重试
        </p>
        <Button 
          onClick={onRetry}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
      </CardContent>
    </Card>
  )
}
