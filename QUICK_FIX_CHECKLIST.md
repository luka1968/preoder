# ⚡ 快速修复检查清单

## 问题诊断 ✅
- [x] 已识别：表名不一致导致数据存储和查询位置不同
- [x] 已分析：8 个文件中的创建操作使用了错误的表名

## 代码修复 ✅
- [x] `pages/api/preorder/create.ts` - 修改为使用 `preorder_orders` 表
- [x] `pages/api/preorder/create-with-billing.ts` - 修改为使用 `preorder_orders` 表
- [x] `pages/api/test-draft-order.ts` - 修改为使用 `preorder_orders` 表
- [x] `pages/api/fix-preorders.ts` - 修改为使用 `preorder_orders` 表
- [x] `pages/api/diagnose-preorders.ts` - 修改为使用 `preorder_orders` 表
- [x] `pages/api/debug-preorder.ts` - 修改为使用 `preorder_orders` 表
- [x] `pages/api/check-shop.ts` - 修改为查询 `preorder_orders` 表
- [x] `pages/api/preorders/list.ts` - 修改为使用 `preorder_orders` 表

## 数据库部分 ✅
- [x] 创建 `supabase-preorder-orders-table.sql` - 手动执行脚本
- [x] 创建 `supabase/migrations/20250114_create_preorder_orders_table.sql` - 自动迁移
- [x] 包含所有必要的索引和触发器
- [x] 提供数据迁移脚本

## 文档部分 ✅
- [x] 创建 `BUG_FIX_SUMMARY.md` - 修复总结
- [x] 创建 `BUG_FIX_PREORDER_ORDERS_TABLE.md` - 详细说明
- [x] 包含验证命令和故障排除

## 🎯 您需要执行的步骤

### Step 1️⃣: 在 Supabase 中创建表 (5 分钟)

```
1. 登录 Supabase 控制台
2. 打开 SQL Editor
3. 复制并运行 supabase-preorder-orders-table.sql 的内容
4. 验证表创建成功
```

### Step 2️⃣: 推送代码更新 (2 分钟)

```bash
git add .
git commit -m "修复: 统一预购订单表名为preorder_orders"
git push
```

### Step 3️⃣: 等待自动部署 (1-2 分钟)

- Vercel 会自动检测到代码变更
- 等待部署完成

### Step 4️⃣: 验证修复 (2 分钟)

```
1. 在 Shopify 店铺创建新的预购订单
2. 访问应用仪表板
3. 检查是否显示预购订单
```

## 📊 修复前后对比

### ❌ 修复前
```
用户创建预购订单
    ↓
保存到 preorders 表
    ↓
后台查询 preorder_orders 表
    ↓
找不到订单 ❌
后台显示为空
```

### ✅ 修复后
```
用户创建预购订单
    ↓
保存到 preorder_orders 表 ✅
    ↓
后台查询 preorder_orders 表 ✅
    ↓
找到订单 ✅
后台正确显示
```

## 🔍 验证修复的关键文件

| 文件 | 验证内容 |
|-----|---------|
| `pages/api/preorder/create.ts` | 第 81 行: `.from('preorder_orders')` |
| `pages/api/orders.ts` | 第 22 行: `.from('preorder_orders')` |
| `pages/api/dashboard/activity.ts` | 第 26 行: `.from('preorder_orders')` |
| `supabase-preorder-orders-table.sql` | 存在该文件 |

## ⏱️ 总耗时：10 分钟

- Supabase 建表: 2 分钟
- 代码推送和部署: 3 分钟
- 验证测试: 2 分钟
- 缓冲时间: 3 分钟

## 💡 技术细节

**关键修改：**

1. 表名统一为 `preorder_orders`
2. 字段改为使用 `shop_id` (UUID) 而非 `shop_domain` (TEXT)
3. 状态字段规范化：
   - `status` → `payment_status` + `fulfillment_status`
4. 添加金额字段：`total_amount`, `paid_amount`

**性能优化：**
- 添加了 shop_id 索引 (快速查询特定店铺的订单)
- 添加了 created_at 索引 (快速排序)
- 添加了 customer_email 索引 (快速查找客户)

## ✨ 修复后的功能

✅ 新订单立即显示在仪表板
✅ 订单统计正确
✅ 订单搜索功能工作
✅ 订单状态追踪正常
✅ 支持部分支付流程

## 📝 说明文档位置

- **快速指南**: `BUG_FIX_SUMMARY.md`
- **详细说明**: `BUG_FIX_PREORDER_ORDERS_TABLE.md`
- **SQL 脚本**: `supabase-preorder-orders-table.sql`
- **迁移文件**: `supabase/migrations/20250114_create_preorder_orders_table.sql`

## 🚀 现在就开始修复

1. 打开 Supabase SQL Editor
2. 复制粘贴脚本并运行
3. 推送代码
4. 完成！预购订单现在应该显示在后台了 ✅

---

**需要帮助？** 查看 `BUG_FIX_PREORDER_ORDERS_TABLE.md` 获取详细的故障排除步骤。
