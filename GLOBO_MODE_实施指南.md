# 🚀 PreOrder Pro - Globo 模式实施指南

**从 Draft Order 模式迁移到 Shopify 原生 Checkout + 订单标记模式**

---

## ✅ **已完成的工作**

### **1. ✅ Webhook 监听已实现**

文件：`lib/webhooks.ts` 和 `pages/api/webhooks/orders/create.ts`

代码已经包含了完整的 `orders/create` webhook 处理逻辑：

```typescript
// 已实现功能：
✅ 检测订单是否为预购订单（通过 tag 或 line_item properties）
✅ 提取预购商品信息
✅ 保存到 preorder_orders 数据库表
✅ 发送预购确认邮件
✅ 记录活动日志
```

**关键代码片段：**

```typescript
// lib/webhooks.ts - handleOrderCreate()
function isPreorderOrder(order: OrderCreateWebhook): boolean {
  // ✅ 检查订单标签
  if (order.tags && order.tags.includes('preorder')) {
    return true
  }
  // ✅ 检查 line item properties
  return order.line_items.some(item => isPreorderLineItem(item))
}

function isPreorderLineItem(lineItem: any): boolean {
  if (lineItem.properties) {
    return lineItem.properties.some((prop: any) =>
      prop.name.toLowerCase().includes('preorder') ||
      prop.name.toLowerCase().includes('pre-order') ||
      prop.value.toLowerCase().includes('preorder')
    )
  }
  return false
}
```

---

### **2. ✅ Globo 模式前端脚本已创建**

文件：`public/universal-preorder-globo-mode.js`

**核心功能：**

```javascript
✅ 检测售罄商品
✅ 显示"预购"按钮和徽章
✅ 使用 Shopify Cart API 加入购物车（带预购标记）
✅ 自动跳转到 /checkout
✅ 显示预计发货日期
✅ 美观的动画和用户反馈
```

**关键逻辑：**

```javascript
// 🎯 核心：使用 Shopify Cart API
async function addToCartWithPreorderTag(variantId) {
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        id: variantId,
        quantity: 1,
        properties: {
          '_preorder': 'true',
          '_是預購商品': '是',
          '_estimated_shipping': '2025-12-15',
          '_預計發貨日期': '2025-12-15'
        }
      }]
    })
  });
  
  // ✅ 成功后跳转到 checkout
  if (response.ok) {
    window.location.href = '/checkout';
  }
}
```

---

## 🎯 **Globo 模式的完整流程**

```
┌─────────────────────────────────────────────────────────────┐
│  1. 客户访问售罄产品页面                                    │
│     ↓                                                       │
│  2. 检测到售罄 → 显示 "Pre-Order Now" 按钮                 │
│     (universal-preorder-globo-mode.js)                     │
│     ↓                                                       │
│  3. 客户点击按钮 → 调用 Shopify Cart API                   │
│     加入购物车，带有 properties: { _preorder: 'true' }     │
│     ↓                                                       │
│  4. 自动跳转到 Shopify Checkout                             │
│     (原生 Checkout，支持所有支付方式)                       │
│     ↓                                                       │
│  5. 客户填写信息并完成支付                                  │
│     ↓                                                       │
│  6. Shopify 创建正式订单 (Order)                            │
│     包含 line_item properties: _preorder = 'true'          │
│     ↓                                                       │
│  7. Webhook 触发 → /api/webhooks/orders/create              │
│     ↓                                                       │
│  8. App 检测到预购标记                                      │
│     (lib/webhooks.ts - handleOrderCreate)                  │
│     ↓                                                       │
│  9. 保存到 preorder_orders 表                               │
│     发送预购确认邮件                                        │
│     ↓                                                       │
│ 10. 显示在 App 后台的预购订单列表                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 **实施步骤**

### **Step 1: 在 Shopify Theme 中加载 Globo 模式脚本**

#### **方法 A：通过 App Embed (推荐)**

1. 找到你的 App Embed 配置文件：
   ```
   extensions/preorder-app-embed/blocks/preorder-widget.liquid
   ```

2. 修改脚本加载路径：
   ```liquid
   <!-- 旧版本（Draft Order 模式）-->
   <script src="https://shopmall.dpdns.org/universal-preorder.js" async></script>

   <!-- 🆕 新版本（Globo 模式）-->
   <script src="https://shopmall.dpdns.org/universal-preorder-globo-mode.js" async></script>
   ```

3. 配置选项（可选）：
   ```liquid
   <script>
     window.PREORDER_CONFIG = {
       shop: '{{ shop.domain }}',
       apiUrl: 'https://shopmall.dpdns.org/api',
       enabled: true,
       debug: {{ block.settings.debug_mode }},
       estimatedShippingDate: '{{ block.settings.shipping_date }}',
       showEstimatedDate: {{ block.settings.show_date }}
     };
   </script>
   ```

#### **方法 B：手动添加到 Theme**

编辑 `theme.liquid` 或 `product.liquid`：

```liquid
<!-- 在 </body> 前添加 -->
<script>
  window.PREORDER_CONFIG = {
    shop: '{{ shop.domain }}',
    apiUrl: 'https://shopmall.dpdns.org/api',
    enabled: true,
    estimatedShippingDate: '2025-12-15',
    showEstimatedDate: true
  };
