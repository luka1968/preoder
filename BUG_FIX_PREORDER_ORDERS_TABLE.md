# 🔧 预购订单无法显示 Bug 修复说明

## 问题描述
用户在 Shopify 店铺下单预购订单后，店铺后台无法显示这些订单。

## 🔍 问题根本原因

**表名不一致导致数据存储和查询错误**

### 详细分析：
1. **数据插入**：预购订单创建时使用了 `preorders` 表
   - `pages/api/preorder/create.ts`
   - `pages/api/test-draft-order.ts`
   - `pages/api/preorder/create-with-billing.ts`
   
2. **数据查询**：仪表板和API接口查询时使用了 `preorder_orders` 表
   - `pages/api/orders.ts`
   - `pages/api/dashboard/activity.ts`
   - `pages/api/analytics.ts`
   - `lib/webhooks.ts`
   - `lib/supabase.ts`

### 结果：
订单被保存到 `preorders` 表，但系统查询的是 `preorder_orders` 表，所以后台永远看不到订单。

## 🔧 修复方案

### 第一步：创建数据库表

1. 打开 **Supabase SQL Editor**
2. 复制 `supabase-preorder-orders-table.sql` 文件的全部内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 执行

```sql
-- 执行此脚本在 Supabase 中创建 preorder_orders 表
```

### 第二步：迁移现有数据（可选）

如果您已经有旧的预购订单保存在 `preorders` 表中，可以运行以下迁移脚本：

```sql
-- 将旧数据从 preorders 表迁移到 preorder_orders 表
INSERT INTO preorder_orders (
  shop_id,
  product_id,
  variant_id,
  customer_email,
  shopify_order_id,
  payment_status,
  fulfillment_status,
  created_at,
  updated_at
)
SELECT
  s.id as shop_id,
  p.product_id,
  p.variant_id,
  p.customer_email,
  p.shopify_draft_order_id::TEXT as shopify_order_id,
  CASE 
    WHEN p.status = 'pending' THEN 'pending'
    WHEN p.status = 'notified' THEN 'pending'
    WHEN p.status = 'completed' THEN 'paid'
    WHEN p.status = 'cancelled' THEN 'cancelled'
    ELSE 'pending'
  END as payment_status,
  'pending' as fulfillment_status,
  p.created_at,
  p.updated_at
FROM preorders p
LEFT JOIN shops s ON p.shop_domain = s.shop_domain
WHERE s.id IS NOT NULL
ON CONFLICT DO NOTHING;
```

### 第三步：推送代码更新

所有 API 端点已经更新为使用 `preorder_orders` 表：

**已修改的文件：**
- ✅ `pages/api/preorder/create.ts` - 预购订单创建
- ✅ `pages/api/preorder/create-with-billing.ts` - 带计费的预购创建
- ✅ `pages/api/test-draft-order.ts` - 测试 Draft Order
- ✅ `pages/api/fix-preorders.ts` - 修复现有预购
- ✅ `pages/api/diagnose-preorders.ts` - 诊断预购问题
- ✅ `pages/api/debug-preorder.ts` - 调试预购
- ✅ `pages/api/check-shop.ts` - 检查店铺
- ✅ `pages/api/preorders/list.ts` - 获取预购列表
- ✅ `pages/api/orders.ts` - 订单管理API
- ✅ `pages/api/dashboard/activity.ts` - 仪表板活动

```bash
# 推送代码更改
git add pages/api/preorder/
git add pages/api/test-draft-order.ts
git add pages/api/fix-preorders.ts
git add pages/api/diagnose-preorders.ts
git add pages/api/debug-preorder.ts
git add pages/api/check-shop.ts
git add pages/api/orders.ts
git add pages/api/dashboard/activity.ts
git add supabase/migrations/20250114_create_preorder_orders_table.sql
git add supabase-preorder-orders-table.sql
git commit -m "修复: 统一预购订单表名从preorders改为preorder_orders"
git push
```

### 第四步：验证修复

1. 访问您的应用仪表板
2. 创建新的预购订单
3. 检查是否在后台显示

**测试端点：**
```
GET /api/orders?shop=your-shop.myshopify.com
GET /api/preorders/list
GET /api/dashboard/activity?shop=your-shop.myshopify.com
```

## 📊 表结构对比

### ❌ 旧表 (preorders)
```sql
CREATE TABLE preorders (
  id BIGSERIAL PRIMARY KEY,
  shop_domain TEXT,
  product_id TEXT,
  variant_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  status TEXT,
  shopify_draft_order_id BIGINT,
  shopify_draft_order_name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### ✅ 新表 (preorder_orders)
```sql
CREATE TABLE preorder_orders (
  id BIGSERIAL PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),  -- 使用 UUID shop_id
  shopify_order_id TEXT,
  product_id TEXT,
  variant_id TEXT,
  customer_email TEXT,
  total_amount VARCHAR(20),
  paid_amount VARCHAR(20),
  payment_status VARCHAR(20),  -- pending, partial, paid, refunded
  fulfillment_status VARCHAR(20),  -- pending, fulfilled, cancelled
  estimated_delivery_date TIMESTAMP,
  order_tags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🎯 关键改进

1. **使用 UUID shop_id** 而不是 shop_domain
   - 更符合数据库设计最佳实践
   - 性能更好（引用完整性）

2. **规范化状态字段**
   - `status` → `payment_status` 和 `fulfillment_status`
   - 更清晰的语义

3. **添加订单金额字段**
   - `total_amount` - 订单总金额
   - `paid_amount` - 已支付金额
   - 支持部分支付功能

4. **改进的索引**
   - 优化常见查询性能

## ⚠️ 注意事项

1. 确保在 Supabase 中运行了表创建脚本
2. 如有旧数据，需要运行迁移脚本
3. 新创建的预购订单将自动使用正确的表
4. 仪表板会立即显示新订单

## 🆘 如果问题继续

如果修复后问题仍然存在，请检查：

1. **表是否存在**
   ```sql
   SELECT * FROM preorder_orders LIMIT 1;
   ```

2. **数据是否被插入**
   ```sql
   SELECT COUNT(*) FROM preorder_orders;
   ```

3. **API 错误日志**
   - 检查 Vercel 部署日志
   - 查看浏览器控制台错误

4. **店铺信息**
   ```sql
   SELECT * FROM shops WHERE shop_domain = 'your-shop.myshopify.com';
   ```

## 📞 支持

如有任何问题，请：
1. 检查 Supabase 表是否存在
2. 验证所有代码已推送到 GitHub
3. 等待 Vercel 自动部署完成
4. 清除浏览器缓存后重试
