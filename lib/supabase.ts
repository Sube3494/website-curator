import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 数据库类型定义
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive'
  avatar?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  color_from: string
  color_to: string
  created_at: string
}

export interface CategoryWithUsage extends Category {
  website_count: number
  is_custom?: boolean
  custom_from_hex?: string
  custom_to_hex?: string
}

export interface Website {
  id: string
  title: string
  url: string
  description: string
  favicon?: string
  category_id: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_by: string
  created_at: string
  updated_at: string
  // 关联数据
  category?: Category
  tags?: Tag[]
  submitted_by_user?: User
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface Favorite {
  user_id: string
  website_id: string
  created_at: string
  website?: Website
}

export interface SystemSetting {
  id: string
  key: string
  value: any
  description?: string
  created_at: string
  updated_at: string
}

// 数据库操作函数
export const db = {
  // 用户相关
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as User
  },

  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase users query error:', error)
        throw error
      }

      return data as User[]
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      throw error
    }
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  // 分类相关
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Supabase categories query error:', error)
        throw error
      }

      return data as Category[]
    } catch (error) {
      console.error('Error in getCategories:', error)
      throw error
    }
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at'>) {
    try {
      // 使用 RPC 函数来创建分类
      const { data, error } = await supabase.rpc('create_category_admin', {
        category_data: category
      })

      if (error) {
        console.error('RPC 创建分类时出错:', error)
        throw new Error(`创建分类失败: ${error.message}`)
      }

      return data as Category
    } catch (rpcError) {
      console.error('RPC 调用失败，尝试直接创建:', rpcError)

      // 如果 RPC 失败，回退到直接创建
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

      if (error) {
        console.error('直接创建分类时出错:', error)
        throw error
      }

      return data as Category
    }
  },

  async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>) {
    try {
      // 使用 RPC 函数来更新分类
      const { data, error } = await supabase.rpc('update_category_admin', {
        category_id: id,
        category_updates: updates
      })

      if (error) {
        console.error('RPC 更新分类时出错:', error)
        throw new Error(`更新分类失败: ${error.message}`)
      }

      return data as Category
    } catch (rpcError) {
      console.error('RPC 调用失败，尝试直接更新:', rpcError)

      // 如果 RPC 失败，回退到直接更新
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        console.error('直接更新分类时出错:', error)
        throw new Error(`更新分类失败: ${error.message}`)
      }

      // 如果没有返回数据但更新成功（没有error）
      if (!data || data.length === 0) {
        // 获取更新后的分类
        const { data: updatedData, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) {
          console.error('获取更新后的分类失败:', fetchError)
          throw new Error('分类不存在或更新失败')
        }

        return updatedData as Category
      }

      const updatedCategory = data[0] as Category
      return updatedCategory
    }
  },

  async deleteCategory(id: string) {
    try {
      const { data, error } = await supabase.rpc('delete_category_admin', {
        category_id: id
      })

      if (error) {
        console.error('RPC 删除分类时出错:', error)
        throw new Error(`删除分类失败: ${error.message}`)
      }

      return data
    } catch (rpcError) {
      console.error('RPC 调用失败，尝试直接删除:', rpcError)

      // 如果 RPC 失败，回退到直接删除
      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('直接删除分类时出错:', error)
        throw error
      }

      return true
    }
  },

  async getCategoryUsageCount(categoryId: string) {
    const { count, error } = await supabase
      .from('websites')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)

    if (error) throw error
    return count || 0
  },

  async getCategoriesWithUsageCount() {
    try {
      // 获取所有分类
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      // 获取每个分类的使用统计
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const { count, error } = await supabase
            .from('websites')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)

          if (error) {
            console.error(`Error counting websites for category ${category.id}:`, error)
            return { ...category, website_count: 0 }
          }

          return { ...category, website_count: count || 0 }
        })
      )

      return categoriesWithCount
    } catch (error) {
      console.error('Error in getCategoriesWithUsageCount:', error)
      throw error
    }
  },

  // 网站相关
  async getWebsites(status?: 'pending' | 'approved' | 'rejected') {
    try {
      let query = supabase
        .from('websites')
        .select(`
          *,
          category:categories(*),
          tags:website_tags(tag:tags(*)),
          submitted_by_user:users!websites_submitted_by_fkey(id, email, name)
        `)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      // 转换 tags 数据结构
      const processedData = data.map(website => ({
        ...website,
        tags: website.tags?.map((wt: any) => wt.tag).filter(Boolean) || []
      }))

      return processedData as Website[]
    } catch (error) {
      console.error('Error in getWebsites:', error)
      throw error
    }
  },

  async getApprovedWebsites() {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select(`
          *,
          category:categories(*),
          tags:website_tags(tag:tags(*)),
          submitted_by_user:users!websites_submitted_by_fkey(id, email, name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase approved websites query error:', error)
        throw error
      }

      // 转换 tags 数据结构
      const processedData = data.map(website => ({
        ...website,
        tags: website.tags?.map((wt: any) => wt.tag).filter(Boolean) || []
      }))

      return processedData as Website[]
    } catch (error) {
      console.error('Error in getApprovedWebsites:', error)
      throw error
    }
  },

  async createWebsite(website: Omit<Website, 'id' | 'created_at' | 'updated_at'>) {
    // 提取标签数据，从网站数据中移除，但保留其他所有字段
    const { tags: websiteTags, ...websiteData } = website as any

    // 首先插入网站数据
    const { data: websiteResult, error: websiteError } = await supabase
      .from('websites')
      .insert(websiteData)
      .select(`
        *,
        category:categories(*),
        submitted_by_user:users!websites_submitted_by_fkey(id, email, name)
      `)
      .single()

    if (websiteError) throw websiteError

    // 处理标签
    if (websiteTags && websiteTags.length > 0) {
      // 处理用户输入的标签
      const tagNames = Array.isArray(websiteTags)
        ? websiteTags
        : typeof websiteTags === 'string'
          ? websiteTags.split(',').map(t => t.trim()).filter(Boolean)
          : []

      if (tagNames.length > 0) {
        // 批量查询所有已存在的标签
        const { data: existingTags } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', tagNames)

        const existingTagMap = new Map(existingTags?.map(tag => [tag.name, tag.id]) || []);
        const newTagNames = tagNames.filter(name => !existingTagMap.has(name));

        // 批量创建新标签
        let newTagIds: string[] = [];
        if (newTagNames.length > 0) {
          const newTagsData = newTagNames.map(name => ({ name }));
          const { data: newTags } = await supabase
            .from('tags')
            .insert(newTagsData)
            .select('id, name');

          if (newTags) {
            newTagIds = newTags.map(tag => tag.id);
            newTags.forEach(tag => existingTagMap.set(tag.name, tag.id));
          }
        }

        // 准备所有标签ID
        const allTagIds = tagNames.map(name => existingTagMap.get(name)).filter(Boolean) as string[];

        // 批量关联标签到网站
        if (allTagIds.length > 0) {
          const websiteTagsData = allTagIds.map(tagId => ({
            website_id: websiteResult.id,
            tag_id: tagId
          }));

          const { error: websiteTagsError } = await supabase
            .from('website_tags')
            .insert(websiteTagsData);

          if (websiteTagsError) throw websiteTagsError;
        }
      }
    }

    // 重新获取完整的网站数据，包括标签
    const { data: finalWebsite, error: finalError } = await supabase
      .from('websites')
      .select(`
        *,
        category:categories(*),
        tags:website_tags(tag:tags(*)),
        submitted_by_user:users!websites_submitted_by_fkey(id, email, name)
      `)
      .eq('id', websiteResult.id)
      .single()

    if (finalError) throw finalError

    // 转换 tags 数据结构
    const processedData = {
      ...finalWebsite,
      tags: finalWebsite.tags?.map((wt: any) => wt.tag).filter(Boolean) || []
    }

    return processedData as Website
  },

  async updateWebsite(id: string, updates: Partial<Website>) {
    const { data, error } = await supabase
      .from('websites')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        tags:website_tags(tag:tags(*)),
        submitted_by_user:users!websites_submitted_by_fkey(id, email, name)
      `)
      .single()

    if (error) throw error

    // 转换 tags 数据结构
    const processedData = {
      ...data,
      tags: data.tags?.map((wt: any) => wt.tag).filter(Boolean) || []
    }

    return processedData as Website
  },

  async deleteWebsite(id: string) {
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 收藏相关
  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        website:websites(
          *,
          category:categories(*),
          tags:website_tags(tag:tags(*))
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // 处理标签数据结构，使其与主页一致
    const processedData = data.map(favorite => ({
      ...favorite,
      website: favorite.website ? {
        ...favorite.website,
        tags: favorite.website.tags?.map((wt: any) => wt.tag).filter(Boolean) || []
      } : null
    }))

    return processedData as Favorite[]
  },

  async addFavorite(userId: string, websiteId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, website_id: websiteId })
      .select()
      .single()

    if (error) throw error
    return data as Favorite
  },

  async removeFavorite(userId: string, websiteId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('website_id', websiteId)

    if (error) throw error
  },

  // 标签相关
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Tag[]
  },

  async createTag(name: string) {
    const { data, error } = await supabase
      .from('tags')
      .insert({ name })
      .select()
      .single()

    if (error) throw error
    return data as Tag
  },

  async addWebsiteTags(websiteId: string, tagIds: string[]) {
    const websiteTags = tagIds.map(tagId => ({
      website_id: websiteId,
      tag_id: tagId
    }))

    const { error } = await supabase
      .from('website_tags')
      .insert(websiteTags)

    if (error) throw error
  },

  async removeWebsiteTags(websiteId: string) {
    const { error } = await supabase
      .from('website_tags')
      .delete()
      .eq('website_id', websiteId)

    if (error) throw error
  },

  // 系统设置相关
  async getSystemSetting(key: string) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single()

      if (error) {
        // 如果是权限错误或找不到记录，返回默认值而不是抛出错误
        if (error.code === 'PGRST116' || error.code === 'PGRST301' || error.message?.includes('No rows found')) {
          console.warn(`系统设置 '${key}' 不存在或无权限访问，使用默认值`)
          return null
        }

        console.error('Supabase getSystemSetting error:', {
          error,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          key
        })
        throw error
      }
      return data as SystemSetting
    } catch (error) {
      console.error('Error in getSystemSetting:', error)
      throw error
    }
  },

  async getAllSystemSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key')

    if (error) throw error
    return data as SystemSetting[]
  },

  async updateSystemSetting(key: string, value: any) {
    // 使用 upsert 操作：如果记录存在就更新，如果不存在就创建
    const { data, error } = await supabase
      .from('system_settings')
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'key',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) throw error
    return data as SystemSetting
  }
}
