# 🚀 Vercel + Shopify 开发者店铺部署验证指南

## 📋 部署流程概览

```
本地修复 → Vercel部署 → Shopify安装 → 开发店铺测试 → 生产发布
```

## 1️⃣ 准备工作

### 检查修复是否完成

```bash
# Windows
verify-fix.bat

# 或手动检查
dir extensions\preorder-embed\assets\preorder-universal.js
dir public\shopify-integration.js
```

### 确认环境变量

检查 `.env` 或 `.env.local` 文件：

```env
# Shopify配置
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_orders,write_draft_orders

# 数据库（如果使用）
DATABASE_URL=your_database_url

# Vercel URL（部署后会自动生成）
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 2️⃣ 部署到 Vercel

### 方法1: 使用 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到生产环境
vercel --prod

# 4. 记录部署的URL
# 例如: https://preorder-pro-fix.vercel.app
```

### 方法2: 通过 Git 自动部署

```bash
# 1. 提交修复代码
git add .
git commit -m "修复：库存为0时预购按钮不显示的问题"

# 2. 推送到 GitHub
git push origin main

# 3. Vercel 会自动检测并部署
# 访问 https://vercel.com/dashboard 查看部署状态
```

### 验证 Vercel 部署

```bash
# 访问以下URL检查部署状态
https://your-app.vercel.app/api/health
https://your-app.vercel.app/test-zero-inventory.html
```

## 3️⃣ 配置 Shopify App

### 更新 App URL

