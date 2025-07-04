import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db, type Website, type Category, type CategoryWithUsage } from "@/lib/supabase"

// 查询键
export const websiteKeys = {
  all: ['websites'] as const,
  approved: () => [...websiteKeys.all, 'approved'] as const,
  allWebsites: () => [...websiteKeys.all, 'all-status'] as const,
  categories: () => ['categories'] as const,
  categoriesWithUsage: () => [...websiteKeys.categories(), 'with-usage'] as const,
}

// 获取已批准的网站
export function useApprovedWebsites() {
  return useQuery({
    queryKey: websiteKeys.approved(),
    queryFn: () => db.getApprovedWebsites(),
    staleTime: 5 * 60 * 1000, // 5 分钟
    gcTime: 10 * 60 * 1000, // 10 分钟
  })
}

// 获取所有网站（管理员用）
export function useAllWebsites() {
  return useQuery({
    queryKey: websiteKeys.allWebsites(),
    queryFn: () => db.getWebsites(),
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
    queryFn: () => db.getCategories(),
    staleTime: 10 * 60 * 1000, // 分类变化较少，缓存 10 分钟
    gcTime: 20 * 60 * 1000, // 20 分钟
  })
}

// 添加网站
export function useAddWebsite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (website: Omit<Website, 'id' | 'created_at' | 'updated_at'>) =>
      db.createWebsite(website),
    onSuccess: (newWebsite) => {
      // 乐观更新：立即添加到所有相关缓存
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return [newWebsite]
        return [newWebsite, ...old]
      })

      // 如果是已批准的网站，也更新已批准网站的缓存
      if (newWebsite.status === 'approved') {
        queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
          if (!old) return [newWebsite]
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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Website> }) =>
      db.updateWebsite(id, updates),
    onSuccess: (updatedWebsite) => {
      // 乐观更新：立即更新所有相关缓存中的数据
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return [updatedWebsite]
        return old.map((website) =>
          website.id === updatedWebsite.id ? updatedWebsite : website
        )
      })

      queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
        if (!old) return updatedWebsite.status === 'approved' ? [updatedWebsite] : []
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
        return old.filter((website) => website.id !== deletedId)
      })

      queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
        if (!old) return []
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
  return useQuery({
    queryKey: websiteKeys.categoriesWithUsage(),
    queryFn: () => db.getCategoriesWithUsageCount(),
    staleTime: 10 * 60 * 1000, // 10 分钟（增加缓存时间）
    gcTime: 20 * 60 * 1000, // 20 分钟
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
      // 乐观更新：立即添加到所有相关缓存
      queryClient.setQueryData<Category[]>(websiteKeys.categories(), (old) => {
        if (!old) return [newCategory]
        return [...old, newCategory].sort((a, b) => a.name.localeCompare(b.name))
      })

      queryClient.setQueryData<CategoryWithUsage[]>(websiteKeys.categoriesWithUsage(), (old) => {
        if (!old) return [{ ...newCategory, website_count: 0 }]
        return [...old, { ...newCategory, website_count: 0 }].sort((a, b) => a.name.localeCompare(b.name))
      })
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
      // 乐观更新：立即更新所有相关缓存中的数据
      queryClient.setQueryData<Category[]>(websiteKeys.categories(), (old) => {
        if (!old) return [updatedCategory]
        return old.map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category
        ).sort((a, b) => a.name.localeCompare(b.name))
      })

      queryClient.setQueryData<CategoryWithUsage[]>(websiteKeys.categoriesWithUsage(), (old) => {
        if (!old) return [{ ...updatedCategory, website_count: 0 }]
        return old.map((category) =>
          category.id === updatedCategory.id
            ? { ...updatedCategory, website_count: category.website_count }
            : category
        ).sort((a, b) => a.name.localeCompare(b.name))
      })

      // 同时更新网站缓存中的分类信息
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return []
        return old.map((website) =>
          website.category?.id === updatedCategory.id
            ? { ...website, category: updatedCategory }
            : website
        )
      })

      queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
        if (!old) return []
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
    onMutate: async (deletedId) => {
      // 取消任何正在进行的查询以避免冲突
      await queryClient.cancelQueries({ queryKey: websiteKeys.categories() })
      await queryClient.cancelQueries({ queryKey: websiteKeys.categoriesWithUsage() })
      await queryClient.cancelQueries({ queryKey: websiteKeys.allWebsites() })
      await queryClient.cancelQueries({ queryKey: websiteKeys.approved() })

      // 保存当前数据以便回滚
      const previousCategories = queryClient.getQueryData<Category[]>(websiteKeys.categories())
      const previousCategoriesWithUsage = queryClient.getQueryData<CategoryWithUsage[]>(websiteKeys.categoriesWithUsage())
      const previousAllWebsites = queryClient.getQueryData<Website[]>(websiteKeys.allWebsites())
      const previousApprovedWebsites = queryClient.getQueryData<Website[]>(websiteKeys.approved())

      // 乐观更新：立即从所有缓存中移除
      queryClient.setQueryData<Category[]>(websiteKeys.categories(), (old) => {
        if (!old) return []
        return old.filter((category) => category.id !== deletedId)
      })

      queryClient.setQueryData<CategoryWithUsage[]>(websiteKeys.categoriesWithUsage(), (old) => {
        if (!old) return []
        return old.filter((category) => category.id !== deletedId)
      })

      // 更新网站缓存，将删除分类的网站的 category 设为 undefined
      queryClient.setQueryData<Website[]>(websiteKeys.allWebsites(), (old) => {
        if (!old) return []
        return old.map((website) =>
          website.category?.id === deletedId
            ? { ...website, category: undefined, category_id: '' }
            : website
        )
      })

      queryClient.setQueryData<Website[]>(websiteKeys.approved(), (old) => {
        if (!old) return []
        return old.map((website) =>
          website.category?.id === deletedId
            ? { ...website, category: undefined, category_id: '' }
            : website
        )
      })

      // 返回上下文以便在错误时回滚
      return {
        previousCategories,
        previousCategoriesWithUsage,
        previousAllWebsites,
        previousApprovedWebsites
      }
    },
    onError: (err, deletedId, context) => {
      // 回滚乐观更新
      if (context?.previousCategories) {
        queryClient.setQueryData(websiteKeys.categories(), context.previousCategories)
      }
      if (context?.previousCategoriesWithUsage) {
        queryClient.setQueryData(websiteKeys.categoriesWithUsage(), context.previousCategoriesWithUsage)
      }
      if (context?.previousAllWebsites) {
        queryClient.setQueryData(websiteKeys.allWebsites(), context.previousAllWebsites)
      }
      if (context?.previousApprovedWebsites) {
        queryClient.setQueryData(websiteKeys.approved(), context.previousApprovedWebsites)
      }
    },
    onSettled: () => {
      // 无论成功失败，都重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: websiteKeys.categories() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.categoriesWithUsage() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.allWebsites() })
      queryClient.invalidateQueries({ queryKey: websiteKeys.approved() })
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
