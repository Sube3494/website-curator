// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 20:15:00 +08:00; Reason: "Create MySQL connection layer and basic operations";
// }}
// {{START MODIFICATIONS}}
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// MySQL 连接配置 - 支持 PlanetScale
const connectionConfig = process.env.DATABASE_URL
  ? {
      // PlanetScale 连接字符串模式
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
      charset: 'utf8mb4',
      timezone: '+08:00',
      connectionLimit: 10
    }
  : {
      // 本地开发模式
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'website_curator',
      charset: 'utf8mb4',
      timezone: '+08:00',
      connectionLimit: 10
    }

// 创建连接池
const pool = mysql.createPool(connectionConfig)

// 测试连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('MySQL 连接成功')
    return true
  } catch (error) {
    console.error('MySQL 连接失败:', error)
    throw error
  }
}

// 执行查询的通用函数
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error('MySQL 查询错误:', error)
    console.error('查询语句:', query)
    console.error('参数:', params)
    throw error
  }
}

// 执行单条记录查询
export async function executeQuerySingle<T = any>(query: string, params: any[] = []): Promise<T | null> {
  const results = await executeQuery<T>(query, params)
  return results.length > 0 ? results[0] : null
}

// 生成 UUID
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 密码哈希 - 统一使用 bcrypt
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// 验证密码 - 统一使用 bcrypt
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('密码验证错误:', error)
    return false
  }
}

// JWT 令牌操作
export function generateJWT(payload: any): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET 环境变量未设置')
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyJWT(token: string): any {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET 环境变量未设置')
  }
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    console.error('JWT 验证失败:', error)
    return null
  }
}

// 会话管理
export async function createUserSession(userId: string, token: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7天过期
  
  await executeQuery(
    'INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    [generateUUID(), userId, token, expiresAt]
  )
}

export async function getUserBySessionToken(token: string): Promise<any | null> {
  const query = `
    SELECT u.*, s.expires_at
    FROM users u
    INNER JOIN user_sessions s ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > NOW()
  `
  return await executeQuerySingle(query, [token])
}

// 从JWT令牌获取用户
export async function getCurrentUserFromToken(token: string): Promise<any | null> {
  if (!token) return null
  
  const decodedToken = verifyJWT(token)
  if (!decodedToken || !decodedToken.userId) return null
  
  const query = `SELECT * FROM users WHERE id = ? AND status = 'active'`
  return await executeQuerySingle(query, [decodedToken.userId])
}

export async function deleteUserSession(token: string): Promise<void> {
  await executeQuery('DELETE FROM user_sessions WHERE token = ?', [token])
}

export async function cleanExpiredSessions(): Promise<void> {
  await executeQuery('DELETE FROM user_sessions WHERE expires_at < NOW()')
}

// 数据库事务支持
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  
  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// 获取连接池统计信息
export function getPoolStats() {
  return {
    config: connectionConfig,
    // 注意：mysql2 的连接池可能没有直接暴露这些统计信息
    // 这里返回配置信息
  }
}

// 优雅关闭连接池
export async function closePool(): Promise<void> {
  await pool.end()
}

// 初始化时测试连接
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch(console.error)
}
// {{END MODIFICATIONS}}