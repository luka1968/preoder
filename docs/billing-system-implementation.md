# 计费系统实现文档

## 🎯 系统概述

PreOrder Pro 计费系统完全按照需求实现，支持免费版和Pro版的功能限制和使用统计。

## 📋 定价计划

### 免费版 (Free)
- **价格**: $0/月
- **预售订单**: 1个/月
- **补货邮件**: 50个/月
- **部分付款**: ❌ 不支持
- **折扣码**: ❌ 不支持
- **邮件模板编辑**: ❌ 不支持
- **移除品牌标识**: ❌ 不支持

### Pro版 (Pro)
- **价格**: $3.99/月
- **预售订单**: 100个/月
- **补货邮件**: 1000个/月
- **部分付款**: ✅ 支持
- **折扣码**: ✅ 支持
- **邮件模板编辑**: ✅ 支持
- **移除品牌标识**: ✅ 支持

## 🏗️ 技术架构

### 数据库结构
```sql
-- 定价计划表
pricing_plans (
  id, name, price_monthly, price_yearly, 
  features, limits, is_active
)

-- 店铺订阅表
shop_subscriptions (
  id, shop_id, plan_id, status, billing_cycle,
  current_period_start, current_period_end
)

-- 使用统计表
usage_tracking (
  id, shop_id, subscription_id, usage_type,
  usage_count, period_start, period_end
)

-- 计费事件表
billing_events (
  id, shop_id, subscription_id, event_type, event_data
)
```

### 核心组件

#### 1. BillingSystem 类 (`lib/billing-system.ts`)
- ✅ 定价计划管理
- ✅ 订阅创建/更新/取消
- ✅ 使用限制检查
- ✅ 使用统计跟踪
- ✅ 功能权限验证

#### 2. UsageMiddleware 类 (`lib/usage-middleware.ts`)
- ✅ 使用限制中间件
- ✅ 功能访问检查
- ✅ 自动使用计数
- ✅ 品牌标识控制

#### 3. 计费管理页面 (`pages/billing.tsx`)
- ✅ 当前计划显示
- ✅ 使用统计图表
- ✅ 计划升级/降级
- ✅ 计费信息展示

## 🔧 API 端点

### 计费相关 API
```
GET  /api/billing/plans        # 获取定价计划
GET  /api/billing/subscription # 获取当前订阅
POST /api/billing/subscription # 创建订阅
PUT  /api/billing/subscription # 更改计划
DELETE /api/billing/subscription # 取消订阅

GET  /api/billing/usage        # 获取使用统计
POST /api/billing/usage        # 增加使用计数

GET  /api/billing/branding     # 检查品牌标识设置
```

### 使用限制集成示例
```typescript
// 在预售创建API中集成计费检查
export default withUsageCheck('preorder_orders', async (req, res) => {
  // 创建预售订单的逻辑
  // 使用量会自动检查和递增
})

// 检查功能访问权限
export default withFeatureCheck('partial_payments', async (req, res) => {
  // 部分付款功能逻辑
  // 只有Pro用户可以访问
})
```

## 📊 使用限制实现

### 1. 预售订单限制
- **免费版**: 1个/月
- **Pro版**: 100个/月
- **检查时机**: 创建预售订单时
- **超限处理**: 返回403错误，提示升级

### 2. 补货邮件限制
- **免费版**: 50个/月
- **Pro版**: 1000个/月
- **检查时机**: 发送补货通知时
- **超限处理**: 停止发送，提示升级

### 3. 功能访问控制
- **部分付款**: 仅Pro版
- **邮件模板编辑**: 仅Pro版
- **移除品牌标识**: 仅Pro版

## 🎨 品牌标识控制

### 前端组件
```tsx
import BrandingFooter from '@/components/BrandingFooter'

// 自动根据计划显示/隐藏品牌标识
<BrandingFooter shop={shop} />
```

### Widget集成
```javascript
// 在前端widget中检查品牌设置
const showBranding = await WidgetBranding.shouldShow(shop)
if (showBranding) {
  WidgetBranding.inject('preorder-widget')
}
```

## 🔄 升级/降级流程

### 升级到Pro
1. 用户点击"Upgrade to Pro"
2. 调用 `PUT /api/billing/subscription`
3. 更新订阅计划
4. 立即生效，解锁所有功能
5. 重置使用计数到新限制

### 降级到免费版
1. 用户点击"Downgrade to Free"
2. 调用 `PUT /api/billing/subscription`
3. 更新订阅计划
4. 立即生效，应用免费版限制
5. 如果当前使用超过免费版限制，阻止新操作

