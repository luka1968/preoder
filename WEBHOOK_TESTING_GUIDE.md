# 🧪 测试 Webhook 验证修复指南

## 方法 1：触发 App Uninstall Webhook（最简单）

### 步骤 1：安装测试
在 Shopify Partners Dashboard 中：
1. 访问 **Apps** → 选择您的 App → **Test on development store**
2. 选择一个测试商店
3. 点击 **Install app**

### 步骤 2：卸载测试
1. 进入测试商店的 **Settings** → **Apps and sales channels**
2. 找到您的 App
3. 点击 **Uninstall**

这会触发 `app/uninstalled` webhook，您可以在 Vercel 的 Function Logs 中看到结果。

---

## 方法 2：查看 Vercel 部署日志

### 检查实时日志

1. **访问 Vercel Dashboard**
   - 打开 https://vercel.com
   - 进入您的项目

2. **查看 Function Logs**
   - 点击 **Deployments** 标签
   - 选择最新的部署
   - 点击 **Functions** 标签
   - 找到 `/api/webhooks/app-uninstalled` 或其他 webhook 端点

3. **查找日志关键词**

**✅ 成功的日志**应该包含：
```
✅ Webhook verified successfully
Processing app uninstall webhook for shop xxx.myshopify.com
```

**❌ 失败的日志**（修复前）会显示：
```
❌ Missing webhook signature
❌ SHOPIFY_API_SECRET is not configured
401 Unauthorized
```

---

## 方法 3：使用 API 端点检查配置

访问以下 URL 检查环境变量配置：

```
https://your-app.vercel.app/api/check-config
```

期望结果：
```json
{
  "configured": {
    "apiKey": "95dd3d7f...",
    "apiSecret": "Set (hidden)",
    "supabase": "configured",
    "webhooks": "ready"
  }
}
```

---

## 方法 4：手动测试 Webhook（高级）

### 使用 curl 模拟 Shopify Webhook

#### 步骤 1：计算 HMAC 签名

使用 Python 脚本：

```python
import hmac
import hashlib
import base64
import json

# 您的 App Secret（从 Vercel 环境变量中）
api_secret = "shpss_eatf2d518a77b84fb9fd185dd1870c999"

# Webhook payload
payload = {
    "id": 123456789,
    "name": "Test Shop",
    "domain": "test-shop.myshopify.com"
}

# 转换为 JSON 字符串
payload_str = json.dumps(payload, separators=(',', ':'))

# 计算 HMAC-SHA256
hmac_digest = hmac.new(
    api_secret.encode('utf-8'),
    payload_str.encode('utf-8'),
    hashlib.sha256
).digest()

# Base64 编码
signature = base64.b64encode(hmac_digest).decode('utf-8')

print(f"Payload: {payload_str}")
print(f"HMAC-SHA256: {signature}")
```

#### 步骤 2：发送测试请求

```bash
curl -X POST "https://your-app.vercel.app/api/webhooks/app-uninstalled" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-SHA256: <YOUR_CALCULATED_SIGNATURE>" \
  -H "X-Shopify-Shop-Domain: test-shop.myshopify.com" \
  -H "X-Shopify-Topic: app/uninstalled" \
  -d '{"id":123456789,"name":"Test Shop","domain":"test-shop.myshopify.com"}'
```

#### 期望响应：

**✅ 成功（200）**:
```json
{
  "success": true
}
```

**❌ 失败（401）**:
```json
{
  "error": "Unauthorized"
}
```

---

## 方法 5：使用 Shopify CLI 触发 Webhook（推荐）

如果您安装了 Shopify CLI：

```bash
shopify webhook trigger app/uninstalled
```

这会自动：
1. 生成正确的 HMAC 签名
2. 发送到您配置的 webhook URL
3. 显示响应状态

---

## ✅ 验证成功的标志

### 1. Vercel Function Logs 显示：
```
[Webhook] Received: {
  topic: 'app/uninstalled',
  shop: 'your-shop.myshopify.com',
  signaturePresent: true,
  bodyLength: 123
}
[Webhook] ✅ Signature verified
Processing app uninstall webhook for shop your-shop.myshopify.com
Successfully processed app uninstall for shop your-shop.myshopify.com
```

### 2. HTTP 响应状态：
- **200 OK** ✅

### 3. 数据库更新（针对 app/uninstalled）：
- 在 Supabase `shops` 表中，对应店铺的 `active` 字段变为 `false`
- `activity_log` 表中有新的 `app_uninstalled` 记录

---

## 🔍 常见问题排查

### Q1: 返回 401 Unauthorized
**原因**：Webhook 签名验证失败

**检查**：
1. Vercel 环境变量 `SHOPIFY_API_SECRET` 是否正确设置
2. 值是否匹配 Shopify Partners Dashboard 中的 Client Secret
3. 是否已经部署最新代码（包含修复）

### Q2: 返回 500 Internal Server Error
**原因**：服务器内部错误

**检查**：
1. Vercel Function Logs 中的错误堆栈
2. Supabase 连接是否正常
3. 环境变量是否完整

### Q3: Webhook 没有被触发
**原因**：Webhook 没有在 Shopify 中注册

**解决**：
1. 访问 `https://your-app.vercel.app/api/auth/install?shop=your-shop.myshopify.com`
2. 重新安装 App
3. Webhook 会在 OAuth 回调中自动注册

---

## 📊 快速检查清单

