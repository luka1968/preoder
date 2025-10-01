# PreOrder Pro 部署指南

## 🎯 部署架构

```
Shopify Store → Shopify App (Partner Dashboard) → Vercel (Backend) → Supabase (Database)
```

## 📋 部署前准备清单

### 1. 账号准备
- [ ] Shopify Partner账号 (免费)
- [ ] Vercel账号 (免费)
- [ ] Supabase账号 (免费)
- [ ] 域名 (可选，推荐)

### 2. 环境变量配置
创建 `.env.local` 文件：

```env
# Shopify App 配置
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
SHOPIFY_APP_URL=https://your-app.vercel.app

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 其他配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
CRON_SECRET=your_cron_secret

# 邮件服务 (Brevo)
BREVO_API_KEY=your_brevo_api_key

# 加密密钥
ENCRYPTION_KEY=your_32_character_encryption_key
```

## 🚀 第一步：部署到 Vercel

### 1.1 连接 GitHub
```bash
# 1. 将代码推送到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. 访问 vercel.com
# 3. 点击 "Import Project"
# 4. 选择你的 GitHub 仓库
```

### 1.2 配置 Vercel 项目
```bash
# 项目设置
Project Name: preorder-pro
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 1.3 添加环境变量
在 Vercel Dashboard → Settings → Environment Variables 中添加所有环境变量

### 1.4 自定义域名 (推荐)
```bash
# 在 Vercel Dashboard → Settings → Domains 中添加
# 例如: preorder-pro.yourdomain.com
# 或使用免费的 .vercel.app 域名
```

## 🏪 第二步：创建 Shopify App

### 2.1 访问 Shopify Partner Dashboard
1. 访问 https://partners.shopify.com
2. 登录或注册 Partner 账号
3. 点击 "Apps" → "Create app"

### 2.2 配置 App 基本信息
```
App name: PreOrder Pro
App URL: https://your-app.vercel.app
Allowed redirection URL(s): 
  - https://your-app.vercel.app/api/auth/callback
  - https://your-app.vercel.app/auth/callback

Webhook endpoints:
  - https://your-app.vercel.app/api/webhooks/orders/create
  - https://your-app.vercel.app/api/webhooks/orders/paid
  - https://your-app.vercel.app/api/webhooks/inventory-levels/update
  - https://your-app.vercel.app/api/webhooks/app/uninstalled
```

### 2.3 设置 App 权限 (Scopes)
```
Read access:
- read_products
- read_product_listings
- read_inventory
- read_orders
- read_customers
- read_locales
- read_translations

Write access:
- write_products
- write_inventory
- write_orders
- write_draft_orders
- write_script_tags
- write_translations
```

### 2.4 获取 API 凭据
```
API key: 复制到环境变量 SHOPIFY_API_KEY
API secret key: 复制到环境变量 SHOPIFY_API_SECRET
```

## 🗄️ 第三步：配置 Supabase

### 3.1 创建 Supabase 项目
1. 访问 https://supabase.com
2. 创建新项目
3. 等待项目初始化完成

### 3.2 运行数据库迁移
```sql
-- 在 Supabase SQL Editor 中运行
-- 1. 运行基础迁移
\i supabase/migrations/20240930_create_tables.sql

-- 2. 运行计费系统迁移
\i supabase/migrations/20240930_billing_system.sql

