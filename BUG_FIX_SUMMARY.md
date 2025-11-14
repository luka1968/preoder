# 🐛 Bug 修复总结 - 预购订单无法显示

## 问题诊断

您报告的问题：**在 Shopify 店铺下单预购订单，店铺后台无法显示这些订单**

## 🔍 根本原因

**代码中使用了两个不同的表名：**

### 问题代码：
| 操作 | 表名 | 文件 |
|-----|-----|------|
| 写入 (创建订单) | `preorders` | `pages/api/preorder/create.ts` |
| 读取 (显示订单) | `preorder_orders` | `pages/api/orders.ts` |
| 读取 (仪表板) | `preorder_orders` | `pages/api/dashboard/activity.ts` |

**结果：** 订单被保存到 A 表，系统查询 B 表 → 永远看不到订单 ❌

## ✅ 修复内容

### 1️⃣ 已修改的 8 个 API 文件

所有创建/修改预购订单的接口现在都使用 `preorder_orders` 表：

✅ `pages/api/preorder/create.ts` - 主要预购创建接口
✅ `pages/api/preorder/create-with-billing.ts` - 带计费预购创建
✅ `pages/api/test-draft-order.ts` - 测试 Draft Order 创建
✅ `pages/api/fix-preorders.ts` - 修复现有预购
✅ `pages/api/diagnose-preorders.ts` - 诊断预购问题
✅ `pages/api/debug-preorder.ts` - 调试预购
✅ `pages/api/check-shop.ts` - 检查店铺数据
✅ `pages/api/preorders/list.ts` - 获取预购列表

### 2️⃣ 创建了数据库迁移脚本

**文件：`supabase-preorder-orders-table.sql`**

此脚本在您的 Supabase 数据库中创建正确的 `preorder_orders` 表，包含：
- 所有必要的列（shop_id, product_id, customer_email 等）
- 性能索引
- 自动时间戳更新触发器
- 数据库注释

### 3️⃣ 更新的表结构

**新表：preorder_orders**
```
├── id (主键)
├── shop_id (UUID, 关联到 shops 表)
├── shopify_order_id (Shopify订单ID)
├── product_id
├── variant_id
├── customer_email
├── total_amount (订单总金额)
├── paid_amount (已支付金额)
├── payment_status (pending, partial, paid, refunded)
├── fulfillment_status (pending, fulfilled, cancelled)
├── estimated_delivery_date
├── order_tags (订单标签数组)
├── created_at
└── updated_at (自动更新)
```

## 🚀 后续步骤

### 步骤 1：创建数据库表

1. 登录 Supabase 控制台
2. 进入 **SQL Editor**
3. 打开 `supabase-preorder-orders-table.sql` 文件
4. 复制全部内容到 SQL Editor
5. 点击 **Run** 执行

### 步骤 2：迁移旧数据（如有）

如果您已经创建过预购订单，运行此迁移脚本：

```sql
-- 将旧数据从 preorders 迁移到 preorder_orders
INSERT INTO preorder_orders (
  shop_id, product_id, variant_id, customer_email,
  shopify_order_id, payment_status, fulfillment_status,
  created_at, updated_at
)
SELECT
  s.id, p.product_id, p.variant_id, p.customer_email,
  p.shopify_draft_order_id::TEXT,
  CASE WHEN p.status = 'completed' THEN 'paid' ELSE 'pending' END,
  'pending', p.created_at, p.updated_at
FROM preorders p
LEFT JOIN shops s ON p.shop_domain = s.shop_domain
WHERE s.id IS NOT NULL;
```

### 步骤 3：推送代码更新

```bash
git add .
git commit -m "修复: 统一预购订单表名为preorder_orders"
git push
```

Vercel 会自动部署代码。

### 步骤 4：验证修复

1. 登录您的 Shopify 店铺
2. 下单一个预购订单
3. 访问应用仪表板
4. 预购订单应该立即显示 ✅

## 📊 验证命令

在 Supabase SQL Editor 中运行以下命令验证数据：

```sql
-- 检查表是否存在
SELECT * FROM preorder_orders LIMIT 1;

-- 查看预购订单数量
SELECT COUNT(*) as total_orders FROM preorder_orders;

-- 查看特定店铺的订单
SELECT * FROM preorder_orders 
WHERE shop_id = (SELECT id FROM shops WHERE shop_domain = 'your-shop.myshopify.com');

-- 查看最近的订单
SELECT * FROM preorder_orders 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🎯 修复的关键点

1. **统一表名** - 所有代码现在都使用 `preorder_orders` 表
2. **正确的字段** - 使用 `shop_id` (UUID) 而不是 `shop_domain` (TEXT)
3. **更好的数据模型** - 分离 `payment_status` 和 `fulfillment_status`
4. **性能优化** - 添加了必要的索引
5. **自动维护** - 自动更新 `updated_at` 时间戳

## 🔄 完整修复流程图

```
用户下单预购
    ↓
API: /api/preorder/create
    ↓
✅ 写入 preorder_orders 表 (已修复)
    ↓
仪表板查询
    ↓
API: /api/orders 或 /api/dashboard/activity
    ↓
✅ 从 preorder_orders 表读取 (已支持)
    ↓
在后台显示 ✅
```

## ✨ 现在您应该看到：

✅ 新创建的预购订单立即显示在仪表板
✅ 订单状态、金额、客户信息都正确显示
✅ 订单列表不为空
✅ 订单搜索和过滤功能正常

## 📞 如果问题持续

请检查：

1. ✓ SQL 脚本是否在 Supabase 中成功执行
2. ✓ `preorder_orders` 表是否存在
3. ✓ 代码是否已推送到 GitHub
4. ✓ Vercel 部署是否完成 (检查部署日志)
5. ✓ 清除浏览器缓存并重新访问

## 📁 相关文件

- 完整说明：`BUG_FIX_PREORDER_ORDERS_TABLE.md`
- SQL 脚本：`supabase-preorder-orders-table.sql`
- 迁移文件：`supabase/migrations/20250114_create_preorder_orders_table.sql`
