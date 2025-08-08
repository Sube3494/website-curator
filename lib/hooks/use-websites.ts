import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/db-client"
import type { Website, Category } from "@/lib/db-types"

// 查询键
export const websiteKeys = {
  all: ['websites'] as const,
  approved: () => [...websiteKeys.all, 'approved'] as const,
  allWebsites: () => [...websiteKeys.all, 'all-status'] as const,
  categories: () => ['categories'] as const,
  categoriesWithUsage: () => ['categories-with-usage'] as const, // 使用独立的查询键避免缓存冲突
}

// 获取已批准的网站
export function useApprovedWebsites() {
  return useQuery({
    queryKey: websiteKeys.approved(),
    queryFn: async () => {
      try {
        console.log('正在获取已批准的网站数据...')
        const response = await db.getApprovedWebsites()
        // 处理 API 返回 {success, data} 格式
        console.log('已批准网站数据响应:', response)
        if (response && typeof response === 'object' && 'data' in response) {
          console.log('处理后的已批准网站数据:', response.data)
          return response.data || []
        }
        console.log('原始已批准网站数据:', response)
        return response || []
      } catch (error) {
        console.error('获取已批准网站数据失败:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 分钟
    gcTime: 10 * 60 * 1000, // 10 分钟
  })
}

// 获取所有网站（管理员用）
export function useAllWebsites() {
  return useQuery({
    queryKey: websiteKeys.allWebsites(),
    queryFn: async () => {
      try {
        console.log('正在获取所有网站数据...')
        const response = await db.getWebsites()
        // 处理 API 返回 {success, data} 格式
        console.log('网站数据响应:', response)
        if (response && typeof response === 'object' && 'data' in response) {
          console.log('处理后的网站数据:', response.data)
          return response.data || []
        }
        console.log('原始网站数据:', response)
        return response || []
      } catch (error) {
        console.error('获取网站数据失败:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 分钟（增加缓存时间）
    gcTime: 10 * 60 * 1000, // 10 分钟
    refetchOnWindowFocus: false, // 禁用窗口焦点时重新获取
    refetchOnReconnect: true, // 网络重连时重新获取
  })
}

// 获取分类
export function useCategories() {
  return useQuery({
    queryKey: websiteKeys.categories(),
    queryFn: async () => {
      const response = await db.getCategories()
      // 处理 API 返回 {success, data} 格式
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data || []
      }
      return response || []
    },
    staleTime: 10 * 60 * 1000, // 分类变化较少，缓存 10 分钟
    gcTime: 20 * 60 * 1000, // 20 分钟
  })
}

// 添加网站
export function useAddWebsite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (website: Omit<Website, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await db.createWebsite(website)
      // 处理 API 返回 {success, data} 格式
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data
      }
      return response
    },
    onSuccess: (newWebsite) => {
      // 乐观更新：立即添加到所有相关缓存
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return [newWebsite]
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return [newWebsite]
        return [newWebsite, ...old]
      })

      // 如果是已批准的网站，也更新已批准网站的缓存
      if (newWebsite.status === 'approved') {
        queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
          if (!old) return [newWebsite]
          // 确保 old 是数组类型
          if (!Array.isArray(old)) return [newWebsite]
          return [newWebsite, ...old]
        })
      }
    },
    onError: () => {
      // 发生错误时重新获取数据
      queryClient.invalidateQueries({ queryKey: websiteKeys.allWebsites() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.approved() })
    },
  })
}

// 更新网站
export function useUpdateWebsite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Website> }) => {
      const response = await db.updateWebsite(id, updates)
      // 处理 API 返回 {success, data} 格式
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data
      }
      return response
    },
    onSuccess: (updatedWebsite) => {
      // 乐观更新：立即更新所有相关缓存中的数据
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return [updatedWebsite]
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return [updatedWebsite]
        return old.map((website) =>
          website.id === updatedWebsite.id ? updatedWebsite : website
        )
      })

      queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
        if (!old) return updatedWebsite.status === 'approved' ? [updatedWebsite] : []
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return updatedWebsite.status === 'approved' ? [updatedWebsite] : []

        if (updatedWebsite.status === 'approved') {
          // 如果更新后是已批准状态，添加或更新
          const exists = old.some(w => w.id === updatedWebsite.id)
          if (exists) {
            return old.map((website) =>
              website.id === updatedWebsite.id ? updatedWebsite : website
            )
          } else {
            return [updatedWebsite, ...old]
          }
        } else {
          // 如果更新后不是已批准状态，从已批准列表中移除
          return old.filter(website => website.id !== updatedWebsite.id)
        }
      })
    },
    onError: () => {
      // 发生错误时重新获取数据
      queryClient.invalidateQueries({ queryKey: websiteKeys.allWebsites() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.approved() })
    },
  })
}

// 删除网站
export function useDeleteWebsite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => db.deleteWebsite(id),
    onMutate: async (deletedId) => {
      // 取消任何正在进行的查询以避免冲突
      await queryClient.cancelQueries({ queryKey: websiteKeys.allWebsites() })
      await queryClient.cancelQueries({ queryKey: websiteKeys.approved() })

      // 保存当前数据以便回滚
      const previousAllWebsites = queryClient.getQueryData<Website[]>(websiteKeys.allWebsites())
      const previousApprovedWebsites = queryClient.getQueryData<Website[]>(websiteKeys.approved())

      // 乐观更新：立即从所有缓存中移除
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return []
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return []
        return old.filter((website) => website.id !== deletedId)
      })

      queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
        if (!old) return []
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return []
        return old.filter((website) => website.id !== deletedId)
      })

      // 返回上下文以便在错误时回滚
      return { previousAllWebsites, previousApprovedWebsites }
    },
    onError: (err, deletedId, context) => {
      // 回滚乐观更新
      if (context?.previousAllWebsites) {
        queryClient.setQueryData(websiteKeys.allWebsites(), context.previousAllWebsites)
      }
      if (context?.previousApprovedWebsites) {
        queryClient.setQueryData(websiteKeys.approved(), context.previousApprovedWebsites)
      }
    },
    onSettled: () => {
      // 无论成功失败，都重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: websiteKeys.allWebsites() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.approved() })
    },
  })
}

