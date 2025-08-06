// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-06 10:30:00 +08:00; Reason: "创建数据库类型定义文件，统一导出所有类型";
// }}
// {{START MODIFICATIONS}}

// 确保所有类型都被正确导出
// 错误类型
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// 用户类型
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive'
  trusted: boolean
  created_at: string
  updated_at: string
}

// 分类类型
export interface Category {
  id: string
  name: string
  color_from?: string
  color_to?: string
  created_at: string
}

// 带使用数量的分类类型
export interface CategoryWithUsage extends Category {
  website_count: number
}

// 标签类型
export interface Tag {
  id: string
  name: string
  created_at: string
}

// 网站类型
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
  submitted_by_user?: {
    id: string
    name: string
    email: string
  }
}

// 收藏类型
export interface Favorite {
  user_id: string
  website_id: string
  created_at: string
  website?: Website
}

// 系统设置类型
export interface SystemSetting {
  setting_key: string
  setting_value: any
  description?: string
  updated_at?: string
  created_at?: string
  id?: string
}

// 认证相关类型
export interface AuthResponse {
  user: User | null
  token: string | null
  error?: string
}

// 网站提交类型
export interface WebsiteSubmission {
  title: string
  url: string
  description: string
  category_id: string
  tags?: string[]
  submitted_by?: string
}

// 网站过滤类型
export interface WebsiteFilters {
  status?: 'pending' | 'approved' | 'rejected'
  category?: string
  search?: string
  limit?: number
  offset?: number
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
// {{END MODIFICATIONS}}