- [ ] Vercel 部署成功（最新 commit）
- [ ] 环境变量 `SHOPIFY_API_KEY` 已设置
- [ ] 环境变量 `SHOPIFY_API_SECRET` 已设置（使用 Client Secret）
- [ ] 代码中不再使用 `SHOPIFY_WEBHOOK_SECRET`
- [ ] 触发测试 webhook（通过卸载/重装 App）
- [ ] 检查 Vercel Function Logs 看到成功日志
- [ ] 检查 Supabase 数据库有相应更新

---

## 🎯 下一步

如果 webhook 验证成功，您可以：

1. **测试预购功能**：
   - 在产品页面点击预购按钮
   - 检查是否创建 Draft Order
   - 验证 Shopify 后台是否显示订单

2. **监控生产环境**：
   - 定期检查 Vercel Logs
   - 设置 Sentry 或其他错误追踪
   - 监控 webhook 失败率

3. **清理环境变量**：
   - 从 Vercel 中删除 `SHOPIFY_WEBHOOK_SECRET`（已不再使用）
   - 确保所有环境（Production/Preview/Development）都已更新

---

## 🔒 测试 GDPR Privacy Webhooks

### 概述

Shopify 要求所有应用实现三个 GDPR 隐私 webhooks：
- `shop/redact` - 店铺数据删除（卸载后 48 小时触发）
- `customers/redact` - 客户数据删除
- `customers/data_request` - 客户数据导出请求

### 方法 1：使用 Shopify CLI（推荐）

#### 测试 shop/redact

```bash
shopify app webhook trigger --topic shop/redact --shop kean-17076.myshopify.com
```

**期望结果**：
- Vercel logs 显示 `[GDPR] Processing shop/redact for: kean-17076.myshopify.com`
- Supabase 中该店铺的所有数据被删除
- 返回 HTTP 200

#### 测试 customers/redact

```bash
shopify app webhook trigger --topic customers/redact --shop kean-17076.myshopify.com
```

**期望结果**：
- Vercel logs 显示 `[GDPR] Anonymizing X preorder records`
- `preorder_orders` 表中客户邮箱变为 `redacted-{timestamp}@privacy.invalid`
- 返回 HTTP 200

#### 测试 customers/data_request

```bash
shopify app webhook trigger --topic customers/data_request --shop kean-17076.myshopify.com
```

**期望结果**：
- Vercel logs 显示导出的客户数据 JSON
- 包含 `preorder_orders` 和 `back_in_stock_subscriptions`
- 返回 HTTP 200

### 方法 2：手动测试（高级）

#### 测试 shop/redact

```bash
curl -X POST "https://preorder.orbrother.com/api/webhooks/privacy/shop-redact" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-SHA256: <CALCULATED_SIGNATURE>" \
  -H "X-Shopify-Shop-Domain: test-shop.myshopify.com" \
  -H "X-Shopify-Topic: shop/redact" \
  -d '{"shop_id":123456,"shop_domain":"test-shop.myshopify.com"}'
```

### 验证步骤

#### 1. 验证 shop/redact

**测试前**：
```sql
-- 检查店铺数据存在
SELECT * FROM shops WHERE shop_domain = 'kean-17076.myshopify.com';
SELECT COUNT(*) FROM products_rules WHERE shop_id = '<shop_id>';
SELECT COUNT(*) FROM preorder_orders WHERE shop_id = '<shop_id>';
```

**触发 webhook**：
```bash
shopify app webhook trigger --topic shop/redact --shop kean-17076.myshopify.com
```

**测试后**：
```sql
-- 验证所有数据已删除
SELECT * FROM shops WHERE shop_domain = 'kean-17076.myshopify.com';
-- 应该返回 0 行
```

#### 2. 验证 customers/redact

**测试前**：
```sql
-- 检查客户邮箱
SELECT customer_email FROM preorder_orders 
WHERE shop_id = '<shop_id>' AND customer_email = 'test@example.com';
```

**触发 webhook**：
```bash
shopify app webhook trigger --topic customers/redact --shop kean-17076.myshopify.com
```

**测试后**：
```sql
-- 验证邮箱已匿名化
SELECT customer_email FROM preorder_orders 
WHERE shop_id = '<shop_id>' AND customer_email LIKE 'redacted-%@privacy.invalid';
```

#### 3. 验证 customers/data_request

**检查 Vercel logs**：
```bash
vercel logs --filter="[GDPR] Exported data"
```

应该看到类似输出：
```json
{
  "customer_email": "customer@example.com",
  "export_date": "2026-01-14T11:00:00.000Z",
  "preorder_orders": [...],
  "back_in_stock_subscriptions": [...],
  "data_summary": {
    "total_preorders": 5,
    "total_subscriptions": 2
  }
}
```

### 常见问题

**Q: 如何验证 webhooks 已注册？**

访问 Shopify Partner Dashboard:
1. Apps → Your App → API access → Webhooks
2. 应该看到 6 个 webhooks（包括 3 个 privacy webhooks）

**Q: shop/redact 什么时候触发？**

- 手动测试：使用 Shopify CLI 立即触发
- 生产环境：卸载应用后 48 小时自动触发

**Q: 如果删除失败怎么办？**

Privacy webhooks 必须在 5 秒内返回 HTTP 200，即使操作失败：
- 错误会记录到 Vercel logs
- Shopify 仍然认为 webhook 成功
- 需要手动检查 logs 并修复问题

---

**最后更新**：2026-01-14  
**修复版本**：使用 SHOPIFY_API_SECRET 进行 webhook 验证  
**新增功能**：GDPR Privacy Webhooks (shop/redact, customers/redact, customers/data_request)
