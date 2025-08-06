// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 20:16:00 +08:00; Reason: "Create unified database adapter layer with all CRUD operations for MySQL";
// }}
// {{START MODIFICATIONS}}
import { 
  executeQuery, 
  executeQuerySingle, 
  generateUUID, 
  hashPassword, 
  verifyPassword,
  generateJWT,
  verifyJWT,
  createUserSession,
  getUserBySessionToken,
  deleteUserSession,
  executeTransaction
} from './mysql'
import {
  User,
  Category,
  CategoryWithUsage,
  Website,
  Tag,
  Favorite,
  SystemSetting,
  AuthResponse,
  WebsiteSubmission,
  WebsiteFilters,
  DatabaseError,
  AuthenticationError,
  ValidationError
} from './db-types'

// 数据库操作类
export class Database {
  // ============================================================================
  // 用户相关操作
  // ============================================================================

  async getUser(id: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = ?'
      return await executeQuerySingle<User>(query, [id])
    } catch (error) {
      console.error('获取用户失败:', error)
      throw new DatabaseError('获取用户失败')
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = ?'
      return await executeQuerySingle<User>(query, [email])
    } catch (error) {
      console.error('根据邮箱获取用户失败:', error)
      throw new DatabaseError('获取用户失败')
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const query = 'SELECT * FROM users ORDER BY created_at DESC'
      return await executeQuery<User>(query)
    } catch (error) {
      console.error('获取所有用户失败:', error)
      throw new DatabaseError('获取用户列表失败')
    }
  }

  async createUser(userData: { email: string; name: string; password: string; role?: string; status?: string; trusted?: boolean; avatar?: string; email_verified?: boolean }): Promise<User> {
    try {
      const id = generateUUID()
      const hashedPassword = await hashPassword(userData.password)

      const query = `
        INSERT INTO users (id, email, name, password_hash, role, status, trusted, avatar, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      const params = [
        id,
        userData.email,
        userData.name,
        hashedPassword,
        userData.role || 'user',
        userData.status || 'active',
        userData.trusted || false,
        userData.avatar || null,
        userData.email_verified || false
      ]

      await executeQuery(query, params)

      const newUser = await this.getUser(id)
      if (!newUser) {
        throw new DatabaseError('创建用户后获取失败')
      }
      
      return newUser
    } catch (error) {
      console.error('创建用户失败:', error)
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new ValidationError('邮箱已存在', 'email')
      }
      throw new DatabaseError('创建用户失败')
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      // 构建动态更新语句
      const fields: string[] = []
      const values: any[] = []
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && value !== undefined) {
          fields.push(`${key} = ?`)
          values.push(value)
        }
      })
      
      if (fields.length === 0) {
        throw new ValidationError('没有要更新的字段')
      }
      
      values.push(id)
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
      
      await executeQuery(query, values)
      
      const updatedUser = await this.getUser(id)
      if (!updatedUser) {
        throw new DatabaseError('用户不存在')
      }
      
      return updatedUser
    } catch (error) {
      console.error('更新用户失败:', error)
      throw new DatabaseError('更新用户失败')
    }
  }

  // 用户认证
  async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = await this.getUserByEmail(email)
      
      if (!user) {
        return { success: false, message: '用户不存在' }
      }
      
      if (user.status !== 'active') {
        return { success: false, message: '账户已被禁用' }
      }
      
      const isPasswordValid = await verifyPassword(password, user.password_hash)
      
      if (!isPasswordValid) {
        return { success: false, message: '密码错误' }
      }
      
      // 生成JWT令牌
      const token = generateJWT({ userId: user.id, email: user.email, role: user.role })
      
      // 创建会话
      await createUserSession(user.id, token)
      
      // 返回用户信息（不包含密码）
      const { password_hash: _password_hash, ...userWithoutPassword } = user
      
      return {
        success: true,
        token,
        user: userWithoutPassword
      }
    } catch (error) {
      console.error('用户认证失败:', error)
      return { success: false, message: '认证失败' }
    }
  }

  // ============================================================================
  // 分类相关操作
  // ============================================================================

  async getCategories(): Promise<Category[]> {
    try {
      const query = 'SELECT * FROM categories ORDER BY name'
      return await executeQuery<Category>(query)
    } catch (error) {
      console.error('获取分类失败:', error)
      throw new DatabaseError('获取分类失败')
    }
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    try {
      const id = generateUUID()
      const query = `
        INSERT INTO categories (id, name, color_from, color_to)
        VALUES (?, ?, ?, ?)
      `
      
      await executeQuery(query, [id, categoryData.name, categoryData.color_from, categoryData.color_to])
      
      const newCategory = await executeQuerySingle<Category>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      )
      
      if (!newCategory) {
        throw new DatabaseError('创建分类后获取失败')
      }
      
      return newCategory
    } catch (error) {
      console.error('创建分类失败:', error)
      throw new DatabaseError('创建分类失败')
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const fields: string[] = []
      const values: any[] = []
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && value !== undefined) {
          fields.push(`${key} = ?`)
          values.push(value)
        }
      })
      
      if (fields.length === 0) {
        throw new ValidationError('没有要更新的字段')
      }
      
      values.push(id)
      const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`
      
      await executeQuery(query, values)
      
      const updatedCategory = await executeQuerySingle<Category>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      )
      
      if (!updatedCategory) {
        throw new DatabaseError('分类不存在')
      }
      
      return updatedCategory
    } catch (error) {
      console.error('更新分类失败:', error)
      throw new DatabaseError('更新分类失败')
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      // 检查是否有网站使用此分类
      const websiteCount = await executeQuerySingle<{count: number}>(
        'SELECT COUNT(*) as count FROM websites WHERE category_id = ?',
        [id]
      )
      
      if (websiteCount && websiteCount.count > 0) {
        throw new ValidationError('该分类下还有网站，无法删除')
      }
      
      await executeQuery('DELETE FROM categories WHERE id = ?', [id])
    } catch (error) {
      console.error('删除分类失败:', error)
      if (error instanceof ValidationError) {
        throw error
      }
      throw new DatabaseError('删除分类失败')
    }
  }

  async getCategoriesWithUsageCount(): Promise<CategoryWithUsage[]> {
    try {
      const query = `
        SELECT 
          c.*,
          COUNT(w.id) as website_count
        FROM categories c
        LEFT JOIN websites w ON c.id = w.category_id AND w.status = 'approved'
        GROUP BY c.id
        ORDER BY c.name
      `
      return await executeQuery<CategoryWithUsage>(query)
    } catch (error) {
      console.error('获取分类使用统计失败:', error)
      throw new DatabaseError('获取分类统计失败')
    }
  }

  // ============================================================================
  // 网站相关操作
  // ============================================================================

  async getWebsites(filters: WebsiteFilters = {}): Promise<Website[]> {
    try {
      let query = `
        SELECT 
          w.*,
          c.name as category_name,
          c.color_from as category_color_from,
          c.color_to as category_color_to,
          u.name as submitted_by_name,
          u.email as submitted_by_email,
          GROUP_CONCAT(t.name) as tag_names,
          GROUP_CONCAT(t.id) as tag_ids
        FROM websites w
        LEFT JOIN categories c ON w.category_id = c.id
        LEFT JOIN users u ON w.submitted_by = u.id
        LEFT JOIN website_tags wt ON w.id = wt.website_id
        LEFT JOIN tags t ON wt.tag_id = t.id
      `
      
      const conditions: string[] = []
      const params: any[] = []
      
      if (filters.status) {
        conditions.push('w.status = ?')
        params.push(filters.status)
      }
      
      if (filters.category) {
        conditions.push('w.category_id = ?')
        params.push(filters.category)
      }
      
      if (filters.search) {
        conditions.push('(w.title LIKE ? OR w.description LIKE ?)')
        params.push(`%${filters.search}%`, `%${filters.search}%`)
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
      
      query += ' GROUP BY w.id ORDER BY w.created_at DESC'
      
      if (filters.limit) {
        query += ' LIMIT ?'
        params.push(filters.limit)
        
        if (filters.offset) {
          query += ' OFFSET ?'
          params.push(filters.offset)
        }
      }
      
      const results = await executeQuery(query, params)
      
      // 处理关联数据
      return results.map((row: any) => ({
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description,
        favicon: row.favicon,
        category_id: row.category_id,
        status: row.status,
        submitted_by: row.submitted_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          color_from: row.category_color_from,
          color_to: row.category_color_to,
          created_at: ''
        } : undefined,
        tags: row.tag_names ? row.tag_names.split(',').map((name: string, index: number) => ({
          id: row.tag_ids.split(',')[index],
          name: name.trim(),
          created_at: ''
        })) : [],
        submitted_by_user: row.submitted_by_name ? {
          id: row.submitted_by,
          name: row.submitted_by_name,
          email: row.submitted_by_email
        } : undefined
      }))
    } catch (error) {
      console.error('获取网站失败:', error)
      throw new DatabaseError('获取网站列表失败')
    }
  }

  async getApprovedWebsites(): Promise<Website[]> {
    return await this.getWebsites({ status: 'approved' })
  }

  async createWebsite(websiteData: WebsiteSubmission & { submitted_by?: string }): Promise<Website> {
    try {
      return await executeTransaction(async (connection) => {
        const websiteId = generateUUID()

        // 检查是否应该自动批准
        let status = 'pending'
        if (websiteData.submitted_by) {
          // 获取系统设置
          const autoApproveSettingQuery = 'SELECT value FROM system_settings WHERE key = ?'
          const autoApproveSetting = await connection.execute(autoApproveSettingQuery, ['auto_approve_trusted_users'])

          if (autoApproveSetting[0] && autoApproveSetting[0][0]?.value?.enabled) {
            // 检查用户是否为可信用户
            const userQuery = 'SELECT trusted FROM users WHERE id = ?'
            const userResult = await connection.execute(userQuery, [websiteData.submitted_by])

            if (userResult[0] && userResult[0][0]?.trusted) {
              status = 'approved'
              console.log(`可信用户 ${websiteData.submitted_by} 提交的网站自动批准`)
            }
          }
        }

        // 插入网站数据
        const websiteQuery = `
          INSERT INTO websites (id, title, url, description, category_id, submitted_by, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `

        await connection.execute(websiteQuery, [
          websiteId,
          websiteData.title,
          websiteData.url,
          websiteData.description,
          websiteData.category_id,
          websiteData.submitted_by || null,
          status
        ])
        
        // 处理标签
        if (websiteData.tags && websiteData.tags.length > 0) {
          for (const tagName of websiteData.tags) {
            // 检查标签是否存在
            const [tagResults] = await connection.execute(
              'SELECT id FROM tags WHERE name = ?',
              [tagName.trim()]
            )
            
            let tagId: string
            if ((tagResults as any[]).length === 0) {
              // 创建新标签
              tagId = generateUUID()
              await connection.execute(
                'INSERT INTO tags (id, name) VALUES (?, ?)',
                [tagId, tagName.trim()]
              )
            } else {
              tagId = (tagResults as any[])[0].id
            }
            
            // 关联网站和标签
            await connection.execute(
              'INSERT IGNORE INTO website_tags (website_id, tag_id) VALUES (?, ?)',
              [websiteId, tagId]
            )
          }
        }
        
        // 直接返回创建的网站信息
        const [websiteResults] = await connection.execute(`
          SELECT 
            w.*,
            c.name as category_name,
            c.color_from as category_color_from,
            c.color_to as category_color_to,
            u.name as submitted_by_name,
            u.email as submitted_by_email,
            GROUP_CONCAT(t.name) as tag_names,
            GROUP_CONCAT(t.id) as tag_ids
          FROM websites w
          LEFT JOIN categories c ON w.category_id = c.id
          LEFT JOIN users u ON w.submitted_by = u.id
          LEFT JOIN website_tags wt ON w.id = wt.website_id
          LEFT JOIN tags t ON wt.tag_id = t.id
          WHERE w.id = ?
          GROUP BY w.id
        `, [websiteId])
        
        const websiteArray = websiteResults as any[]
        if (websiteArray.length === 0) {
          throw new DatabaseError('创建网站后获取失败')
        }
        
        const row = websiteArray[0]
        return {
          id: row.id,
          title: row.title,
          url: row.url,
          description: row.description,
          favicon: row.favicon,
          category_id: row.category_id,
          status: row.status,
          submitted_by: row.submitted_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          category: row.category_name ? {
            id: row.category_id,
            name: row.category_name,
            color_from: row.category_color_from,
            color_to: row.category_color_to,
            created_at: ''
          } : undefined,
          tags: row.tag_names ? row.tag_names.split(',').map((name: string, index: number) => ({
            id: row.tag_ids.split(',')[index],
            name: name.trim(),
            created_at: ''
          })) : []
        }
      })
    } catch (error) {
      console.error('创建网站失败:', error)
      throw new DatabaseError('创建网站失败')
    }
  }

  async updateWebsite(id: string, updates: Partial<Website>): Promise<Website> {
    try {
      const fields: string[] = []
      const values: any[] = []
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && value !== undefined) {
          fields.push(`${key} = ?`)
          values.push(value)
        }
      })
      
      if (fields.length === 0) {
        throw new ValidationError('没有要更新的字段')
      }
      
      values.push(id)
      const query = `UPDATE websites SET ${fields.join(', ')} WHERE id = ?`
      
      await executeQuery(query, values)
      
      const websites = await this.getWebsites()
      const website = websites.find(w => w.id === id)
      
      if (!website) {
        throw new DatabaseError('网站不存在')
      }
      
      return website
    } catch (error) {
      console.error('更新网站失败:', error)
      throw new DatabaseError('更新网站失败')
    }
  }

  async deleteWebsite(id: string): Promise<void> {
    try {
      // 先删除关联的标签和收藏
      await executeQuery('DELETE FROM website_tags WHERE website_id = ?', [id])
      await executeQuery('DELETE FROM favorites WHERE website_id = ?', [id])
      
      // 删除网站
      await executeQuery('DELETE FROM websites WHERE id = ?', [id])
    } catch (error) {
      console.error('删除网站失败:', error)
      throw new DatabaseError('删除网站失败')
    }
  }

  // ============================================================================
  // 收藏相关操作
  // ============================================================================

  async getFavorites(userId: string): Promise<Favorite[]> {
    try {
      const query = `
        SELECT 
          f.*,
          w.*,
          c.name as category_name,
          c.color_from as category_color_from,
          c.color_to as category_color_to,
          GROUP_CONCAT(t.name) as tag_names,
          GROUP_CONCAT(t.id) as tag_ids
        FROM favorites f
        INNER JOIN websites w ON f.website_id = w.id
        LEFT JOIN categories c ON w.category_id = c.id
        LEFT JOIN website_tags wt ON w.id = wt.website_id
        LEFT JOIN tags t ON wt.tag_id = t.id
        WHERE f.user_id = ? AND w.status = 'approved'
        GROUP BY f.user_id, f.website_id
        ORDER BY f.created_at DESC
      `
      
      const results = await executeQuery(query, [userId])
      
      return results.map((row: any) => ({
        user_id: row.user_id,
        website_id: row.website_id,
        created_at: row.created_at,
        website: {
          id: row.website_id,
          title: row.title,
          url: row.url,
          description: row.description,
          favicon: row.favicon,
          category_id: row.category_id,
          status: row.status,
          submitted_by: row.submitted_by,
          created_at: row.website_created_at || row.created_at,
          updated_at: row.updated_at,
          category: row.category_name ? {
            id: row.category_id,
            name: row.category_name,
            color_from: row.category_color_from,
            color_to: row.category_color_to,
            created_at: ''
          } : undefined,
          tags: row.tag_names ? row.tag_names.split(',').map((name: string, index: number) => ({
            id: row.tag_ids.split(',')[index],
            name: name.trim(),
            created_at: ''
          })) : []
        }
      }))
    } catch (error) {
      console.error('获取收藏失败:', error)
      throw new DatabaseError('获取收藏列表失败')
    }
  }

  async addFavorite(userId: string, websiteId: string): Promise<void> {
    try {
      await executeQuery(
        'INSERT IGNORE INTO favorites (user_id, website_id) VALUES (?, ?)',
        [userId, websiteId]
      )
    } catch (error) {
      console.error('添加收藏失败:', error)
      throw new DatabaseError('添加收藏失败')
    }
  }

  async removeFavorite(userId: string, websiteId: string): Promise<void> {
    try {
      await executeQuery(
        'DELETE FROM favorites WHERE user_id = ? AND website_id = ?',
        [userId, websiteId]
      )
    } catch (error) {
      console.error('移除收藏失败:', error)
      throw new DatabaseError('移除收藏失败')
    }
  }

  // ============================================================================
  // 标签相关操作
  // ============================================================================

  async getTags(): Promise<Tag[]> {
    try {
      const query = 'SELECT * FROM tags ORDER BY name'
      return await executeQuery<Tag>(query)
    } catch (error) {
      console.error('获取标签失败:', error)
      throw new DatabaseError('获取标签失败')
    }
  }

  async createTag(name: string): Promise<Tag> {
    try {
      const id = generateUUID()
      await executeQuery('INSERT INTO tags (id, name) VALUES (?, ?)', [id, name])
      
      const tag = await executeQuerySingle<Tag>('SELECT * FROM tags WHERE id = ?', [id])
      if (!tag) {
        throw new DatabaseError('创建标签后获取失败')
      }
      
      return tag
    } catch (error) {
      console.error('创建标签失败:', error)
      throw new DatabaseError('创建标签失败')
    }
  }

  // ============================================================================
  // 系统设置相关操作
  // ============================================================================

  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    try {
      const query = 'SELECT * FROM system_settings WHERE setting_key = ?'
      return await executeQuerySingle<SystemSetting>(query, [key])
    } catch (error) {
      console.error('获取系统设置失败:', error)
      return null
    }
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    try {
      const query = 'SELECT * FROM system_settings ORDER BY setting_key'
      return await executeQuery<SystemSetting>(query)
    } catch (error) {
      console.error('获取所有系统设置失败:', error)
      throw new DatabaseError('获取系统设置失败')
    }
  }

  async updateSystemSetting(key: string, value: any, description?: string): Promise<SystemSetting> {
    try {
      console.log('数据库更新系统设置:', { key, value, description })
      
      const existing = await this.getSystemSetting(key)
      console.log('现有设置:', existing)

      // 如果value是一个对象但不是字符串，直接转为JSON字符串
      const jsonValue = typeof value === 'object' ? JSON.stringify(value) : value
      console.log('准备保存的值:', jsonValue)
      
      if (existing) {
        // 更新现有设置
        const query = `
          UPDATE system_settings 
          SET setting_value = ?, description = COALESCE(?, description), updated_at = NOW()
          WHERE setting_key = ?
        `
        // 将undefined转换为null以满足MySQL2要求
        const descParam = description === undefined ? null : description
        console.log('执行更新:', { query, params: [jsonValue, descParam, key] })
        await executeQuery(query, [jsonValue, descParam, key])
      } else {
        // 创建新设置
        const id = generateUUID()
        const query = `
          INSERT INTO system_settings (id, setting_key, setting_value, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `
        // 将undefined转换为null以满足MySQL2要求
        const descParam = description === undefined ? null : description
        console.log('执行插入:', { query, params: [id, key, jsonValue, descParam] })
        await executeQuery(query, [id, key, jsonValue, descParam])
      }
      
      // 确保获取最新的设置
      await executeQuery('COMMIT')
      const setting = await this.getSystemSetting(key)
      console.log('更新后的设置:', setting)
      
      if (!setting) {
        console.error('更新系统设置后获取失败')
        throw new DatabaseError('更新系统设置后获取失败')
      }
      
      return setting
    } catch (error) {
      console.error('更新系统设置失败:', error)
      throw new DatabaseError('更新系统设置失败')
    }
  }
}

