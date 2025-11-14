# 🎯 在 Shopify 后台显示预购订单完整解决方案

## 问题

预购订单只保存到数据库，但**没有显示在 Shopify 店铺后台的订单列表**中。

## 原因分析

预购订单显示在 Shopify 后台需要两个条件：

1. ✅ **数据保存** - 已修复（保存到 `preorder_orders` 表）
2. ❌ **创建 Draft Order** - 需要修复（Shopify 原生订单）

目前缺少的是第二步：自动创建 **Draft Order**，这样 Shopify 才会在后台显示。

## 📋 完整解决方案

### 第一步：确保 Shopify 应用有正确的权限

**检查清单：**

在 `shopify.app.toml` 中确保包含：

```toml
[access_scopes]
scopes = "write_products,read_products,write_orders,read_orders,write_customers,read_customers,write_inventory,read_inventory,write_draft_orders,read_draft_orders"
```

**关键权限：**
- ✅ `write_draft_orders` - **必需** 用于创建 Draft Order
- ✅ `read_draft_orders` - 用于查询 Draft Order

如果没有这些权限，需要：
1. 在 Shopify Partner Dashboard 更新应用权限
2. 用户需要**重新安装应用**

### 第二步：检查店铺是否已重新授权

运行以下 SQL 查询检查店铺权限：

```sql
-- 在 Supabase SQL Editor 中运行
SELECT 
  shop_domain,
  scope,
  installed_at,
  updated_at,
  active
FROM shops 
WHERE shop_domain = 'your-shop.myshopify.com';
```

**预期结果：**
- `scope` 应包含 `write_draft_orders`
- `active` 应为 `true`

如果 `scope` 不包含 `write_draft_orders`，需要**重新授权应用**。

### 第三步：测试 Draft Order 创建

使用提供的测试页面验证 Draft Order 创建是否工作：

```
https://your-app.vercel.app/api/test-draft-order
```

或在 Supabase SQL Editor 运行测试：

```sql
-- 直接调用测试API查看完整日志
```

### 第四步：修复代码（如果创建失败）

如果 Draft Order 创建仍然失败，通常是以下原因：

#### ❌ 问题 1: Variant ID 格式错误

**症状：** `Invalid variant_id format`

**解决方案：**
```typescript
// ❌ 错误方式
const variantId = '49733009596732'; // 字符串

// ✅ 正确方式
const numericVariantId = parseInt(variantId, 10); // 转换为数字
```

代码已修复，但确保前端发送的是有效的 Variant ID。

#### ❌ 问题 2: 缺少客户信息

**症状：** `Customer email is required`

**解决方案：** 确保 Draft Order 请求包含客户邮箱：

```typescript
const requestBody = {
  draft_order: {
    line_items: [...],
    customer: {
      email: email,  // ✅ 必需
      first_name: name || 'Customer'
    },
    email: email,  // ✅ 必需
    tags: 'preorder'
  }
}
```

#### ❌ 问题 3: 没有授予权限

**症状：** `Access denied` 或 `Unauthorized`

**解决方案：**
1. 检查应用是否有 `write_draft_orders` 权限
2. 在 Shopify Partner Dashboard 重新安装应用到测试店铺
3. 确保用户完成了 OAuth 授权

#### ❌ 问题 4: API 版本不支持

**症状：** `API version not available`

**解决方案：** 确保使用的是最新的 Shopify API 版本：

```typescript
// 当前使用的版本
const apiUrl = `https://${shop}/admin/api/2023-10/draft_orders.json`

// 如果不工作，尝试更新到
const apiUrl = `https://${shop}/admin/api/2024-01/draft_orders.json`
```

### 第五步：完整的工作流验证

运行以下步骤确保完整的工作流：

#### 步骤 A: 检查权限
```sql
SELECT scope FROM shops WHERE shop_domain = 'your-shop.myshopify.com';
-- 应包含: write_draft_orders, read_draft_orders
```

#### 步骤 B: 创建预购订单
```bash
curl -X POST https://your-app.vercel.app/api/preorder/create \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "your-shop.myshopify.com",
    "productId": "123456789",
    "variantId": "987654321",
    "email": "customer@example.com",
    "name": "Customer Name"
  }'
