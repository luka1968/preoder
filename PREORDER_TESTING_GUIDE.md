# 🛍️ 预购订单完整测试指南

## 前置条件检查

### ✅ 第一步：确认环境变量
访问 Vercel Dashboard，确认以下环境变量已正确设置：

**必需的环境变量**：
- ✅ `SHOPIFY_API_KEY` = `95dd3d7f9dfd51aa82d81f8c8113c2a`
- ✅ `SHOPIFY_API_SECRET` = `shpss_eatf2d518a77b84fb9fd185dd1870c999`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SHOPIFY_APP_URL` = `https://your-app.vercel.app`

**可以删除的**：
- ❌ `SHOPIFY_WEBHOOK_SECRET`（已不再使用）

---

## 📋 测试流程（共 5 步）

### 步骤 1️⃣：设置测试产品

#### 1.1 进入 Shopify 后台
- 登录您的测试商店
- 进入 **Products** → **All products**

#### 1.2 创建或选择一个测试产品
- 如果没有测试产品，点击 **Add product**
- 设置产品名称：`预购测试产品`
- 添加一张产品图片（可选）
- 设置价格：`100.00`

#### 1.3 设置库存为 0（触发预购显示）
- 在产品页面，找到 **Inventory** 部分
- 找到默认变体（或您要测试的变体）
- 将 **Available** 数量设置为 `0`
- 点击 **Save**

#### 1.4 确认产品已发布
- 确保 **Status** 为 **Active**
- 确保产品在 **Online Store** 渠道中可见

---

### 步骤 2️⃣：安装预购脚本

#### 方法 A：使用 App Embed（推荐）

1. **访问 Theme Editor**
   ```
   https://your-shop.myshopify.com/admin/themes/current/editor
   ```

2. **启用 App Embed**
   - 在左侧边栏中，点击 **App embeds**
   - 找到您的 Preorder App
   - 打开开关 ✅
   - 点击 **Save**

#### 方法 B：手动安装脚本（如果 App Embed 不可用）

1. **访问代码编辑器**
   ```
   https://your-shop.myshopify.com/admin/themes/current
   ```

2. **编辑 theme.liquid**
   - 在 `</head>` 标签前添加：
   ```liquid
   <script src="https://your-app.vercel.app/universal-preorder.js"></script>
   <script>
     window.PREORDER_CONFIG = {
       enabled: true,
       apiUrl: 'https://your-app.vercel.app',
       buttonText: 'Pre-Order Now',
       successMessage: '✅ Pre-order submitted successfully!'
     };
   </script>
   ```

3. **保存并发布**

---

### 步骤 3️⃣：测试前端显示

#### 3.1 打开产品页面
访问您测试产品的前台页面：
```
https://your-shop.myshopify.com/products/test-product
```

#### 3.2 期望看到的效果

**✅ 成功的标志**：
1. **"Add to Cart"** 按钮被隐藏或禁用
2. **"Pre-Order Now"** 按钮显示
3. 按钮样式应该醒目（橙色/金色）

**打开浏览器控制台（F12）检查**：
```javascript
// 应该看到类似的日志
[PreOrder App Embed] 📦 Script loaded
[PreOrder App Embed] ⚙️ Configuration: {enabled: true, apiUrl: "..."}
[PreOrder App Embed] 🔍 Checking product availability...
[PreOrder App Embed] ❌ Product is out of stock, showing pre-order button
[PreOrder App Embed] ✅ variantId from xxx: 12345678
```

#### 3.3 故障排除

**如果预购按钮没出现**：

1. **检查控制台是否有错误**
   - 按 F12 打开开发者工具
   - 查看 Console 标签中的错误信息

2. **确认脚本加载**
   ```javascript
   // 在控制台输入
   console.log(window.PREORDER_CONFIG)
   ```
   应该看到配置对象

3. **确认产品确实缺货**
   - 库存必须为 0
   - 或者 `inventory_management` 为 null

---

### 步骤 4️⃣：提交预购订单

#### 4.1 点击 "Pre-Order Now" 按钮

#### 4.2 填写预购表单
- **Email**: 输入测试邮箱（如 `test@example.com`）
- **Quantity**: 选择数量（默认 1）
- 点击 **Submit Pre-Order**

#### 4.3 期望的响应

**✅ 成功提交**：
- 看到成功消息：`✅ Pre-order submitted successfully!`
- 表单自动关闭
- 控制台显示：
  ```
  [PreOrder] ✅ Order created successfully
  [PreOrder] Draft Order ID: 123456789
  ```

**❌ 失败情况**：
- 错误消息：`Failed to create pre-order`
- 控制台显示详细错误信息

---

### 步骤 5️⃣：验证订单创建

#### 5.1 检查 Shopify Draft Orders

1. **访问 Shopify 后台**
   ```
   https://your-shop.myshopify.com/admin/draft_orders
   ```

2. **期望看到**：
   - ✅ 一条新的 Draft Order
   - **Customer**: 您填写的邮箱
   - **Items**: 您选择的产品和数量
   - **Tags**: 包含 `preorder`
   - **Status**: `Open` 或 `Invoice sent`

3. **点击 Draft Order 查看详情**：
   - 确认产品正确
   - 确认价格正确
   - 确认客户信息正确

