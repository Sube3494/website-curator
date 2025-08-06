'use client'

import { useState } from 'react'
import { X, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
  onSwitchToRegister?: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin, onSwitchToRegister }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)

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

  const handleClose = () => {
    setEmail('')
    setError('')
    setIsSuccess(false)
    setShowRegisterPrompt(false)
    onClose()
  }

  const handleBackToLogin = () => {
    setEmail('')
    setError('')
    setIsSuccess(false)
    setShowRegisterPrompt(false)
    onBackToLogin()
  }

  const handleSwitchToRegister = () => {
    if (onSwitchToRegister) {
      setEmail('')
      setError('')
      setIsSuccess(false)
      setShowRegisterPrompt(false)
      onSwitchToRegister()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md relative">
        {/* 关闭按钮 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-white dark:hover:bg-gray-800"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </Button>

        <Card className="w-full border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden transform transition-all duration-300">
          {!isSuccess ? (
            <>
              <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-5">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 sm:mb-4 mx-auto animate-fade-in">
                  <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  忘记密码
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                  输入你的邮箱地址，我们将发送密码重置链接
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
                        className="pl-10 h-9 sm:h-10 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 animate-fade-in"
                        disabled={isLoading}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="space-y-2 sm:space-y-3">
                      <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs sm:text-sm">
                          {error}
                        </AlertDescription>
                      </Alert>

                      {showRegisterPrompt && onSwitchToRegister && (
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

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-9 sm:h-10 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        发送中...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        发送重置链接
                      </>
                    )}
                  </Button>
                </form>

                {/* 返回登录 */}
                <div className="mt-4 sm:mt-6 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToLogin}
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto font-normal transition-colors duration-200"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    返回登录
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            /* 成功状态 */
            <>
              <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-5">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-3 sm:mb-4 mx-auto animate-fade-in">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 animate-bounce-slow" />
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  邮件已发送
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                  我们已向 <strong className="text-foreground">{email}</strong> 发送了密码重置链接。
                  请检查你的邮箱并点击链接重置密码。
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
                    onClick={() => setIsSuccess(false)}
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    重新发送邮件
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