## 📈 使用统计展示

### 实时使用监控
```typescript
// 获取当前使用情况
const usage = await BillingSystem.getUsageSummary(shopId)

// 返回格式
{
  preorder_orders: { current: 5, limit: 100 },
  restock_emails: { current: 23, limit: 1000 },
  partial_payments: { current: 0, limit: 999999 }
}
```

### 使用进度条
- 绿色: 0-74% 使用率
- 黄色: 75-89% 使用率  
- 红色: 90-100% 使用率

### 使用警告
- 80%使用率时显示警告
- 90%使用率时强调升级
- 100%使用率时阻止操作

## 🔒 安全和验证

### 权限验证
- 所有计费API都验证店铺权限
- 使用中间件自动检查限制
- 防止绕过计费限制

### 数据完整性
- 使用事务确保数据一致性
- 自动记录所有计费事件
- 定期同步使用统计

### 错误处理
- 优雅处理计费系统错误
- 默认允许操作（降级体验）
- 详细的错误日志记录

## 🚀 部署和配置

### 数据库迁移
```bash
# 运行计费系统迁移
psql -f supabase/migrations/20240930_billing_system.sql
```

### 环境变量
```env
# 计费相关配置
BILLING_WEBHOOK_SECRET=your_webhook_secret
STRIPE_SECRET_KEY=your_stripe_key (如果集成Stripe)
```

### 初始化
1. 运行数据库迁移
2. 默认创建Free和Pro计划
3. 为现有店铺创建免费订阅
4. 配置使用统计跟踪

## 📝 使用示例

### 检查预售限制
```typescript
const usageCheck = await UsageMiddleware.checkPreorderLimit(shop)
if (!usageCheck.allowed) {
  return res.status(403).json({
    error: 'Preorder limit exceeded',
    message: usageCheck.message,
    upgrade_required: true
  })
}
```

### 增加使用计数
```typescript
const result = await UsageMiddleware.incrementAndCheck(shop, 'preorder_orders')
if (!result.allowed) {
  // 处理超限情况
}
```

### 检查功能权限
```typescript
const hasAccess = await BillingSystem.canUseFeature(shopId, 'partial_payments')
if (!hasAccess) {
  return res.status(403).json({
    error: 'Feature not available on current plan'
  })
}
```

## 🎯 测试场景

### 免费版限制测试
1. 创建1个预售订单 ✅
2. 尝试创建第2个预售订单 ❌ (应被阻止)
3. 发送50个补货邮件 ✅
4. 尝试发送第51个邮件 ❌ (应被阻止)
5. 尝试使用部分付款 ❌ (应被阻止)

### Pro版功能测试
1. 升级到Pro版 ✅
2. 创建100个预售订单 ✅
3. 发送1000个补货邮件 ✅
4. 使用部分付款功能 ✅
5. 编辑邮件模板 ✅
6. 品牌标识被移除 ✅

### 升级/降级测试
1. 从免费版升级到Pro ✅
2. 功能立即解锁 ✅
3. 从Pro降级到免费版 ✅
4. 功能立即限制 ✅

## 📊 监控和分析

### 使用统计
- 每日/月度使用报告
- 计划转换率分析
- 功能使用热力图

### 收入跟踪
- 月度经常性收入(MRR)
- 客户生命周期价值(LTV)
- 流失率分析

## 🔮 未来扩展

### 计划增强
- 年度计划折扣
- 企业级计划
- 按使用量计费

### 功能扩展
- 自动升级建议
- 使用预测分析
- 个性化定价

## ✅ 实现状态

| 功能 | 状态 | 文件 |
|------|------|------|
| 数据库结构 | ✅ 完成 | `supabase/migrations/20240930_billing_system.sql` |
| 核心计费逻辑 | ✅ 完成 | `lib/billing-system.ts` |
| 使用限制中间件 | ✅ 完成 | `lib/usage-middleware.ts` |
| 计费管理页面 | ✅ 完成 | `pages/billing.tsx` |
| API端点 | ✅ 完成 | `pages/api/billing/*` |
| 品牌标识控制 | ✅ 完成 | `components/BrandingFooter.tsx` |
| 使用示例 | ✅ 完成 | `pages/api/preorder/create-with-billing.ts` |

**总结**: PreOrder Pro 计费系统已完全实现，支持所有需求的功能限制、使用统计和计划管理。系统设计灵活，易于扩展，完全满足免费版和Pro版的差异化需求。
