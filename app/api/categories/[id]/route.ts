import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/database'
import { getCurrentUserFromToken } from '@/lib/database'
import { revalidateTag } from 'next/cache'

// GET /api/categories/[id] - 获取单个分类
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少分类ID' },
        { status: 400 }
      )
    }

    const category = await db.getCategoryById(id)
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: '分类不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('获取分类失败:', error)
    return NextResponse.json(
      { success: false, message: '获取分类失败' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    // 验证用户身份和权限
    const user = await getCurrentUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '会话已过期' },
        { status: 401 }
      )
    }

    // 检查是否为管理员
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: '权限不足' },
        { status: 403 }
      )
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少分类ID' },
        { status: 400 }
      )
    }

    const updates = await request.json()
    
    // 验证更新数据
    if (!updates.name || updates.name.trim() === '') {
      return NextResponse.json(
        { success: false, message: '分类名称不能为空' },
        { status: 400 }
      )
    }

    const updatedCategory = await db.updateCategory(id, updates)
    try {
      revalidateTag('categories')
      revalidateTag('categories-usage')
    } catch {}

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: '分类更新成功'
    })
  } catch (error) {
    console.error('更新分类失败:', error)
    return NextResponse.json(
      { success: false, message: '更新分类失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    // 验证用户身份和权限
    const user = await getCurrentUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '会话已过期' },
        { status: 401 }
      )
    }

    // 检查是否为管理员
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: '权限不足' },
        { status: 403 }
      )
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少分类ID' },
        { status: 400 }
      )
    }

    // 检查分类是否存在
    const category = await db.getCategoryById(id)
    if (!category) {
      return NextResponse.json(
        { success: false, message: '分类不存在' },
        { status: 404 }
      )
    }

    // 删除分类（数据库层会检查是否有关联的网站）
    await db.deleteCategory(id)
    try {
      revalidateTag('categories')
      revalidateTag('categories-usage')
    } catch {}

    return NextResponse.json({
      success: true,
      message: '分类删除成功'
    })
  } catch (error) {
    console.error('删除分类失败:', error)
    
    // 检查是否是验证错误（如分类下还有网站）
    if (error instanceof Error && error.message.includes('该分类下还有网站')) {
      return NextResponse.json(
        { success: false, message: '该分类下还有网站，无法删除' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: '删除分类失败' },
      { status: 500 }
    )
  }
}
