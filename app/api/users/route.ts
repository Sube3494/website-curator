// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-06 15:30:00 +08:00; Reason: "创建用户API以替代Supabase";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db, getCurrentUserFromToken } from '@/lib/database'

// 获取所有用户
export async function GET(request: NextRequest) {
  try {
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    const currentUser = await getCurrentUserFromToken(token || '')
    
    // 只有管理员和超级管理员可以访问用户列表
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: '无权访问此资源' }, 
        { status: 403 }
      )
    }
    
    const users = await db.getAllUsers()
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户列表失败' }, 
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}