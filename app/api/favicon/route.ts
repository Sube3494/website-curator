/*
 * @Date: 2025-06-30 02:04:21
 * @Author: Sube
 * @FilePath: route.ts
 * @LastEditTime: 2025-06-30 02:06:35
 * @Description: 
 */
import { NextRequest, NextResponse } from 'next/server'

// 简单的内存缓存，避免重复请求
const faviconCache = new Map<string, { data: any; timestamp: number; success: boolean }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
const ERROR_CACHE_DURATION = 30 * 60 * 1000 // 错误缓存30分钟

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  // 检查缓存
  const cached = faviconCache.get(url)
  if (cached) {
    const age = Date.now() - cached.timestamp
    const maxAge = cached.success ? CACHE_DURATION : ERROR_CACHE_DURATION

    if (age < maxAge) {
      if (cached.success) {
        return new NextResponse(cached.data.buffer, {
          headers: cached.data.headers
        })
      } else {
        // 返回缓存的错误，减少重复请求
        return NextResponse.json(cached.data, {
          status: 404,
          headers: {
            'Cache-Control': 'public, max-age=1800',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
    } else {
      // 清理过期缓存
      faviconCache.delete(url)
    }
  }

  try {
    // 验证 URL 格式
    new URL(url)
    
    // 获取 favicon
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
      // 设置超时
      signal: AbortSignal.timeout(10000), // 10秒超时
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 检查内容类型
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Response is not an image')
    }

    // 获取图片数据
    const imageBuffer = await response.arrayBuffer()

    const responseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 缓存1天
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // 缓存成功结果
    faviconCache.set(url, {
      data: { buffer: imageBuffer, headers: responseHeaders },
      timestamp: Date.now(),
      success: true
    })

    // 返回图片，设置适当的缓存头
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error) {
    // 减少错误日志的详细程度，避免控制台污染
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // 只在开发环境记录详细错误
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Favicon fetch failed for ${url}: ${errorMessage}`)
    }

    const errorResponse = {
      error: 'Failed to fetch favicon',
      details: errorMessage,
      url: url
    }

    // 缓存错误结果，避免重复请求
    faviconCache.set(url, {
      data: errorResponse,
      timestamp: Date.now(),
      success: false
    })

    // 返回默认的 favicon 或错误响应
    return NextResponse.json(errorResponse, {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=1800', // 错误缓存30分钟
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

// 支持 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
