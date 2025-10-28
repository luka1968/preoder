# ✅ 不用 CLI 的完整方案 - 预购插件立即可用

## 🎯 三种方法让预购插件显示

你有 **3种方法** 可以让预购插件工作，**都不需要 CLI**！

---

## 方法1: 自动安装（推荐）⭐

### 工作原理
当用户安装你的 App 时，脚本会自动注入。

### 已经配置好了
在 `pages/api/auth/shopify.ts` 第140行已经有自动注入代码：

```typescript
await autoInjectPreorderScript(shopDomain, accessToken)
```

### 使用步骤

1. **部署到 Vercel**
   ```bash
   git add .
   git commit -m "预购功能修复"
   git push origin main
   ```

2. **安装 App 到开发店铺**
   - 访问：`https://shopmall.dpdns.org/api/auth/shopify?shop=你的店铺.myshopify.com`
   - 或在 Shopify Partners 后台手动安装

3. **自动完成**
   - 脚本自动注入 ✅
   - 预购功能立即可用 ✅

---

## 方法2: 手动安装页面 ⭐

### 使用步骤

1. **部署到 Vercel**（如果还没部署）
   ```bash
   git push origin main
   ```

2. **访问手动安装页面**
   ```
   https://shopmall.dpdns.org/manual-install
   ```

3. **输入店铺域名**
   - 例如：`your-store.myshopify.com`
   - 点击"安装脚本"按钮

4. **完成**
   - 脚本自动安装 ✅
   - 立即生效 ✅

---

## 方法3: 手动添加代码

### 如果前两种方法都不行，用这个

1. **进入 Shopify Admin**
   ```
   Online Store → Themes → Actions → Edit code
   ```

2. **找到 theme.liquid**
   - 在左侧文件列表中找到 `Layout/theme.liquid`

3. **添加代码**
   - 在 `</head>` 标签前添加：

```liquid
<!-- PreOrder Pro -->
<script>
  window.PREORDER_CONFIG = {
    shop: '{{ shop.permanent_domain }}',
    apiUrl: 'https://shopmall.dpdns.org/api',
    enabled: true,
    debug: false
  };
</script>
<script src="https://shopmall.dpdns.org/shopify-integration.js" async></script>
```

4. **保存**
   - 点击 Save
   - 完成！

---

## 🧪 测试预购功能

### 1. 创建测试商品

```
Products → Add product
设置库存为 0
Save
```

### 2. 访问商品页面

应该看到：
- ✅ 预购按钮（橙色渐变）
- ✅ 预购徽章（图片右上角）
- ✅ 原"加入购物车"按钮隐藏

### 3. 检查浏览器控制台

按 F12，应该看到：
```javascript
[PreOrder] 初始化预购功能...
[PreOrder] ✅ Variant data indicates sold out
[PreOrder] 预购功能初始化完成
```

---

## 📊 三种方法对比

| 特性 | 方法1: 自动安装 | 方法2: 手动安装页面 | 方法3: 手动添加代码 |
|------|---------------|-------------------|-------------------|
| 需要 CLI | ❌ 否 | ❌ 否 | ❌ 否 |
| 操作难度 | 最简单 | 简单 | 中等 |
| 用户操作 | 无需操作 | 点击一次 | 需要编辑代码 |
| 自动更新 | ✅ 是 | ✅ 是 | ❌ 否 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚀 立即开始

### 最快的方法

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "预购功能修复"
   git push origin main
   ```

2. **等待 Vercel 自动部署**（1-2分钟）

3. **选择一种方法**：
   - **方法1**: 重新安装 App（自动注入）
   - **方法2**: 访问 `/manual-install` 页面
   - **方法3**: 手动添加代码到主题

4. **测试**
   - 创建库存为0的商品
   - 访问商品页面
   - 看到预购按钮 ✅

---

## ✅ 验证安装成功

### 检查 Script Tags

在 Shopify Admin 中：
```
Settings → Apps and sales channels
→ 你的 App → View in Admin API
→ 查看 Script tags
```

应该能看到：
```
https://shopmall.dpdns.org/shopify-integration.js
```

### 检查页面源代码

访问任意商品页面，按 `Ctrl+U` 查看源代码，搜索：
```
shopify-integration.js
```

如果找到了 = 安装成功！✅

---

## 🎉 总结

**你完全不需要 CLI！**

三种方法都能让预购插件工作：
1. ✅ 自动安装（App 安装时自动注入）
2. ✅ 手动安装页面（访问 `/manual-install`）
3. ✅ 手动添加代码（编辑 theme.liquid）

**现在就推送代码，选择一种方法，立即测试！** 🚀

---

## 📞 需要帮助？

### 如果方法1不工作

检查 `pages/api/auth/shopify.ts` 中的自动注入代码是否被注释掉了。

### 如果方法2不工作

确保：
1. App 已安装到店铺
2. 数据库中有店铺的 access_token
3. Vercel 已部署最新代码

### 如果方法3不工作

确保：
1. 代码添加在 `</head>` 标签前
2. URL 正确：`https://shopmall.dpdns.org/shopify-integration.js`
3. 保存并刷新页面

---

## 🎊 完成！

**预购功能已经修复，现在选择一种方法安装即可！**

不需要 CLI，不需要 App Embed，功能完全正常！✅
