import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUserFromToken } from '@/lib/database'
import { db } from '@/lib/database'
import { revalidateTag, unstable_cache } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const getWebsiteCached = unstable_cache(
      async (id: string) => {
        const w = await db.getWebsiteById(id)
        return w || null
      },
      (id: string) => ['website', `website:${id}`],
      { revalidate: 120, tags: ['websites-approved'] }
    )
    const website = await getWebsiteCached(params.id)
    
    if (!website) {
      return NextResponse.json(
        { success: false, message: '网站不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: website
    })
  } catch (error) {
    console.error('获取网站详情失败:', error)
    return NextResponse.json(
      { success: false, message: '获取网站详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }
    
    const user = await getCurrentUserFromToken(token)
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: '权限不足' },
        { status: 403 }
      )
    }
    
    const updateData = await request.json()
    
    // 检查网站是否存在
    const existingWebsite = await db.getWebsiteById(params.id)
    if (!existingWebsite) {
      return NextResponse.json(
        { success: false, message: '网站不存在' },
        { status: 404 }
      )
    }
    
    // 更新网站
    const updatedWebsite = await db.updateWebsite(params.id, updateData)
    // 写入后失效前台已批准列表缓存
    try { revalidateTag('websites-approved') } catch {}
    
    return NextResponse.json({
      success: true,
      data: updatedWebsite,
      message: '网站更新成功'
    })
  } catch (error) {
    console.error('更新网站失败:', error)
    return NextResponse.json(
      { success: false, message: '更新网站失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }
    
    const user = await getCurrentUserFromToken(token)
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: '权限不足' },
        { status: 403 }
      )
    }
    
    // 检查网站是否存在
    const existingWebsite = await db.getWebsiteById(params.id)
    if (!existingWebsite) {
      return NextResponse.json(
        { success: false, message: '网站不存在' },
        { status: 404 }
      )
    }
    
    // 删除网站
    await db.deleteWebsite(params.id)
    // 删除后失效前台已批准列表缓存
    try { revalidateTag('websites-approved') } catch {}
    
    return NextResponse.json({
      success: true,
      message: '网站删除成功'
    })
  } catch (error) {
    console.error('删除网站失败:', error)
    return NextResponse.json(
      { success: false, message: '删除网站失败' },
      { status: 500 }
    )
  }
}