#### 5.2 检查 Supabase 数据库

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com
   - 选择您的项目

2. **查询 `preorder_orders` 表**
   - 进入 **Table Editor**
   - 选择 `preorder_orders` 表
   - 应该看到最新的订单记录

3. **验证字段**：
   ```sql
   SELECT 
     id,
     customer_email,
     shopify_order_id,  -- ✅ 应该有值（Draft Order ID）
     variant_id,        -- ✅ 应该有值
     product_id,        -- ✅ 应该有值
     total_amount,
     payment_status,
     created_at
   FROM preorder_orders
   ORDER BY created_at DESC
   LIMIT 1;
   ```

**✅ 成功的标志**：
- `shopify_order_id` 有值（不是 null）
- `variant_id` 有值
- `customer_email` 正确
- `payment_status` 为 `pending`

---

## 🔍 完整测试清单

### 前端测试
- [ ] 缺货产品页面显示 "Pre-Order Now" 按钮
- [ ] "Add to Cart" 按钮被隐藏
- [ ] 点击按钮弹出预购表单
- [ ] 表单可以提交
- [ ] 提交后显示成功消息

### 后端测试
- [ ] Shopify Draft Orders 中出现新订单
- [ ] Draft Order 包含正确的产品和客户信息
- [ ] Draft Order 带有 `preorder` 标签
- [ ] Supabase `preorder_orders` 表中有记录
- [ ] 记录包含 `shopify_order_id`（Draft Order ID）
- [ ] 记录包含 `variant_id` 和 `product_id`

### API 测试
- [ ] `/api/preorder/create` 返回 200 状态
- [ ] 响应包含 `draftOrderId`
- [ ] Vercel Function Logs 没有错误

---

## 🐛 常见问题排查

### Q1: 预购按钮没有显示

**可能原因**：
1. 产品没有真正缺货（库存 > 0）
2. 脚本没有加载
3. `PREORDER_CONFIG.enabled` 为 false

**解决方法**：
```javascript
// 在控制台运行
console.log('Script loaded:', typeof window.PREORDER_CONFIG !== 'undefined')
console.log('Config:', window.PREORDER_CONFIG)
console.log('Product data:', window.meta?.product)
```

### Q2: 提交后返回 500 错误

**可能原因**：
1. `SHOPIFY_API_SECRET` 未设置
2. Shop 没有 `access_token`（未完成 OAuth）
3. Variant ID 格式错误

**解决方法**：
1. 检查 Vercel Function Logs 中的详细错误
2. 访问 `/api/check-config` 确认配置
3. 确认已完成 OAuth 安装流程

### Q3: Draft Order 没有创建

**可能原因**：
1. `SHOPIFY_API_SECRET` 不正确
2. Shop 的 `access_token` 已过期
3. 没有 Draft Order 创建权限

**解决方法**：
1. 检查环境变量是否正确
2. 重新安装 App（刷新 access_token）
3. 确认 App 权限包含 `write_draft_orders`

### Q4: Supabase 中有记录但没有 shopify_order_id

**可能原因**：
Draft Order 创建失败，但预购记录已保存

**解决方法**：
1. 查看 Vercel Logs 中的 Draft Order 创建错误
2. 检查 Shopify API 响应
3. 确认产品和变体在 Shopify 中存在

---

## 📊 成功验证示例

### Vercel Function Logs（成功）
```
[PreOrder Create] Received request
[PreOrder Create] Shop: test-shop.myshopify.com
[PreOrder Create] Product ID: 7234567890
[PreOrder Create] Variant ID: 42345678901234
[PreOrder Create] ✅ Shop found, has access token
[PreOrder Create] ✅ Creating Draft Order...
[PreOrder Create] ✅ Draft Order created: 987654321
[PreOrder Create] ✅ Saved to database with ID: uuid-xxx
[PreOrder Create] ✅ Email sent to: test@example.com
```

### Shopify Draft Order（成功）
```
Draft Order #D1001
Status: Open
Customer: test@example.com
Items:
  - 预购测试产品 × 1 = $100.00
Subtotal: $100.00
Tags: preorder
Invoice URL: https://test-shop.myshopify.com/...
```

### Supabase 记录（成功）
```json
{
  "id": "uuid-xxx",
  "shop_id": "shop-uuid",
  "shopify_order_id": "987654321",
  "product_id": "7234567890",
  "variant_id": "42345678901234",
  "customer_email": "test@example.com",
  "total_amount": "100.00",
  "payment_status": "pending",
  "fulfillment_status": "pending",
  "created_at": "2025-11-21T03:50:00Z"
}
```

---

## 🎯 下一步

测试成功后，您可以：

1. **发送付款链接给客户**
   - 在 Draft Order 页面点击 **Send invoice**
   - 客户会收到带有付款链接的邮件

2. **监控预购订单**
   - 定期检查 `/orders` 页面
   - 查看预购订单统计

3. **配置自动化**
   - 设置自动发送发票邮件
   - 配置库存恢复后的通知

4. **生产环境部署**
   - 在真实商店测试
   - 监控 Vercel 和 Supabase 日志

---

**最后更新**：2025-11-21  
**测试环境**：Vercel + Shopify + Supabase
