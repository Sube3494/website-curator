"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useSupabaseAuth } from "@/lib/supabase-auth-context"
import { supabase } from "@/lib/supabase"

interface LoginFormProps {
  onToggleMode: () => void
  onAccountDisabled: () => void
}

export function LoginForm({ onToggleMode, onAccountDisabled }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useSupabaseAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password) {
      setError("请填写所有字段")
      setIsLoading(false)
      return
    }

    try {
      // 尝试登录
      const success = await login(email, password)

      if (success) {
        // 登录成功，但不在这里导航，而是由 auth context 处理
        return
      }

      // 检查账户是否被禁用
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("status")
        .eq("email", email)
        .single()

      if (userData && userData.status === "inactive") {
        // 账户被禁用，显示特殊消息
        onAccountDisabled()
        return
      }

      // 登录失败，显示通用错误
      setError("邮箱或密码不正确。请重试。")
    } catch (err) {
      setError("登录失败。请稍后重试。")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden">
      <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-5">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          欢迎回来
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
          登录以访问您的网站收藏
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-5">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              邮箱地址
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-200" />
              <Input
                id="email"
                type="email"
                placeholder="请输入您的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-9 sm:h-10 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/80 dark:bg-gray-700/80"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              密码
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-200" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入您的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-9 sm:h-10 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/80 dark:bg-gray-700/80"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-blue-500 transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 py-2">
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-9 sm:h-10 text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">登录中...</span>
              </>
            ) : (
              <span className="text-sm">登录</span>
            )}
          </Button>
        </form>

        <div className="relative my-3 sm:my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-3 text-muted-foreground font-medium">新用户？</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onToggleMode}
          className="w-full h-9 sm:h-10 text-sm font-semibold border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-[1.02] rounded-lg bg-transparent"
        >
          创建账户
        </Button>


      </CardContent>
    </Card>
  )
}
