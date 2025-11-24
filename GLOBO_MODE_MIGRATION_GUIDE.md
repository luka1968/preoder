# 🚀 PreOrder Pro - Globo 模式迁移指南

**从 Draft Order 模式迁移到 Shopify 原生 Checkout + 订单标记模式**

---

## ❌ **当前的 Draft Order 模式问题**

你的应用目前使用的是 Draft Order 付款流程：

### **当前流程：**

1. 客户点击 "Pre-Order Now" 按钮
2. 填写邮箱和姓名
3. **后端调用 Shopify API 创建 Draft Order**
4. （未实现）发送 invoice_url 给客户
5. 客户通过 invoice_url 完成支付

### **这种方式的缺点：**

❌ **Draft Order 不支持 Shopify Payments 等多种支付方式**  
❌ **草稿订单容易被 Shopify 防垃圾系统拦截**  
❌ **影响结账转化率**（客户需要额外步骤）  
❌ **增加延迟**（需要创建 Draft Order 再发送邮件）  
❌ **不支持多项 Shopify 功能**：折扣、追加销售、一键结账等  
❌ **需要额外的邮件发送逻辑**  
❌ **客户体验差**：需要等待邮件、额外的支付步骤

---

## ✅ **Globo Pre-Order 的真实付款流程**

**Globo Pre-Order 并不是用 "草稿订单 Draft Order + invoice_url" 方式来支付的！**

### **Globo 不会：**

- ❌ 不会为每个预购创建 Draft Order
- ❌ 不会通过 invoice_url 引导支付
- ❌ 不会通过慢速创建订单的方式下单

### **Globo 的预购流程是另一种模式：**

**——完全走 Shopify 正常 Checkout，不走草稿单**

---

# 🟢 **Globo 模式的完整流程**

## **🔵 Step 1：商品标记为"预购可用"**

App 给产品加 metafield，或自动切换按钮文案：

> **"Pre-Order"**  
> 而不是 "Add to Cart"

**实现方式：**
- 前端检测库存状态
- 自动替换按钮文字和样式
- **不改变按钮行为**：仍然是加入购物车

---

## **🔵 Step 2：客户点击 Pre-Order → 加入购物车（与正常流程一样）**

这个按钮只是改变文字，但逻辑仍然是：

> 加入 Shopify Cart → Shopify Checkout

**关键点：**
- ✅ 使用 Shopify 原生购物车 API
- ✅ 添加 line_item properties 标记为预购
- ✅ 客户立即进入 Checkout 页面

---

## **🔵 Step 3：Shopify Checkout 正常支付（不使用 Draft Order）**

客户会进入原生 Shopify Checkout：

- ✅ 支持所有支付方式
- ✅ 支持折扣码
- ✅ 支持 Shopify 所有功能
- ✅ 最快的结账流程

---

## **🔵 Step 4：Shopify 创建一个标准订单（Order）**

订单里会有：

- 标签：`preorder`
- 或 line_item properties 例如：
  ```json
  {
    "preorder": true,
    "estimated_date": "2025-12-01"
  }
  ```

### **没有 Draft Order，直接是正式订单！**

---

## **🔵 Step 5：应用在后台标记这些订单为"预购"**

App 通过 Webhook 监听订单创建事件：

```
订单创建 (orders/create webhook)
→ 检查订单 tag 或 line_item properties
→ 如果包含 "preorder"
→ 保存到 App 数据库，标记为预购订单
→ 显示在 App → Pre-Orders → Orders 列表
```

---

# 📊 **两种模式对比**

| 特性 | Draft Order 模式（你当前的） | Globo 模式（推荐） |
|------|---------------------------|------------------|
| **结账方式** | Draft Order + invoice_url | 原生 Shopify Checkout |
| **支付方式支持** | ❌ 有限 | ✅ 全部支持 |
| **客户体验** | ❌ 需要等待邮件、额外步骤 | ✅ 立即结账 |
| **转化率** | ❌ 低（多步骤） | ✅ 高（一步到位） |
| **Shopify 功能** | ❌ 折扣、追加销售不支持 | ✅ 全部支持 |
| **开发复杂度** | ❌ 高（需要创建 Draft Order、发邮件） | ✅ 低（只需标记订单） |
| **性能** | ❌ 慢（API 调用） | ✅ 快（原生流程） |
| **官方推荐** | ❌ Shopify 不推荐 | ✅ Shopify 推荐 |

---

# 🔧 **迁移到 Globo 模式的实现步骤**

## **Phase 1: 修改前端脚本（universal-preorder.js）**

### **当前代码：**
```javascript
// 点击预购按钮 → 显示表单 → 提交到 /api/preorder/create
async function handlePreorderClick(productId, variantId) {
  showPreorderForm(productId, variantId); // 显示表单
}

async function submitPreorder(productId, variantId, email, name) {
  // POST 到 /api/preorder/create
  // 后端创建 Draft Order
}
```

