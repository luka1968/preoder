# 🔧 修复 OAuth 错误

## 问题
```
400 - Oauth error invalid_request
The redirect_uri is not whitelisted
```

## ✅ 已完成的修复

1. ✅ 更新了 `shopify.app.toml` 中的配置
   - client_id: `61745622bf8d460b0b8c5132d951a388`
   - application_url: `https://shopmall.dpdns.org`
   - redirect_urls 已正确配置

## 🚀 现在需要做的

### 方法1: 在 Shopify Partners 后台手动添加（最简单）

1. **访问 Shopify Partners**
   ```
   https://partners.shopify.com/4506660/apps/28749423205
   ```

2. **点击左侧 "Configuration" 或 "App setup"**

3. **找到 "App URL" 部分，设置为：**
   ```
   https://shopmall.dpdns.org
   ```

4. **找到 "Allowed redirection URL(s)" 部分**
   
   **添加以下 URL（如果还没有）：**
   ```
   https://shopmall.dpdns.org/api/auth/shopify
   https://shopmall.dpdns.org/api/auth/callback
   https://shopmall.dpdns.org/api/auth/shopify/callback
   ```

5. **点击 Save**

6. **重新访问安装链接：**
   ```
   https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com
   ```

---

### 方法2: 使用 Shopify CLI 推送配置（如果方法1找不到设置）

```bash
# 1. 确保已登录
shopify auth login

# 2. 推送配置
shopify app config push

# 3. 重新安装
```

---

### 方法3: 创建新的 App（最后的选择）

如果以上方法都不行，可以创建一个新的 App：

1. **在 Shopify Partners 创建新 App**
2. **获取新的 API Key 和 Secret**
3. **更新 `.env.production.local`**
4. **重新部署到 Vercel**

---

## 🎯 推荐方案

**使用方法1**（在 Partners 后台手动添加）

这是最简单、最直接的方法：
1. 进入 Configuration 页面
2. 添加回调 URL
3. 保存
4. 重新安装

---

## 📝 如果还是不行

### 检查当前配置

在 Shopify Partners 后台查看：
- App URL 是否是 `https://shopmall.dpdns.org`
- Allowed redirection URLs 是否包含：
  - `https://shopmall.dpdns.org/api/auth/shopify`
  - `https://shopmall.dpdns.org/api/auth/callback`

### 检查 Vercel 环境变量

确保设置了：
```
SHOPIFY_API_KEY=61745622bf8d460b0b8c5132d951a388
SHOPIFY_API_SECRET=65fba7135cd4790c6db8470741e0d603
NEXT_PUBLIC_APP_URL=https://shopmall.dpdns.org
```

---

## ✅ 完成后

重新访问：
```
https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com
```

应该就能正常安装了！🎉
