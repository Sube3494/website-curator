// =========================================================================
// URL标准化工具 - 网站重复检查核心组件
// 创建时间: 2025-08-08T15:18:22+08:00
// 目的: 实现智能的URL标准化和哈希生成，支持重复检查机制
// =========================================================================

import crypto from 'crypto';

/**
 * URL标准化配置选项
 */
export interface UrlNormalizationOptions {
  /** 是否强制使用HTTPS */
  forceHttps?: boolean;
  /** 是否移除www前缀 */
  removeWww?: boolean;
  /** 是否移除尾部斜杠 */
  removeTrailingSlash?: boolean;
  /** 是否排序查询参数 */
  sortQueryParams?: boolean;
  /** 是否转换为小写 */
  toLowerCase?: boolean;
  /** 是否移除默认端口 */
  removeDefaultPorts?: boolean;
}

/**
 * 默认标准化配置
 */
const DEFAULT_OPTIONS: Required<UrlNormalizationOptions> = {
  forceHttps: true,
  removeWww: true,
  removeTrailingSlash: true,
  sortQueryParams: true,
  toLowerCase: true,
  removeDefaultPorts: true,
};

/**
 * URL标准化处理结果
 */
export interface NormalizedUrlResult {
  /** 原始URL */
  originalUrl: string;
  /** 标准化后的URL */
  normalizedUrl: string;
  /** SHA-256哈希值 */
  hash: string;
  /** 提取的域名 */
  domain: string;
  /** 是否为有效URL */
  isValid: boolean;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * 验证并解析URL
 * @param url 待验证的URL字符串
 * @returns URL对象或null
 */
function parseUrl(url: string): URL | null {
  try {
    // 如果URL没有协议，默认添加https
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * 移除www前缀
 * @param hostname 主机名
 * @returns 处理后的主机名
 */
function removeWwwPrefix(hostname: string): string {
  return hostname.replace(/^www\./i, '');
}

/**
 * 移除默认端口
 * @param hostname 主机名
 * @param protocol 协议
 * @returns 处理后的主机名
 */
function removeDefaultPort(hostname: string, protocol: string): string {
  if (protocol === 'https:' && hostname.endsWith(':443')) {
    return hostname.slice(0, -4);
  }
  if (protocol === 'http:' && hostname.endsWith(':80')) {
    return hostname.slice(0, -3);
  }
  return hostname;
}

/**
 * 排序查询参数
 * @param searchParams URLSearchParams对象
 * @returns 排序后的查询字符串
 */
function sortQueryParameters(searchParams: URLSearchParams): string {
  const params = Array.from(searchParams.entries());
  params.sort(([a], [b]) => a.localeCompare(b));
  return params.length > 0 ? '?' + params.map(([k, v]) => `${k}=${v}`).join('&') : '';
}

/**
 * 标准化URL
 * @param url 原始URL字符串
 * @param options 标准化选项
 * @returns 标准化结果
 */
export function normalizeUrl(
  url: string,
  options: UrlNormalizationOptions = {}
): NormalizedUrlResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const result: NormalizedUrlResult = {
    originalUrl: url,
    normalizedUrl: url,
    hash: '',
    domain: '',
    isValid: false,
  };

  try {
    // 解析URL
    const parsedUrl = parseUrl(url.trim());
    if (!parsedUrl) {
      throw new Error('无效的URL格式');
    }

    // 提取域名
    result.domain = parsedUrl.hostname;

    // 开始标准化处理
    let protocol = parsedUrl.protocol;
    let hostname = parsedUrl.hostname;
    let pathname = parsedUrl.pathname;
    let search = parsedUrl.search;

    // 1. 强制HTTPS
    if (opts.forceHttps) {
      protocol = 'https:';
    }

    // 2. 转换为小写
    if (opts.toLowerCase) {
      hostname = hostname.toLowerCase();
      pathname = pathname.toLowerCase();
    }

    // 3. 移除www前缀
    if (opts.removeWww) {
      hostname = removeWwwPrefix(hostname);
    }

    // 4. 移除默认端口
    if (opts.removeDefaultPorts) {
      hostname = removeDefaultPort(hostname, protocol);
    }

    // 5. 处理路径
    if (opts.removeTrailingSlash && pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    // 6. 排序查询参数
    if (opts.sortQueryParams && search) {
      const searchParams = new URLSearchParams(search);
      search = sortQueryParameters(searchParams);
    }

    // 构建标准化URL
    result.normalizedUrl = `${protocol}//${hostname}${pathname}${search}`;
    result.isValid = true;

  } catch (error) {
    result.error = error instanceof Error ? error.message : '未知错误';
    result.normalizedUrl = url; // 保持原始URL
  }

  // 生成哈希值
  result.hash = generateUrlHash(result.normalizedUrl);

  return result;
}

/**
 * 生成URL的SHA-256哈希值
 * @param url 标准化后的URL
 * @returns 64位十六进制哈希字符串
 */
export function generateUrlHash(url: string): string {
  return crypto
    .createHash('sha256')
    .update(url, 'utf8')
    .digest('hex');
}

/**
 * 检查两个URL是否可能重复
 * @param url1 第一个URL
 * @param url2 第二个URL
 * @param options 标准化选项
 * @returns 是否可能重复
 */
export function areUrlsSimilar(
  url1: string,
  url2: string,
  options?: UrlNormalizationOptions
): boolean {
  const result1 = normalizeUrl(url1, options);
  const result2 = normalizeUrl(url2, options);
  
  if (!result1.isValid || !result2.isValid) {
    return false;
  }

  return result1.hash === result2.hash;
}

/**
 * 批量标准化URL
 * @param urls URL数组
 * @param options 标准化选项
 * @returns 标准化结果数组
 */
export function normalizeUrls(
  urls: string[],
  options?: UrlNormalizationOptions
): NormalizedUrlResult[] {
  return urls.map(url => normalizeUrl(url, options));
}

/**
 * 验证URL是否为有效的网站地址
 * @param url URL字符串
 * @returns 验证结果
 */
export function isValidWebsiteUrl(url: string): boolean {
  const result = normalizeUrl(url);
  return result.isValid && !result.error;
}

// =========================================================================
// 常用工具函数
// =========================================================================

/**
 * 从URL中提取域名
 * @param url URL字符串
 * @returns 域名或空字符串
 */
export function extractDomain(url: string): string {
  const result = normalizeUrl(url);
  return result.domain;
}

/**
 * 检查是否为同一域名的URL
 * @param url1 第一个URL
 * @param url2 第二个URL
 * @returns 是否为同一域名
 */
export function isSameDomain(url1: string, url2: string): boolean {
  const domain1 = extractDomain(url1);
  const domain2 = extractDomain(url2);
  return domain1 !== '' && domain1 === domain2;
}
