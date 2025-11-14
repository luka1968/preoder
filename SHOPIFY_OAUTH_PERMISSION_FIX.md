# 🔐 Shopify OAuth 权限检查与重授权指南

## 问题

预购订单无法创建为 Draft Order，通常是因为**应用权限不足**或**用户未完成重新授权**。

## 🔍 检查当前权限

### 方法 1: 数据库查询

```sql
-- 在 Supabase SQL Editor 中运行
SELECT 
  id,
  shop_domain,
  scope,
  installed_at,
  updated_at,
  active
FROM shops 
WHERE shop_domain = 'your-shop.myshopify.com';
```

**检查清单：**
- ✅ `scope` 字段应包含 `write_draft_orders`
- ✅ `scope` 字段应包含 `read_draft_orders`
- ✅ `active` 应该是 `true`

### 方法 2: API 端点查询

```bash
curl "https://your-app.vercel.app/api/check-scopes?shop=your-shop.myshopify.com"
```

**响应示例：**
```json
{
  "scopes": ["write_draft_orders", "read_draft_orders", ...],
  "hasWriteDraftOrders": true,
  "hasReadDraftOrders": true
}
```

## ⚠️ 如果缺少权限

### 场景 1: 应用更新了权限 (最常见)

应用在 `shopify.app.toml` 中添加了 `write_draft_orders`，但用户是在旧权限下安装的。

**解决方案：**

#### 步骤 1: 从店铺卸载应用
1. 登录 Shopify 店铺后台
2. 进入 **设置** → **应用和销售渠道**
3. 找到 **PreOrder Pro** 应用
4. 点击 **移除应用**
5. 确认卸载

#### 步骤 2: 清除缓存
```bash
# 清除浏览器缓存
# Mac: Cmd + Shift + Delete
# Windows: Ctrl + Shift + Delete

# 或在浏览器控制台运行
localStorage.clear()
sessionStorage.clear()
```

#### 步骤 3: 重新安装应用

**方式 A: 通过安装页面 (推荐)**
```
https://your-app.vercel.app/install?shop=your-shop.myshopify.com
```

1. 访问上面的 URL
2. 点击 "安装应用"
3. 在 Shopify 授权确认页面选择 **"安装"**
4. 应用会请求所有权限，包括 `write_draft_orders`
5. 用户需要点击 **"授予"**

**方式 B: 直接在应用中重授权**
```
https://your-app.vercel.app/api/auth/shopify?shop=your-shop.myshopify.com
```

#### 步骤 4: 验证权限已更新

在 Supabase 中查询：
```sql
SELECT scope FROM shops 
WHERE shop_domain = 'your-shop.myshopify.com';
```

检查是否包含 `write_draft_orders`。

### 场景 2: 权限被店铺管理员拒绝

用户在授权时选择了 **"拒绝"** 某些权限。

**解决方案：**

1. **卸载应用** (见上面的步骤)
2. **重新安装** 并在授权页面选择 **"全部授予"**

### 场景 3: 应用未在 Partner Dashboard 中配置权限

如果应用配置了 `write_draft_orders` 但仍然无法使用。

**解决方案：**

#### 检查应用配置

1. 登录 **Shopify Partner Dashboard**
2. 选择 **PreOrder Pro** 应用
3. 进入 **Configuration**
4. 找到 **Admin API scopes**
5. 确保列表中包含：
   - ✅ `write_draft_orders`
   - ✅ `read_draft_orders`
   - ✅ `write_orders`
   - ✅ `read_orders`

如果缺少，需要：
1. 添加缺失的权限
2. 保存配置
3. 用户需要重新安装应用

## 📋 完整的权限检查清单

```
初始安装
  ├─ [ ] 应用在 shopify.app.toml 中配置了权限
  ├─ [ ] Partner Dashboard 已保存权限配置
  └─ [ ] 用户完成了 OAuth 授权
        └─ [ ] 用户在授权页面选择了 "授予" 或 "同意"

授权后
  ├─ [ ] Supabase shops 表中 scope 包含 write_draft_orders
  ├─ [ ] Supabase shops 表中 active = true
  └─ [ ] API 调用成功返回 Draft Order

如果失败
  ├─ [ ] 卸载应用
  ├─ [ ] 清除浏览器缓存
  ├─ [ ] 重新安装应用
  └─ [ ] 在授权页面完成所有权限
```

## 🔄 完整的重授权流程

### 对于终端用户的说明

如果预购订单无法在 Shopify 后台显示，用户需要执行以下步骤：

```
1. 从店铺卸载应用
   ├─ 设置 → 应用和销售渠道
   └─ 找到 PreOrder Pro → 移除

2. 清除浏览器缓存
   └─ Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)

3. 重新访问应用
   └─ https://your-app.vercel.app/install?shop=your-shop.myshopify.com

4. 在 Shopify 授权页面
   └─ 点击 "同意" 授予所有权限

5. 重新创建预购订单
   └─ 预购订单现在应该显示在 Shopify 后台
```

## 🛠️ 开发者调试

### 查看完整的 OAuth 过程日志

在 Vercel 日志中查看：

```
Pages/api/auth/callback - OAuth 授权完成时的日志
Pages/api/auth/shopify - OAuth 初始化时的日志
```

查找以下信息：
- ✅ 授权成功
- ✅ 权限列表 (scopes)
- ✅ Access Token 已保存
- ✅ 店铺信息已保存

### 手动测试 Draft Order 创建

```bash
# 1. 获取有效的店铺信息
curl "https://your-app.vercel.app/api/check-shop?shop=your-shop.myshopify.com"

# 2. 查看权限
curl "https://your-app.vercel.app/api/check-scopes?shop=your-shop.myshopify.com"

# 3. 创建预购（用于测试）
curl -X POST "https://your-app.vercel.app/api/preorder/create" \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "your-shop.myshopify.com",
    "productId": "123456789",
    "variantId": "987654321",
    "email": "test@example.com",
    "name": "Test"
  }'

# 4. 检查响应中是否有 Draft Order ID
# 如果 draftOrderError 为 null，说明成功
# 如果 draftOrderError 不为 null，查看具体错误
```

## 🎯 权限对应关系

| 需要的功能 | 权限 | 状态 |
|-----------|------|------|
| 创建 Draft Order | `write_draft_orders` | ✅ 已配置 |
| 查询 Draft Order | `read_draft_orders` | ✅ 已配置 |
| 创建订单标签 | `write_orders` | ✅ 已配置 |
| 读取订单 | `read_orders` | ✅ 已配置 |
| 获取产品信息 | `read_products` | ✅ 已配置 |
| 获取客户信息 | `read_customers` | ✅ 已配置 |

## ✅ 权限配置完成后

一旦权限配置正确，用户重新授权后：

1. ✅ 能够创建 Draft Order
2. ✅ Draft Order 自动显示在 Shopify 后台
3. ✅ 预购订单带有 `preorder` 标签
4. ✅ 可以在店铺后台进行订单管理

## 📞 最后的检查

如果仍然不工作，逐项验证：

- [ ] 应用已从店铺完全卸载
- [ ] 浏览器缓存已清除
- [ ] 用户已完成重新安装并授予权限
- [ ] Supabase 中 shops 表的 scope 字段包含 `write_draft_orders`
- [ ] Vercel 日志中没有权限错误
- [ ] Shopify API 返回成功响应

如果所有项都通过，Draft Order 应该能够正确创建！🎉