1. 访问 [Shopify Partners](https://partners.shopify.com/)
2. 进入你的 App
3. 更新配置：

```
App URL: https://your-app.vercel.app
Allowed redirection URL(s):
  https://your-app.vercel.app/api/auth/shopify
  https://your-app.vercel.app/api/auth/callback
```

### 更新 shopify.app.toml

```toml
# shopify.app.toml
name = "preorder-pro"
client_id = "your_client_id"
application_url = "https://your-app.vercel.app"
embedded = true

[auth]
redirect_urls = [
  "https://your-app.vercel.app/api/auth/shopify",
  "https://your-app.vercel.app/api/auth/callback"
]

[webhooks]
api_version = "2024-01"

[pos]
embedded = false
```

## 4️⃣ 部署 App Embed 扩展

### 部署扩展到 Shopify

```bash
# 1. 进入扩展目录
cd extensions/preorder-embed

# 2. 确认配置
type shopify.extension.toml

# 3. 部署扩展
shopify app deploy

# 4. 选择版本并确认
# 输出示例：
# ✓ Deployed to Shopify
# Extension ID: your-extension-id
# Version: 1.0.1
```

### 更新扩展配置

确保 `shopify.extension.toml` 正确：

```toml
api_version = "2024-01"

[[extensions]]
type = "theme_app_extension"
name = "PreOrder Pro"
handle = "preorder-pro"

[[extensions.targeting]]
target = "head"
```

## 5️⃣ 在开发店铺安装测试

### 创建开发店铺（如果还没有）

1. 访问 [Shopify Partners](https://partners.shopify.com/)
2. 点击 "Stores" → "Add store"
3. 选择 "Development store"
4. 填写店铺信息并创建

### 安装 App 到开发店铺

```bash
# 方法1: 使用 Shopify CLI
shopify app dev

# 这会：
# 1. 启动本地开发服务器
# 2. 创建一个临时的安装链接
# 3. 自动打开浏览器进行安装

# 方法2: 手动安装
# 1. 在 Partners 后台找到你的 App
# 2. 点击 "Test on development store"
# 3. 选择你的开发店铺
# 4. 点击 "Install app"
```

### 安装后配置

1. **启用 App Embed**
   ```
   Shopify Admin → Online Store → Themes → Customize
   → Theme settings → App embeds
   → 找到 "PreOrder Pro" → 打开开关
   → Save
   ```

2. **验证脚本加载**
   - 访问任意商品页面
   - 打开浏览器控制台（F12）
   - 应该看到：`🚀 PreOrder Pro App Embed Block Loaded`

## 6️⃣ 创建测试商品

### 在 Shopify Admin 创建测试商品

```
1. Products → Add product

2. 填写商品信息：
   - Title: 测试商品 - 库存为零
   - Price: 99.00
   
3. 设置库存：
   - Inventory → Track quantity: ✓
   - Quantity: 0
   - Continue selling when out of stock: ✗
   
4. Save
```

### 创建多个测试场景

| 商品名称 | 库存数量 | 继续销售 | 预期结果 |
|---------|---------|---------|---------|
| 测试1-库存为零 | 0 | ✗ | ✅ 显示预购 |
| 测试2-负库存 | -5 | ✗ | ✅ 显示预购 |
| 测试3-有库存 | 10 | - | ❌ 不显示预购 |
| 测试4-允许超卖 | 0 | ✓ | ❌ 不显示预购 |

## 7️⃣ 验证修复效果

### 自动化测试

在商品页面打开控制台，运行：

```javascript
// 1. 加载验证脚本
var script = document.createElement('script');
script.src = 'https://your-app.vercel.app/test-fix-verification.js';
document.head.appendChild(script);

// 2. 等待加载完成后运行测试
setTimeout(() => {
  testPreorderFix.checkCurrentProduct();
}, 2000);
```

### 手动测试清单

- [ ] **测试1: 库存为0的商品**
  - [ ] 访问商品页面
  - [ ] 确认"加入购物车"按钮显示为"售罄"或被禁用
  - [ ] 确认预购按钮显示
  - [ ] 确认预购徽章显示在图片上
  - [ ] 点击预购按钮测试功能

- [ ] **测试2: 切换变体**
  - [ ] 选择有库存的变体 → 预购按钮消失
  - [ ] 选择无库存的变体 → 预购按钮出现

- [ ] **测试3: 移动端**
  - [ ] 在手机浏览器测试
  - [ ] 确认按钮样式正常
  - [ ] 确认点击功能正常

- [ ] **测试4: 不同主题**
  - [ ] 切换到 Dawn 主题测试
  - [ ] 切换到其他主题测试

### 查看调试日志

```javascript
// 启用调试模式
window.PREORDER_CONFIG = {
  ...window.PREORDER_CONFIG,
  debug: true
};

// 重新初始化
window.PreOrderAppEmbed?.init();

// 查看产品数据
console.log('产品数据:', window.meta?.product);

// 查看检测结果
console.log('售罄检测:', window.PreOrderAppEmbed?.detect());
```

## 8️⃣ 常见问题排查

### 问题1: 预购按钮不显示

**检查步骤：**

```javascript
// 1. 检查 App Embed 是否启用
console.log('Config:', window.PREORDER_CONFIG);

// 2. 检查脚本是否加载
console.log('Scripts:', {
  integration: !!window.PreOrderIntegration,
  appEmbed: !!window.PreOrderAppEmbed
});

// 3. 检查产品数据
console.log('Product:', window.meta?.product);

// 4. 手动触发检测
window.PreOrderAppEmbed?.detect();
```

**可能原因：**
- App Embed 未启用
- 脚本加载失败
- 产品数据格式不正确
- 缓存问题

### 问题2: 脚本加载失败

**检查 Network 面板：**
1. 打开开发者工具 → Network
2. 刷新页面
3. 搜索 `preorder` 或 `universal`
4. 检查脚本是否返回 200 状态码

**检查 CORS 配置：**

在 `vercel.json` 中添加：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 问题3: 产品数据不正确

```javascript
// 检查 Shopify 产品对象
console.log('Shopify:', window.Shopify);
console.log('Meta:', window.meta);
console.log('ShopifyAnalytics:', window.ShopifyAnalytics);

// 如果数据不存在，可能需要在主题中添加
// 在 product.liquid 中添加：
/*
<script>
  window.meta = window.meta || {};
  window.meta.product = {{ product | json }};
</script>
*/
```

## 9️⃣ 性能优化

### 优化脚本加载

```javascript
// 在 preorder-pro.liquid 中使用异步加载
<script async src="https://your-app.vercel.app/universal-preorder.js"></script>

// 或使用 defer
<script defer src="https://your-app.vercel.app/universal-preorder.js"></script>
```

### 缓存策略

在 `vercel.json` 中配置：

```json
{
  "headers": [
    {
      "source": "/universal-preorder.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"
        }
      ]
    }
  ]
}
```

## 🔟 发布到生产环境

### 发布前检查清单

- [ ] 所有测试通过
- [ ] 开发店铺验证完成
- [ ] 性能测试通过
- [ ] 文档已更新
- [ ] 备份已创建

### 发布步骤

```bash
# 1. 创建生产版本
shopify app version create

# 2. 部署扩展
shopify app deploy --version=1.0.1

# 3. 发布版本
shopify app version release --version=1.0.1

# 4. 更新 Vercel 环境变量（如果需要）
vercel env add SHOPIFY_API_KEY production
```

### 发布后监控

```javascript
// 添加错误监控
window.addEventListener('error', function(e) {
  console.error('PreOrder Error:', e);
  // 发送到监控服务
});

// 添加性能监控
window.addEventListener('load', function() {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart);
});
```

## 📊 验证成功标准

✅ **部署成功：**
- Vercel 部署状态为 "Ready"
- App 在 Shopify Partners 显示为 "Active"
- App Embed 扩展已部署

✅ **功能正常：**
- 库存为0的商品显示预购按钮
- 预购徽章正确显示
- 点击预购按钮功能正常
- 控制台无错误日志

✅ **性能达标：**
- 脚本加载时间 < 1秒
- 按钮显示延迟 < 500ms
- 页面性能评分 > 90

## 🎉 完成！

恭喜！你已经成功将修复后的预购功能部署到 Shopify 开发店铺。

**下一步：**
1. 在开发店铺进行充分测试
2. 收集测试反馈
3. 准备发布到生产环境
4. 通知现有用户更新

**技术支持：**
- [修复说明](./修复说明_中文.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [快速修复指南](./QUICK_FIX_GUIDE.md)
