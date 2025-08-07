// {{CHENGQI:
// Action: Added; Timestamp: 2025-08-05 20:30:00 +08:00; Reason: "创建系统设置API路由，支持客户端组件获取和更新设置";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db, getCurrentUserFromToken } from '@/lib/database'
import { cookies } from 'next/headers'
import { revalidateTag, unstable_cache } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    // 仅允许已认证用户访问（若需要匿名只读可再放宽）
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    const getSettingsCached = unstable_cache(
      async () => {
        const s = await db.getAllSystemSettings()
        return Array.isArray(s) ? s : []
      },
      ['settings'],
      { revalidate: 300, tags: ['settings'] }
    )
    const settings = await getSettingsCached()
    
    // 格式化为前端需要的格式
    const formattedSettings = settings.map(setting => ({
      key: setting.setting_key,
      value: setting.setting_value,
      description: setting.description,
      updated_at: setting.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedSettings
    })
  } catch (error) {
    console.error('获取系统设置失败:', error)
    return NextResponse.json(
      { success: false, message: '获取系统设置失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    console.log('更新系统设置:', { key, value })

    // 更新系统设置
    try {
      const setting = await db.updateSystemSetting(key, value)
      
      // 转换回前端需要的格式
      const formattedSetting = {
        key: setting.setting_key,
        value: setting.setting_value
      }

      // 设置更新后，失效相关标签（若有）
      try { revalidateTag('settings') } catch {}

      return NextResponse.json({
        success: true,
        data: formattedSetting,
        message: '设置更新成功'
      })
    } catch (error) {
      console.error('数据库更新系统设置失败:', error)
      return NextResponse.json(
        { success: false, message: '更新系统设置失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('更新系统设置失败:', error)
    return NextResponse.json(
      { success: false, message: '更新系统设置失败' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}