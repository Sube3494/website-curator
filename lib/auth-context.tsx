// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 20:20:00 +08:00; Reason: "创建新的MySQL JWT认证Context，替换Supabase认证";
// }}
// {{START MODIFICATIONS}}
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { User } from "./db-types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  showAccountDisabledDialog: boolean
  setShowAccountDisabledDialog: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAccountDisabledDialog, setShowAccountDisabledDialog] = useState(false)

  useEffect(() => {
    // 获取初始用户信息
    const getInitialUser = async () => {
      try {
        // 获取基础URL，避免在服务器端使用相对路径
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.user) {
            setUser(result.user)
          }
        }
      } catch (error) {
        console.error('获取初始用户信息失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialUser()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // 获取基础URL，避免在服务器端使用相对路径
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (result.success && result.user) {
        setUser(result.user)

        // 触发登录成功事件
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("loginSuccess"))
        }, 100)

        return true
      } else {
        // 检查是否是账户被禁用
        if (result.message?.includes('禁用')) {
          setShowAccountDisabledDialog(true)
        }

        // 检查是否是防爆破限制
        if (result.blocked) {
          // 抛出特殊错误，包含剩余时间信息
          throw new Error(`RATE_LIMITED:${result.message}`)
        }

        // 抛出普通登录错误
        throw new Error(result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      // 重新抛出错误，让调用方处理
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // 获取基础URL，避免在服务器端使用相对路径
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      })

      const result = await response.json()

      if (result.success && result.user) {
        // 注册成功后自动登录
        const loginSuccess = await login(email, password)
        return loginSuccess
      } else {
        return false
      }
    } catch (error) {
      console.error('注册失败:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // 获取基础URL，避免在服务器端使用相对路径
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      
      setUser(null)
      
      // 触发登出事件
      window.dispatchEvent(new CustomEvent("logout"))
    } catch (error) {
      console.error('登出失败:', error)
      // 即使API调用失败，也清除本地状态
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        showAccountDisabledDialog,
        setShowAccountDisabledDialog
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// 保持向后兼容性的别名
export const SupabaseAuthProvider = AuthProvider
export const useSupabaseAuth = useAuth
// {{END MODIFICATIONS}}