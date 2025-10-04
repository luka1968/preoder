# 🔒 安全部署步骤指南

## ⚠️ 重要安全提醒

**你刚才提供的API密钥已经暴露，需要立即重新生成！**

## 🚨 第1步：立即重新生成所有密钥

### 1.1 重新生成 Vercel Token
```
1. 访问 https://vercel.com/account/tokens
2. 删除现有的 token: pevFoGhYOgR8t9IO4DK7tBWq
3. 点击 "Create Token"
4. 复制新的 token
```

### 1.2 重新生成 Shopify API Secret
```
1. 访问 https://partners.shopify.com
2. 进入你的应用设置
3. 重新生成 "Client secret"
4. 复制新的 secret
```

### 1.3 重新生成 Supabase Service Role Key
```
1. 访问 https://supabase.com
2. 选择项目 → Settings → API
3. 点击 "Reset" service_role key
4. 复制新的 key
```

### 1.4 重新生成 Brevo API Key
```
1. 访问 Brevo Dashboard
2. Account → SMTP & API → API Keys
3. 删除现有 key，创建新的
4. 复制新的 key
```

## 🛡️ 第2步：安全配置环境变量

### 2.1 编辑本地配置文件
```bash
# 编辑 .env.deploy 文件（已创建）
# 将新生成的密钥填入对应位置
```

### 2.2 配置示例
```env
# 使用新生成的密钥替换
VERCEL_TOKEN=新的vercel_token_在这里
SHOPIFY_API_SECRET=新的shopify_secret_在这里
SUPABASE_SERVICE_ROLE_KEY=新的supabase_key_在这里
BREVO_API_KEY=新的brevo_key_在这里
```

## 🚀 第3步：自动化部署

### 3.1 运行自动部署
```bash
# 使用 API 自动化部署
npm run deploy:env
```

### 3.2 或使用交互式部署
```bash
# 使用交互式一键部署
npm run deploy:auto
```

## 🔍 第4步：验证部署

### 4.1 检查环境变量
```bash
# 查看已配置的环境变量
vercel env ls
```

### 4.2 测试应用
```bash
# 测试健康检查
curl https://your-app.vercel.app/api/health
```

## 📋 安全检查清单

### ✅ 必须完成的安全措施
- [ ] 已重新生成所有暴露的 API 密钥
- [ ] .env.deploy 文件已在 .gitignore 中排除
- [ ] 本地配置文件不会提交到 GitHub
- [ ] 所有环境变量通过 Vercel API 安全配置
- [ ] 删除本地的 .env.deploy 文件（部署完成后）

### ❌ 绝对不要做的事情
- [ ] 不要将 API 密钥提交到 GitHub
- [ ] 不要在聊天中分享真实的密钥
- [ ] 不要在代码中硬编码敏感信息
- [ ] 不要使用已暴露的密钥

## 🎯 正确的部署流程

```bash
# 1. 重新生成所有密钥
# 2. 编辑 .env.deploy 文件
# 3. 运行自动部署
npm run deploy:env

# 4. 验证部署
curl https://your-app.vercel.app/api/health

# 5. 删除本地配置文件
rm .env.deploy
```

## 🔐 为什么不能上传到 GitHub？

### 安全风险
- 🚨 **API 密钥泄露** - 任何人都能看到你的密钥
- 💸 **财务风险** - 他人可能使用你的账户产生费用
- 🔓 **数据泄露** - 数据库和应用可能被恶意访问
- 🏪 **店铺风险** - Shopify 店铺可能被恶意操作

### 正确做法
- ✅ **本地配置** - 密钥只在本地存储
- ✅ **API 上传** - 通过 Vercel API 安全传输
- ✅ **环境隔离** - 不同环境使用不同密钥
- ✅ **定期轮换** - 定期更换密钥

---

**🔒 记住：安全永远是第一优先级！**
