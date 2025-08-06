import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { emailService } from '@/lib/email-service'
import crypto from 'crypto'

// 邮箱格式验证函数
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 请求密码重置
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // 验证输入
    if (!email) {
      return NextResponse.json(
        { success: false, message: '邮箱地址不能为空' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱地址格式不正确' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await db.getUserByEmail(email)

    // 如果用户不存在，直接提示邮箱不存在
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '该邮箱地址不存在，请检查邮箱地址或先注册账户',
        code: 'EMAIL_NOT_FOUND'
      }, { status: 404 })
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return NextResponse.json({
        success: true,
        message: '如果该邮箱地址存在于我们的系统中，你将收到密码重置邮件'
      })
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // 设置过期时间（1小时后）
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // 清理该用户的旧令牌
    await db.cleanupExpiredPasswordResetTokens()

    // 保存重置令牌
    await db.createPasswordResetToken(user.id, resetToken, expiresAt)

    // 发送重置邮件
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name
    )

    if (!emailSent) {
      console.error('密码重置邮件发送失败:', user.email)
      return NextResponse.json(
        { success: false, message: '邮件发送失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '密码重置邮件已发送，请检查你的邮箱'
    })

  } catch (error) {
    console.error('密码重置请求失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
