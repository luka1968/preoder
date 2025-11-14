# 🎯 预购订单显示在 Shopify 后台 - 快速指南

## 问题
预购订单无法在 Shopify 店铺后台显示。

## 解决方案概括

您的应用有**两个部分的功能**：

### ✅ 第 1 部分: 数据保存 (已修复)
- 预购订单正确保存到数据库 `preorder_orders` 表
- 可以在应用仪表板中查看

### ❓ 第 2 部分: Shopify 后台显示 (需要权限)
- 应用需要 `write_draft_orders` 权限
- 用户需要**重新授权应用**
- 代码已正确，但权限可能不足

## 🚀 3 个快速步骤

### 步骤 1️⃣: 卸载并重新安装应用

```
1. Shopify 后台 → 设置 → 应用 → 找到 PreOrder Pro → 移除
2. 清除浏览器缓存 (Ctrl+Shift+Del)
3. 访问: https://your-app.vercel.app/install?shop=your-shop.myshopify.com
4. 点击 "同意" 授予所有权限（包括 write_draft_orders）
```

### 步骤 2️⃣: 验证权限

在 Supabase SQL Editor 运行：
```sql
SELECT scope FROM shops 
WHERE shop_domain = 'your-shop.myshopify.com';
```

结果应包含: `write_draft_orders`

### 步骤 3️⃣: 测试

1. 创建新的预购订单
2. 进入 Shopify 后台查看订单
3. 应该看到新的 Draft Order ✅

## 📚 详细指南

| 我想... | 查看这个文件 |
|--------|-----------|
| 快速了解完整流程 | 📄 [`PREORDER_SHOPIFY_COMPLETE_FIX.md`](./PREORDER_SHOPIFY_COMPLETE_FIX.md) |
| 了解 Draft Order 创建 | 📄 [`SHOPIFY_DRAFT_ORDER_FIX.md`](./SHOPIFY_DRAFT_ORDER_FIX.md) |
| 理解权限和重授权 | 📄 [`SHOPIFY_OAUTH_PERMISSION_FIX.md`](./SHOPIFY_OAUTH_PERMISSION_FIX.md) |
| 了解数据库修复 | 📄 [`BUG_FIX_PREORDER_ORDERS_TABLE.md`](./BUG_FIX_PREORDER_ORDERS_TABLE.md) |

## ⏱️ 总耗时

只需 **15 分钟**！

- 卸载应用: 5 分钟
- 重新安装: 5 分钟
- 验证和测试: 5 分钟

## ✅ 完成标志

修复成功的标志：

1. ✅ Supabase 中 scope 包含 `write_draft_orders`
2. ✅ Shopify 后台能看到 Draft Order
3. ✅ 订单有 `preorder` 标签
4. ✅ 可以在后台管理预购订单

## 🆘 如果不工作

### 常见原因

| 问题 | 原因 | 解决 |
|------|------|------|
| 看不到权限 | 用户旧权限下安装 | 重新授权 |
| Draft Order 没创建 | 缺少权限 | 检查 scope 字段 |
| 仍然看不到 | Shopify 缓存 | 刷新页面或清除缓存 |

### 调试

查看 Vercel 日志：
```
Vercel Dashboard → Logs → 搜索 "preorder/create"
```

查看数据库：
```sql
-- 检查 Draft Order ID 是否被创建
SELECT shopify_order_id, payment_status, created_at 
FROM preorder_orders 
ORDER BY created_at DESC LIMIT 5;
```

## 🎯 核心原理

```
预购功能的完整流程：

用户在店铺预购
    ↓
保存到 preorder_orders 表 ✅
    ↓
自动创建 Shopify Draft Order ← 需要权限
    ↓
显示在 Shopify 后台订单列表
    ↓
管理员可以管理预购订单
```

## 📞 总结

**原因**: 应用权限不足或用户权限过旧
**解决**: 重新授权应用以获得 `write_draft_orders` 权限
**耗时**: 15 分钟
**难度**: ⭐ 简单

---

## 现在就开始！

👉 **立即按照上面的 3 个步骤操作，15 分钟后您就能在 Shopify 后台看到预购订单了！** 🎉

**更多详情**: 查看 [`PREORDER_SHOPIFY_COMPLETE_FIX.md`](./PREORDER_SHOPIFY_COMPLETE_FIX.md)