-- 3. 创建必要的函数
CREATE OR REPLACE FUNCTION increment_usage_count(
  p_shop_id UUID,
  p_usage_type VARCHAR,
  p_period_start TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  UPDATE usage_tracking 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE shop_id = p_shop_id 
    AND usage_type = p_usage_type 
    AND period_start = p_period_start;
END;
$$ LANGUAGE plpgsql;
```

### 3.3 配置 RLS (Row Level Security)
```sql
-- 启用 RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_preorder_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_subscriptions ENABLE ROW LEVEL SECURITY;
-- ... 其他表

-- 创建安全策略
CREATE POLICY "Users can only access their own shop data" ON shops
  FOR ALL USING (auth.uid() = user_id);
```

### 3.4 获取 Supabase 凭据
```
Project URL: 复制到 NEXT_PUBLIC_SUPABASE_URL
Anon key: 复制到 NEXT_PUBLIC_SUPABASE_ANON_KEY
Service role key: 复制到 SUPABASE_SERVICE_ROLE_KEY
```

## ⚙️ 第四步：配置定时任务

### 4.1 设置 Vercel Cron Jobs
创建 `vercel.json`:
```json
{
  "functions": {
    "pages/api/cron/update-schedules.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    {
      "path": "/api/cron/update-schedules",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-notifications",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/cleanup-expired",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 4.2 或使用外部 Cron 服务
```bash
# 使用 cron-job.org 或类似服务
# 每小时调用: https://your-app.vercel.app/api/cron/update-schedules
# 每15分钟调用: https://your-app.vercel.app/api/cron/send-notifications
```

## 🔧 第五步：测试部署

### 5.1 本地测试
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 测试 API 端点
curl https://localhost:3000/api/health
```

### 5.2 生产环境测试
```bash
# 测试 Vercel 部署
curl https://your-app.vercel.app/api/health

# 测试 Shopify 集成
# 在开发商店中安装应用
```

## 📱 第六步：在开发商店中测试

### 6.1 创建开发商店
1. 在 Shopify Partner Dashboard 中创建开发商店
2. 安装你的应用进行测试

### 6.2 测试核心功能
- [ ] 应用安装和授权
- [ ] 产品预售设置
- [ ] 前端按钮和徽章显示
- [ ] 邮件通知发送
- [ ] 订单创建和管理
- [ ] 计费系统功能

## 🚀 第七步：提交应用审核

### 7.1 完善应用信息
```
App listing:
- App name: PreOrder Pro
- App subtitle: Advanced Pre-order & Back-in-Stock Notifications
- App description: 详细的功能描述
- App icon: 1024x1024 PNG
- Screenshots: 至少5张应用截图
- App category: Store management
- Pricing: 免费 + Pro ($3.99/月)
```

### 7.2 提交审核材料
- [ ] 应用功能演示视频
- [ ] 详细的功能说明文档
- [ ] 隐私政策和服务条款
- [ ] 客服联系方式

### 7.3 审核流程
```
1. 提交应用 → 2. Shopify 审核 → 3. 修改反馈 → 4. 最终批准 → 5. 上架 App Store
```

## 🔒 安全和合规

### 7.1 GDPR 合规
- [ ] 用户数据加密存储
- [ ] 数据删除功能
- [ ] 隐私政策完善
- [ ] Cookie 使用声明

### 7.2 安全措施
- [ ] HTTPS 强制使用
- [ ] API 请求验证
- [ ] Webhook 签名验证
- [ ] 敏感数据加密

## 📊 监控和维护

### 8.1 应用监控
```bash
# Vercel Analytics
# Supabase Monitoring
# 自定义错误追踪
```

### 8.2 日志管理
```bash
# 查看 Vercel 日志
vercel logs

# 查看 Supabase 日志
# 在 Supabase Dashboard 中查看
```

## 💰 定价和计费

### 9.1 Shopify 费用
- Partner 账号: 免费
- 应用审核: 免费
- 交易费用: 收入的 20% (Shopify 抽成)

### 9.2 基础设施费用
- Vercel: 免费额度足够开始
- Supabase: 免费额度足够开始
- 域名: $10-15/年 (可选)

## 🎯 上线后优化

### 10.1 性能优化
- [ ] CDN 配置
- [ ] 图片压缩
- [ ] 代码分割
- [ ] 缓存策略

### 10.2 用户反馈
- [ ] 应用评分监控
- [ ] 用户反馈收集
- [ ] 功能迭代计划
- [ ] 客服支持体系

## 📞 技术支持

### 常见问题解决
1. **部署失败**: 检查环境变量配置
2. **数据库连接失败**: 验证 Supabase 凭据
3. **Shopify 授权失败**: 检查回调 URL 配置
4. **Webhook 不工作**: 验证 URL 和签名

### 联系支持
- Shopify Partner Support
- Vercel Support
- Supabase Support
- 社区论坛和文档
