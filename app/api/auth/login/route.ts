// {{CHENGQI:
// Action: Modified; Timestamp: 2025-08-05 20:19:00 +08:00; Reason: "替换Supabase认证为MySQL JWT认证实现";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 使用数据库服务器端方法进行认证
    const result = await db.authenticateUser(email, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      )
    }

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