// ==================== 分类管理相关 hooks ====================

// 获取带使用统计的分类
export function useCategoriesWithUsage() {
  console.log('useCategoriesWithUsage hook 被调用了！查询键:', websiteKeys.categoriesWithUsage())
  return useQuery({
    queryKey: websiteKeys.categoriesWithUsage(),
    queryFn: async () => {
      console.log('开始获取分类使用统计数据...')
      console.log('调用 db.getCategoriesWithUsageCount()...')
      try {
        const response = await db.getCategoriesWithUsageCount()
        console.log('获取到的原始分类使用统计数据:', response)

        // 处理 API 返回 {success, data} 格式
        let result = []
        if (response && typeof response === 'object' && 'data' in response) {
          result = response.data || []
        } else {
          result = response || []
        }

        console.log('处理后的分类使用统计数据:', result)
        console.log('第一个分类的详细数据 (from hook):', result[0])
        if (result[0]) {
          console.log('第一个分类的字段 (from hook):', Object.keys(result[0]))
        }
        return result
      } catch (error) {
        console.error('获取分类使用统计失败:', error)
        throw error
      }
    },
    staleTime: 0, // 禁用缓存，强制每次重新获取
    gcTime: 0, // 立即清理
    refetchOnWindowFocus: false, // 禁用窗口焦点时重新获取
    refetchOnReconnect: true, // 网络重连时重新获取
  })
}

// 添加分类
export function useAddCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (category: Omit<Category, 'id' | 'created_at'>) =>
      db.createCategory(category),
    onSuccess: (newCategory) => {
      // 乐观更新：立即添加到基本分类缓存
      queryClient.setQueryData<Category[]>(websiteKeys.categories(), (old) => {
        if (!old) return [newCategory]
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return [newCategory]
        return [...old, newCategory].sort((a, b) => a.name.localeCompare(b.name))
      })

      // 触发两类数据的立即刷新，保证管理页即时可见
      queryClient.invalidateQueries({ queryKey: websiteKeys.categoriesWithUsage() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.categories() })
    },
    onError: () => {
      // 发生错误时重新获取数据
      queryClient.invalidateQueries({ queryKey: websiteKeys.categories() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.categoriesWithUsage() })
    },
  })
}

// 更新分类
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Category, 'id' | 'created_at'>> }) =>
      db.updateCategory(id, updates),
    onSuccess: (updatedCategory) => {
      // 乐观更新：立即更新基本分类缓存
      queryClient.setQueryData<Category[]>(websiteKeys.categories(), (old) => {
        if (!old) return [updatedCategory]
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return [updatedCategory]
        return old.map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category
        ).sort((a, b) => a.name.localeCompare(b.name))
      })

      // 对于带使用统计的分类，重新获取真实数据而不是手动设置
      // 因为 updatedCategory 没有 website_count 字段，手动设置会导致数据不完整
      queryClient.invalidateQueries({ queryKey: websiteKeys.categoriesWithUsage() })

      // 同时更新网站缓存中的分类信息
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return []
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return []
        return old.map((website) =>
          website.category?.id === updatedCategory.id
            ? { ...website, category: updatedCategory }
            : website
        )
      })

      queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
        if (!old) return []
        // 确保 old 是数组类型
        if (!Array.isArray(old)) return []
        return old.map((website) =>
          website.category?.id === updatedCategory.id
            ? { ...website, category: updatedCategory }
            : website
        )
      })
    },
    onError: () => {
      // 发生错误时重新获取数据
      queryClient.invalidateQueries({ queryKey: websiteKeys.categories() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.categoriesWithUsage() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.allWebsites() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.approved() })
    },
  })
}

// 删除分类
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => db.deleteCategory(id),
    onMutate: async (id) => {
      // 取消任何进行中的重新获取
      await queryClient.cancelQueries({ queryKey: websiteKeys.categoriesWithUsage() })
      
      // 保存当前状态以便回滚
      const previousCategories = queryClient.getQueryData(websiteKeys.categoriesWithUsage())
      
      // 乐观更新 UI
      queryClient.setQueryData(
        websiteKeys.categoriesWithUsage(),
        (old: any[] | undefined) => old ? old.filter(cat => cat.id !== id) : []
      )
      
      return { previousCategories }
    },
    onError: (err, id, context) => {
      // 出错时回滚
      if (context?.previousCategories) {
        queryClient.setQueryData(
          websiteKeys.categoriesWithUsage(),
          context.previousCategories
        )
      }
      // 重新获取所需数据
      queryClient.invalidateQueries({ queryKey: websiteKeys.categoriesWithUsage() })
    },
    onSuccess: () => {
      // 成功后只重新获取必要数据
      queryClient.invalidateQueries({ queryKey: websiteKeys.categoriesWithUsage() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.categories() })
    },
  })
}

// 刷新网站数据
export function useRefreshWebsites() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: websiteKeys.allWebsites() })
    queryClient.invalidateQueries({ queryKey: websiteKeys.approved() })
    queryClient.invalidateQueries({ queryKey: websiteKeys.categories() })
  }
}
