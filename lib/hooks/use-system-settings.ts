import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/db-client'
import type { SystemSetting } from '@/lib/db-types'

// Query keys
const settingsKeys = {
  all: ['settings'] as const,
  allSettings: () => [...settingsKeys.all, 'all'] as const,
  setting: (key: string) => [...settingsKeys.all, 'setting', key] as const,
}

// 获取系统设置
export function useSystemSetting(key: string) {
  return useQuery({
    queryKey: settingsKeys.setting(key),
    queryFn: () => db.getSystemSetting(key),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false,
  })
}

// 获取所有系统设置
export function useAllSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.allSettings(),
    queryFn: () => db.getAllSystemSettings(),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false,
  })
}

// 更新系统设置
export function useUpdateSystemSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      db.updateSystemSetting(key, value),
    onSuccess: (data) => {
      // 更新特定设置的缓存
      queryClient.setQueryData(settingsKeys.setting(data.key), data)
      // 使所有设置的缓存失效
      queryClient.invalidateQueries({ queryKey: settingsKeys.allSettings() })
    },
    onError: (error) => {
      console.error('更新系统设置失败:', error)
    },
  })
}
