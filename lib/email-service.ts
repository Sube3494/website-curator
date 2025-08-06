// 邮件服务 - 密码重置功能
// 支持 QQ SMTP 邮箱服务

import nodemailer from 'nodemailer'

interface EmailConfig {
  from: string
  service?: string
  host?: string
  port?: number
  secure?: boolean
  auth?: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private config: EmailConfig
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.config = {
      from: process.env.EMAIL_FROM || 'noreply@your-domain.com',
      host: process.env.EMAIL_HOST || 'smtp.qq.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '' // QQ邮箱授权码
      }
    }

    // 初始化邮件传输器
    this.initTransporter()
  }

  // 初始化 nodemailer 传输器
  private initTransporter() {
    try {
      // 如果配置了邮件服务就创建传输器
      if (this.config.auth?.user && this.config.auth?.pass) {
        this.transporter = nodemailer.createTransport({
          host: this.config.host,
          port: this.config.port,
          secure: this.config.secure,
          auth: {
            user: this.config.auth?.user,
            pass: this.config.auth?.pass
          },
          // QQ邮箱特殊配置
          tls: {
            rejectUnauthorized: false
          }
        })

        console.log('📧 邮件服务已初始化:', {
          host: this.config.host,
          port: this.config.port,
          secure: this.config.secure,
          user: this.config.auth?.user
        })
      }
    } catch (error) {
      console.error('邮件传输器初始化失败:', error)
    }
  }

  // 发送密码重置邮件
  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
      
      const emailOptions: EmailOptions = {
        to,
        subject: '密码重置 - 网站导航系统',
        html: this.generatePasswordResetHTML(userName, resetUrl),
        text: this.generatePasswordResetText(userName, resetUrl)
      }

      // 如果没有配置传输器，只记录日志
      if (!this.transporter) {
        console.log('📧 密码重置邮件 (开发模式):')
        console.log('收件人:', emailOptions.to)
        console.log('主题:', emailOptions.subject)
        console.log('重置链接:', resetUrl)
        console.log('令牌:', resetToken)
        console.log('HTML 内容:')
        console.log(emailOptions.html)
        return true
      }

      // 使用配置的邮件服务发送
      return await this.sendEmail(emailOptions)
    } catch (error) {
      console.error('发送密码重置邮件失败:', error)
      return false
    }
  }

  // 生成密码重置邮件的 HTML 内容
  private generatePasswordResetHTML(userName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>密码重置</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 密码重置</h1>
            <p>网站导航系统</p>
        </div>
        <div class="content">
            <h2>你好，${userName}！</h2>
            <p>我们收到了你的密码重置请求。点击下面的按钮来重置你的密码：</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">重置密码</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ 安全提醒：</strong>
                <ul>
                    <li>此链接将在 <strong>1小时</strong> 后过期</li>
                    <li>如果你没有请求密码重置，请忽略此邮件</li>
                    <li>请不要将此链接分享给他人</li>
                </ul>
            </div>
            
            <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${resetUrl}
            </p>
        </div>
        <div class="footer">
            <p>此邮件由系统自动发送，请勿回复</p>
            <p>© 2025 网站导航系统</p>
        </div>
    </div>
</body>
</html>
    `
  }

  // 生成密码重置邮件的纯文本内容
  private generatePasswordResetText(userName: string, resetUrl: string): string {
    return `
你好，${userName}！

我们收到了你的密码重置请求。请访问以下链接来重置你的密码：

${resetUrl}

安全提醒：
- 此链接将在 1小时 后过期
- 如果你没有请求密码重置，请忽略此邮件
- 请不要将此链接分享给他人

此邮件由系统自动发送，请勿回复。

© 2025 网站导航系统
    `
  }

  // 实际发送邮件的方法
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // 如果没有配置传输器，使用开发模式
      if (!this.transporter) {
        console.log('📧 邮件发送 (开发模式):', {
          to: options.to,
          subject: options.subject,
          // 不记录完整内容以保护隐私
        })
        return true
      }

      // 使用 nodemailer 发送邮件
      const mailOptions = {
        from: `"网站导航系统" <${this.config.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      }

      const info = await this.transporter.sendMail(mailOptions)

      console.log('📧 邮件发送成功:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject
      })

      return true
    } catch (error) {
      console.error('📧 邮件发送失败:', error)
      return false
    }
  }

  // 验证邮箱格式
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// 导出单例和类
export const emailService = new EmailService()
export { EmailService }
export default emailService
