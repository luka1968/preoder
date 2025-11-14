# 🎯 预购订单显示在 Shopify 后台 - 完整解决方案

## 目标

让预购订单**真正显示在 Shopify 店铺后台的订单列表**中。

## 完整解决方案流程

### 第 1 部分: 数据库修复 ✅ (已完成)

这部分已经修复，确保预购订单正确保存到数据库。

**检查：**
```sql
SELECT * FROM preorder_orders LIMIT 1;
```

**预期：** 有数据，表结构正确

---

### 第 2 部分: Draft Order 创建 (✅ 代码正确，但需要权限)

这部分代码已经正确，但需要满足两个条件：

#### 条件 1: 应用权限 ✅ (已配置)

应用已在 `shopify.app.toml` 中配置了 `write_draft_orders` 权限。

#### 条件 2: 用户重新授权 ❓ (可能需要)

**最常见的问题：用户在旧权限下安装的应用**

如果用户是在应用添加 `write_draft_orders` 权限**之前**安装的，那么他们的授权不包含这个权限。

**解决方案：** 用户需要**重新授权应用**

---

## 🚀 完整修复步骤 (对用户)

### 步骤 1: 卸载应用 (5 分钟)

1. 登录 **Shopify 店铺后台**
2. 进入 **设置** → **应用和销售渠道**
3. 点击 **PreOrder Pro**
4. 点击 **移除应用**
5. 确认卸载

### 步骤 2: 清除缓存 (1 分钟)

**在浏览器中：**
- Windows: `Ctrl + Shift + Delete`
- Mac: `Cmd + Shift + Delete`

或在浏览器控制台运行：
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### 步骤 3: 重新安装应用 (5 分钟)

访问安装链接：
```
https://your-app.vercel.app/install?shop=your-shop.myshopify.com
```

**在 Shopify 授权页面：**
- 仔细阅读应用请求的权限
- 确保看到 `write_draft_orders` 权限
- 点击 **"同意"** 或 **"授予"** 同意所有权限

### 步骤 4: 验证权限 (2 分钟)

#### 方式 1: 数据库验证

在 Supabase SQL Editor 运行：
```sql
SELECT scope FROM shops 
WHERE shop_domain = 'your-shop.myshopify.com';
```

**结果应包含：** `write_draft_orders, read_draft_orders, ...`

#### 方式 2: API 验证

在浏览器控制台运行：
```javascript
fetch('https://your-app.vercel.app/api/check-scopes?shop=your-shop.myshopify.com')
  .then(r => r.json())
  .then(d => console.log('写权限:', d.hasWriteDraftOrders, '读权限:', d.hasReadDraftOrders))
```

### 步骤 5: 测试创建预购 (2 分钟)

1. 访问应用仪表板
2. 创建一个**新的**预购订单（用于测试）
3. 填写：店铺、产品ID、Variant ID、邮箱

### 步骤 6: 验证显示 (2 分钟)

#### 方式 1: Shopify 后台查看

1. 登录 **Shopify 店铺后台**
2. 进入 **订单**
3. 应该看到最新的 Draft Order
4. 标签应该是 `preorder`

#### 方式 2: 数据库查看

在 Supabase 运行：
```sql
SELECT * FROM preorder_orders 
WHERE shop_id = (SELECT id FROM shops WHERE shop_domain = 'your-shop.myshopify.com')
ORDER BY created_at DESC 
LIMIT 1;
```

**检查项：**
- ✅ `shopify_order_id` 不为空 (应该是 Draft Order ID)
- ✅ `payment_status` = `pending`
- ✅ `fulfillment_status` = `pending`

---

## ❌ 如果仍然不工作

### 诊断问题

#### 问题 1: Shopify 后台看不到订单

**原因可能：**
1. 权限仍然不够 → 再次检查 `scope` 字段
2. Draft Order 创建失败 → 查看 Vercel 日志
3. 刷新页面 → 清除浏览器缓存

**调试：**
```sql
-- 检查 shopify_order_id 是否为 NULL
SELECT 
  id,
  customer_email,
  shopify_order_id,
  payment_status,
  created_at
FROM preorder_orders 
ORDER BY created_at DESC 
LIMIT 5;
```

如果 `shopify_order_id` 全为 NULL，说明 Draft Order 没有创建成功。

#### 问题 2: Draft Order 创建失败

**查看 Vercel 日志：**

1. 登录 **Vercel Dashboard**
2. 选择项目
3. 进入 **Logs**
4. 搜索 `preorder/create`
5. 查看错误信息

**常见错误：**

| 错误 | 原因 | 解决 |
|------|------|------|
| `write_draft_orders` 缺失 | 权限不足 | 重新授权 |
| `Invalid variant_id` | Variant ID 无效 | 使用正确的 Product Variant ID |
| `Customer email required` | 邮箱为空 | 确保邮箱有效 |
| `Unauthorized` | Access Token 无效 | 重新授权应用 |

---

## 📋 完整检查清单

### 安装前
- [ ] 应用已从店铺卸载
- [ ] 浏览器缓存已清除
- [ ] 新标签页访问应用

### 安装时
- [ ] 访问 https://your-app.vercel.app/install
- [ ] 点击 "同意" 或 "授予"
- [ ] 等待重定向完成

### 安装后
- [ ] 检查 shops 表的 scope 包含 `write_draft_orders`
- [ ] 创建新的预购订单
- [ ] Shopify 后台看到 Draft Order
- [ ] Draft Order 有 `preorder` 标签

### 故障排除
- [ ] 检查 Vercel 日志没有错误
- [ ] 检查 Supabase 有预购记录
- [ ] 检查 shopify_order_id 不为空
- [ ] 检查 Shopify 后台是否显示

---

## 📁 相关文档

| 文件 | 内容 |
|-----|------|
| `BUG_FIX_PREORDER_ORDERS_TABLE.md` | 数据库表修复说明 |
| `SHOPIFY_DRAFT_ORDER_FIX.md` | Draft Order 创建详解 |
| `SHOPIFY_OAUTH_PERMISSION_FIX.md` | 权限配置指南 |

---

## ⏱️ 总耗时

- **卸载应用**: 5 分钟
- **清除缓存**: 1 分钟
- **重新安装**: 5 分钟
- **权限验证**: 2 分钟
- **测试**: 2 分钟
- **总计**: ~15 分钟

---

## ✅ 完成标志

修复完成的标志：

```
1. ✅ Supabase shops 表中 scope 包含 write_draft_orders
2. ✅ Supabase preorder_orders 表中有数据
3. ✅ 数据中 shopify_order_id 不为空
4. ✅ Shopify 后台订单列表中有 Draft Order
5. ✅ Draft Order 有 `preorder` 标签
6. ✅ 可以在后台管理预购订单
```

如果以上 6 项都通过，恭喜！您的预购功能已完全正常工作！🎉

---

## 🎯 预期结果

### 修复前 ❌
```
用户下单预购
  ↓
数据保存到数据库
  ↓
Shopify 后台看不到订单 ❌
```

### 修复后 ✅
```
用户下单预购
  ↓
数据保存到数据库
  ↓
自动创建 Draft Order
  ↓
Shopify 后台显示订单 ✅
  ↓
管理员可以管理预购订单 ✅
```

---

**现在就开始修复吧！** 按照上面的步骤操作，15 分钟后您的预购功能就能完全正常工作。
