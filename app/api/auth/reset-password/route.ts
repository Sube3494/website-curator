import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { hashPassword } from '@/lib/mysql'

// 重置密码
export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json()

    // 验证输入
    if (!token) {
      return NextResponse.json(
        { success: false, message: '重置令牌不能为空' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: '新密码不能为空' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: '两次输入的密码不一致' },
        { status: 400 }
      )
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 验证重置令牌
    const resetTokenData = await db.getPasswordResetToken(token)
    
    if (!resetTokenData) {
      return NextResponse.json(
        { success: false, message: '重置令牌无效或已过期' },
        { status: 400 }
      )
    }

    // 检查令牌是否已使用
    if (resetTokenData.used) {
      return NextResponse.json(
        { success: false, message: '重置令牌已被使用' },
        { status: 400 }
      )
    }

    // 检查令牌是否过期
    if (new Date() > new Date(resetTokenData.expires_at)) {
      return NextResponse.json(
        { success: false, message: '重置令牌已过期' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const user = await db.getUser(resetTokenData.user_id)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 400 }
      )
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: '账户已被禁用' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedPassword = await hashPassword(password)

    // 更新用户密码
    await db.updateUserPassword(user.id, hashedPassword)

    // 标记令牌为已使用
    await db.markPasswordResetTokenAsUsed(resetTokenData.id)

    // 清理过期令牌
    await db.cleanupExpiredPasswordResetTokens()

    return NextResponse.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    })

  } catch (error) {
    console.error('密码重置失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 验证重置令牌（GET 请求）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: '重置令牌不能为空' },
        { status: 400 }
      )
    }

    // 验证重置令牌
    const resetTokenData = await db.getPasswordResetToken(token)
    
    if (!resetTokenData) {
      return NextResponse.json(
        { success: false, message: '重置令牌无效或已过期' },
        { status: 400 }
      )
    }

    // 检查令牌是否已使用
    if (resetTokenData.used) {
      return NextResponse.json(
        { success: false, message: '重置令牌已被使用' },
        { status: 400 }
      )
    }

    // 检查令牌是否过期
    if (new Date() > new Date(resetTokenData.expires_at)) {
      return NextResponse.json(
        { success: false, message: '重置令牌已过期' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '令牌有效',
      data: {
        expires_at: resetTokenData.expires_at
      }
    })

  } catch (error) {
    console.error('验证重置令牌失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
