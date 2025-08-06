// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-06 15:35:00 +08:00; Reason: "创建单个用户API以替代Supabase";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db, getCurrentUserFromToken } from '@/lib/database'

// 获取单个用户
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '用户ID不能为空' }, 
        { status: 400 }
      )
    }

    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    const currentUser = await getCurrentUserFromToken(token || '')
    
    // 用户只能查看自己的信息，管理员可以查看所有用户
    if (!currentUser || (currentUser.id !== userId && 
        currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, message: '无权访问此资源' }, 
        { status: 403 }
      )
    }
    
    const user = await db.getUser(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('获取用户失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户失败' }, 
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '用户ID不能为空' }, 
        { status: 400 }
      )
    }
    
    // 验证身份
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    const currentUser = await getCurrentUserFromToken(token || '')
    
    // 验证权限：用户只能更新自己的非权限信息，管理员可以更新所有用户的状态，超级管理员可以更新所有信息
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '未授权' }, 
        { status: 401 }
      )
    }

    const updates = await request.json()
    
    // 普通用户的限制
    if (currentUser.id === userId && currentUser.role === 'user') {
      // 用户不能更改自己的role和status
      if (updates.role || updates.status) {
        return NextResponse.json(
          { success: false, message: '无权修改权限或状态' }, 
          { status: 403 }
        )
      }
    } 
    // 管理员的限制
    else if (currentUser.role === 'admin') {
      // 管理员不能修改超级管理员
      const targetUser = await db.getUser(userId)
      if (targetUser && targetUser.role === 'super_admin') {
        return NextResponse.json(
          { success: false, message: '无权修改超级管理员' }, 
          { status: 403 }
        )
      }
      
      // 管理员不能将用户升级为超级管理员
      if (updates.role === 'super_admin') {
        return NextResponse.json(
          { success: false, message: '无权将用户升级为超级管理员' }, 
          { status: 403 }
        )
      }
    } 
    // 非管理员不能修改其他用户
    else if (currentUser.id !== userId && currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: '无权修改其他用户' }, 
        { status: 403 }
      )
    }
    
    const updatedUser = await db.updateUser(userId, updates)
    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('更新用户失败:', error)
    return NextResponse.json(
      { success: false, message: '更新用户失败' }, 
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}