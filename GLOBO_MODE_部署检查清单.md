# ✅ Globo 模式部署检查清单

## 📋 部署前检查

### **1. 文件确认** ✅

- [ ] `public/universal-preorder-globo-mode.js` 存在
- [ ] 文件可以通过 `https://shopmall.dpdns.org/universal-preorder-globo-mode.js` 访问
- [ ] `lib/webhooks.ts` 包含预购订单处理逻辑
- [ ] `pages/api/webhooks/orders/create.ts` 存在

### **2. 后端配置** ✅

- [ ] Webhook `orders/create` 已在 Shopify Partner Dashboard 注册
  - URL: `https://shopmall.dpdns.org/api/webhooks/orders/create`
  - Format: JSON
  - API Version: 2024-01 或更高
- [ ] Supabase `preorder_orders` 表存在且可访问
- [ ] 环境变量正确配置：
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### **3. 产品配置** ⚠️

- [ ] 测试产品库存设为 0
- [ ] 产品设置为 "Continue selling when out of stock"
  - Shopify Admin → Products → [产品名称]
  - Inventory → When out of stock: **Continue selling**
- [ ] 产品有有效的变体 ID

---

## 🧪 测试流程

### **测试 1：访问测试页面** ✅

打开浏览器访问：
```
https://shopmall.dpdns.org/test-globo-mode.html
```

运行所有测试：
- [ ] 测试 1：售罄商品展示
- [ ] 测试 2：Cart API 功能
- [ ] 测试 3：Webhook 检测
- [ ] 测试 4：完整流程模拟

**预期结果：** 所有测试通过 ✅

---

### **测试 2：在测试店铺中部署** ⚠️

#### **2.1 添加脚本到主题**

编辑 `theme.liquid` 文件，在 `</body>` 前添加：

```liquid
<!-- PreOrder Globo Mode -->
{% if template contains 'product' %}
<script>
  window.PREORDER_CONFIG = {
    shop: '{{ shop.domain }}',
    apiUrl: 'https://shopmall.dpdns.org/api',
    enabled: true,
    estimatedShippingDate: '2025-12-15',
    showEstimatedDate: true,
    debug: true  // 测试时开启，生产环境改为 false
  };
</script>
<script src="https://shopmall.dpdns.org/universal-preorder-globo-mode.js" async></script>
{% endif %}
```

#### **2.2 测试步骤**

**步骤 1：访问产品页面**
- [ ] 打开测试产品页面（库存为 0 的产品）
- [ ] 打开浏览器开发者工具（F12）
- [ ] 查看 Console 输出

**预期输出：**
```
🚀 PreOrder Globo Mode Widget Loading...
[PreOrder Globo Mode] Configuration: {...}
[PreOrder Globo Mode] 🔍 Detecting sold out status...
[PreOrder Globo Mode] ✅ Product is sold out
[PreOrder Globo Mode] ✅ Preorder button inserted
[PreOrder Globo Mode] 🎉 PreOrder Widget initialized successfully
```

**页面应显示：**
- [ ] 产品图片上有 "🔥 預售 Pre-Order" 徽章
- [ ] 看到 "立即预订 Pre-Order Now" 按钮
- [ ] 看到预计发货日期说明（如果启用）

---

**步骤 2：点击预购按钮**
- [ ] 点击 "立即预订 Pre-Order Now" 按钮
- [ ] 观察 Console 输出
- [ ] 观察页面变化

**预期现象：**
1. 按钮文字变为 "加入购物车中..."
2. Console 显示：
   ```
   [PreOrder Globo Mode] 🛒 Adding to cart with preorder tag...
   [PreOrder Globo Mode] ✅ Added to cart successfully
   [PreOrder Globo Mode] 🔀 Redirecting to checkout...
   ```
3. 显示成功提示消息
4. 1 秒后自动跳转到 `/checkout`

---

**步骤 3：检查购物车**
- [ ] 在 Checkout 页面查看购物车
- [ ] 商品应该在购物车中

**额外验证（可选）：**
在 Checkout 之前，访问 `/cart` 查看购物车 JSON：
```
https://your-store.myshopify.com/cart.js
```

应该看到：
```json
{
  "items": [
    {
      "id": 12345678901234,
      "properties": {
        "_preorder": "true",
        "_是預購商品": "是",
        "_estimated_shipping": "2025-12-15",
        "_預計發貨日期": "2025-12-15"
      }
    }
  ]
}
```

---

**步骤 4：完成测试支付**
- [ ] 在 Checkout 页面填写测试信息
- [ ] 使用 Shopify 测试支付完成订单
  - 测试卡号: `1` (Bogus Gateway)
  - 或使用 Shopify Payments 测试模式

**完成支付后记录：**
- 订单号: `#________`
- 订单 ID: `________`

---

**步骤 5：验证 Webhook 处理**

访问 Vercel 部署日志：
```
https://vercel.com/your-project/deployments
```

