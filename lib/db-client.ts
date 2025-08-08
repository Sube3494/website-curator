// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-06 10:05:00 +08:00; Reason: "创建数据库客户端替换原supabase.ts";
// }}
// {{START MODIFICATIONS}}
// 客户端兼容性层 - 不导入服务器端模块

// 保持兼容性的认证对象 - 仅用于类型兼容
export const auth = {
  // 认证相关 (已弃用，使用新的认证方式)
  getUser: async () => ({ data: { user: null }, error: new Error('请使用新的认证方式') }),
  signInWithPassword: async () => ({ data: { user: null }, error: new Error('请使用新的认证API') }),
  signUp: async () => ({ data: { user: null }, error: new Error('请使用新的注册API') }),
  signOut: async () => ({ error: new Error('请使用新的登出API') })
}

// 从类型文件导入
export type {
  User,
  Category,
  CategoryWithUsage,
  Website,
  Tag,
  Favorite,
  SystemSetting,
  ApiResponse
} from './db-types'

// 客户端安全的数据库操作 - 通过 API 调用
export const db = {
  // 网站相关方法
  async getApprovedWebsites() {
    const response = await fetch('/api/websites?status=approved')
    if (!response.ok) throw new Error('获取已批准网站失败')
    const result = await response.json()
    return result.data || []
  },
  
  async getWebsites(filters?: { status?: string }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    
    const response = await fetch(`/api/websites?${params}`)
    if (!response.ok) throw new Error('获取网站失败')
    const result = await response.json()
    return result.data || []
  },
  
  async createWebsite(websiteData: any) {
    const response = await fetch('/api/websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify(websiteData)
    })
    if (!response.ok) throw new Error('创建网站失败')
    const result = await response.json()
    return result.data
  },
  
  async updateWebsite(id: string, updates: any) {
    const response = await fetch(`/api/websites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('更新网站失败')
    const result = await response.json()
    return result.data
  },
  
  async deleteWebsite(id: string) {
    const response = await fetch(`/api/websites/${id}`, {
      method: 'DELETE',
      credentials: 'include' // 确保发送认证cookies
    })
    if (!response.ok) throw new Error('删除网站失败')
    return true
  },
  
  // 分类相关方法
  async getCategories() {
    const response = await fetch('/api/categories')
    if (!response.ok) throw new Error('获取分类失败')
    const result = await response.json()
    return result.data || []
  },
  
  async getCategoriesWithUsageCount() {
    const response = await fetch('/api/categories?withUsage=true')
    if (!response.ok) throw new Error('获取带使用统计的分类失败')
    const result = await response.json()
    return result // 返回完整的 {success, data} 格式，让 hook 处理
  },
  
  async createCategory(categoryData: any) {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify(categoryData)
    })
    if (!response.ok) throw new Error('创建分类失败')
    const result = await response.json()
    return result.data
  },
  
  async updateCategory(id: string, updates: any) {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('更新分类失败')
    const result = await response.json()
    return result.data
  },
  
  async deleteCategory(id: string) {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include' // 确保发送认证cookies
    })
    if (!response.ok) throw new Error('删除分类失败')
    return true
  },
  
  // 收藏相关方法
  async getFavorites(userId: string) {
    if (!userId) return []
    const response = await fetch(`/api/favorites?userId=${userId}`)
    if (!response.ok) throw new Error('获取收藏失败')
    const result = await response.json()
    return result.data || []
  },
  
  async addFavorite(userId: string, websiteId: string) {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify({ userId, websiteId })
    })
    if (!response.ok) throw new Error('添加收藏失败')
    const result = await response.json()
    return result.data
  },
  
  async removeFavorite(userId: string, websiteId: string) {
    const response = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify({ userId, websiteId })
    })
    if (!response.ok) throw new Error('删除收藏失败')
    return true
  },
  
  // 系统设置相关方法
  async getSystemSetting(key: string) {
    const response = await fetch(`/api/system-settings/${key}`)
    if (!response.ok) throw new Error('获取系统设置失败')
    return response.json()
  },
  
  async getAllSystemSettings() {
    const response = await fetch('/api/system-settings')
    if (!response.ok) throw new Error('获取所有系统设置失败')
    const result = await response.json()
    return result.data || []
  },
  
  async updateSystemSetting(key: string, value: any) {
    const response = await fetch(`/api/system-settings/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify({ value })
    })
    if (!response.ok) throw new Error('更新系统设置失败')
    return response.json()
  },

  // 用户相关方法
  async getAllUsers() {
    const response = await fetch('/api/users', {
      credentials: 'include' // 确保发送认证cookies
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`获取所有用户失败: ${response.status} - ${errorData.message || '未知错误'}`)
    }
    
    const result = await response.json()
    return result.data || []
  },

  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`, {
      credentials: 'include' // 确保发送认证cookies
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`获取用户失败: ${response.status} - ${errorData.message || '未知错误'}`)
    }
    
    const result = await response.json()
    return result.data
  },

  async updateUser(id: string, updates: any) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 确保发送认证cookies
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`更新用户失败: ${response.status} - ${errorData.message || '未知错误'}`)
    }
    
    const result = await response.json()
    return result.data
  }
}
// {{END MODIFICATIONS}}