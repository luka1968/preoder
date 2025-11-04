# 修复 Shopify 安装链接错误

## 问题
错误信息：**"The installation link for this app is invalid"**

## 原因
Shopify Partner Dashboard 中配置的 **Allowed redirection URL(s)** 与实际的回调 URL 不匹配。

## 解决方案

### 步骤 1：更新 Shopify Partner Dashboard 配置

1. **登录 Shopify Partner Dashboard**
   ```
   https://partners.shopify.com
   ```

2. **进入你的应用**
   - 点击 "Apps"
   - 选择 "PreOrder Pro"

3. **进入 Configuration 页面**
   - 点击左侧菜单的 "Configuration"

4. **更新 App URL**
   ```
   App URL: https://shopmall.dpdns.org
   ```

5. **更新 Allowed redirection URL(s)**
   
   **删除所有现有的 URL，只添加这一个：**
   ```
   https://shopmall.dpdns.org/api/auth/shopify
   ```
   
   ⚠️ **重要：**
   - 不要添加 `/callback` 后缀
   - 不要添加多个 URL
   - 确保 URL 完全匹配

6. **保存配置**
   - 点击 "Save" 按钮

### 步骤 2：验证环境变量

确保 Vercel 中设置了正确的环境变量：

```env
SHOPIFY_API_KEY=61745622bf8d460b0b8c5132d951a388
SHOPIFY_API_SECRET=65fba7135cd4790c6db8470741e0d603
SHOPIFY_APP_URL=https://shopmall.dpdns.org
SHOPIFY_SCOPES=write_products,read_products,write_orders,read_orders,write_customers,read_customers,write_inventory,read_inventory,write_draft_orders,read_draft_orders
```

### 步骤 3：重新部署

```bash
git add .
git commit -m "修复 OAuth redirect URL 配置"
git push
```

### 步骤 4：测试安装

访问安装链接：
```
https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com
```

或者在 Shopify 后台：
1. Apps → App and sales channel settings
2. 搜索 "PreOrder Pro"
3. 点击安装

## 常见问题

### Q1: 还是显示 "invalid link"
**A:** 检查 Partner Dashboard 中的 redirect URL 是否完全匹配：
- ✅ 正确：`https://shopmall.dpdns.org/api/auth/shopify`
- ❌ 错误：`https://shopmall.dpdns.org/api/auth/callback`
- ❌ 错误：`https://shopmall.dpdns.org/api/auth/shopify/callback`

### Q2: 安装后跳转到错误页面
**A:** 检查 `SHOPIFY_APP_URL` 环境变量是否正确设置

### Q3: HMAC 验证失败
**A:** 检查 `SHOPIFY_API_SECRET` 是否正确

## 验证清单

- [ ] Partner Dashboard 中的 App URL 是 `https://shopmall.dpdns.org`
- [ ] Partner Dashboard 中的 Redirect URL 是 `https://shopmall.dpdns.org/api/auth/shopify`
- [ ] Vercel 环境变量 `SHOPIFY_API_KEY` 已设置
- [ ] Vercel 环境变量 `SHOPIFY_API_SECRET` 已设置
- [ ] Vercel 环境变量 `SHOPIFY_APP_URL` 已设置
- [ ] `shopify.app.toml` 已更新
- [ ] 代码已重新部署

## 截图参考

### Partner Dashboard - Configuration 页面应该这样配置：

```
App URL:
┌─────────────────────────────────────────┐
│ https://shopmall.dpdns.org              │
└─────────────────────────────────────────┘

Allowed redirection URL(s):
┌─────────────────────────────────────────┐
│ https://shopmall.dpdns.org/api/auth/shopify │
└─────────────────────────────────────────┘
```

## 完成后

安装链接应该可以正常工作了：
```
https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com
```

或者直接访问：
```
https://admin.shopify.com/store/arivi-shop/apps/preorder-pro-3
```
