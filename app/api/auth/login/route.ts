// {{CHENGQI:
// Action: Modified; Timestamp: 2025-08-05 20:19:00 +08:00; Reason: "替换Supabase认证为MySQL JWT认证实现";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { cookies } from 'next/headers'

// 登录尝试记录 - 基于内存的简单实现
interface LoginAttempt {
  count: number
  lastAttempt: number
  blockedUntil?: number
}

const loginAttempts = new Map<string, LoginAttempt>()

// 配置
const MAX_ATTEMPTS = 5 // 最大尝试次数
const BLOCK_DURATION = 15 * 60 * 1000 // 封锁时间：15分钟
const ATTEMPT_WINDOW = 5 * 60 * 1000 // 尝试窗口：5分钟

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

function isBlocked(ip: string): boolean {
  const attempt = loginAttempts.get(ip)
  if (!attempt) return false

  const now = Date.now()

  // 检查是否在封锁期内
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    return true
  }

  // 清理过期的封锁
  if (attempt.blockedUntil && now >= attempt.blockedUntil) {
    loginAttempts.delete(ip)
    return false
  }

  return false
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (!attempt) {
    loginAttempts.set(ip, {
      count: 1,
      lastAttempt: now
    })
    return
  }

  // 如果距离上次尝试超过窗口时间，重置计数
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
    loginAttempts.set(ip, {
      count: 1,
      lastAttempt: now
    })
    return
  }

  // 增加尝试次数
  attempt.count++
  attempt.lastAttempt = now

  // 如果达到最大尝试次数，设置封锁
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = now + BLOCK_DURATION
  }

  loginAttempts.set(ip, attempt)
}

function recordSuccessfulLogin(ip: string): void {
  // 成功登录后清除记录
  loginAttempts.delete(ip)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const clientIP = getClientIP(request)

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 检查IP是否被封锁
    if (isBlocked(clientIP)) {
      const attempt = loginAttempts.get(clientIP)
      const remainingTime = attempt?.blockedUntil ? Math.ceil((attempt.blockedUntil - Date.now()) / 1000 / 60) : 0

      return NextResponse.json(
        {
          success: false,
          message: `登录尝试过于频繁，请在 ${remainingTime} 分钟后重试`,
          blocked: true,
          remainingTime
        },
        { status: 429 }
      )
    }

    // 使用数据库服务器端方法进行认证
    const result = await db.authenticateUser(email, password)

    if (!result.success) {
      // 记录失败尝试
      recordFailedAttempt(clientIP)

      const attempt = loginAttempts.get(clientIP)
      const remainingAttempts = MAX_ATTEMPTS - (attempt?.count || 0)

      let message = result.message
      if (remainingAttempts > 0) {
        message += ` (剩余尝试次数: ${remainingAttempts})`
      }

      return NextResponse.json(
        { success: false, message },
        { status: 401 }
      )
    }

    // 成功登录，清除失败记录
    recordSuccessfulLogin(clientIP)

    // 设置HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/'
    })

    return NextResponse.json({
      success: true,
      user: result.user,
      message: '登录成功'
    })

  } catch (error) {
    console.error('登录API错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}