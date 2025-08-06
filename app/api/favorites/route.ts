// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 22:00:00 +08:00; Reason: "创建收藏API路由，支持前端获取、添加和删除收藏";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db, getCurrentUserFromToken } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '缺少用户ID' },
        { status: 400 }
      )
    }
    
    // 获取用户收藏
    const favorites = await db.getFavorites(userId)
    
    return NextResponse.json({
      success: true,
      data: favorites
    })
  } catch (error) {
    console.error('获取收藏失败:', error)
    return NextResponse.json(
      { success: false, message: '获取收藏失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    // 验证用户身份
    const user = await getCurrentUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '会话已过期' },
        { status: 401 }
      )
    }

    const { userId, websiteId } = await request.json()

    if (!userId || !websiteId) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查是否为自己添加收藏
    if (user.id !== userId) {
      return NextResponse.json(
        { success: false, message: '只能为自己添加收藏' },
        { status: 403 }
      )
    }

    // 添加收藏
    await db.addFavorite(userId, websiteId)

    return NextResponse.json({
      success: true,
      message: '添加收藏成功'
    })

  } catch (error) {
    console.error('添加收藏失败:', error)
    return NextResponse.json(
      { success: false, message: '添加收藏失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    // 验证用户身份
    const user = await getCurrentUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '会话已过期' },
        { status: 401 }
      )
    }

    const { userId, websiteId } = await request.json()

    if (!userId || !websiteId) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查是否为自己删除收藏
    if (user.id !== userId) {
      return NextResponse.json(
        { success: false, message: '只能删除自己的收藏' },
        { status: 403 }
      )
    }

    // 删除收藏
    await db.removeFavorite(userId, websiteId)

    return NextResponse.json({
      success: true,
      message: '删除收藏成功'
    })

  } catch (error) {
    console.error('删除收藏失败:', error)
    return NextResponse.json(
      { success: false, message: '删除收藏失败' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}