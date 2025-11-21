# 🔧 Webhook 验证修复 - 使用正确的 API Secret

## 📋 问题描述

**症状**：Shopify Webhook 验证失败，返回 401 Unauthorized 错误。

**根本原因**：代码错误地使用了 `SHOPIFY_WEBHOOK_SECRET` 环境变量来验证 webhook，但根据 **Shopify 官方文档**，webhooks 是使用 **App 的 Client Secret**（即 `SHOPIFY_API_SECRET`）来签名的。

## 🎯 解决方案

### 修复内容

修改了两个文件中的 webhook 验证函数：

1. **`lib/shopify.ts`** - `verifyWebhookSignature` 函数
2. **`lib/shopify-auth.ts`** - `verifyWebhookHmac` 函数

**修改前**：
```typescript
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET  // ❌ 错误
  // ...
  const hmac = crypto.createHmac('sha256', webhookSecret)
  // ...
}
```

**修改后**：
```typescript
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const apiSecret = process.env.SHOPIFY_API_SECRET  // ✅ 正确
  // ...
  const hmac = crypto.createHmac('sha256', apiSecret)
  // ...
}
```

### Shopify 官方文档参考

根据 [Shopify Webhook 验证文档](https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook)：

> **验证 webhook 签名时，应使用您的 App 的 Client Secret（即 SHOPIFY_API_SECRET）**

HMAC 计算公式：
```
HMAC-SHA256(request_body, app_client_secret)
```

## ✅ Vercel 环境变量配置

### 必需的环境变量

您只需要在 Vercel 中设置以下两个 Shopify 相关的环境变量：

1. **`SHOPIFY_API_KEY`** = `your_client_id_here`
   - 这是您的 Shopify App 的 **Client ID**
   - 从 Shopify Partners Dashboard → Apps → 您的 App → App credentials → Client ID
   - 示例格式：`95dd3d7f9dfd51aa82d81f8c8113c2a`

2. **`SHOPIFY_API_SECRET`** = `your_client_secret_here`
   - 这是您的 Shopify App 的 **Client Secret**
   - 从 Shopify Partners Dashboard → Apps → 您的 App → App credentials → Client Secret
   - 示例格式：`shpss_xxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **⚠️ 重要**：这个 Secret 同时用于：
     - OAuth 令牌交换
     - **Webhook HMAC 验证**（这是关键！）

### ~~不需要的环境变量~~

**不再需要** `SHOPIFY_WEBHOOK_SECRET`。这是之前代码中的错误设计。

## 🔍 如何验证修复

### 1. 部署到 Vercel

```bash
git add .
git commit -m "fix: use SHOPIFY_API_SECRET for webhook verification"
git push
```

### 2. 检查 Vercel 环境变量

访问 Vercel Dashboard → 您的项目 → Settings → Environment Variables

确认已设置：
- ✅ `SHOPIFY_API_KEY`
- ✅ `SHOPIFY_API_SECRET`

### 3. 测试 Webhook

#### 方法 A：触发真实 Webhook

在 Shopify 后台卸载并重新安装您的 App，这会触发 `app/uninstalled` 和安装相关的 webhooks。

#### 方法 B：使用 Shopify CLI 测试

```bash
shopify webhook trigger app/uninstalled
```

#### 方法 C：手动验证签名（Python 示例）

```python
import hmac
import hashlib
import base64

# 从 Shopify 截图中的值
api_secret = "shpss_eatf2d518a77b84fb9fd185dd1870c999"
request_body = '{"id":123456789}'  # webhook payload

# 计算 HMAC
hmac_digest = hmac.new(
    api_secret.encode('utf-8'),
    request_body.encode('utf-8'),
    hashlib.sha256
).digest()

# Base64 编码
signature = base64.b64encode(hmac_digest).decode('utf-8')
print(f"Expected X-Shopify-Hmac-SHA256: {signature}")
```

### 4. 检查 Vercel 部署日志

访问 Vercel Dashboard → Deployments → Functions → 查看 webhook 日志

**成功的日志**：
```
✅ Webhook verified successfully
Processing app uninstall webhook for shop xxxxx.myshopify.com
```

**失败的日志（修复前）**：
```
❌ Missing webhook signature
❌ SHOPIFY_WEBHOOK_SECRET is not configured
```

## 📝 技术说明

### Webhook 验证流程

1. **Shopify 发送 webhook 时**：
   ```
   POST /api/webhooks/app-uninstalled
   Headers:
     X-Shopify-Hmac-SHA256: <base64_signature>
     X-Shopify-Shop-Domain: example.myshopify.com
     X-Shopify-Topic: app/uninstalled
   Body: <JSON_payload>
   ```

2. **我们的服务器验证**：
   ```typescript
   const signature = req.headers['x-shopify-hmac-sha256']
   const rawBody = await getRawBodyFromRequest(req)
   
   // 使用 SHOPIFY_API_SECRET 计算 HMAC
   const hmac = crypto.createHmac('sha256', SHOPIFY_API_SECRET)
   hmac.update(rawBody, 'utf8')
   const calculatedHash = hmac.digest('base64')
   
   // 时间安全比较
   if (crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(signature))) {
     // ✅ 验证通过
   }
   ```

### 为什么必须使用 Raw Body

Webhook 签名是基于**原始请求体**（raw body）计算的，而不是解析后的 JSON 对象。

**错误做法**（会验证失败）：
```typescript
const body = JSON.stringify(req.body)  // ❌ JSON.stringify 会改变格式
```

**正确做法**（我们已实现）：
```typescript
export const config = {
  api: {
    bodyParser: false,  // 禁用默认 body parser
  },
}

const rawBody = await getRawBodyFromRequest(req)  // ✅ 获取原始字节流
```

## 🚀 后续优化建议

### 1. 移除环境变量验证代码中的 SHOPIFY_WEBHOOK_SECRET 检查

在以下文件中移除对 `SHOPIFY_WEBHOOK_SECRET` 的检查：
- `lib/env-validation.ts`
- `pages/api/system/check.ts`

### 2. 更新文档

更新所有配置文档，移除 `SHOPIFY_WEBHOOK_SECRET` 的相关说明。

### 3. 添加 Webhook 日志记录

增强 webhook 处理日志，便于调试：

```typescript
console.log('[Webhook] Received:', {
  topic: req.headers['x-shopify-topic'],
  shop: req.headers['x-shopify-shop-domain'],
  signaturePresent: !!req.headers['x-shopify-hmac-sha256'],
  bodyLength: rawBody.length
})
```

## 📚 相关文档

- [Shopify Webhook 验证官方文档](https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook)
- [Shopify App 凭据说明](https://shopify.dev/docs/apps/auth/oauth)
- [Next.js API Routes - 禁用 Body Parser](https://nextjs.org/docs/api-routes/request-helpers#custom-config)

## ✅ 修复确认清单

- [x] 修改 `lib/shopify.ts` 中的 `verifyWebhookSignature`
- [x] 修改 `lib/shopify-auth.ts` 中的 `verifyWebhookHmac`
- [x] Vercel 中已设置 `SHOPIFY_API_KEY`
- [x] Vercel 中已设置 `SHOPIFY_API_SECRET`
- [ ] 部署到 Vercel
- [ ] 测试 webhook 验证是否通过
- [ ] 清理文档中的 `SHOPIFY_WEBHOOK_SECRET` 引用

---

**修复日期**：2025-11-21  
**修复原因**：按照 Shopify 官方文档要求使用正确的 API Secret 进行 webhook 验证
