"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, type User as DBUser } from "./supabase"
import type { User as AuthUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin" | "super_admin"
  avatar?: string
  createdAt: string
}

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

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAccountDisabledDialog, setShowAccountDisabledDialog] = useState(false)

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
      setIsLoading(false)
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user)

          // 只有在用户资料加载成功且用户状态正常且是登录事件时才触发登录成功事件
          if (event === 'SIGNED_IN' && userProfile && userProfile.status === 'active') {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("loginSuccess"))
            }, 100)
          }
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const createTempUser = (authUser: AuthUser): User => {
    return {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
      role: 'user',
      avatar: authUser.user_metadata?.avatar_url,
      createdAt: new Date().toISOString()
    };
  }

  const loadUserProfile = async (authUser: AuthUser): Promise<any> => {
    try {
      if (!authUser || !authUser.id) {
        return null
      }

      // 尝试从数据库获取用户资料
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      // 用户不存在，创建新用户资料
      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          role: 'user' as const,
          avatar: authUser.user_metadata?.avatar_url,
          status: 'active' // 确保新用户默认状态为活跃
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          // 如果数据库还没准备好，使用临时用户数据
          const tempUser = createTempUser(authUser);
          setUser(tempUser);
          return null;
        }

        const userProfile = {
          id: createdProfile.id,
          email: createdProfile.email,
          name: createdProfile.name,
          role: createdProfile.role,
          avatar: createdProfile.avatar,
          createdAt: createdProfile.created_at,
          status: createdProfile.status || 'active'
        }
        setUser(userProfile)
        return createdProfile
      } 
      // 处理其他错误
      else if (error) {
        // 如果数据库还没准备好，使用临时用户数据
        const tempUser = createTempUser(authUser);
        tempUser.status = 'active'; // 添加状态属性
        setUser(tempUser);
        return tempUser;
      } 
      // 成功获取用户资料
      else {
        // 确保 profile 存在
        if (!profile) {
          const tempUser = createTempUser(authUser);
          tempUser.status = 'active'; // 添加状态属性
          setUser(tempUser);
          return tempUser;
        }

        // 检查用户状态，如果被禁用，不设置用户数据
        if (profile.status === 'inactive') {
          setUser(null)
          return null
        }

        const userProfile = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar,
          createdAt: profile.created_at,
          status: profile.status
        }
        setUser(userProfile)
        return profile
      }
    } catch (error) {
      // 如果数据库还没准备好，使用临时用户数据
      const tempUser = createTempUser(authUser);
      tempUser.status = 'active'; // 添加状态属性
      setUser(tempUser);
      return tempUser;
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // 注意：此处不再检查用户状态，因为该检查已在登录表单中完成
      // 这里只负责处理登录成功后的流程
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setIsLoading(false)
        return false
      }

      // 登录成功，loadUserProfile 会在 onAuthStateChange 中被调用
      setTimeout(() => {
        setIsLoading(false)
        // 触发登录成功事件，让主应用处理跳转
        window.dispatchEvent(new CustomEvent("loginSuccess"))
      }, 100)

      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (error) {
        setIsLoading(false)
        return false
      }

      setTimeout(() => {
        setIsLoading(false)
        // 注册成功后也触发登录成功事件
        window.dispatchEvent(new CustomEvent("loginSuccess"))
      }, 100)

      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      // 处理错误
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

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider")
  }
  return context
}
