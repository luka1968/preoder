# 🎯 Custom App 完整测试指南

你已成功安装 **Preoder Pro 2.7** Custom App！现在跟着这个指南完成测试。

---

## 📋 第一步：获取并配置 Access Token

### 1.1 获取 Admin API Access Token

1. 在当前页面（Shopify Admin），点击 **API credentials** 标签
2. 找到 **Admin API access token**
3. 点击 **Reveal token once** （⚠️ 只显示一次，务必复制保存！）
4. 复制 token，格式类似：
   ```
   shpat_1234567890abcdef1234567890abcdef
   ```

### 1.2 添加到 Supabase 数据库

1. 访问 Supabase Dashboard: https://supabase.com
2. 登录并选择你的项目（`uumtumvqkmvcursfqkgs`）
3. 进入 **SQL Editor**
4. 运行以下 SQL：

```sql
-- 添加或更新店铺信息
INSERT INTO shops (
    shop_domain,
    access_token,
    installed_at,
    updated_at
) VALUES (
    'anvi-shop.myshopify.com',
    '你刚复制的Access_Token',
    NOW(),
    NOW()
)
ON CONFLICT (shop_domain)
DO UPDATE SET
    access_token = EXCLUDED.access_token,
    updated_at = NOW();
```

5. 点击 **Run** 执行

6. 验证是否成功：
```sql
SELECT shop_domain, installed_at 
FROM shops 
WHERE shop_domain = 'anvi-shop.myshopify.com';
```

---

## 📊 第二步：访问管理界面

访问应用的管理后台：
```
https://shopmall.dpdns.org/admin?shop=anvi-shop.myshopify.com
```

### 期望看到：
- ✅ **Dashboard**（仪表板）
  - 预购产品统计
  - 今日订单数
  - 系统健康状态
- ✅ **Products**（产品管理）
- ✅ **Orders**（订单列表）
- ✅ **Settings**（设置）

### 如果看到错误：
- ❌ "Shop not found" → 检查 Supabase 中 shop_domain 是否正确
- ❌ "Unauthorized" → Access Token 可能不正确
- ❌ 页面一片空白 → 检查浏览器控制台（F12）的错误

---

## 🎨 第三步：启用 App Embed Block（推荐）

根据你截图中的说明，使用 App Embed 是最简单的方式。

### 3.1 启用 App Embed

1. 在 Shopify Admin，进入：
   ```
   Online Store → Themes
   ```

2. 点击当前主题的 **Customize** 按钮

3. 在主题编辑器中：
   - 点击左侧边栏中的 **App embeds** 图标（🧩）
   - 找到 **Preoder Pro 2.7**
   - 打开开关 ✅
   - 点击 **Save** 保存

### 3.2 配置 App Embed（可选）

如果 App Embed 有配置选项：
- **Button Text**: `Pre-Order Now`（预购按钮文字）
- **Badge Text**: `Pre-Order`（预购徽章文字）
- **Button Color**: 选择你喜欢的颜色
- **API URL**: `https://shopmall.dpdns.org`

---

## 📦 第四步：设置测试产品

### 4.1 创建或选择一个测试产品

1. 在 Shopify Admin，进入 **Products**

2. 选择一个产品（或创建新产品）：
   - 产品名称：`预购测试商品`
   - 价格：`99.00`
   - 添加图片（可选）

3. **关键步骤**：设置库存为 0
   - 找到 **Inventory** 部分
   - 将 **Available** 设置为 `0`
   - （或者取消勾选 **Track quantity**）
   - 点击 **Save**

### 4.2 在预购应用中启用该产品

1. 访问应用管理界面：
   ```
   https://shopmall.dpdns.org/admin/products?shop=anvi-shop.myshopify.com
   ```

2. 找到刚才的测试产品

3. 点击 **Enable Pre-order** 按钮

4. （可选）设置预计到货日期：
   - 例如：`2025-12-31`

5. 保存设置

---

## 🧪 第五步：测试前端显示

### 5.1 访问产品页面

访问测试产品的前台页面：
```
https://anvi-shop.myshopify.com/products/你的产品handle
```

**如果前台不可访问**（密码保护），可以：
1. 在 Shopify Admin → **Online Store** → **Preferences**
2. 找到 **Password protection**
3. 暂时取消勾选或记下密码
4. 或者使用预览链接

### 5.2 期望看到的效果

✅ **成功的标志**：
- "Add to Cart" 按钮被隐藏或变灰
- "Pre-Order Now" 按钮显示（醒目的颜色）
- 可能显示 "Pre-Order" 徽章
- 可能显示预计到货日期

### 5.3 检查浏览器控制台

按 **F12** 打开开发者工具，查看 Console：

期望看到类似的日志：
```javascript
[PreOrder] Script loaded successfully
[PreOrder] Product variant ID: 123456789
[PreOrder] Product is out of stock, showing pre-order button
[PreOrder] Config: {apiUrl: "https://shopmall.dpdns.org", ...}
```

---

## 🛒 第六步：提交测试订单

### 6.1 点击 "Pre-Order Now" 按钮

### 6.2 填写预购表单
- **Email**: `test@example.com`
- **Quantity**: `1`
- （可能还有其他字段，如姓名、电话等）

### 6.3 提交订单

点击 **Submit** 或 **Confirm Pre-order**

### 6.4 期望结果

✅ **成功**：
- 看到成功消息：`✅ Pre-order submitted successfully!`
- 表单自动关闭
- 控制台显示：
  ```
  [PreOrder] Order created successfully
  [PreOrder] Draft Order ID: 987654321
  ```

