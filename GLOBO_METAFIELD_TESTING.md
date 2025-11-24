# 🧪 Globo Metafield 功能测试指南

## 快速测试流程

### 📍 测试1：启用预购（设置 metafield）

使用 API 启用预购：

```bash
curl -X POST https://your-app.vercel.app/api/products/enable-preorder \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "your-shop.myshopify.com",
    "variantId": "YOUR_VARIANT_ID",
    "enabled": true
  }'
```

**预期结果**：
- ✅ `inventory_policy` 设置为 "continue"
- ✅ metafield `preorder_enabled` 设置为 "true"

---

### 📍 测试2：前端检测 metafield

访问产品页面，打开浏览器控制台：

```javascript
// 应该看到以下日志：
🔍 检查 preorder_enabled metafield... YOUR_VARIANT_ID
✅ 预购已启用 { preorder_enabled: true }
✅ 预购已启用，准备显示预购按钮
✅ 已替换添加到购物车按钮为预购按钮
```

**预期结果**：
- ✅ 按钮文本显示 "Pre-Order Now"
- ✅ 按钮颜色为蓝色
- ✅ 产品图片上显示 "Pre-Order" 徽章

---

### 📍 测试3：点击预购按钮

点击 "Pre-Order Now" 按钮

**预期结果**：
- ✅ 控制台显示：`🛒 调用 Shopify Cart API...`
- ✅ 控制台显示：`✅ Cart API 成功`
- ✅ 自动跳转到 `/checkout` 页面

---

### 📍 测试4：验证购物车数据

在控制台 Network 标签中查看 `/cart/add.js` 请求：

**Request Body**：
```json
{
  "items": [{
    "id": 123456789,
    "quantity": 1,
    "properties": {
      "_preorder": "true",
      "_estimated_shipping": "2025-12-01",
      "_preorder_message": "此商品为预购商品，预计 2025-12-01 发货"
    }
  }]
}
```

**预期结果**：
- ✅ properties 包含 `_preorder: "true"`
- ✅ 包含预计发货日期

---

### 📍 测试5：完成订单并验证

完成 Checkout 支付后：

**在 Shopify Admin 中检查**：
1. 进入 Orders
2. 找到刚创建的订单
3. 检查：
   - ✅ Order Tags 包含 "preorder"
   - ✅ Line Items 的 Properties 包含 `_preorder: true`

---

### 📍 测试6：禁用预购

```bash
curl -X POST https://your-app.vercel.app/api/products/enable-preorder \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "your-shop.myshopify.com",
    "variantId": "YOUR_VARIANT_ID",
    "enabled": false
  }'
```

刷新产品页面

**预期结果**：
- ✅ 控制台显示：`ℹ️ 预购未启用，无需显示预购按钮`
- ✅ 按钮恢复为 "Add to Cart" 或 "Sold Out"
- ✅ 没有预购徽章

---

## 🐛 常见问题

### 问题：metafield API 返回 404
**解决**：检查 `CONFIG.apiUrl` 是否正确配置

### 问题：前端无法获取 variantId
**解决**：打开控制台运行 `window.PreOrderGloboMode.detect()`

### 问题：按钮没有替换
**解决**：检查主题的按钮选择器，可能需要添加到 `ADD_TO_CART_SELECTORS`

---

## ✅ 所有测试通过后

恭喜！你已经成功实现了 **Globo Pre-Order 同款功能**！

核心功能：
1. ✅ inventory_policy = "continue"
2. ✅ metafield 控制按钮显示
3. ✅ 订单标记（tags + properties）
