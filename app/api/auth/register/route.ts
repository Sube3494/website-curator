// {{CHENGQI:
// Action: Modified; Timestamp: 2025-08-05 20:19:00 +08:00; Reason: "创建MySQL注册API替换Supabase";
// }}
// {{START MODIFICATIONS}}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { ValidationError } from '@/lib/db-types'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    // 验证输入
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: '所有字段都是必填的' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码至少需要6个字符' },
        { status: 400 }
      )
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 创建用户
    const newUser = await db.createUser({
      email,
      name,
      password,
      role: 'user',
      status: 'active'
    })

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: '注册成功'
    })

  } catch (error) {
    console.error('注册API错误:', error)
    
    if (error instanceof ValidationError && error.field === 'email') {
      return NextResponse.json(
        { success: false, message: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
// {{END MODIFICATIONS}}