### **改造后代码：**
```javascript
// 点击预购按钮 → 直接加入购物车（带预购标记）
async function handlePreorderClick(productId, variantId) {
  // 直接加入购物车，不显示表单
  await addToCartWithPreorderTag(variantId);
}

async function addToCartWithPreorderTag(variantId) {
  // 使用 Shopify Cart API
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        id: variantId,
        quantity: 1,
        properties: {
          '_preorder': 'true',
          '_estimated_shipping': '2025-12-01'
        }
      }]
    })
  });
  
  if (response.ok) {
    // 重定向到 Checkout
    window.location.href = '/checkout';
  }
}
```

**关键改动：**
1. ✅ 不再收集邮箱（Checkout 页面会自然收集）
2. ✅ 使用 Shopify Cart API（`/cart/add.js`）
3. ✅ 添加 `properties` 标记为预购
4. ✅ 直接跳转到 `/checkout`

---

## **Phase 2: 添加 Webhook 监听订单创建**

### **创建新文件：`pages/api/webhooks/orders/create.ts`**

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyShopifyWebhook } from '../../../../lib/shopify-auth'
import { supabaseAdmin } from '../../../../lib/supabase'

export const config = {
  api: {
    bodyParser: false, // 需要原始 body 来验证签名
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. 验证 Webhook 签名
  const isValid = await verifyShopifyWebhook(req)
  if (!isValid) {
    console.error('❌ Webhook 签名验证失败')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 2. 解析订单数据
  const order = JSON.parse(req.body.toString())
  
  console.log('📦 收到订单创建 Webhook:', {
    orderId: order.id,
    orderName: order.name,
    tags: order.tags,
    lineItems: order.line_items.length
  })

  // 3. 检查是否是预购订单
  const isPreorder = checkIfPreorder(order)
  
  if (!isPreorder) {
    console.log('ℹ️ 非预购订单，忽略')
    return res.status(200).json({ message: 'Not a preorder' })
  }

  // 4. 保存到数据库
  await savePreorderToDatabase(order)

  return res.status(200).json({ message: 'Preorder processed' })
}

// 检查订单是否是预购订单
function checkIfPreorder(order: any): boolean {
  // 方法 1: 检查订单标签
  if (order.tags && order.tags.includes('preorder')) {
    return true
  }

  // 方法 2: 检查 line_item properties
  for (const item of order.line_items) {
    if (item.properties) {
      for (const prop of item.properties) {
        if (prop.name === '_preorder' && prop.value === 'true') {
          return true
        }
      }
    }
  }

  return false
}

// 保存预购订单到数据库
async function savePreorderToDatabase(order: any) {
  try {
    // 获取店铺信息
    const shop = order.shop_url || order.domain
    const { data: shopData } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('shop_domain', shop)
      .single()

    if (!shopData) {
      console.error('❌ 店铺未找到:', shop)
      return
    }

    // 提取预购商品信息
    const preorderItems = order.line_items.filter((item: any) => {
      // 检查是否有预购标记
      if (item.properties) {
        for (const prop of item.properties) {
          if (prop.name === '_preorder' && prop.value === 'true') {
            return true
          }
        }
      }
      return false
    })

    // 保存每个预购商品
    for (const item of preorderItems) {
      const preorderData = {
        shop_id: shopData.id,
        shopify_order_id: order.id.toString(),
        order_name: order.name,
        product_id: item.product_id.toString(),
        variant_id: item.variant_id.toString(),
        customer_email: order.email,
        customer_name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
        total_amount: order.total_price,
        paid_amount: order.total_price,
        payment_status: order.financial_status,
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        order_tags: order.tags ? order.tags.split(', ') : [],
        created_at: order.created_at
      }

      const { error } = await supabaseAdmin
        .from('preorder_orders')
        .insert([preorderData])

      if (error) {
        console.error('❌ 保存预购订单失败:', error)
      } else {
        console.log('✅ 预购订单已保存:', preorderData.order_name)
      }
    }
  } catch (error) {
    console.error('❌ 处理预购订单异常:', error)
  }
}
```

---

## **Phase 3: 注册 Webhook**

### **在 Shopify 后台注册 `orders/create` Webhook：**

1. 登录 Shopify Partner Dashboard
2. 进入你的 App → Configuration
3. 添加新的 Webhook：
   - **Event**: `Order creation`
   - **Format**: `JSON`
   - **URL**: `https://your-app.vercel.app/api/webhooks/orders/create`
   - **API Version**: `2024-01`

或者通过代码自动注册（在 App 安装时）：

```typescript
// 在 OAuth callback 中注册 webhook
await registerWebhook(shop, accessToken, 'orders/create', 
  `${process.env.APP_URL}/api/webhooks/orders/create`)
```

---

## **Phase 4: 移除旧代码**

### **可以删除或废弃的文件/功能：**

- ❌ `pages/api/preorder/create.ts` 中的 Draft Order 创建逻辑
- ❌ `pages/api/diagnose-draft-orders.ts`（诊断工具不再需要）
- ❌ `DRAFT_ORDER_DIAGNOSIS.md`（文档过时）
- ❌ 前端表单收集邮箱逻辑
- ❌ `submitPreorder()` 函数

### **保留的功能：**

- ✅ 售罄检测逻辑
- ✅ 按钮替换功能
- ✅ 预购徽章显示
- ✅ 后台订单管理页面（只需改成读取 `shopify_order_id` 字段）

---

## **Phase 5: 更新数据库表结构**

### **修改 `preorder_orders` 表：**

```sql
-- shopify_order_id 现在存储的是正式订单 ID，不是 Draft Order ID
ALTER TABLE preorder_orders 
  ALTER COLUMN shopify_order_id TYPE bigint USING shopify_order_id::bigint;

-- 添加新字段
ALTER TABLE preorder_orders 
  ADD COLUMN IF NOT EXISTS order_name VARCHAR(50),  -- 例如 "#1001"
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- 移除不再需要的字段（可选）
-- ALTER TABLE preorder_orders DROP COLUMN IF EXISTS draft_order_invoice_url;
```

---

# 🎯 **迁移后的完整流程**

## **新的预购流程：**

```
1. 客户访问售罄产品页面
   ↓
2. 看到 "Pre-Order Now" 按钮（由 App Embed 注入）
   ↓
3. 点击按钮 → 商品加入购物车（带 preorder property）
   ↓
4. 自动跳转到 Shopify Checkout
   ↓
5. 客户填写信息并支付（原生 Checkout）
   ↓
6. Shopify 创建正式订单（Order）
   ↓
7. Webhook 触发 → App 收到 orders/create 事件
   ↓
8. App 检测到 preorder 标记
   ↓
9. 保存到 preorder_orders 表
   ↓
10. 显示在 App 后台的预购订单列表
```

---

# ✅ **Globo 模式的优势总结**

| 优势 | 说明 |
|------|------|
| **✅ 最自然的流程** | 完全使用 Shopify 原生功能 |
| **✅ 最高转化率** | 客户直接结账，无需等待邮件 |
| **✅ 最稳定** | 不依赖 Draft Order API（Shopify 已不推荐） |
| **✅ 最快** | 无需额外 API 调用创建 Draft Order |
| **✅ 支持所有支付方式** | Shopify Payments / PayPal / 等等 |
| **✅ 支持所有 Shopify 功能** | 折扣、追加销售、一键结账等 |
| **✅ 更简单的代码** | 只需监听 Webhook，不需要复杂的订单创建逻辑 |

---

# 🚨 **需要注意的事项**

## **1. 库存管理**

预购商品在下单时**会扣减库存**（即使库存为0）。解决方法：

- **方法 A**：允许负库存（在 Shopify 产品设置中开启）
- **方法 B**：使用 Shopify Flow 或 App 自动补充库存

## **2. 发货时间显示**

在 Checkout 页面显示预计发货时间：

- 使用 `line_item properties` 中的 `_estimated_shipping` 字段
- 或在产品描述中添加预购说明
- 或使用 Shopify Scripts 在 Checkout 页面显示提示

## **3. 取消订单**

因为是正式订单，客户可以在 Shopify 后台取消订单：

- 需要同步更新 App 数据库
- 监听 `orders/cancelled` Webhook

## **4. 退款处理**

正式订单支持退款功能：

- 监听 `refunds/create` Webhook
- 更新 App 数据库中的订单状态

---

# 📚 **相关 Shopify 官方文档**

- [Shopify Cart API](https://shopify.dev/docs/api/ajax/reference/cart)
- [Line Item Properties](https://shopify.dev/docs/themes/architecture/cart#line-item-properties)
- [Orders API](https://shopify.dev/docs/api/admin-rest/2024-01/resources/order)
- [Webhooks - Order Creation](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook#event-topics)

---

# 🎉 **总结**

## **Globo 模式 = 正常结账 + 标记订单**

| 组件 | 实现方式 |
|------|---------|
| **前端** | 改变按钮文字 → 加入购物车（带 properties）→ 跳转 Checkout |
| **Checkout** | ✅ Shopify 原生 Checkout（无需改动） |
| **订单创建** | ✅ Shopify 标准订单（不是 Draft Order） |
| **后台标记** | ✅ 通过 tag / metafield / line_item properties |
| **App 识别** | ✅ Webhook 监听 `orders/create` → 检查标记 → 保存到数据库 |

---

## **⚡ 如果你正在开发自己的 Pre-Order App，这里是结论：**

### ✔ 使用 Shopify 原生 Checkout（最省心）
### ✔ 使用 tag / metafield / cart line item properties 来标记 preorder
### ✔ 不创建 Draft Order
### ✔ 不生成 invoice_url

**你的应用的流程应该是：**

> 顾客下单 → 正常订单 → Shopify Orders → 你的 App 读取订单 → 标记为预购

---

**🚀 准备好迁移了吗？按照上面的 Phase 1-5 步骤开始吧！**
