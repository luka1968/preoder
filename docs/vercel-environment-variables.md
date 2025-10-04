# Vercel 环境变量配置

## 🚨 重要提醒
**这些敏感信息绝不能提交到 GitHub！** 请在 Vercel Dashboard 中手动配置以下环境变量。

## 📋 完整环境变量列表

### Shopify 应用配置
```
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_SCOPES=write_products,read_products,write_orders,read_orders,write_customers,read_customers,write_inventory,read_inventory,write_draft_orders,read_draft_orders
SHOPIFY_APP_URL=https://your-app-domain.vercel.app
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Supabase 数据库配置
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_PROJECT_ID=your_supabase_project_id
```

### Brevo 邮件服务配置
```
BREVO_API_KEY=your_brevo_api_key_here
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_brevo_smtp_password
```

### JWT 和安全配置
```
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
```

### 可选：Stripe 支付配置
```
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

## 🚀 Vercel 配置步骤

### 1. 登录 Vercel Dashboard
访问 [vercel.com](https://vercel.com) 并登录你的账户。

### 2. 选择项目
在 Dashboard 中找到你的 PreOrder Pro 项目。

### 3. 进入项目设置
点击项目名称 → Settings → Environment Variables

### 4. 添加环境变量
逐一添加上述环境变量：
- **Name**: 变量名（如 `SHOPIFY_API_KEY`）
- **Value**: 对应的值
- **Environment**: 选择 `Production`, `Preview`, `Development`（建议全选）

### 5. 更新应用 URL
将所有 `https://your-app-domain.vercel.app` 替换为你的实际 Vercel 域名。

### 6. 重新部署
添加完环境变量后，触发一次重新部署以应用新配置。

## 🔒 安全检查清单

### ✅ GitHub 上传前检查
- [ ] `.env.local` 文件已被 `.gitignore` 忽略
- [ ] `.env` 文件已被 `.gitignore` 忽略
- [ ] `.env.deploy` 文件已被 `.gitignore` 忽略
- [ ] 代码中没有硬编码的 API 密钥
- [ ] `shopify.app.toml` 中只包含 Client ID（公开信息）

### ✅ Vercel 配置检查
- [ ] 所有必需的环境变量已添加
- [ ] 环境变量值正确无误
- [ ] 应用 URL 已更新为实际域名
- [ ] 重新部署成功

## 🛠️ 本地开发设置

如果需要本地开发，创建 `.env.local` 文件（不会被提交到 Git）：

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，填入实际值
```

## 🔄 环境变量更新流程

当需要更新环境变量时：

1. **本地开发**: 更新 `.env.local`
2. **生产环境**: 在 Vercel Dashboard 中更新
3. **文档**: 更新此文档（但不包含实际值）
4. **重新部署**: 触发 Vercel 重新部署

## 📞 故障排除

### 常见问题

1. **应用无法连接 Shopify**
   - 检查 `SHOPIFY_API_KEY` 和 `SHOPIFY_API_SECRET`
   - 确认 `SHOPIFY_APP_URL` 与 Vercel 域名一致

2. **数据库连接失败**
   - 验证 Supabase URL 和密钥
   - 检查 Supabase 项目状态

3. **邮件发送失败**
   - 确认 Brevo API 密钥有效
   - 检查 SMTP 配置

### 调试命令

```bash
# 检查环境变量（本地）
npm run env:check

# 查看应用健康状态
npm run health:check
```

---

**⚠️ 安全提醒**: 此文档包含敏感信息，请妥善保管，不要分享给未授权人员。
