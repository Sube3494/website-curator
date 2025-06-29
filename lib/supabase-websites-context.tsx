"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, db, type Website, type Category } from './supabase'
import { useSupabaseAuth } from './supabase-auth-context'

// 带有类别信息的网站类型
export interface WebsiteWithCategory extends Website {
  category: Category
}

interface SupabaseWebsitesContextType {
  websites: WebsiteWithCategory[]
  categoriesByID: Record<string, Category>
  categories: Category[]
  isLoading: boolean
  addWebsite: (website: Omit<Website, 'id' | 'created_at' | 'updated_at'>) => Promise<Website>
  addToFavorites: (websiteId: string) => Promise<void>
  removeFavorite: (websiteId: string) => Promise<void>
  favorites: Set<string>
  isFavoritesLoading: boolean
  isAddingFavorite: Record<string, boolean>
  isRemovingFavorite: Record<string, boolean>
}

const SupabaseWebsitesContext = createContext<SupabaseWebsitesContextType>({
  websites: [],
  categoriesByID: {},
  categories: [],
  isLoading: true,
  addWebsite: async () => ({ id: '', title: '', url: '', description: '', category_id: '', status: 'pending', submitted_by: '', created_at: '', updated_at: '' }),
  addToFavorites: async () => { },
  removeFavorite: async () => { },
  favorites: new Set(),
  isFavoritesLoading: false,
  isAddingFavorite: {},
  isRemovingFavorite: {}
})

export const useSupabaseWebsites = () => useContext(SupabaseWebsitesContext)

// 模拟数据 - 当Supabase不可用时使用
const mockWebsites: WebsiteWithCategory[] = [
  {
    id: '1',
    title: 'Next.js - React Framework',
    url: 'https://nextjs.org',
    description: 'Next.js is a React framework for production - it makes building fullstack React apps and sites a breeze and ships with built-in SSR.',
    category_id: 'dev',
    status: 'approved',
    submitted_by: 'user1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    category: {
      id: 'dev',
      name: '开发工具',
      color_from: 'from-blue-500',
      color_to: 'to-indigo-500',
      created_at: '2023-01-01'
    }
  },
  // ... more mock websites ...
]

const mockCategories: Category[] = [
  {
    id: 'dev',
    name: '开发工具',
    color_from: 'from-blue-500',
    color_to: 'to-indigo-500',
    created_at: '2023-01-01'
  },
  // ... more mock categories ...
]

export function SupabaseWebsitesProvider({ children }: { children: React.ReactNode }) {
  const [websites, setWebsites] = useState<WebsiteWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false)
  const [isAddingFavorite, setIsAddingFavorite] = useState<Record<string, boolean>>({})
  const [isRemovingFavorite, setIsRemovingFavorite] = useState<Record<string, boolean>>({})
  const { user } = useSupabaseAuth()

  // 创建分类ID到分类的映射
  const categoriesByID: Record<string, Category> = categories.reduce((acc, category) => {
    acc[category.id] = category
    return acc
  }, {} as Record<string, Category>)

  // 加载网站数据
  useEffect(() => {
    async function loadWebsitesAndCategories() {
      try {
        setIsLoading(true)

        // 并行加载分类和网站
        const [categoriesData, websitesData] = await Promise.all([
          db.getCategories(),
          db.getApprovedWebsites()
        ])

        // 保存分类数据
        setCategories(categoriesData || [])

        // 合并网站和分类数据
        const websitesWithCategories = websitesData.map(website => {
          const category = categoriesData.find(c => c.id === website.category_id)
          return {
            ...website,
            category: category || {
              id: 'unknown',
              name: '未分类',
              color_from: 'from-gray-400',
              color_to: 'to-gray-600',
              created_at: ''
            }
          }
        })

        setWebsites(websitesWithCategories)
      } catch (error) {
        // 使用模拟数据作为备用
        setWebsites(mockWebsites)
        setCategories(mockCategories)
      } finally {
        setIsLoading(false)
      }
    }

    loadWebsitesAndCategories()
  }, [])

  // 当用户登录时加载收藏
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          setIsFavoritesLoading(true)
          const favoritesData = await db.getFavorites(user.id)
          setFavorites(new Set(favoritesData.map(fav => fav.website_id)))
        } catch (error) {
          // 如果获取收藏失败，使用空集合
          setFavorites(new Set())
        } finally {
          setIsFavoritesLoading(false)
        }
      } else {
        // 用户未登录，清除收藏
        setFavorites(new Set())
      }
    }

    loadFavorites()
  }, [user])

  // 添加网站
  const addWebsite = async (websiteData: Omit<Website, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newWebsite = await db.createWebsite(websiteData)
      
      // 网站创建成功后，不需要立即添加到列表中，因为需要管理员审核
      // 只有状态为approved的网站才会显示在列表中
      
      return newWebsite
    } catch (error) {
      throw error
    }
  }

  // 添加到收藏
  const addToFavorites = async (websiteId: string) => {
    if (!user) return

    // 乐观更新UI
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      newFavorites.add(websiteId)
      return newFavorites
    })

    setIsAddingFavorite(prev => ({ ...prev, [websiteId]: true }))

    try {
      await db.addFavorite(user.id, websiteId)
    } catch (error) {
      // 出错时回滚UI状态
      setFavorites(prev => {
        const newFavorites = new Set(prev)
        newFavorites.delete(websiteId)
        return newFavorites
      })
      throw error
    } finally {
      setIsAddingFavorite(prev => ({ ...prev, [websiteId]: false }))
    }
  }

  // 移除收藏
  const removeFavorite = async (websiteId: string) => {
    if (!user) return

    // 乐观更新UI
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      newFavorites.delete(websiteId)
      return newFavorites
    })

    setIsRemovingFavorite(prev => ({ ...prev, [websiteId]: true }))

    try {
      await db.removeFavorite(user.id, websiteId)
    } catch (error) {
      // 出错时回滚UI状态
      setFavorites(prev => {
        const newFavorites = new Set(prev)
        newFavorites.add(websiteId)
        return newFavorites
      })
      throw error
    } finally {
      setIsRemovingFavorite(prev => ({ ...prev, [websiteId]: false }))
    }
  }

  return (
    <SupabaseWebsitesContext.Provider
      value={{
        websites,
        categoriesByID,
        categories,
        isLoading,
        addWebsite,
        addToFavorites,
        removeFavorite,
        favorites,
        isFavoritesLoading,
        isAddingFavorite,
        isRemovingFavorite
      }}
    >
      {children}
    </SupabaseWebsitesContext.Provider>
  )
}
