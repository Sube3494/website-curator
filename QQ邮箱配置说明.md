# QQ 邮箱 SMTP 配置说明

## 🚀 **快速配置（推荐）**

运行配置助手：
```bash
npm run setup:email
```

按提示输入你的 QQ 邮箱和授权码即可自动配置。

## 📝 **手动配置**

### **第一步：获取 QQ 邮箱授权码**

1. 登录 [QQ邮箱](https://mail.qq.com)
2. 点击 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 开启 **POP3/SMTP服务** 或 **IMAP/SMTP服务**
5. 按提示发送短信验证
6. 获得 **16位授权码**（这不是你的QQ密码！）

### **第二步：配置环境变量**

在 `.env.local` 文件中添加：

```env
# QQ SMTP 邮箱配置
EMAIL_FROM=你的QQ邮箱@qq.com
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=你的QQ邮箱@qq.com
EMAIL_PASS=你的16位授权码
```

### **第三步：重启应用**

```bash
npm run dev
```

## 🧪 **测试配置**

1. 访问 http://localhost:3000
2. 点击 **登录** → **忘记密码？**
3. 输入邮箱地址
4. 检查邮箱是否收到重置邮件

## ⚙️ **配置选项**

### **端口选择**

- **587端口（推荐）**：
  ```env
  EMAIL_PORT=587
  EMAIL_SECURE=false
  ```

- **465端口**：
  ```env
  EMAIL_PORT=465
  EMAIL_SECURE=true
  ```

## 🔍 **故障排除**

### **常见错误**

1. **授权码错误**：
   ```
   Error: Invalid login: 535 Login Fail
   ```
   - 检查授权码是否正确（16位）
   - 确保 EMAIL_USER 和 EMAIL_FROM 相同

2. **连接超时**：
   ```
   Error: Connection timeout
   ```
   - 检查网络连接
   - 尝试使用 465 端口

### **检查日志**

成功发送时会显示：
```
📧 邮件发送成功: { messageId: '...', to: '...', subject: '...' }
```

失败时会显示：
```
📧 邮件发送失败: [错误详情]
```

## 📚 **更多帮助**

- 详细配置指南：`docs/qq-email-setup.md`
- 如有问题，请检查控制台日志

## ✅ **配置完成检查清单**

- [ ] 已获取 QQ 邮箱 16 位授权码
- [ ] 已配置 `.env.local` 文件
- [ ] 已重启应用
- [ ] 测试发送邮件成功

配置完成后，用户就可以使用密码重置功能了！🎉