搜索关键词：
- [ ] "Processing order create webhook"
- [ ] "Pre-order created"
- [ ] "检测到预购标记"

**预期日志：**
```
Processing order create webhook for order 123456789
📦 收到订单创建 Webhook: { orderId: 123456789, ... }
✅ 找到预购标记: _preorder = true
Created pre-order record xxx for line item xxx
✅ 预购订单已保存
```

---

**步骤 6：验证数据库**

登录 Supabase Dashboard：
```
https://app.supabase.com/project/[your-project-id]
```

查询 `preorder_orders` 表：
```sql
SELECT * FROM preorder_orders 
WHERE shopify_order_id = '你的订单ID'
ORDER BY created_at DESC 
LIMIT 1;
```

- [ ] 找到对应记录
- [ ] `shopify_order_id` 正确
- [ ] `customer_email` 正确
- [ ] `payment_status` = 'paid'
- [ ] `order_tags` 包含相关标签

---

**步骤 7：验证 App 后台**

访问 App 后台订单页面：
```
https://shopmall.dpdns.org/orders
```

- [ ] 看到新的预购订单
- [ ] 订单信息正确显示
- [ ] 状态显示为 "已支付" 或 "待发货"

---

**步骤 8：验证邮件**

检查客户邮箱（测试时使用的邮箱）：
- [ ] 收到 Shopify 订单确认邮件
- [ ] 收到 App 预购确认邮件（如果配置了邮件功能）

---

## ✅ 测试通过标准

所有以下项目都应该 ✅：

- [x] 预购按钮和徽章正确显示
- [x] 点击按钮成功加入购物车
- [x] 自动跳转到 Checkout
- [x] 完成支付创建订单
- [x] Webhook 成功触发
- [x] 订单保存到数据库
- [x] 订单显示在 App 后台
- [x] 收到确认邮件

---

## 🚀 上线到生产环境

### **1. 调整配置**

修改 `PREORDER_CONFIG`：
```javascript
window.PREORDER_CONFIG = {
  shop: '{{ shop.domain }}',
  apiUrl: 'https://shopmall.dpdns.org/api',
  enabled: true,
  estimatedShippingDate: '2025-12-31',  // 改为实际日期
  showEstimatedDate: true,
  debug: false  // ⚠️ 关闭调试模式
};
```

### **2. 部署到主题**

- [ ] 将脚本添加到生产主题
- [ ] 发布主题

### **3. 配置所有预购产品**

对每个预购产品：
- [ ] 设置库存为 0
- [ ] 启用 "Continue selling when out of stock"
- [ ] 测试预购流程

### **4. 监控和观察**

部署后第一周：
- [ ] 每天检查 Vercel 日志
- [ ] 每天检查数据库记录
- [ ] 收集客户反馈
- [ ] 监控转化率变化

---

## 🐛 常见问题排查

### **问题 1：按钮没有显示**

**检查：**
```javascript
// 在浏览器 Console 输入
console.log(window.PreOrderGloboMode);
window.PreOrderGloboMode.detect();
```

**可能原因：**
- 产品实际有库存
- 脚本未正确加载
- CSS 冲突导致按钮隐藏

---

### **问题 2：加入购物车失败**

**检查：**
- Network 标签查看 `/cart/add.js` 请求
- 确认产品设置允许超卖
- 确认 variantId 正确

**测试命令：**
```javascript
// 在 Console 手动测试
fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ id: '你的variantId', quantity: 1 }]
  })
}).then(r => r.json()).then(console.log);
```

---

### **问题 3：Webhook 未触发**

**检查：**
1. Shopify Partner Dashboard → Webhooks
2. 确认 webhook 已注册
3. 查看 webhook 发送历史

**测试 webhook：**
```bash
# 使用 Shopify CLI
shopify app webhook trigger --topic orders/create
```

---

### **问题 4：订单未保存**

**检查：**
1. Vercel 日志是否有错误
2. Supabase 连接是否正常
3. Line item properties 是否包含 `_preorder: true`

**调试：**
在 `lib/webhooks.ts` 的 `isPreorderLineItem` 添加日志：
```typescript
console.log('检查 line item:', lineItem);
console.log('properties:', lineItem.properties);
```

---

## 📞 需要帮助？

### **文档资源：**
- `GLOBO_MODE_README.md` - 快速开始
- `GLOBO_MODE_实施指南.md` - 详细步骤
- `GLOBO_MODE_开发总结.md` - 完整总结

### **测试工具：**
- `https://shopmall.dpdns.org/mode-comparison.html` - 模式对比
- `https://shopmall.dpdns.org/test-globo-mode.html` - 功能测试

### **Shopify 官方文档：**
- [Cart API](https://shopify.dev/docs/api/ajax/reference/cart)
- [Line Item Properties](https://shopify.dev/docs/themes/architecture/cart#line-item-properties)
- [Webhooks](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook)

---

**✅ 完成所有检查项后，你的 Globo 模式就可以上线了！**

**祝你成功！🚀**
