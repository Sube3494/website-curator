'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Globe, Sparkles, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)

  // 设置页面标题
  useEffect(() => {
    document.title = '忘记密码 - 网站导航'
  }, [])

  // 重新发送倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown, canResend])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowRegisterPrompt(false)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        // 设置重新发送倒计时（60秒）
        setResendCountdown(60)
        setCanResend(false)
      } else {
        // 检查是否是邮箱不存在的错误
        if (data.code === 'EMAIL_NOT_FOUND') {
          setShowRegisterPrompt(true)
        }
        setError(data.message || '请求失败，请稍后重试')
      }
    } catch (error) {
      console.error('忘记密码请求失败:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/')
  }

  const handleSwitchToRegister = () => {
    router.push('/?mode=register')
  }



  const handleResend = async () => {
    if (!canResend || resendCountdown > 0) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        // 重新设置倒计时
        setResendCountdown(60)
        setCanResend(false)
      } else {
        setError(data.message || '重新发送失败，请稍后重试')
      }
    } catch (error) {
      console.error('重新发送邮件失败:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Globe className="absolute top-20 left-20 h-8 w-8 text-blue-300/40 dark:text-blue-400/30 animate-float" />
        <Sparkles className="absolute top-40 right-32 h-6 w-6 text-purple-300/40 dark:text-purple-400/30 animate-float delay-1000" />
        <Star className="absolute bottom-32 left-32 h-7 w-7 text-indigo-300/40 dark:text-indigo-400/30 animate-float delay-500" />
        <Mail className="absolute bottom-20 right-20 h-8 w-8 text-pink-300/40 dark:text-pink-400/30 animate-float delay-1500" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-8 sm:top-8 sm:left-10 md:top-10 md:left-12 z-20">
        <div
          onClick={handleBackToLogin}
          className="p-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg animate-in zoom-in duration-500 delay-200">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-in slide-in-from-top duration-500 delay-300">
                忘记密码
              </h1>
              <p className="text-muted-foreground animate-in slide-in-from-top duration-500 delay-400">
                输入您的邮箱地址，我们将发送重置链接
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="w-full border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden transform transition-all duration-500 animate-in slide-in-from-bottom delay-500">
            {!isSuccess ? (
              <>
                <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-5">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    重置密码
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                    请输入您注册时使用的邮箱地址
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
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email.trim()}
                      className="w-full h-9 sm:h-10 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          发送中...
                        </>
                      ) : (
                        '发送重置邮件'
                      )}
                    </Button>
                  </form>

                  {error && (
                    <div className="space-y-2 sm:space-y-3">
                      <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs sm:text-sm">
                          {error}
                        </AlertDescription>
                      </Alert>

                      {showRegisterPrompt && (
                        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                          <AlertDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 space-y-2 sm:space-y-3">
                            <p>看起来你还没有账户。要不要先注册一个？</p>
                            <Button
                              type="button"
                              onClick={handleSwitchToRegister}
                              className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                            >
                              立即注册
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="pt-2 sm:pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackToLogin}
                      className="w-full h-8 sm:h-9 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      返回登录
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-5">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-3 sm:mb-4 mx-auto animate-fade-in">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    邮件已发送
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                    我们已向您的邮箱发送了密码重置链接
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-5">
                  <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <AlertDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                      <div className="space-y-1">
                        <p><strong>提示：</strong></p>
                        <p>• 重置链接将在 1 小时后过期</p>
                        <p>• 如果没有收到邮件，请检查垃圾邮件文件夹</p>
                        <p>• 可以点击下方按钮重新发送邮件</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 sm:space-y-3">
                    <Button
                      type="button"
                      onClick={handleBackToLogin}
                      className="w-full h-9 sm:h-10 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      返回登录
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResend}
                      disabled={!canResend || resendCountdown > 0 || isLoading}
                      className="w-full h-8 sm:h-9 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          发送中...
                        </>
                      ) : resendCountdown > 0 ? (
                        `重新发送邮件 (${resendCountdown}s)`
                      ) : (
                        '重新发送邮件'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
