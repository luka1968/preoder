# 🚀 预购应用快速设置指南

## 第一步：获取你的Vercel部署URL

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的预购应用项目
3. 复制项目的URL（例如：`https://preorder-pro-abc123.vercel.app`）

## 第二步：在Shopify主题中添加预购功能

### 方法A：通过theme.liquid文件（推荐）

1. **进入Shopify Admin**
   - 登录你的Shopify商店后台
   - 进入 `Online Store` > `Themes`

2. **编辑主题代码**
   - 点击 `Actions` > `Edit code`
   - 找到 `layout/theme.liquid` 文件

3. **添加预购脚本**
   - 在 `</head>` 标签前添加以下代码：

```html
<!-- PreOrder Pro 预购插件 -->
<script>
  window.PREORDER_APP_URL = 'https://你的vercel应用URL.vercel.app';
</script>
<script src="https://你的vercel应用URL.vercel.app/shopify-integration.js"></script>
```

**重要**: 将 `你的vercel应用URL.vercel.app` 替换为你在第一步获取的实际URL

### 方法B：仅在产品页面添加

如果你只想在产品页面显示预购功能：

1. 找到 `sections/product-form.liquid` 或 `templates/product.liquid`
2. 在文件末尾添加相同的脚本代码

## 第三步：测试预购功能

1. **创建测试产品**
   - 在Shopify Admin中创建一个新产品
   - 将库存设置为0或禁用库存跟踪

2. **访问产品页面**
   - 打开产品页面
   - 应该看到：
     - 🏷️ 预售徽章（在产品图片上）
     - 🛒 立即预订按钮（替代添加到购物车按钮）

3. **测试预购流程**
   - 点击预购按钮
   - 填写邮箱地址
   - 提交预购请求

## 第四步：验证API连接

打开浏览器开发者工具（F12），查看控制台：

- 应该看到 `[PreOrder] 初始化预购功能...` 消息
- 点击预购按钮时应该看到 `[PreOrder] 预购点击:` 消息
- 如果有错误，会显示具体的错误信息

## 🔧 常见问题解决

### 问题1：预购按钮不显示
**解决方案**:
1. 检查浏览器控制台是否有JavaScript错误
2. 确认Vercel URL配置正确
3. 确认产品确实缺货（库存为0或添加到购物车按钮被禁用）

### 问题2：点击预购按钮没反应
**解决方案**:
1. 检查网络连接
2. 确认API端点可访问：访问 `https://你的vercel应用URL.vercel.app/api/preorder/create`
3. 查看浏览器控制台的网络请求

### 问题3：样式不正确
**解决方案**:
1. 清除浏览器缓存
2. 检查主题CSS是否有冲突
3. 可以在主题的CSS文件中添加自定义样式

## 📱 移动端测试

确保在手机上测试预购功能：
- 预购按钮应该正确显示
- 模态框应该适配移动屏幕
- 表单提交应该正常工作

## 🎯 下一步

预购功能正常工作后，你可以：
1. 自定义预购按钮和徽章的样式
2. 配置邮件通知模板
3. 设置预购商品的管理后台
4. 添加更多高级功能

---

**需要帮助？** 如果遇到问题，请检查浏览器控制台的错误信息，这将帮助快速定位问题。