</script>
<script src="https://shopmall.dpdns.org/universal-preorder-globo-mode.js" async></script>
```

---

### **Step 2: 配置产品允许负库存（重要！）**

因为预购商品库存为 0，需要允许负库存：

#### **方法 A：手动设置单个产品**

1. 进入 Shopify Admin → Products → 选择产品
2. 滚动到 Inventory 部分
3. 找到 "When out of stock"
4. 选择 **"Continue selling when out of stock"**
5. 保存

#### **方法 B：批量设置（使用 Shopify API）**

创建一个 API 端点来批量更新：

```typescript
// pages/api/products/allow-overselling.ts
const response = await shopifyAdmin.graphql(`
  mutation {
    productVariantUpdate(input: {
      id: "gid://shopify/ProductVariant/${variantId}",
      inventoryPolicy: CONTINUE
    }) {
      productVariant {
        id
        inventoryPolicy
      }
    }
  }
`);
```

---

### **Step 3: 测试 Globo 模式流程**

#### **测试清单：**

1. **✅ 访问售罄产品页面**
   - 确认看到 "Pre-Order Now" 按钮
   - 确认看到预购徽章
   - 确认看到预计发货日期说明

2. **✅ 点击预购按钮**
   - 确认商品加入购物车
   - 确认看到成功提示消息
   - 确认自动跳转到 `/checkout`

3. **✅ 在 Checkout 页面检查**
   - 确认商品在购物车中
   - 确认看到 line item properties（在订单详情中）
   - 完成支付测试

4. **✅ 检查 Webhook 处理**
   - 查看 Vercel 部署日志
   - 确认收到 `orders/create` webhook
   - 确认日志显示 "Pre-order created"

5. **✅ 检查数据库**
   - 登录 Supabase
   - 检查 `preorder_orders` 表
   - 确认有新记录，包含正确的 `shopify_order_id`

6. **✅ 检查 App 后台**
   - 访问 `https://shopmall.dpdns.org/orders`
   - 确认预购订单显示在列表中

---

### **Step 4: 在 Shopify Partner Dashboard 注册 Webhook**

如果 webhook 未自动注册，手动注册：

1. 登录 Shopify Partner Dashboard
2. 进入你的 App → Configuration → Webhooks
3. 添加 Webhook：
   - **Event**: `Order creation`
   - **Format**: `JSON`
   - **URL**: `https://shopmall.dpdns.org/api/webhooks/orders/create`
   - **API Version**: `2024-01` (或最新版本)

或者使用代码自动注册（在 OAuth callback 中）：

```typescript
// pages/api/auth/callback.ts
import { registerWebhooks } from '../../../lib/webhooks'

// 在 OAuth callback 成功后注册 webhooks
await registerWebhooks(accessToken, shop)
```

---

## 🎨 **自定义选项**

### **修改预计发货日期**

在主题中配置：

```liquid
<script>
  window.PREORDER_CONFIG = {
    estimatedShippingDate: '{{ settings.preorder_shipping_date }}',
    showEstimatedDate: true
  };
</script>
```

或在脚本文件中修改默认值：

```javascript
// universal-preorder-globo-mode.js
const CONFIG = window.PREORDER_CONFIG || {
  estimatedShippingDate: '2025-12-31', // 修改这里
  showEstimatedDate: true
};
```

### **修改按钮样式**

在脚本中找到 `createPreorderButton()` 函数：

```javascript
button.style.cssText = `
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); // 改颜色
  color: white;
  padding: 16px 32px;
  border-radius: 8px; // 改圆角
  font-size: 16px;
  font-weight: bold;
  // ... 更多样式
`;
```

### **修改预购徽章文字**

```javascript
// universal-preorder-globo-mode.js
function createPreorderBadge() {
  // ...
  badge.innerHTML = '🔥 限量預售'; // 改文字和 emoji
}
```

---

## 🔄 **从旧版本迁移**

如果你已经有用户使用旧的 Draft Order 模式：

### **选项 1：并行运行（推荐）**

同时支持两种模式一段时间：

