# 🚀 库存为零预购按钮快速修复指南

## 问题
当Shopify商品库存为0时，预购按钮无法显示。

## 解决方案
已修复两个核心文件的售罄检测逻辑。

## 📁 修改的文件

1. ✅ `extensions/preorder-embed/assets/preorder-universal.js`
2. ✅ `public/shopify-integration.js`

## 🔧 快速部署

### 方法1: 使用App Embed（推荐）

```bash
# 1. 进入扩展目录
cd extensions/preorder-embed

# 2. 部署到Shopify
shopify app deploy

# 3. 在Shopify主题编辑器中启用App Embed
# 主题编辑器 > App embeds > PreOrder Pro > 启用
```

### 方法2: 使用独立脚本

```bash
# 1. 复制修复后的文件到你的CDN或服务器
cp public/shopify-integration.js /your/cdn/path/

# 2. 在Shopify主题的 theme.liquid 中引用
# 在 </head> 标签前添加：
# <script src="https://your-cdn.com/shopify-integration.js"></script>

# 3. 清除缓存并测试
```

## 🧪 测试修复

### 在本地测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问测试页面
# http://localhost:3000/test-zero-inventory.html

# 3. 查看浏览器控制台的测试结果
```

### 在Shopify商店测试

1. 创建一个测试商品
2. 将库存设置为 **0**
3. 访问商品页面
4. 打开浏览器控制台，运行：

```javascript
// 加载验证脚本
var script = document.createElement('script');
script.src = 'https://your-app-url.vercel.app/test-fix-verification.js';
document.head.appendChild(script);

// 或者直接检查
testPreorderFix.checkCurrentProduct();
```

## ✅ 预期结果

修复后，预购按钮应该在以下情况显示：

- ✅ `available = false`
- ✅ `inventory_quantity = 0`
- ✅ `inventory_quantity < 0`
- ✅ 按钮显示"售罄"、"缺货"等文本
- ✅ 添加到购物车按钮被禁用

## 🐛 问题排查

如果修复后仍然不显示：

```javascript
// 1. 检查产品数据
console.log(window.meta?.product);

// 2. 检查脚本加载
console.log(window.PreOrderIntegration);
console.log(window.PreOrderAppEmbed);

// 3. 启用调试模式
window.PREORDER_CONFIG = { ...window.PREORDER_CONFIG, debug: true };

// 4. 强制重新初始化
if (window.PreOrderIntegration) {
  window.PreOrderIntegration.init();
}
```

## 📞 需要帮助？

查看详细文档：
- 📄 [完整修复说明](./ZERO_INVENTORY_FIX.md)
- 🧪 [测试页面](./test-zero-inventory.html)
- 🔍 [验证脚本](./test-fix-verification.js)

## 🎉 完成！

修复已完成，现在库存为0的商品应该能正常显示预购按钮了！
