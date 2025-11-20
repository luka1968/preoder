# 🔧 预购订单 Draft Order 问题诊断与修复指南

## 📋 问题描述
客户点击预购按钮后，Shopify 后台的 Draft Orders（草稿订单）中看不到订单。

## 🔍 诊断步骤

### Step 1: 运行诊断 API
提交代码到 Vercel 后，访问以下 URL（替换 `your-shop.myshopify.com`）：

```
https://your-app.vercel.app/api/diagnose-draft-orders?shop=your-shop.myshopify.com
```

这个 API 会检查：
- ✅ 店铺是否有 `access_token`（OAuth 授权）
- ✅ 最近的预购订单是否有 `shopify_order_id`（Draft Order ID）
- ✅ 订单记录是否有 `variant_id`

### Step 2: 检查诊断结果

诊断 API 会返回类似这样的 JSON：

```json
{
  "success": true,
  "report": {
    "shopData": {
      "has_access_token": false,  // ❌ 如果是 false，说明需要重新授权
      "access_token_length": 0
    },
    "recentOrders": {
      "count": 3,
      "orders": [
        {
          "has_shopify_order_id": false,  // ❌ 说明 Draft Order 没创建
          "has_variant_id": false         // ❌ 说明前端没传 variantId
        }
      ]
    },
    "issues": [
      "❌ 缺少 access_token - 无法创建 Draft Order",
      "⚠️ 有 3 条订单缺少 shopify_order_id"
    ],
    "recommendations": [
      "需要重新完成 OAuth 授权以获取 access_token",
      "修改前端脚本，确保获取并传递 variantId"
    ],
    "summary": {
      "can_create_draft_orders": "否",
      "main_problem": "OAuth 授权问题"
    }
  }
}
```

## 🛠️ 修复方案

### 情况 A: `has_access_token: false`

**问题**：店铺没有完成 OAuth 授权，应用无法调用 Shopify API。

**修复方法**：
1. 重新安装应用（从 Shopify App Store 或开发者后台）
2. 确保应用在安装时请求了正确的权限范围（scopes）
3. 检查 `.env` 文件中的配置：
   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_SCOPES=write_products,write_orders,write_draft_orders
   ```

4. 测试 OAuth 流程：
   ```
   访问: https://your-app.vercel.app/api/auth/install?shop=your-shop.myshopify.com
   ```

### 情况 B: `has_variant_id: false`

**问题**：前端没有正确获取或传递 `variantId`，导致后端无法创建 Draft Order。

**修复方法**：
我已经增强了 `universal-preorder.js` 脚本，增加了7种获取 `variantId` 的方法。

**测试步骤**：
1. 提交代码到 GitHub/Vercel
2. 在 Shopify 产品页面打开浏览器控制台（F12）
3. 点击预购按钮
4. 查看控制台日志，应该看到：
   ```
   [PreOrder App Embed] ✅ variantId from xxx: 12345678
   [PreOrder App Embed] 📦 最终产品信息: {productId: "xxx", variantId: "12345678"}
   ```

如果仍然看到 `variantId: null`，请联系技术支持提供控制台截图。

### 情况 C: `has_shopify_order_id: false` 但两个都有值

**问题**：虽然有 `access_token` 和 `variantId`，但 Draft Order 创建失败。

**可能原因**：
1. Shopify API 权限不足
2. variant_id 格式不正确
3. 产品或变体不存在

**修复方法**：
1. 检查 Vercel 部署日志中的错误信息
2. 查看 `/api/preorder/create` 的日志输出
3. 确认 Shopify 后台该产品和变体确实存在

## 📊 验证修复

修复后，测试流程：

1. **前端测试**：
   - 访问售罄产品页面
   - 点击"Pre-Order Now"按钮
   - 填写邮箱并提交
   - 应该看到成功提示

2. **后端验证**：
   - 登录 Shopify 后台
   - 进入 **Orders → Drafts**
   - 应该看到新创建的草稿订单
   - 标签应该包含 "preorder"

3. **数据库验证**：
   - 登录 Supabase 控制台
   - 查询 `preorder_orders` 表
   - 最新记录应该有 `shopify_order_id` 字段（Draft Order ID）

## 🚨 常见问题

### Q1: 为什么诊断 API 返回 404？
A: 请确保：
- 代码已经提交到 GitHub
- Vercel 部署成功（没有构建错误）
- 访问的 URL 正确（包含正确的域名和 shop 参数）

### Q2: Draft Order 创建了，但客户看不到付款链接？
A: 这是正常的。Draft Order 创建后，需要：
- 通过邮件发送 `invoice_url` 给客户
- 或者在应用中显示付款链接
- 当前代码只创建了 Draft Order，还需要添加发送邮件的逻辑

### Q3: 前端脚本加载了但预购按钮没出现？
A: 检查：
- 产品是否真的售罄（库存为0）
- 浏览器控制台是否有错误
- `window.PREORDER_CONFIG.enabled` 是否为 `true`

## 📝 下一步优化建议

1. **添加 Draft Order Invoice 发送功能**：
   创建 Draft Order 后自动发送付款链接给客户

2. **添加支付状态追踪**：
   监听 `draft_orders/update` webhook，更新订单状态

3. **添加错误通知**：
   当 Draft Order 创建失败时，发送邮件通知管理员

## 🔗 相关文档

- [Shopify Draft Orders API](https://shopify.dev/docs/api/admin-rest/2024-01/resources/draftorder)
- [OAuth 安装流程](./CREATE_CUSTOM_APP_GUIDE.md)
- [Webhook 修复说明](./FIX_REPORT_ZH.md)
