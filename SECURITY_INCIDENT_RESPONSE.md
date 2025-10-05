# 🚨 API密钥泄露事件处理指南

## 事件概述
- **时间**: 2025-10-05
- **影响**: Brevo API密钥 `JKgWKx` 被检测到在GitHub公开仓库中暴露
- **状态**: ✅ 已修复配置文件，需要轮换密钥

## 已完成的修复

### ✅ 1. 修复配置文件
- 已将 `.env.production.example` 中的真实API密钥替换为安全占位符
- 移除了以下暴露的凭据：
  - Shopify API密钥和密钥
  - Supabase JWT令牌
  - Brevo API密钥
  - 真实邮箱地址

## 🚨 立即需要执行的操作

### 1. 轮换所有暴露的API密钥

#### Brevo (Sendinblue) API密钥
1. 登录 [Brevo控制台](https://app.brevo.com/)
2. 进入 **SMTP & API** > **API Keys**
3. 删除旧的API密钥（如果还存在）
4. 生成新的API密钥
5. 更新生产环境的 `BREVO_API_KEY` 环境变量

#### Shopify API密钥
1. 登录 [Shopify Partner Dashboard](https://partners.shopify.com/)
2. 进入你的应用设置
3. 重新生成 API密钥和密钥
4. 更新以下环境变量：
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SHOPIFY_WEBHOOK_SECRET`

#### Supabase 密钥
1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 进入项目设置 > **API**
3. 重新生成服务角色密钥
4. 更新 `SUPABASE_SERVICE_ROLE_KEY` 环境变量

#### JWT密钥
1. 生成新的32位以上随机字符串
2. 更新 `JWT_SECRET` 环境变量

### 2. 更新生产环境

#### Vercel部署
```bash
# 使用Vercel CLI更新环境变量
vercel env add BREVO_API_KEY
vercel env add SHOPIFY_API_KEY
vercel env add SHOPIFY_API_SECRET
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
```

#### 或通过Vercel Dashboard
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 更新所有暴露的密钥

### 3. 验证修复

#### 测试API连接
```bash
# 测试Brevo API
curl -X GET "https://api.brevo.com/v3/account" \
  -H "api-key: YOUR_NEW_BREVO_API_KEY"

# 测试应用功能
npm run test:api
```

## 🛡️ 预防措施

### 1. 激活预提交检查
```bash
# 安装并配置git hooks
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "node scripts/pre-commit-security-check.js"
```

### 2. GitHub Secret扫描
1. 在GitHub仓库设置中启用 **Secret scanning**
2. 启用 **Push protection** 防止意外提交密钥

### 3. 定期安全审计
- 每月检查环境变量配置
- 使用工具如 `git-secrets` 扫描历史记录
- 定期轮换API密钥（建议每3-6个月）

### 4. 团队培训
- 确保所有开发者了解不要在示例文件中使用真实密钥
- 建立代码审查流程，特别关注配置文件变更

## 📋 检查清单

- [ ] 轮换Brevo API密钥
- [ ] 轮换Shopify API密钥
- [ ] 轮换Supabase密钥
- [ ] 更新JWT密钥
- [ ] 更新生产环境变量
- [ ] 测试应用功能
- [ ] 启用GitHub secret scanning
- [ ] 配置预提交钩子
- [ ] 通知团队成员

## 联系信息
如有问题，请联系：
- 技术负责人：[你的联系方式]
- 安全团队：[安全团队联系方式]

---
**最后更新**: 2025-10-05
**状态**: 配置文件已修复，等待密钥轮换
