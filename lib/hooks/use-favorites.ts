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
      try {
        return db.getFavorites(userId)
      } catch (error) {
        console.error('获取收藏失败:', error)
        throw error
      }
    },
    enabled: !!userId, // 只有在用户登录时才执行查询
    staleTime: 5 * 60 * 1000, // 5 分钟（增加缓存时间，因为我们有乐观更新）
    gcTime: 10 * 60 * 1000, // 10 分钟
    select: (data) => data.map(fav => fav.website).filter(Boolean) as Website[], // 只返回网站数据
    refetchOnWindowFocus: false, // 禁用窗口焦点时重新获取，减少不必要的请求
    refetchOnReconnect: true, // 网络重连时重新获取，确保数据同步
  })
}

// 添加收藏 - 使用乐观更新
export function useAddFavorite(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (website: Website) => {
      if (!userId) throw new Error('User not logged in')
      return await db.addFavorite(userId, website.id)
    },
    onMutate: async (website: Website) => {
      if (!userId) return

      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: favoriteKeys.user(userId) })

      // 获取当前数据
      const previousFavorites = queryClient.getQueryData<Website[]>(favoriteKeys.user(userId)) || []

      // 乐观更新
      queryClient.setQueryData<Website[]>(favoriteKeys.user(userId), [...previousFavorites, website])

      // 返回回滚数据
      return { previousFavorites }
    },
    onError: (err, website, context) => {
      if (!userId || !context) return
      // 回滚到之前的状态
      queryClient.setQueryData(favoriteKeys.user(userId), context.previousFavorites)
    },
    onSettled: () => {
      if (!userId) return
      // 重新获取数据确保同步
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(userId) })
    },
    retry: 2,
    retryDelay: 500,
  })
}

// 移除收藏 - 使用乐观更新
export function useRemoveFavorite(userId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (websiteId: string) => {
      if (!userId) throw new Error('User not logged in')
      return await db.removeFavorite(userId, websiteId)
    },
    onMutate: async (websiteId: string) => {
      if (!userId) return

      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: favoriteKeys.user(userId) })

      // 获取当前数据
      const previousFavorites = queryClient.getQueryData<Website[]>(favoriteKeys.user(userId)) || []

      // 乐观更新 - 移除指定网站
      const updatedFavorites = previousFavorites.filter(fav => fav.id !== websiteId)
      queryClient.setQueryData<Website[]>(favoriteKeys.user(userId), updatedFavorites)

      // 返回回滚数据
      return { previousFavorites }
    },
    onError: (err, websiteId, context) => {
      if (!userId || !context) return
      // 回滚到之前的状态
      queryClient.setQueryData(favoriteKeys.user(userId), context.previousFavorites)
    },
    onSettled: () => {
      if (!userId) return
      // 重新获取数据确保同步
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(userId) })
    },
    retry: 2,
    retryDelay: 500,
  })
}

// 检查是否已收藏
export function useIsFavorited(userId: string | null, websiteId: string) {
  const { data: favorites = [] } = useFavorites(userId)
  return favorites.some(fav => fav.id === websiteId)
}
