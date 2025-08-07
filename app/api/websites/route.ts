// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 21:45:00 +08:00; Reason: "创建网站列表API路由，支持前端获取网站数据";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { unstable_cache, revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { getCurrentUserFromToken } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let websites
    // 为前台只读列表提供缓存（120秒）
    const getApprovedWebsitesCached = unstable_cache(
      async () => {
        const list = await db.getApprovedWebsites()
        return Array.isArray(list) ? list : []
      },
      ['websites-approved'],
      { revalidate: 120, tags: ['websites-approved'] }
    )
    
    if (status === 'approved') {
      // 获取已批准的网站（用于前端展示）
      websites = await getApprovedWebsitesCached()
      console.log('API: 获取已批准的网站:', websites.length)
    } else if (status) {
      // 获取指定状态的网站
      websites = await db.getWebsites({ status: status as 'pending' | 'approved' | 'rejected' })
      console.log(`API: 获取${status}状态的网站:`, websites.length)
    } else {
      // 获取所有网站（需要管理员权限）
      websites = await db.getWebsites({})
      console.log('API: 获取所有网站:', websites.length)
    }
    
    // 确保返回数组
    if (!Array.isArray(websites)) {
      console.log('API: 网站数据不是数组，转换为空数组')
      websites = []
    }
    
    return NextResponse.json({
      success: true,
      data: websites
    })
  } catch (error) {
    console.error('获取网站列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取网站列表失败' },
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
    const currentUser = await getCurrentUserFromToken(token)
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: '权限不足' },
        { status: 403 }
      )
    }

    const websiteData = await request.json()
    
    const newWebsite = await db.createWebsite(websiteData)
    // 写入后使只读列表缓存失效
    try { revalidateTag('websites-approved') } catch {}
    
    return NextResponse.json({
      success: true,
      data: newWebsite,
      message: '网站创建成功'
    })
  } catch (error) {
    console.error('创建网站失败:', error)
    return NextResponse.json(
      { success: false, message: '创建网站失败' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}