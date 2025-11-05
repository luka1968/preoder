# 检查 Shopify Partner Dashboard 配置

## 当前应该的配置

### 应用信息
- **应用名称:** PreOrder Pro
- **Client ID:** 61745622bf8d460b0b8c5132d951a388

### URL 配置
- **App URL:** `https://shopmall.dpdns.org`
- **Allowed redirection URL(s):** 
  - `https://shopmall.dpdns.org/api/auth/shopify`

## 如何检查当前配置

### 方法 1: Partner Dashboard
1. 访问 https://partners.shopify.com
2. Apps → PreOrder Pro
3. 查看 "App setup" 或 "Configuration" 页面
4. 记录当前的 URL 配置

### 方法 2: 通过 API 测试
访问这个 URL 看是否能正常跳转：
```
https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com
```

**预期结果:**
- ✅ 跳转到 Shopify 授权页面
- ✅ 显示应用权限列表
- ✅ 可以点击"安装"按钮

**如果出现错误:**
- ❌ "invalid link" → redirect URL 配置错误
- ❌ "HMAC verification failed" → API Secret 错误
- ❌ 404 错误 → App URL 配置错误

## 当前配置可能的问题

### 问题 1: Redirect URL 不匹配
**当前可能是:**
- `https://shopmall.dpdns.org/api/auth/callback` ❌
- `https://shopmall.dpdns.org/api/auth/shopify/callback` ❌

**应该是:**
- `https://shopmall.dpdns.org/api/auth/shopify` ✅

### 问题 2: 有多个 Redirect URL
Partner Dashboard 可能配置了多个 URL，但只有一个是正确的。

**解决方案:** 删除所有错误的 URL，只保留正确的。

## 如果不能修改配置

### 选项 A: 创建新版本
1. Partner Dashboard → Versions → Create version
2. 在新版本中修改 URL 配置
3. 发布新版本

### 选项 B: 创建新应用
如果创建新版本也不行，可以：
1. 在 Partner Dashboard 创建一个新应用
2. 使用正确的配置
3. 更新 `.env` 中的 API Key 和 Secret

### 选项 C: 使用现有配置（临时方案）
如果 Partner Dashboard 中配置的是：
```
https://shopmall.dpdns.org/api/auth/callback
```

那么修改代码中的路由来匹配：

**创建新文件:** `pages/api/auth/callback.ts`
```typescript
// 重定向到实际的处理函数
import shopifyHandler from './shopify'
export default shopifyHandler
```

## 推荐方案

**最简单的方法:**
1. 先尝试直接安装: `https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com`
2. 如果失败，查看错误信息
3. 根据错误信息决定是否需要创建新版本

**如果必须创建新版本:**
1. Partner Dashboard → Create version
2. 修改 URL 配置
3. 发布并测试

## 验证清单

- [ ] 访问 Partner Dashboard 查看当前配置
- [ ] 记录当前的 App URL
- [ ] 记录当前的 Redirect URL(s)
- [ ] 尝试直接安装测试
- [ ] 如果失败，决定使用哪个方案
- [ ] 创建新版本（如果需要）
- [ ] 重新测试安装

## 需要帮助？

如果你不确定如何操作，可以：
1. 截图 Partner Dashboard 的配置页面
2. 告诉我当前的错误信息
3. 我会给你具体的解决方案
