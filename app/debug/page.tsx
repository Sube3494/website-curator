'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/supabase'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle, Heart, Loader2 } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: any
}

export default function DebugPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateResult = (name: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name)
      const newResult = { name, status, message, details }
      if (existing) {
        return prev.map(r => r.name === name ? newResult : r)
      }
      return [...prev, newResult]
    })
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    // 1. 检查环境变量
    updateResult('环境变量', 'loading', '检查中...')
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        updateResult('环境变量', 'error', '环境变量缺失', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
      } else {
        updateResult('环境变量', 'success', '环境变量配置正常', { 
          url: supabaseUrl.substring(0, 30) + '...', 
          keyLength: supabaseKey.length 
        })
      }
    } catch (error) {
      updateResult('环境变量', 'error', '检查失败', error)
    }

    // 2. 检查用户认证状态
    updateResult('用户认证', 'loading', '检查中...')
    try {
      if (!user) {
        updateResult('用户认证', 'warning', '用户未登录')
      } else {
        updateResult('用户认证', 'success', '用户已登录', {
          id: user.id,
          email: user.email,
          name: user.name
        })
      }
    } catch (error) {
      updateResult('用户认证', 'error', '检查失败', error)
    }

    // 3. 测试数据库连接
    updateResult('数据库连接', 'loading', '检查中...')
    try {
      const websites = await db.getWebsites()
      updateResult('数据库连接', 'success', `成功获取 ${websites.length} 个网站`, { count: websites.length })
    } catch (error) {
      updateResult('数据库连接', 'error', '数据库连接失败', error)
    }

    // 4. 测试收藏功能（如果用户已登录）
    if (user) {
      updateResult('收藏功能', 'loading', '检查中...')
      try {
        const favorites = await db.getFavorites(user.id)
        updateResult('收藏功能', 'success', `成功获取 ${favorites.length} 个收藏`, { count: favorites.length })
      } catch (error) {
        updateResult('收藏功能', 'error', '获取收藏失败', error)
      }
    }

    // 5. 测试 Toast 通知
    updateResult('Toast 通知', 'loading', '检查中...')
    try {
      toast.success('测试通知：成功')
      toast.error('测试通知：错误')
      toast.info('测试通知：信息')
      updateResult('Toast 通知', 'success', 'Toast 通知正常工作')
    } catch (error) {
      updateResult('Toast 通知', 'error', 'Toast 通知失败', error)
    }

    setIsRunning(false)
  }

  const testFavoriteOperation = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      // 获取第一个网站进行测试
      const websites = await db.getWebsites()
      if (websites.length === 0) {
        toast.error('没有可用的网站进行测试')
        return
      }

      const testWebsite = websites[0]
      toast.info(`开始测试收藏功能，网站：${testWebsite.title}`)

      // 尝试添加收藏
      await db.addFavorite(user.id, testWebsite.id)
      toast.success('添加收藏成功')

      // 等待一秒后移除收藏
      setTimeout(async () => {
        try {
          await db.removeFavorite(user.id, testWebsite.id)
          toast.success('移除收藏成功')
        } catch (error) {
          toast.error('移除收藏失败：' + (error as Error).message)
        }
      }, 1000)

    } catch (error) {
      toast.error('收藏测试失败：' + (error as Error).message)
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'loading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">系统诊断</h1>
        <p className="text-muted-foreground">
          诊断收藏功能和系统状态，帮助定位问题
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>快速诊断</CardTitle>
            <CardDescription>
              运行系统诊断检查各项功能状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
                运行诊断
              </Button>
              <Button 
                onClick={testFavoriteOperation} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                测试收藏功能
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>诊断结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{result.name}</h3>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {result.message}
                      </p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            查看详情
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>运行诊断</strong>：检查环境变量、用户认证、数据库连接等基础功能</p>
            <p>• <strong>测试收藏功能</strong>：实际测试添加和移除收藏操作</p>
            <p>• 请在生产环境访问此页面来诊断收藏功能问题</p>
            <p>• 如果发现问题，请将诊断结果截图发送给开发者</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
