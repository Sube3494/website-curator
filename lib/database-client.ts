// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 20:17:00 +08:00; Reason: "Create database client interface compatible with existing supabase calls";
// }}
// {{START MODIFICATIONS}}
// 客户端安全API包装器，不能导入服务器端模块
// 自定义API函数来代替直接使用数据库
// 不能在客户端导入服务器端模块
// import { getUserBySessionToken, verifyJWT } from './mysql'
import {
  User,
  Category,
  CategoryWithUsage,
  Website,
  Tag,
  Favorite,
  SystemSetting,
  WebsiteSubmission,
  AuthResponse
} from './db-types'

// 获取基础URL，用于API请求
function getBaseUrl() {
  return typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

// 客户端安全的数据库API包装器
export const db = {
  // 用户相关
  async getUser(id: string) {
    const response = await fetch(`${getBaseUrl()}/api/users/${id}`)
    const result = await response.json()
    return result.success ? result.data : null
  },

  async getAllUsers() {
    const response = await fetch(`${getBaseUrl()}/api/users`)
    const result = await response.json()
    return result.success ? result.data : []
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const response = await fetch(`${getBaseUrl()}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  async updateUser(id: string, updates: Partial<User>) {
    const response = await fetch(`${getBaseUrl()}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  // 分类相关
  async getCategories() {
    const response = await fetch(`${getBaseUrl()}/api/categories`)
    const result = await response.json()
    return result.success ? result.data : []
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at'>) {
    const response = await fetch(`${getBaseUrl()}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const response = await fetch(`${getBaseUrl()}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  async deleteCategory(id: string) {
    const response = await fetch(`${getBaseUrl()}/api/categories/${id}`, {
      method: 'DELETE'
    })
    const result = await response.json()
    return result.success
  },

  async getCategoryUsageCount(categoryId: string) {
    const categories = await this.getCategoriesWithUsageCount()
    const category = categories.find(c => c.id === categoryId)
    return category?.website_count || 0
  },

  async getCategoriesWithUsageCount() {
    try {
      console.log('客户端请求分类使用统计...')
      const response = await fetch(`${getBaseUrl()}/api/categories?withUsage=true`)
      const result = await response.json()
      console.log('客户端获取分类使用统计结果:', result)
      if (result.success) {
        return result.data || []
      } else {
        console.error('获取分类使用统计失败:', result.message || '未知错误')
        return []
      }
    } catch (error) {
      console.error('获取分类使用统计请求异常:', error)
      return []
    }
  },

  // 网站相关
  async getWebsites(status?: 'pending' | 'approved' | 'rejected') {
    const url = status ? `${getBaseUrl()}/api/websites?status=${status}` : `${getBaseUrl()}/api/websites`
    const response = await fetch(url)
    const result = await response.json()
    return result.success ? result.data : []
  },

  async getApprovedWebsites() {
    const response = await fetch(`${getBaseUrl()}/api/websites?status=approved`)
    const result = await response.json()
    return result.success ? result.data : []
  },

  async createWebsite(website: any) {
    // 转换数据格式以匹配新接口
    const websiteData = {
      title: website.title,
      url: website.url,  
      description: website.description,
      category_id: website.category_id,
      submitted_by: website.submitted_by,
      tags: website.tags || []
    }
    
    const response = await fetch(`${getBaseUrl()}/api/websites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(websiteData)
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  async updateWebsite(id: string, updates: Partial<Website>) {
    const response = await fetch(`${getBaseUrl()}/api/websites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  async deleteWebsite(id: string) {
    await fetch(`${getBaseUrl()}/api/websites/${id}`, {
      method: 'DELETE'
    })
  },

  // 收藏相关
  async getFavorites(userId: string) {
    const response = await fetch(`${getBaseUrl()}/api/favorites?userId=${userId}`)
    const result = await response.json()
    return result.success ? result.data : []
  },

  async addFavorite(userId: string, websiteId: string) {
    const response = await fetch(`${getBaseUrl()}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, websiteId })
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  async removeFavorite(userId: string, websiteId: string) {
    await fetch(`${getBaseUrl()}/api/favorites?userId=${userId}&websiteId=${websiteId}`, {
      method: 'DELETE'
    })
  },

  // 标签相关
  async getTags() {
    const response = await fetch(`${getBaseUrl()}/api/tags`)
    const result = await response.json()
    return result.success ? result.data : []
  },

  async createTag(name: string) {
    const response = await fetch(`${getBaseUrl()}/api/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    const result = await response.json()
    return result.success ? result.data : null
  },

  async addWebsiteTags(websiteId: string, tagIds: string[]) {
    // 这个功能在新的实现中已经集成到 createWebsite 中
    console.warn('addWebsiteTags 已弃用，请使用 createWebsite 时传递 tags')
  },

  async removeWebsiteTags(websiteId: string) {
    // 在更新网站时处理标签移除
    console.warn('removeWebsiteTags 已弃用，请使用 updateWebsite')
  },

  // 系统设置相关
  async getSystemSetting(key: string) {
    const response = await fetch(`${getBaseUrl()}/api/system-settings/${key}`)
    const result = await response.json()
    return result.success ? result.data : null
  },

  async getAllSystemSettings() {
    const response = await fetch(`${getBaseUrl()}/api/system-settings`)
    const result = await response.json()
    return result.success ? result.data : []
  },

  async updateSystemSetting(key: string, value: any) {
    const response = await fetch(`${getBaseUrl()}/api/system-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ key, value })
    })
    const result = await response.json()
    return result.success ? result.data : null
  }
}

// 认证相关函数
export async function authenticateUser(email: string, password: string): Promise<AuthResponse> {
  try {
    // 在服务器API路由中需要使用完整URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const result = await response.json()
    
    return {
      user: result.success ? result.data.user : null,
      token: result.success ? result.data.token : null,
      error: result.success ? undefined : result.message
    }
  } catch (error) {
    console.error('认证失败:', error)
    return {
      user: null,
      token: null,
      error: '认证失败'
    }
  }
}

export async function getCurrentUserFromToken(): Promise<User | null> {
  try {
    // 在服务器API路由中需要使用完整URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/me`)
    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('获取当前用户失败:', error)
    return null
  }
}

// 导出类型以保持兼容性
export * from './db-types'
// {{END MODIFICATIONS}}