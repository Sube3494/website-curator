"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface RegisterFormProps {
  onToggleMode: () => void
  onAccountDisabled?: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const { register, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password || !name || !confirmPassword) {
      setError("请填写所有字段")
      return
    }

    if (password !== confirmPassword) {
      setError("密码不匹配")
      return
    }

    if (password.length < 6) {
      setError("密码至少需要6个字符")
      return
    }

    const success = await register(email, password, name)
    if (!success) {
      setError("邮箱已存在")
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (password.length < 6) return { strength: 1, label: "弱", color: "text-red-500" }
    if (password.length < 8) return { strength: 2, label: "一般", color: "text-orange-500" }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: "强", color: "text-green-500" }
    }
    return { strength: 2, label: "良好", color: "text-blue-500" }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <Card className="w-full border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden">
      <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-5">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          加入网站导航
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
          创建您的账户，开始收藏网站
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-5">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              姓名
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors duration-200" />
              <Input
                id="name"
                type="text"
                placeholder="请输入您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-9 sm:h-10 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white/80 dark:bg-gray-700/80"
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              邮箱地址
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors duration-200" />
              <Input
                id="email"
                type="email"
                placeholder="请输入您的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-9 sm:h-10 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white/80 dark:bg-gray-700/80"
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
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors duration-200" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="创建密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-9 sm:h-10 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white/80 dark:bg-gray-700/80"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-emerald-500 transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.strength === 1
                        ? "w-1/3 bg-red-500"
                        : passwordStrength.strength === 2
                          ? "w-2/3 bg-orange-500"
                          : passwordStrength.strength === 3
                            ? "w-full bg-green-500"
                            : "w-0"
                        }`}
                    />
                  </div>
                  <span className={`font-medium ${passwordStrength.color} text-xs whitespace-nowrap`}>
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              确认密码
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors duration-200" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-9 sm:h-10 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 bg-white/80 dark:bg-gray-700/80"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-emerald-500 transition-colors duration-200"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-1 text-xs">
                {password === confirmPassword ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    <span>密码匹配</span>
                  </div>
                ) : (
                  <span className="text-red-500">密码不匹配</span>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 py-2">
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-9 sm:h-10 text-sm font-semibold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">正在创建账户...</span>
              </>
            ) : (
              <span className="text-sm">创建账户</span>
            )}
          </Button>
        </form>

        <div className="relative my-3 sm:my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-3 text-muted-foreground font-medium">已有账户？</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onToggleMode}
          className="w-full h-9 sm:h-10 text-sm font-semibold border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-[1.02] rounded-lg bg-transparent"
        >
          登录已有账户
        </Button>
      </CardContent>
    </Card>
  )
}