1. 保留 `universal-preorder.js`（Draft Order 模式）
2. 新增 `universal-preorder-globo-mode.js`（Globo 模式）
3. 通过配置开关控制使用哪个脚本

```liquid
{% if settings.use_globo_mode %}
  <script src="https://shopmall.dpdns.org/universal-preorder-globo-mode.js"></script>
{% else %}
  <script src="https://shopmall.dpdns.org/universal-preorder.js"></script>
{% endif %}
```

### **选项 2：完全切换**

1. 备份旧脚本
2. 替换为 Globo 模式脚本
3. 通知现有客户新流程

### **数据库兼容性**

两种模式使用相同的 `preorder_orders` 表，区别在于：

- **Draft Order 模式**：`shopify_order_id` 存储 Draft Order ID
- **Globo 模式**：`shopify_order_id` 存储正式 Order ID

两者可以共存，无需修改数据库结构。

---

## 📊 **两种模式对比**

| 特性 | Draft Order 模式 | Globo 模式 ✅ |
|------|------------------|--------------|
| **结账方式** | Draft Order + invoice_url | Shopify 原生 Checkout |
| **客户体验** | 需要等待邮件、额外步骤 | 立即结账，一步到位 |
| **转化率** | 低（多步骤） | 高（无缝体验） |
| **支付方式** | 有限 | 支持所有 Shopify 支付方式 |
| **支持折扣码** | ❌ | ✅ |
| **支持追加销售** | ❌ | ✅ |
| **开发复杂度** | 高（需创建订单、发邮件） | 低（只需标记） |
| **性能** | 慢（API 调用延迟） | 快（原生流程） |
| **Shopify 推荐** | ❌ 不推荐 | ✅ 推荐 |

---

## 🐛 **故障排查**

### **问题 1：按钮没有显示**

**检查：**
1. 打开浏览器控制台，查看是否有脚本加载错误
2. 确认脚本 URL 正确：`https://shopmall.dpdns.org/universal-preorder-globo-mode.js`
3. 检查 `window.PREORDER_CONFIG.enabled` 是否为 `true`
4. 检查商品是否真的售罄

**调试：**
```javascript
// 在控制台输入
console.log(window.PreOrderGloboMode);
window.PreOrderGloboMode.detect();
```

### **问题 2：加入购物车失败**

**检查：**
1. 确认 `variantId` 有效
2. 检查产品是否设置了 "Continue selling when out of stock"
3. 查看 Network 标签中 `/cart/add.js` 的响应

**调试：**
```javascript
// 在控制台输入
window.PreOrderGloboMode.config.debug = true;
// 然后点击预购按钮
```

### **问题 3：Webhook 未触发**

**检查：**
1. 确认 webhook 已在 Shopify 中注册
2. 检查 Vercel 部署日志
3. 确认 webhook URL 正确

**测试 webhook：**
```bash
# 使用 Shopify CLI 测试
shopify app webhook trigger --topic orders/create
```

### **问题 4：订单未保存到数据库**

**检查：**
1. 查看 Vercel 日志中的错误信息
2. 确认 line item properties 包含 `_preorder: 'true'`
3. 检查 Supabase 连接和权限

**调试：**
1. 访问 Vercel 部署日志
2. 搜索 "Processing order create webhook"
3. 检查是否有错误堆栈

---

## 🎉 **总结**

### **Globo 模式的优势：**

✅ **最自然的购物流程** - 完全使用 Shopify 原生功能  
✅ **最高转化率** - 客户直接结账，无需等待  
✅ **最稳定** - 不依赖 Draft Order API  
✅ **最快** - 无额外 API 调用  
✅ **全功能支持** - 折扣、追加销售、一键结账等  
✅ **Shopify 推荐** - 符合官方最佳实践  

### **实施总结：**

1. ✅ **后端 Webhook 处理** - 已完成，无需修改
2. ✅ **前端 Globo 脚本** - 已创建，可直接使用
3. ⏳ **主题集成** - 需要将脚本添加到主题
4. ⏳ **产品配置** - 需要允许负库存
5. ⏳ **测试验证** - 需要完整测试流程

---

## 📚 **相关文档**

- [Shopify Cart API](https://shopify.dev/docs/api/ajax/reference/cart)
- [Line Item Properties](https://shopify.dev/docs/themes/architecture/cart#line-item-properties)
- [Orders API](https://shopify.dev/docs/api/admin-rest/2024-01/resources/order)
- [Webhooks - Order Creation](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook#event-topics)

---

**🚀 准备好使用 Globo 模式了吗？按照上面的步骤开始实施吧！**

有问题随时查看故障排查部分，或检查浏览器控制台的调试信息。
