
# 🐛 预购订单不显示问题 - 修复报告

## 问题原因
经过分析，预购订单在后台不显示的主要原因有两个：

1. **Webhook 验证失败**：Next.js 默认会解析 API 请求体 (body)，这导致 Shopify Webhook 的签名验证失败。因为签名验证需要原始的请求体 (raw body)，一旦被解析修改，签名就不匹配了。这导致 Shopify 发送的新订单通知被应用拒绝，因此没有写入数据库。

2. **数据库表混淆**：系统中同时存在旧表 `preorders` 和新表 `preorder_orders`。虽然应用逻辑已经更新为使用 `preorder_orders`，但由于 Webhook 验证失败，新订单数据根本没有进入任何表。

## 已完成的修复
我已经修改了所有 Webhook 处理程序，禁用了 Next.js 的默认解析器，改用原始请求体进行签名验证。

### 修改的文件
1. `pages/api/webhooks/orders/create.ts` - 修复订单创建通知
2. `pages/api/webhooks/orders/updated.ts` - 修复订单更新通知
3. `pages/api/webhooks/products/update.ts` - 修复产品更新通知
4. `pages/api/webhooks/app-uninstalled.ts` - 修复卸载通知
5. `lib/webhooks.ts` - 更新验证逻辑以支持原始请求体
6. `lib/raw-body.ts` - 添加获取原始请求体的工具函数

## 下一步操作
请执行以下步骤以应用修复：

1. **提交代码**：将更改提交到 GitHub。
2. **部署**：等待 Vercel 自动部署完成。
3. **测试**：
   - 在 Shopify 店铺下一个新的预购订单。
   - 检查应用后台是否显示该订单。

由于 Webhook 修复只对**新订单**生效，之前的漏单可能需要手动处理或重新下单测试。
