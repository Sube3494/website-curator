// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-06 17:00:00 +08:00; Reason: "创建调试API用于检查数据库查询";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const websitesRaw = await db.getWebsites({})
    const categoriesRaw = await db.getCategories()
    const categoriesWithUsageRaw = await db.getCategoriesWithUsageCount()
    
    // 直接查询数据库，跳过API格式化
    const { pool, executeQuery } = require('@/lib/mysql')
    
    const websitesDirectQuery = await executeQuery('SELECT * FROM websites')
    const categoriesDirectQuery = await executeQuery('SELECT * FROM categories')
    
    return NextResponse.json({
      websitesFromAPI: {
        count: Array.isArray(websitesRaw) ? websitesRaw.length : 0,
        data: websitesRaw
      },
      categoriesFromAPI: {
        count: Array.isArray(categoriesRaw) ? categoriesRaw.length : 0,
        data: categoriesRaw
      },
      categoriesWithUsageFromAPI: {
        count: Array.isArray(categoriesWithUsageRaw) ? categoriesWithUsageRaw.length : 0,
        data: categoriesWithUsageRaw
      },
      websitesDirectQuery: {
        count: Array.isArray(websitesDirectQuery) ? websitesDirectQuery.length : 0,
        sample: websitesDirectQuery.slice(0, 2)
      },
      categoriesDirectQuery: {
        count: Array.isArray(categoriesDirectQuery) ? categoriesDirectQuery.length : 0,
        sample: categoriesDirectQuery.slice(0, 2)
      }
    })
  } catch (error) {
    console.error('Debug API错误:', error)
    return NextResponse.json(
      { success: false, message: '调试失败', error: String(error) },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}