// =========================================================================
// 网站重复检查API - 支持前端实时验证
// 创建时间: 2025-08-08T15:18:22+08:00
// 目的: 提供快速的URL重复检查接口，提升用户体验
// =========================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { normalizeUrl } from '@/lib/utils/url-normalizer'

/**
 * 重复检查响应类型
 */
interface DuplicateCheckResponse {
  success: boolean
  isDuplicate: boolean
  existingWebsite?: {
    id: string
    title: string
    url: string
    status: string
    created_at: string
    submitted_by_user?: {
      name: string
      email: string
    }
  }
  normalizedUrl?: string
  error?: string
  message?: string
}

/**
 * GET /api/websites/check-duplicate
 * 检查URL是否重复
 * 
 * Query参数:
 * - url: 待检查的URL (必需)
 * 
 * 响应:
 * - success: 操作是否成功
 * - isDuplicate: 是否重复
 * - existingWebsite: 如果重复，返回现有网站信息
 * - normalizedUrl: 标准化后的URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    // 参数验证
    if (!url || url.trim() === '') {
      return NextResponse.json({
        success: false,
        isDuplicate: false,
        error: '缺少URL参数',
        message: '请提供要检查的URL'
      } as DuplicateCheckResponse, { status: 400 })
    }

    // URL基础验证
    const trimmedUrl = url.trim()
    if (trimmedUrl.length < 4) {
      return NextResponse.json({
        success: false,
        isDuplicate: false,
        error: 'URL太短',
        message: '请输入有效的网站地址'
      } as DuplicateCheckResponse, { status: 400 })
    }

    // URL标准化处理
    const normalized = normalizeUrl(trimmedUrl)
    if (!normalized.isValid) {
      return NextResponse.json({
        success: false,
        isDuplicate: false,
        error: '无效的URL格式',
        message: normalized.error || '请检查URL格式是否正确'
      } as DuplicateCheckResponse, { status: 400 })
    }

    // 检查数据库中是否存在重复
    const existingWebsite = await db.checkUrlDuplicate(trimmedUrl)

    if (existingWebsite) {
      // 发现重复网站
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        existingWebsite: {
          id: existingWebsite.id,
          title: existingWebsite.title,
          url: existingWebsite.url,
          status: existingWebsite.status,
          created_at: existingWebsite.created_at,
          submitted_by_user: existingWebsite.submitted_by_user
        },
        normalizedUrl: normalized.normalizedUrl,
        message: `发现重复网站：${existingWebsite.title}`
      } as DuplicateCheckResponse)
    } else {
      // 没有重复
      return NextResponse.json({
        success: true,
        isDuplicate: false,
        normalizedUrl: normalized.normalizedUrl,
        message: 'URL可以使用'
      } as DuplicateCheckResponse)
    }

  } catch (error) {
    console.error('重复检查API错误:', error)

    // 区分不同类型的错误
    if (error instanceof Error) {
      if (error.message.includes('ValidationError') || error.message.includes('无效的URL')) {
        return NextResponse.json({
          success: false,
          isDuplicate: false,
          error: '输入验证失败',
          message: error.message
        } as DuplicateCheckResponse, { status: 400 })
      }
    }

    // 服务器内部错误
    return NextResponse.json({
      success: false,
      isDuplicate: false,
      error: '服务器内部错误',
      message: '检查重复时发生错误，请稍后重试'
    } as DuplicateCheckResponse, { status: 500 })
  }
}

/**
 * POST /api/websites/check-duplicate
 * 批量检查URL重复（可选功能，用于管理员工具）
 * 
 * Body:
 * {
 *   "urls": ["url1", "url2", ...]
 * }
 * 
 * 响应:
 * {
 *   "success": true,
 *   "results": [
 *     {
 *       "url": "url1",
 *       "isDuplicate": false,
 *       "normalizedUrl": "..."
 *     },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    // 参数验证
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({
        success: false,
        error: '无效的URLs数组',
        message: '请提供要检查的URL数组'
      }, { status: 400 })
    }

    // 限制批量检查的数量
    if (urls.length > 50) {
      return NextResponse.json({
        success: false,
        error: 'URL数量超限',
        message: '单次最多检查50个URL'
      }, { status: 400 })
    }

    // 批量检查处理
    const results = await Promise.all(
      urls.map(async (url: string) => {
        try {
          if (!url || typeof url !== 'string') {
            return {
              url: url,
              success: false,
              isDuplicate: false,
              error: '无效的URL'
            }
          }

          const trimmedUrl = url.trim()
          const normalized = normalizeUrl(trimmedUrl)
          
          if (!normalized.isValid) {
            return {
              url: trimmedUrl,
              success: false,
              isDuplicate: false,
              error: '无效的URL格式',
              normalizedUrl: trimmedUrl
            }
          }

          const existingWebsite = await db.checkUrlDuplicate(trimmedUrl)
          
          return {
            url: trimmedUrl,
            success: true,
            isDuplicate: !!existingWebsite,
            normalizedUrl: normalized.normalizedUrl,
            existingWebsite: existingWebsite ? {
              id: existingWebsite.id,
              title: existingWebsite.title,
              status: existingWebsite.status
            } : undefined
          }
        } catch {
          return {
            url: url,
            success: false,
            isDuplicate: false,
            error: '检查失败'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      results: results,
      message: `完成 ${results.length} 个URL的重复检查`
    })

  } catch (error) {
    console.error('批量重复检查API错误:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      message: '批量检查时发生错误，请稍后重试'
    }, { status: 500 })
  }
}
