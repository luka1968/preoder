# 🚀 PreOrder Pro 部署检查清单

## 📋 部署前准备

### ✅ 账号准备
- [ ] **Shopify Partner 账号** - 免费注册 https://partners.shopify.com
- [ ] **Vercel 账号** - 免费注册 https://vercel.com  
- [ ] **Supabase 账号** - 免费注册 https://supabase.com
- [ ] **GitHub 账号** - 代码托管
- [ ] **域名** (可选) - 推荐购买自定义域名

### ✅ 本地环境
- [ ] Node.js 18+ 已安装
- [ ] Git 已安装并配置
- [ ] 项目依赖已安装 (`npm install`)
- [ ] 项目可以本地运行 (`npm run dev`)

## 🗄️ 数据库部署

### ✅ Supabase 设置
- [ ] 创建新的 Supabase 项目
- [ ] 复制项目 URL 和 API Keys
- [ ] 运行数据库迁移脚本
- [ ] 配置 Row Level Security (RLS)
- [ ] 测试数据库连接

```sql
-- 在 Supabase SQL Editor 中运行
\i supabase/migrations/20240930_create_tables.sql
\i supabase/migrations/20240930_billing_system.sql
```

## 🌐 后端部署

### ✅ Vercel 部署
- [ ] 将代码推送到 GitHub
- [ ] 在 Vercel 中导入 GitHub 仓库
- [ ] 配置项目设置 (Framework: Next.js)
- [ ] 添加所有环境变量
- [ ] 部署成功并获得域名
- [ ] 测试 API 端点 (`/api/health`)

### ✅ 环境变量配置
```env
# 必需的环境变量
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
SHOPIFY_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_32_character_secret
CRON_SECRET=your_cron_secret
```

### ✅ 定时任务配置
- [ ] Vercel Cron Jobs 已配置
- [ ] 测试定时任务端点
- [ ] 验证任务执行日志

## 🏪 Shopify App 创建

### ✅ Partner Dashboard 设置
- [ ] 创建新的 Shopify App
- [ ] 配置 App URL: `https://your-app.vercel.app`
- [ ] 配置回调 URL: `https://your-app.vercel.app/api/auth/callback`
- [ ] 设置 Webhook 端点
- [ ] 配置 App 权限 (Scopes)
- [ ] 获取 API Key 和 Secret

### ✅ Webhook 配置
```
订单创建: /api/webhooks/orders/create
订单支付: /api/webhooks/orders/paid  
库存更新: /api/webhooks/inventory-levels/update
应用卸载: /api/webhooks/app/uninstalled
```

### ✅ App 权限 (Scopes)
```
读取权限:
- read_products
- read_inventory  
- read_orders
- read_customers
- read_locales

写入权限:
- write_products
- write_inventory
- write_orders
- write_script_tags
```

## 🧪 测试部署

### ✅ 开发商店测试
- [ ] 创建开发商店
- [ ] 安装你的应用
- [ ] 测试应用授权流程
- [ ] 验证管理后台可访问

### ✅ 功能测试
- [ ] **预售设置** - 为产品启用预售
- [ ] **前端显示** - 验证按钮和徽章显示
- [ ] **订单创建** - 测试预售订单流程
- [ ] **邮件通知** - 测试邮件发送
- [ ] **补货通知** - 测试订阅和通知
- [ ] **部分付款** - 测试定金支付
- [ ] **计费系统** - 测试免费版限制
- [ ] **多语言** - 测试语言切换

### ✅ API 测试
```bash
# 健康检查
curl https://your-app.vercel.app/api/health

# 认证测试
curl https://your-app.vercel.app/api/auth/shopify

# Webhook 测试
curl -X POST https://your-app.vercel.app/api/webhooks/orders/create
```

## 📱 App Store 提交

### ✅ App 信息完善
- [ ] **App 名称**: PreOrder Pro
- [ ] **App 副标题**: Advanced Pre-order & Back-in-Stock Notifications
- [ ] **App 描述**: 详细功能描述 (500+ 字)
- [ ] **App 图标**: 1024x1024 PNG 格式
- [ ] **截图**: 至少 5 张高质量截图
- [ ] **演示视频**: 2-3 分钟功能演示

### ✅ 法律文档
- [ ] **隐私政策** - 详细的数据处理说明
- [ ] **服务条款** - 使用条款和限制
- [ ] **退款政策** - 清晰的退款规则
- [ ] **客服联系** - 支持邮箱和文档链接

### ✅ 定价设置
```
免费计划:
- 1 个预售订单/月
- 50 个补货邮件/月
- 基础功能

Pro 计划 ($3.99/月):
- 100 个预售订单/月  
- 1000 个补货邮件/月
- 所有高级功能
- 移除品牌标识
```

## 🔒 安全和合规

### ✅ 安全检查
- [ ] **HTTPS 强制** - 所有连接使用 HTTPS
- [ ] **API 验证** - 所有 API 请求验证
- [ ] **数据加密** - 敏感数据加密存储
- [ ] **Webhook 验证** - HMAC 签名验证
- [ ] **SQL 注入防护** - 参数化查询

### ✅ GDPR 合规
- [ ] **数据最小化** - 只收集必要数据
- [ ] **用户同意** - 明确的同意机制
- [ ] **数据删除** - 支持数据删除请求
- [ ] **数据导出** - 支持数据导出
- [ ] **隐私通知** - 清晰的隐私说明

## 📊 监控和维护

### ✅ 监控设置
- [ ] **Vercel Analytics** - 性能监控
- [ ] **Supabase Monitoring** - 数据库监控  
- [ ] **错误追踪** - 错误日志收集
- [ ] **使用统计** - 用户行为分析

### ✅ 备份和恢复
- [ ] **数据库备份** - Supabase 自动备份
- [ ] **代码备份** - GitHub 代码托管
- [ ] **配置备份** - 环境变量备份
- [ ] **恢复测试** - 定期恢复测试

## 🎯 上线后任务

### ✅ 营销准备
- [ ] **产品网站** - 创建产品介绍网站
- [ ] **文档中心** - 用户使用文档
- [ ] **客服系统** - 客户支持渠道
- [ ] **社交媒体** - 产品宣传渠道

### ✅ 用户反馈
- [ ] **反馈收集** - 用户反馈机制
- [ ] **评分监控** - App Store 评分跟踪
- [ ] **功能请求** - 新功能需求收集
- [ ] **Bug 报告** - 问题报告处理

## 💰 费用预算

### 基础设施费用 (月度)
- **Vercel**: $0 (免费版足够开始)
- **Supabase**: $0 (免费版足够开始)  
- **域名**: $1-2/月 (可选)
- **邮件服务**: $0-10/月 (根据发送量)

### Shopify 费用
- **Partner 账号**: 免费
- **App 审核**: 免费
- **交易费用**: 收入的 20% (Shopify 抽成)

### 总计启动成本
- **最低**: $0/月 (使用免费服务)
- **推荐**: $15-25/月 (包含域名和邮件服务)

## 🚀 部署命令

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/preorder-pro.git
cd preorder-pro

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件

# 4. 本地测试
npm run dev

# 5. 构建项目
npm run build

# 6. 部署到 Vercel
git add .
git commit -m "Ready for deployment"
git push origin main
# 然后在 Vercel 中导入项目
```

## 📞 获取帮助

### 官方文档
- [Shopify App 开发文档](https://shopify.dev/apps)
- [Vercel 部署文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)

### 社区支持
- Shopify Partners Slack
- Vercel Discord
- Supabase Discord
- Stack Overflow

---

**🎉 完成所有检查项后，你的 PreOrder Pro 就可以成功上线了！**
