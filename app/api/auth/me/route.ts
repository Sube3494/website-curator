// {{CHENGQI:
// Action: Modified; Timestamp: 2025-08-05 20:19:00 +08:00; Reason: "创建获取当前用户信息的API，使用JWT会话验证";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUserFromToken } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    const user = await getCurrentUserFromToken(token)

    if (!user) {
      // 清除无效的cookie
      cookieStore.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })

      return NextResponse.json(
        { success: false, message: '会话已过期' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: user
    })

  } catch (error) {
    console.error('获取用户信息API错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}