❌ **失败**：
- 显示错误消息
- 检查浏览器控制台和 Vercel Logs 查看详细错误

---

## ✅ 第七步：验证订单创建

### 7.1 检查 Shopify Draft Orders

1. 在 Shopify Admin，进入：
   ```
   Orders → Drafts
   ```
   或直接访问：
   ```
   https://admin.shopify.com/store/anvi-shop/draft_orders
   ```

2. **期望看到**：
   - ✅ 一条新的 Draft Order
   - Customer: `test@example.com`
   - Items: 你测试的产品
   - Tags: `preorder`
   - Status: `Open`

3. 点击查看详情，确认：
   - 产品正确
   - 数量正确
   - 价格正确
   - 有发票链接（Invoice URL）

### 7.2 检查应用管理界面

访问应用的订单页面：
```
https://shopmall.dpdns.org/admin/orders?shop=anvi-shop.myshopify.com
```

**期望看到**：
- 刚创建的预购订单
- Status: `Pending`
- Customer email 正确
- 订单金额正确

### 7.3 检查 Supabase 数据库

1. 进入 Supabase **SQL Editor**

2. 查询最新订单：
```sql
SELECT 
    id,
    customer_email,
    shopify_order_id,
    variant_id,
    total_amount,
    payment_status,
    created_at
FROM preorder_orders
WHERE shop_id = (
    SELECT id FROM shops WHERE shop_domain = 'anvi-shop.myshopify.com'
)
ORDER BY created_at DESC
LIMIT 5;
```

3. **验证字段**：
   - ✅ `shopify_order_id` 有值（Draft Order ID）
   - ✅ `variant_id` 正确
   - ✅ `customer_email` 为 `test@example.com`
   - ✅ `total_amount` 正确
   - ✅ `payment_status` 为 `pending`

---

## 🔍 测试清单总结

完整测试应该验证以下所有项：

### 后端（管理界面）
- [ ] 能访问 Dashboard
- [ ] 能看到产品列表
- [ ] 能启用/禁用产品的预购功能
- [ ] 能设置预计到货日期
- [ ] 能查看订单列表

### 前端（用户体验）
- [ ] 缺货产品显示预购按钮
- [ ] 预购按钮样式正确（颜色、位置）
- [ ] 点击按钮弹出表单
- [ ] 表单可以提交
- [ ] 提交后显示成功消息

### 订单创建
- [ ] Shopify Draft Orders 中有新订单
- [ ] Draft Order 信息正确
- [ ] Draft Order 带有 `preorder` 标签
- [ ] Supabase 数据库中有记录
- [ ] 记录包含 `shopify_order_id`

### API 功能
- [ ] `/api/dashboard/stats` 返回正确数据
- [ ] `/api/preorder/create` 能创建订单
- [ ] `/api/admin/products` 能列出产品
- [ ] Vercel Logs 没有严重错误

---

## 🐛 常见问题排查

### Q1: 管理界面打不开
**检查**：
- Supabase 中是否已添加 shop 记录？
- Access Token 是否正确？
- 浏览器控制台有什么错误？

**解决**：
```sql
-- 检查 shop 是否存在
SELECT * FROM shops WHERE shop_domain = 'anvi-shop.myshopify.com';
```

### Q2: 预购按钮不显示
**检查**：
- App Embed 是否已启用？
- 产品库存是否为 0？
- 在应用中是否启用了该产品的预购？
- 浏览器控制台有什么错误？

**解决**：
- 在主题编辑器中重新检查 App Embed
- 确认产品确实缺货
- 清除浏览器缓存

### Q3: 提交订单失败（500 错误）
**检查**：
- Vercel 环境变量是否完整？
- Supabase 连接是否正常？
- 查看 Vercel Function Logs

**解决**：
访问 Vercel Dashboard → 你的项目 → Logs，查看详细错误

### Q4: Draft Order 没创建
**检查**：
- Custom App 的 API Scopes 是否包含 `write_draft_orders`？
- Access Token 是否有效？

**解决**：
在 Shopify Admin → Apps → Preoder Pro 2.7 → Configuration
确认权限包含：`write_draft_orders`

---

## 🎉 测试成功后的下一步

### 1. 自定义样式
修改预购按钮和徽章的外观：
- 在应用设置中调整颜色
- 修改按钮文字
- 调整位置和大小

### 2. 配置邮件通知
设置自动邮件：
- 订单确认邮件
- 付款提醒邮件
- 到货通知邮件

### 3. 批量启用预购
如果有多个缺货产品：
- 使用应用的批量操作功能
- 一次性启用多个产品的预购

### 4. 监控和分析
定期查看：
- Dashboard 统计数据
- 订单转化率
- 客户反馈

### 5. 生产环境部署
测试通过后：
- 在真实商店（非开发店）安装
- 配置域名和SSL
- 启用所有产品的预购功能

---

## 📞 需要帮助？

如果测试过程中遇到问题：

1. **查看浏览器控制台**（F12 → Console）
2. **查看 Vercel Logs**（Vercel Dashboard → 项目 → Logs）
3. **查看 Supabase Logs**（Supabase Dashboard → Logs）
4. **检查 Network 请求**（F12 → Network，看 API 调用是否成功）

记录详细的错误信息，包括：
- 错误消息
- 请求 URL
- 响应状态码
- 浏览器控制台日志

---

**祝测试顺利！** 🎊

如有任何问题，随时提供详细的错误信息，我会帮你解决！
