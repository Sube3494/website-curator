/*
 * @Date: 2025-06-29 23:42:23
 * @Author: Sube
 * @FilePath: next.config.mjs
 * @LastEditTime: 2025-06-30 00:07:20
 * @Description: 
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'github.com',
      'static.figma.com',
      'cdn.sstatic.net',
      'cdn.dribbble.com',
      'miro.medium.com',
      'unsplash.com',
      'cpwebassets.codepen.io',
      'dev.to',
      'a5.behance.net',
      'www.awwwards.com',
      'substack.com',
      'www.notion.so',
      'www.pexels.com',
      'fontawesome.com',
      'static.canva.com',
      'a.trellocdn.com',
      'd3njjcbhbojbot.cloudfront.net',
      'www.freecodecamp.org',
      'lf3-cdn-tos.bytescdn.com',
      'g.csdnimg.cn',
      'www.v2ex.com',
      'static.zcool.cn',
      'huaban.com',
      'static.zhihu.com',
      'img3.doubanio.com',
      'img.alicdn.com',
      'tinypng.com',
      'www.processon.com',
      'sf1-dycdn-tos.pstatp.com',
      'www.imooc.com',
      'static001.geekbang.org'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
}

export default nextConfig