```

#### 步骤 C: 检查数据库
```sql
SELECT * FROM preorder_orders 
WHERE shop_id = (SELECT id FROM shops WHERE shop_domain = 'your-shop.myshopify.com')
ORDER BY created_at DESC 
LIMIT 1;
```

**预期结果：**
- ✅ `shopify_order_id` 不为空（Draft Order ID）
- ✅ `payment_status` = `pending`
- ✅ `fulfillment_status` = `pending`

#### 步骤 D: 验证 Shopify 后台
1. 登录 Shopify 店铺后台
2. 进入 **订单** 页面
3. 搜索客户邮箱或查看最近订单
4. 应该看到带有 `preorder` 标签的 Draft Order

## 🔧 如果还是看不到订单

### 调试步骤

1. **查看 Vercel 日志：**
   ```
   Vercel Dashboard → Logs → 查看 /api/preorder/create 的日志
   ```
   找出是哪一步失败。

2. **查看 Shopify API 错误：**
   日志中会显示 Shopify API 的具体错误信息。

3. **检查店铺安装状态：**
   ```
   Shopify Partner Dashboard → 你的App → 测试店铺 → 检查安装状态
   ```

4. **重新安装应用：**
   如果权限有变化，需要：
   - 从店铺卸载应用
   - 清除缓存
   - 重新安装应用
   - 完成新的 OAuth 授权

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `write_draft_orders` 权限缺失 | 应用没有权限 | 重新配置权限并重装应用 |
| `Invalid variant_id` | Variant ID 格式错误 | 确保是有效的 Shopify Variant ID |
| `Customer not found` | 客户邮箱无效 | 确保邮箱格式正确 |
| `Unprocessable Entity` | 数据验证失败 | 检查所有必需字段是否提供 |
| `Unauthorized` | Access Token 无效 | 重新授权应用 |

## 📊 完整工作流图

```
用户在前端提交预购
    ↓
前端发送: shop, productId, variantId, email, name
    ↓
后端 API /api/preorder/create
    ├─ 保存到 preorder_orders 表 ✅
    └─ 创建 Shopify Draft Order ❓
        ├─ 获取 shop_id 和 access_token ✅
        ├─ 格式化请求体
        ├─ 调用 Shopify API
        ├─ Shopify 创建 Draft Order
        └─ 返回 Draft Order ID
    ↓
更新数据库: shopify_order_id
    ↓
Shopify 后台显示订单 ✅
```

## 🎯 快速修复检查清单

- [ ] 应用在 `shopify.app.toml` 中有 `write_draft_orders` 权限
- [ ] 用户已重新安装应用（如果权限有变化）
- [ ] 前端正确发送了 `variantId`
- [ ] `variantId` 是有效的 Shopify Product Variant ID
- [ ] 店铺有 valid 的 `access_token`
- [ ] 检查 Vercel 日志中没有错误
- [ ] 在 Shopify 后台搜索可以找到 Draft Order

## 📞 如果修复后仍然不工作

查看这些文件中的调试信息：

1. **Vercel 日志** - `/api/preorder/create` 的完整输出
2. **Supabase 日志** - 查看数据是否被保存
3. **浏览器控制台** - 查看客户端错误

### 获取完整的调试日志

在浏览器控制台运行：

```javascript
// 打印最后一次请求的详细日志
fetch('https://your-app.vercel.app/api/preorder/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shop: 'your-shop.myshopify.com',
    productId: '123',
    variantId: '456',
    email: 'test@example.com',
    name: 'Test'
  })
}).then(r => r.json()).then(console.log)
```

## ✅ 最终验证

修复完成后，运行完整测试：

1. **创建预购订单** ✅
2. **查看数据库** ✅
3. **查看 Shopify 后台** ✅
4. **看到 Draft Order** ✅
5. **标签为 preorder** ✅

如果所有项都通过，恭喜！您的预购功能已完全正常工作！🎉
