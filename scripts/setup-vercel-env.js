#!/usr/bin/env node

/**
 * Vercel 环境变量配置助手
 * 帮助快速生成 Vercel 部署所需的环境变量配置
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('🚀 Vercel 部署环境变量配置助手\n')

// 生成强 JWT 密钥
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex')
}

// 读取当前 .env.local 配置
function readCurrentEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    const env = {}
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    })
    return env
  }
  return {}
}

// 生成 Vercel 环境变量配置
function generateVercelEnvConfig() {
  const currentEnv = readCurrentEnv()
  
  const config = {
    // 应用配置
    'NEXT_PUBLIC_APP_URL': 'https://your-app.vercel.app',
    
    // 数据库配置
    'MYSQL_HOST': currentEnv.MYSQL_HOST || 'your-database-host',
    'MYSQL_USER': currentEnv.MYSQL_USER || 'your-database-user', 
    'MYSQL_PASSWORD': currentEnv.MYSQL_PASSWORD || 'your-database-password',
    'MYSQL_DATABASE': currentEnv.MYSQL_DATABASE || 'website_curator',
    
    // JWT 密钥（生成新的强密钥）
    'JWT_SECRET': generateJWTSecret(),
    
    // 邮件服务配置
    'EMAIL_FROM': currentEnv.EMAIL_FROM || 'your-email@qq.com',
    'EMAIL_HOST': currentEnv.EMAIL_HOST || 'smtp.qq.com',
    'EMAIL_PORT': currentEnv.EMAIL_PORT || '587',
    'EMAIL_SECURE': currentEnv.EMAIL_SECURE || 'false',
    'EMAIL_USER': currentEnv.EMAIL_USER || 'your-email@qq.com',
    'EMAIL_PASS': currentEnv.EMAIL_PASS || 'your-qq-authorization-code',
    
    // 环境标识
    'NODE_ENV': 'production'
  }
  
  return config
}

// 输出配置指南
function outputConfigGuide() {
  const config = generateVercelEnvConfig()
  
  console.log('📋 请在 Vercel 项目设置中添加以下环境变量：\n')
  console.log('='.repeat(60))
  
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key}=${value}`)
  })
  
  console.log('='.repeat(60))
  console.log('\n📝 配置步骤：')
  console.log('1. 登录 Vercel 控制台')
  console.log('2. 选择您的项目')
  console.log('3. 进入 Settings > Environment Variables')
  console.log('4. 逐一添加上述环境变量')
  console.log('5. 确保选择 "Production" 环境')
  console.log('6. 点击 "Save" 保存配置')
  
  console.log('\n⚠️  重要提醒：')
  console.log('• 请将 NEXT_PUBLIC_APP_URL 替换为您的实际域名')
  console.log('• 请配置真实的数据库连接信息')
  console.log('• 请使用有效的 QQ 邮箱授权码')
  console.log('• JWT_SECRET 已自动生成强密钥，请直接使用')
  
  console.log('\n🔗 有用的链接：')
  console.log('• Vercel 控制台: https://vercel.com/dashboard')
  console.log('• 部署文档: docs/vercel-deployment.md')
  console.log('• QQ 邮箱配置: QQ邮箱配置说明.md')
}

// 保存配置到文件
function saveConfigToFile() {
  const config = generateVercelEnvConfig()
  const configContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  
  const outputPath = path.join(process.cwd(), '.env.vercel.example')
  fs.writeFileSync(outputPath, configContent)
  
  console.log(`\n💾 配置已保存到: ${outputPath}`)
  console.log('您可以参考此文件在 Vercel 中配置环境变量')
}

// 主函数
function main() {
  try {
    outputConfigGuide()
    saveConfigToFile()
    
    console.log('\n✅ 配置生成完成！')
    console.log('请按照上述步骤在 Vercel 中配置环境变量，然后部署您的应用。')
    
  } catch (error) {
    console.error('❌ 配置生成失败:', error.message)
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  main()
}

module.exports = {
  generateJWTSecret,
  generateVercelEnvConfig,
  readCurrentEnv
}
