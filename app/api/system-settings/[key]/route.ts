"use server"

import { NextRequest, NextResponse } from 'next/server'
import { db, getCurrentUserFromToken } from '@/lib/database'
import { cookies } from 'next/headers'

// GET /api/system-settings/[key] - 获取特定系统设置
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    console.log('获取单个系统设置:', params.key)

    const { key } = params
    if (!key) {
      return NextResponse.json(
        { success: false, message: '缺少设置键名' },
        { status: 400 }
      )
    }

    const setting = await db.getSystemSetting(key)
    
    if (!setting) {
      return NextResponse.json(
        { success: false, message: '设置不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        key: setting.setting_key,
        value: setting.setting_value,
        description: setting.description,
        updated_at: setting.updated_at
      }
    })
  } catch (error) {
    console.error('获取系统设置失败:', error)
    return NextResponse.json(
      { success: false, message: '获取系统设置失败' },
      { status: 500 }
    )
  }
}

// PUT /api/system-settings/[key] - 更新特定系统设置
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
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

    const { key } = params
    if (!key) {
      return NextResponse.json(
        { success: false, message: '缺少设置键名' },
        { status: 400 }
      )
    }

    const { value } = await request.json()

    if (value === undefined) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    console.log('更新系统设置:', { key, value })

    // 更新系统设置
    const setting = await db.updateSystemSetting(key, value)

    // 转换为前端需要的格式
    const formattedSetting = {
      key: setting.setting_key,
      value: setting.setting_value
    }

    return NextResponse.json({
      success: true,
      data: formattedSetting,
      message: '设置更新成功'
    })
  } catch (error) {
    console.error('更新系统设置失败:', error)
    return NextResponse.json(
      { success: false, message: '更新系统设置失败' },
      { status: 500 }
    )
  }
}