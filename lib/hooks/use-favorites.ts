import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db, type Website, type Favorite } from "@/lib/supabase"

// 查询键
export const favoriteKeys = {
  all: ['favorites'] as const,
  user: (userId: string) => [...favoriteKeys.all, userId] as const,
}

// 获取用户收藏
export function useFavorites(userId: string | null) {
  return useQuery({
    queryKey: favoriteKeys.user(userId || ''),
    queryFn: () => {
      if (!userId) return []
      return db.getFavorites(userId)
    },
    enabled: !!userId, // 只有在用户登录时才执行查询
    staleTime: 5 * 60 * 1000, // 5 分钟（增加缓存时间，因为我们有乐观更新）
    gcTime: 10 * 60 * 1000, // 10 分钟
    select: (data) => data.map(fav => fav.website).filter(Boolean) as Website[], // 只返回网站数据
    refetchOnWindowFocus: false, // 禁用窗口焦点时重新获取，减少不必要的请求
    refetchOnReconnect: true, // 网络重连时重新获取，确保数据同步
  })
}

// 添加收藏 - 简化版本，本地状态提供即时反馈
export function useAddFavorite(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (website: Website) => {
      if (!userId) throw new Error('User not logged in')
      return await db.addFavorite(userId, website.id)
    },
    onSuccess: () => {
      if (!userId) return
      // 成功后同步服务器数据
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.user(userId)
      })
    },
    retry: 1,
    retryDelay: 300,
  })
}

// 移除收藏 - 简化版本，本地状态提供即时反馈
export function useRemoveFavorite(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (websiteId: string) => {
      if (!userId) throw new Error('User not logged in')
      return await db.removeFavorite(userId, websiteId)
    },
    onSuccess: () => {
      if (!userId) return
      // 成功后同步服务器数据
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.user(userId)
      })
    },
    retry: 1,
    retryDelay: 300,
  })
}

// 检查是否已收藏
export function useIsFavorited(userId: string | null, websiteId: string) {
  const { data: favorites = [] } = useFavorites(userId)
  return favorites.some(fav => fav.id === websiteId)
}
