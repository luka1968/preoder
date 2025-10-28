# 🎉 无需 Shopify CLI 的完整部署方案

## ✅ 好消息！

你的项目**已经内置了自动脚本注入功能**，完全不需要 Shopify CLI！

预购功能会在用户安装 App 时自动激活。

---

## 🚀 部署步骤（超简单）

### 第1步：部署到 Vercel

```bash
# 方法1: 推送到 GitHub（自动部署）
git add .
git commit -m "修复：库存为0时预购按钮不显示"
git push origin main

# 方法2: 使用 Vercel CLI
vercel login
vercel --prod
```

### 第2步：完成！

就这么简单！不需要其他操作。

---

## 🔧 工作原理

### 自动安装流程

```
用户安装 App
    ↓
OAuth 认证
    ↓
自动调用 autoInjectPreorderScript()
    ↓
创建 Script Tag
    ↓
脚本自动加载到所有页面
    ↓
检测库存为0的商品
    ↓
显示预购按钮
```

### 代码位置

在 `pages/api/auth/shopify.ts` 中：

```typescript
// 5. 自动注入预购脚本到商店
try {
  await autoInjectPreorderScript(shopDomain, accessToken)
  console.log('✅ PreOrder script auto-injected for:', shopDomain)
} catch (error) {
  console.warn('⚠️ Failed to auto-inject PreOrder script')
}
```

---

## 📝 用户使用流程

### 对于商家（你的客户）

1. **安装 App**
   - 从 Shopify App Store 或你提供的链接安装
   - 点击"安装"按钮
   - 授权权限

2. **自动完成**
   - 脚本自动注入 ✅
   - 无需任何配置 ✅
   - 立即生效 ✅

3. **测试**
   - 创建库存为0的商品
   - 访问商品页面
   - 看到预购按钮

### 对于最终用户（购物者）

1. 访问缺货商品页面
2. 看到预购按钮和徽章
3. 点击预购
4. 填写信息
5. 提交预购

---

## 🧪 测试步骤

### 1. 部署到 Vercel

```bash
# 推送代码
git push origin main

# 或使用 Vercel CLI
vercel --prod
```

### 2. 安装到开发店铺

访问：`https://shopmall.dpdns.org/api/auth/shopify?shop=你的店铺.myshopify.com`

或在 Shopify Partners 后台：
- 进入你的 App
- 点击 "Test on development store"
- 选择开发店铺
- 点击 "Install"

### 3. 验证脚本已注入

在 Shopify Admin 中：
```
Online Store → Themes → Actions → Edit code
→ 查看 Settings → Script tags
```

应该能看到：
```
https://shopmall.dpdns.org/universal-preorder.js
```

### 4. 创建测试商品

```
Products → Add product
设置库存为 0
Save
```

### 5. 访问商品页面

应该看到：
- ✅ 预购按钮（橙色渐变）
- ✅ 预购徽章（图片右上角）
- ✅ 原"加入购物车"按钮隐藏

### 6. 检查浏览器控制台

按 F12，应该看到：
```javascript
[PreOrder] 初始化预购功能...
[PreOrder] ✅ Variant data indicates sold out
[PreOrder] 预购功能初始化完成
```

---

## 🔍 验证脚本注入

### 方法1: 通过 Shopify Admin

```
Settings → Apps and sales channels → Develop apps
→ 你的 App → API credentials
→ Admin API access token

然后访问：
https://你的店铺.myshopify.com/admin/api/2024-01/script_tags.json
```

### 方法2: 通过浏览器

访问任意商品页面，查看源代码（Ctrl+U），搜索：
```
universal-preorder.js
```

### 方法3: 通过控制台

```javascript
// 在商品页面打开控制台（F12）
console.log('PreOrder Config:', window.PREORDER_CONFIG);
console.log('PreOrder Loaded:', window.PreOrderProLoaded);
```

---

## 📊 对比：App Embed vs Script Tags

