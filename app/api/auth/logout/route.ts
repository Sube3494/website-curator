// {{CHENGQI:
// Action: Modified; Timestamp: 2025-08-05 20:19:00 +08:00; Reason: "创建MySQL登出API，清理会话和cookies";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteUserSession } from '@/lib/mysql'

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (token) {
      // 删除数据库中的会话
      try {
        await deleteUserSession(token)
      } catch (error) {
        console.error('删除会话失败:', error)
        // 即使删除会话失败，也要清理cookie
      }
    }

    // 清除 cookie
    cookieStore.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('登出API错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}