// 导出数据库实例
export const db = new Database()

// 从mysql.ts重导出getCurrentUserFromToken函数
export { getCurrentUserFromToken } from './mysql'

// 导出所有类型
export * from './db-types'

// 扩展 Database 类 - 密码重置功能
declare module './database' {
  interface Database {
    createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>
    getPasswordResetToken(token: string): Promise<{ id: string; user_id: string; expires_at: Date; used: boolean } | null>
    markPasswordResetTokenAsUsed(tokenId: string): Promise<void>
    updateUserPassword(userId: string, newPasswordHash: string): Promise<void>
    cleanupExpiredPasswordResetTokens(): Promise<void>
  }
}

// 实现密码重置方法
Database.prototype.createPasswordResetToken = async function(userId: string, token: string, expiresAt: Date): Promise<void> {
  try {
    const id = generateUUID()
    const query = `
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `
    await executeQuery(query, [id, userId, token, expiresAt])
  } catch (error) {
    console.error('创建密码重置令牌失败:', error)
    throw new DatabaseError('创建密码重置令牌失败')
  }
}

Database.prototype.getPasswordResetToken = async function(token: string): Promise<{ id: string; user_id: string; expires_at: Date; used: boolean } | null> {
  try {
    const query = `
      SELECT id, user_id, expires_at, used
      FROM password_reset_tokens
      WHERE token = ? AND used = FALSE AND expires_at > NOW()
    `
    const results = await executeQuery(query, [token])
    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error('获取密码重置令牌失败:', error)
    throw new DatabaseError('获取密码重置令牌失败')
  }
}

Database.prototype.markPasswordResetTokenAsUsed = async function(tokenId: string): Promise<void> {
  try {
    const query = `
      UPDATE password_reset_tokens
      SET used = TRUE
      WHERE id = ?
    `
    await executeQuery(query, [tokenId])
  } catch (error) {
    console.error('标记密码重置令牌为已使用失败:', error)
    throw new DatabaseError('标记密码重置令牌为已使用失败')
  }
}

Database.prototype.updateUserPassword = async function(userId: string, newPasswordHash: string): Promise<void> {
  try {
    const query = `
      UPDATE users
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeQuery(query, [newPasswordHash, userId])
  } catch (error) {
    console.error('更新用户密码失败:', error)
    throw new DatabaseError('更新用户密码失败')
  }
}

Database.prototype.cleanupExpiredPasswordResetTokens = async function(): Promise<void> {
  try {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE expires_at < NOW() OR used = TRUE
    `
    await executeQuery(query)
  } catch (error) {
    console.error('清理过期密码重置令牌失败:', error)
    // 这个错误不需要抛出，因为是清理操作
  }
}

// {{END MODIFICATIONS}}