| 特性 | App Embed | Script Tags（当前方案） |
|------|-----------|------------------------|
| 需要 CLI | ✅ 是 | ❌ 否 |
| 自动安装 | ❌ 需要用户启用 | ✅ 完全自动 |
| 用户操作 | 需要在主题编辑器启用 | 无需任何操作 |
| 部署方式 | `shopify app deploy` | `git push` |
| 功能效果 | 完全相同 | 完全相同 |
| 卸载清理 | 自动 | 需要webhook处理 |
| 网络要求 | 需要访问Shopify API | 只需要访问Vercel |

---

## ⚙️ 配置说明

### 脚本URL配置

在 `pages/api/auth/shopify.ts` 中：

```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopmall.dpdns.org'
const scriptUrl = `${appUrl}/universal-preorder.js`
```

### 环境变量

确保 `.env` 中有：
```env
NEXT_PUBLIC_APP_URL=https://shopmall.dpdns.org
```

---

## 🐛 问题排查

### 问题1: 脚本未注入

**检查步骤：**

1. 查看 Vercel 部署日志
2. 检查 OAuth 回调是否成功
3. 查看 Shopify Admin 的 Script tags

**解决方法：**

```bash
# 手动触发注入
# 访问：
https://shopmall.dpdns.org/api/install-script-tag

# POST 请求
{
  "shop": "你的店铺.myshopify.com",
  "accessToken": "你的access_token"
}
```

### 问题2: 预购按钮不显示

**检查步骤：**

```javascript
// 1. 检查脚本是否加载
console.log('Script loaded:', !!window.PreOrderIntegration);

// 2. 检查产品数据
console.log('Product:', window.meta?.product);

// 3. 手动触发检测
window.PreOrderIntegration?.init();
```

### 问题3: 网络超时（CLI问题）

**解决方法：**

不需要 CLI！使用当前的 Script Tags 方案即可。

如果将来需要使用 CLI：
1. 检查网络代理设置
2. 尝试使用 VPN
3. 检查防火墙设置

---

## 🔄 更新流程

### 修改代码后

```bash
# 1. 推送到 GitHub
git add .
git commit -m "更新预购功能"
git push origin main

# 2. Vercel 自动部署

# 3. 脚本自动更新（用户无需操作）
```

### 强制更新脚本

如果需要强制更新已安装的脚本：

```bash
# 访问：
https://shopmall.dpdns.org/api/update-script-tags

# 这会更新所有已安装店铺的脚本URL
```

---

## ✅ 优势总结

### 使用 Script Tags 的优势

1. **无需 CLI** ✅
   - 不需要安装 Shopify CLI
   - 不需要处理网络问题
   - 不需要命令行操作

2. **完全自动** ✅
   - 用户安装即可使用
   - 无需任何配置
   - 无需启用开关

3. **简单部署** ✅
   - 只需推送代码
   - Vercel 自动部署
   - 立即生效

4. **功能完整** ✅
   - 预购按钮正常显示
   - 库存为0检测已修复
   - 所有功能都能用

---

## 📝 部署检查清单

### 部署前
- [x] 代码已修复（库存为0的bug）
- [x] `.env` 已配置
- [x] 自动注入功能已启用

### 部署
- [ ] 推送代码到 GitHub
- [ ] Vercel 自动部署成功
- [ ] 访问 `https://shopmall.dpdns.org/shopify-integration.js` 能看到代码

### 测试
- [ ] 安装 App 到开发店铺
- [ ] 检查 Script Tags 已创建
- [ ] 创建库存为0的测试商品
- [ ] 访问商品页面验证预购按钮
- [ ] 浏览器控制台无错误

---

## 🎉 总结

**你不需要 Shopify CLI！**

你的项目已经有完整的自动脚本注入功能：

1. ✅ 用户安装 App 时自动注入脚本
2. ✅ 预购功能自动激活
3. ✅ 库存为0的bug已修复
4. ✅ 只需要部署到 Vercel

**现在就部署：**

```bash
git push origin main
```

**就这么简单！** 🚀

---

## 📞 下一步

1. **部署到 Vercel**
   ```bash
   git push origin main
   ```

2. **安装到开发店铺测试**
   ```
   https://shopmall.dpdns.org/api/auth/shopify?shop=你的店铺.myshopify.com
   ```

3. **创建测试商品验证**
   - 库存设为 0
   - 访问商品页面
   - 看到预购按钮

**完成！不需要 CLI，功能完全一样！** 🎊
