// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 21:45:00 +08:00; Reason: "创建分类列表API路由，支持前端获取分类数据";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database' // 服务器端数据库连接

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const withUsage = searchParams.get('withUsage') === 'true'
    
    console.log('分类API请求开始，withUsage=', withUsage)
    let categories
    
    // 直接测试数据库连接
    try {
      const { executeQuery } = await import('@/lib/mysql')
      const directTestQuery = await executeQuery('SELECT * FROM categories LIMIT 1')
      console.log('直接查询分类测试:', directTestQuery)
    } catch (dbError) {
      console.error('直接数据库查询测试失败:', dbError)
    }
    
    if (withUsage) {
      // 获取带使用统计的分类（管理员用）
      console.log('正在获取带使用统计的分类...')
      try {
        categories = await db.getCategoriesWithUsageCount()
        console.log('成功获取带使用统计的分类:', categories)
      } catch (error) {
        console.error('获取带使用统计的分类失败:', error)
        // 如果获取带统计的分类失败，回退到普通分类
        categories = await db.getCategories()
      }
    } else {
      // 获取基本分类信息
      console.log('正在获取基本分类信息...')
      categories = await db.getCategories()
    }

    console.log('获取到的分类数据:', categories)
    
    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取分类列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const categoryData = await request.json()
    
    // TODO: 添加管理员权限检查
    
    const newCategory = await db.createCategory(categoryData)
    
    return NextResponse.json({
      success: true,
      data: newCategory,
      message: '分类创建成功'
    })
  } catch (error) {
    console.error('创建分类失败:', error)
    return NextResponse.json(
      { success: false, message: '创建分类失败' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}