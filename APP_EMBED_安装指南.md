# 🚀 PreOrder Pro - App Embed 完整安装指南

## 📋 目录
1. [为什么选择 App Embed](#为什么选择-app-embed)
2. [部署到 Vercel](#部署到-vercel)
3. [部署 App Embed 扩展](#部署-app-embed-扩展)
4. [在 Shopify 中启用](#在-shopify-中启用)
5. [测试验证](#测试验证)
6. [备用方案：Script Tags](#备用方案script-tags)
7. [问题排查](#问题排查)

---

## 为什么选择 App Embed？

### ✅ App Embed 的优势

| 特性 | App Embed | Script Tags | 手动安装 |
|------|-----------|-------------|---------|
| 无需修改主题代码 | ✅ | ✅ | ❌ |
| 一键启用/禁用 | ✅ | ❌ | ❌ |
| 自动适配所有主题 | ✅ | ✅ | ⚠️ |
| 更新自动生效 | ✅ | ✅ | ❌ |
| 性能影响 | 最小 | 中等 | 最小 |
| 用户体验 | 最佳 | 一般 | 需要技术知识 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

### 🎯 App Embed 工作原理

```
用户安装App → 部署扩展 → 在主题编辑器中启用 → 自动注入到所有页面
```

**关键优势：**
- 🚀 用户只需点击一个开关
- 🔄 更新时无需用户操作
- 🎨 自动适配所有主题
- 📱 支持桌面和移动端

---

## 部署到 Vercel

### 步骤1: 准备环境变量

创建 `.env.local` 文件：

```env
# Shopify App 配置
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=write_products,read_orders,write_draft_orders

# 数据库（如果使用）
DATABASE_URL=your_database_url

# App URL（部署后会自动生成）
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 步骤2: 部署到 Vercel

```bash
# 方法1: 使用 Vercel CLI（推荐）
npm install -g vercel
vercel login
vercel --prod

# 方法2: 通过 Git 自动部署
git add .
git commit -m "修复：库存为0时预购按钮显示问题"
git push origin main
# Vercel 会自动检测并部署
```

### 步骤3: 记录部署URL

部署完成后，记录你的 Vercel URL：
```
https://your-app-name.vercel.app
```

### 步骤4: 更新 Shopify App 配置

1. 访问 [Shopify Partners](https://partners.shopify.com/)
2. 进入你的 App
3. 更新以下配置：

```
App URL: https://your-app.vercel.app
Allowed redirection URL(s):
  https://your-app.vercel.app/api/auth/shopify
  https://your-app.vercel.app/api/auth/callback
```

---

## 部署 App Embed 扩展

### 步骤1: 检查扩展配置

确认 `extensions/preorder-embed/shopify.extension.toml` 内容：

```toml
api_version = "2024-01"

[[extensions]]
type = "theme"
name = "PreOrder Pro"

[[extensions.targeting]]
target = "head"
module = "./blocks/app_embed.liquid"
```

### 步骤2: 部署扩展

```bash
# 进入扩展目录
cd extensions/preorder-embed

# 部署扩展
shopify app deploy

# 输出示例：
# ✓ Deployed to Shopify
# Extension ID: your-extension-id
# Version: 1.0.1
```

### 步骤3: 确认部署成功

在 Shopify Partners 后台查看：
1. 进入你的 App
2. 点击 "Extensions"
3. 应该能看到 "PreOrder Pro" 扩展
4. 状态应该是 "Active"

---

## 在 Shopify 中启用

### 方法1: 在开发店铺中测试

#### 1. 安装 App 到开发店铺

```bash
# 使用 Shopify CLI
shopify app dev

# 或者在 Partners 后台
# App → Test on development store → 选择店铺 → Install
```

#### 2. 启用 App Embed

1. **进入主题编辑器**
   ```
   Shopify Admin → Online Store → Themes → Customize
   ```

2. **找到 App embeds**
   - 点击左侧菜单顶部的 "⚙️" 图标
   - 或者点击 "Theme settings"
   - 找到 "App embeds" 部分

3. **启用 PreOrder Pro**
   - 找到 "PreOrder Pro - 预购插件"
   - 打开开关（从灰色变为绿色）
   - 点击 "Save" 保存

#### 3. 配置选项（可选）

点击 "PreOrder Pro" 可以配置：
- ✅ 启用预购功能
- 🔗 API URL
- 🐛 调试模式
- 📝 按钮文本
- 🏷️ 徽章文本

### 方法2: 在生产店铺中使用

1. **发布 App**
   ```bash
   shopify app version create
   shopify app version release --version=1.0.1
   ```

2. **用户安装**
   - 用户从 Shopify App Store 安装你的 App
   - 自动跳转到主题编辑器
   - 引导用户启用 App Embed

---

## 测试验证

### 1. 创建测试商品

在 Shopify Admin 中：

```
Products → Add product

商品信息：
- Title: 测试商品 - 库存为零
- Price: 99.00

库存设置：
- Track quantity: ✓
- Quantity: 0
- Continue selling when out of stock: ✗

保存商品
```

### 2. 访问商品页面

在前台访问该商品页面，应该看到：

✅ **预期效果：**
- 原"加入购物车"按钮显示为"售罄"或被禁用
- 出现橙色的"立即预订 Pre-Order Now"按钮
- 产品图片右上角显示"预售 Pre-Order"徽章
- 按钮有渐变色和阴影效果

### 3. 检查浏览器控制台

按 F12 打开控制台，应该看到：

```javascript
🚀 PreOrder Pro App Embed Block Loaded
📊 Config: {shop: "...", apiUrl: "...", enabled: true, ...}
✅ PreOrder Universal Widget loaded via App Embed
🔍 Detecting sold out status...
✅ Variant sold out via Shopify data: {...}
📊 Inventory details: {available: false, inventory_quantity: 0, ...}
✅ Preorder button inserted after original button
✅ Preorder badge added to: .product__media
🎉 PreOrder Widget initialized successfully via App Embed!
```

### 4. 测试预购功能

1. 点击预购按钮
2. 应该弹出预购模态框
3. 填写邮箱和姓名
4. 提交测试

### 5. 测试不同场景

| 场景 | 库存设置 | 预期结果 |
|------|---------|---------|
| 库存为0 | quantity=0, available=false | ✅ 显示预购 |
| 负库存 | quantity=-5 | ✅ 显示预购 |
| 有库存 | quantity=10 | ❌ 不显示预购 |
| 允许超卖 | quantity=0, continue_selling=true | ❌ 不显示预购 |

---

## 备用方案：Script Tags

如果 App Embed 无法使用，可以使用 Script Tags API：

### 自动安装

```bash
# 访问安装页面
https://your-app.vercel.app/install-methods

# 或者通过 API
POST /api/install-script-tag
{
  "shop": "your-shop.myshopify.com",
  "accessToken": "your_access_token"
}
```

### 手动安装

在 `theme.liquid` 的 `</head>` 前添加：

```liquid
<!-- PreOrder Pro -->
<script>
  window.PREORDER_CONFIG = {
    shop: '{{ shop.permanent_domain }}',
    apiUrl: 'https://your-app.vercel.app/api',
    enabled: true,
    debug: false
  };
</script>
<script src="https://your-app.vercel.app/shopify-integration.js" async></script>
```

---

## 问题排查

### 问题1: 看不到 App Embed 选项

**可能原因：**
- 扩展未部署成功
- App 未安装到店铺
- 缓存问题

**解决方法：**

```bash
# 1. 重新部署扩展
cd extensions/preorder-embed
shopify app deploy

# 2. 检查部署状态
shopify app info

# 3. 重新安装 App
# 在 Partners 后台卸载并重新安装
```

### 问题2: 预购按钮不显示

**检查步骤：**

```javascript
// 1. 检查 App Embed 是否启用
console.log('Config:', window.PREORDER_CONFIG);

// 2. 检查脚本是否加载
console.log('Scripts:', {
  loaded: window.PreOrderProLoaded,
  appEmbed: !!window.PreOrderAppEmbed
});

// 3. 检查产品数据
console.log('Product:', window.meta?.product);

// 4. 手动触发检测
window.PreOrderAppEmbed?.detect();
```

**常见原因：**
- App Embed 未启用
- 产品库存不为0
- 脚本加载失败
- 主题不兼容

### 问题3: 脚本加载失败

**检查 Network 面板：**
1. F12 → Network
2. 刷新页面
3. 搜索 `preorder` 或 `universal`
4. 检查状态码（应该是 200）

**检查 CORS：**

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

### 问题4: 样式不正确

**检查 CSS 冲突：**

```javascript
// 检查按钮元素
const btn = document.querySelector('.preorder-btn');
console.log('Button styles:', window.getComputedStyle(btn));

// 检查是否被主题样式覆盖
console.log('CSS specificity:', btn.style.cssText);
```

**解决方法：**
- 所有样式都使用 `!important`
- 使用更高的 CSS 优先级
- 检查主题的自定义 CSS

---

## 📊 部署检查清单

### 部署前
- [ ] 代码修复已完成
- [ ] 本地测试通过
- [ ] 环境变量已配置
- [ ] 备份已创建

### Vercel 部署
- [ ] 部署成功
- [ ] URL 已记录
- [ ] Shopify App 配置已更新
- [ ] 健康检查通过

### 扩展部署
- [ ] `shopify app deploy` 成功
- [ ] 扩展在 Partners 后台可见
- [ ] 版本号已更新

### Shopify 测试
- [ ] App 已安装到开发店铺
- [ ] App Embed 可见并已启用
- [ ] 测试商品已创建（库存=0）
- [ ] 预购按钮正常显示
- [ ] 预购徽章正常显示
- [ ] 点击功能正常
- [ ] 控制台无错误

### 多场景测试
- [ ] 库存为0 → 显示预购
- [ ] 负库存 → 显示预购
- [ ] 有库存 → 不显示预购
- [ ] 多变体切换正常
- [ ] 移动端显示正常

### 生产发布
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 用户指南已准备
- [ ] 监控已设置

---

## 🎉 完成！

恭喜！你已经成功部署了 PreOrder Pro 的 App Embed 扩展。

**用户使用流程：**
1. 从 App Store 安装你的 App
2. 在主题编辑器中启用 App Embed
3. 保存设置
4. 立即生效，无需任何代码修改

**你的优势：**
- ✅ 用户体验最佳
- ✅ 安装最简单
- ✅ 维护最方便
- ✅ 覆盖所有主题

**下一步：**
- 收集用户反馈
- 优化性能
- 添加更多功能
- 准备上架 App Store
