import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/db-client'
import type { User } from '@/lib/db-types'

// Query keys
const userKeys = {
  all: ['users'] as const,
  allUsers: () => [...userKeys.all, 'all'] as const,
  user: (id: string) => [...userKeys.all, 'user', id] as const,
}

// 获取所有用户
export function useAllUsers() {
  return useQuery({
    queryKey: userKeys.allUsers(),
    queryFn: async () => {
      const response = await db.getAllUsers()
      // 处理 API 返回 {success, data} 格式
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data || []
      }
      return response || []
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// 获取单个用户
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.user(id),
    queryFn: async () => {
      const response = await db.getUser(id)
      // 处理 API 返回 {success, data} 格式
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data
      }
      return response
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// 更新用户
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      db.updateUser(id, updates),
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(userKeys.user(data.id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.allUsers() })
    },
    onError: (error) => {
      console.error('Error updating user:', error)
    },
  })
}

// 创建用户
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) =>
      db.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.allUsers() })
    },
    onError: (error) => {
      console.error('Error creating user:', error)
    },
  })
}

// 更新用户状态
export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      db.updateUser(id, { status }),
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(userKeys.user(data.id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.allUsers() })
    },
    onError: (error) => {
      console.error('Error updating user status:', error)
    },
  })
}

// 更新用户可信状态
export function useUpdateUserTrusted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, trusted }: { id: string; trusted: boolean }) =>
      db.updateUser(id, { trusted }),
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(userKeys.user(data.id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.allUsers() })
    },
    onError: (error) => {
      console.error('Error updating user trusted status:', error)
    },
  })
}

// 更新用户角色
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' | 'super_admin' }) =>
      db.updateUser(id, { role }),
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(userKeys.user(data.id), data)
      queryClient.invalidateQueries({ queryKey: userKeys.allUsers() })
    },
    onError: (error) => {
      console.error('Error updating user role:', error)
    },
  })
}

// 刷新用户数据
export function useRefreshUsers() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: userKeys.allUsers() })
  }
}
