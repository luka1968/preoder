# 🚀 Partner App (OAuth 模式) 测试指南

你的应用是 **Partner App**，使用 OAuth 流程，无需手动配置 Access Token！

---

## ✅ 第一步：确认环境变量（已完成）

你的 Vercel 环境变量已经正确设置：

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=shpss_your_api_secret_here
SHOPIFY_APP_URL=https://your-app-domain.vercel.app
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

✅ **这就够了！不需要手动 Access Token！**

---

## 🔐 第二步：通过 OAuth 安装应用

### 2.1 访问安装链接

访问：
```
https://shopmall.dpdns.org/api/auth?shop=anvi-shop.myshopify.com
```

### 2.2 期望流程

1. **跳转到 Shopify 授权页面**
2. **显示权限列表**
3. **点击 "Install app"**
4. **自动跳转回应用**
5. **OAuth 流程自动完成**：
   - ✅ 获取 Access Token
   - ✅ 保存到 Supabase `shops` 表
   - ✅ 重定向到管理界面

---

## 📊 第三步：访问管理界面

安装成功后访问：
```
https://shopmall.dpdns.org/admin?shop=anvi-shop.myshopify.com
```

**期望看到**：
- ✅ Dashboard 显示统计数据
- ✅ Products 页面
- ✅ Orders 页面
- ✅ Settings 页面

---

## 🎨 第四步：启用 App Embed

### 4.1 进入主题编辑器

1. 在 Shopify Admin：`Online Store` → `Themes`
2. 点击 `Customize`
3. 在左侧找到 `App embeds` 🧩
4. 启用 **Preorder Pro 2.7** ✅
5. 保存

### 4.2 或手动添加脚本

如果 App Embed 不可用，在 `theme.liquid` 的 `</head>` 前添加：

```html
<script>
  window.PREORDER_CONFIG = {
    enabled: true,
    apiUrl: 'https://shopmall.dpdns.org',
    shop: '{{ shop.permanent_domain }}'
  };
</script>
<script src="https://shopmall.dpdns.org/universal-preorder.js"></script>
```

---

## 📦 第五步：设置测试产品

### 5.1 在应用管理界面

1. 访问：`https://shopmall.dpdns.org/admin/products?shop=anvi-shop.myshopify.com`
2. 找到一个产品
3. 点击 **Enable Pre-order**
4. 设置预计到货日期（可选）

### 5.2 在 Shopify 设置库存为 0

1. Shopify Admin → `Products`
2. 选择同一个产品
3. Inventory → 设置为 `0`
4. 保存

---

## 🧪 第六步：测试前端

### 6.1 访问产品页面

```
https://anvi-shop.myshopify.com/products/你的产品
```

或使用预览链接（如果商店有密码保护）

### 6.2 期望看到

- ✅ "Pre-Order Now" 按钮显示
- ✅ "Add to Cart" 按钮隐藏
- ✅ 预购徽章显示（可选）

### 6.3 检查控制台（F12）

```javascript
[PreOrder] Script loaded
[PreOrder] Product out of stock
[PreOrder] Showing pre-order button
```

---

## 🛒 第七步：提交测试订单

1. **点击 "Pre-Order Now"**
2. **填写表单**：
   - Email: `test@example.com`
   - Quantity: `1`
3. **提交**

**期望结果**：
- ✅ 成功消息显示
- ✅ 表单关闭

---

## ✅ 第八步：验证订单

### 8.1 检查 Shopify Draft Orders

访问：
```
https://admin.shopify.com/store/anvi-shop/draft_orders
```

**期望看到**：
- ✅ 新的 Draft Order
- ✅ Customer: `test@example.com`
- ✅ Tags: `preorder`

### 8.2 检查应用订单页面

访问：
```
https://shopmall.dpdns.org/admin/orders?shop=anvi-shop.myshopify.com
```

**期望看到**：
- ✅ 订单列表中有新订单
- ✅ Status: Pending

### 8.3 检查 Supabase

```sql
SELECT * FROM shops WHERE shop_domain = 'anvi-shop.myshopify.com';
```

**应该看到**：
- ✅ `access_token` 字段有值（`shpat_xxx`）← OAuth 自动生成的！
- ✅ `installed_at` 有时间戳

```sql
SELECT * FROM preorder_orders ORDER BY created_at DESC LIMIT 1;
```

**应该看到**：
- ✅ 最新的订单记录
- ✅ `shopify_order_id` 有值

---

## 🐛 故障排除

### Q1: OAuth 安装时出现 SSL 错误

**原因**：商店前台不可访问

**解决**：
- 检查 Shopify Partner 配置中的回调 URL
- 确保是：`https://shopmall.dpdns.org/api/auth/callback`

### Q2: 管理界面显示 "Unauthorized"

**原因**：OAuth 未完成或 token 无效

**解决**：
1. 检查 Supabase `shops` 表，看是否有记录
2. 重新执行 OAuth 安装流程
3. 检查 Vercel Logs 查看错误

### Q3: 预购按钮不显示

**检查**：
- ✅ App Embed 是否启用？
- ✅ 产品库存是否为 0？
- ✅ 在应用中是否启用了该产品？

---

## 📋 完整测试清单

- [ ] OAuth 安装成功
- [ ] Supabase 中有 shop 记录和 access_token
- [ ] 能访问管理界面 Dashboard
- [ ] 能在应用中启用产品预购
- [ ] App Embed 已启用（或脚本已添加）
- [ ] 前端显示预购按钮
- [ ] 能提交测试订单
- [ ] Shopify Draft Orders 中有订单
- [ ] 应用订单页面显示订单
- [ ] Supabase 中有订单记录

---

## 🎉 成功后的下一步

1. **自定义样式**：调整按钮颜色和文字
2. **配置邮件**：设置订单通知邮件
3. **批量启用**：为多个产品启用预购
4. **监控数据**：查看 Dashboard 统计

---

**现在开始测试 OAuth 安装！** 🚀

访问：`https://shopmall.dpdns.org/api/auth?shop=anvi-shop.myshopify.com`
