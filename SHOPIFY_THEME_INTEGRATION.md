# Shopify主题集成指南

## 🎯 如何在你的Shopify商店中显示预购按钮

### 方法1：通过Shopify Admin添加脚本（推荐）

1. **登录Shopify Admin**
   - 进入你的开发商店管理后台

2. **添加预购脚本**
   - 进入 `Online Store` > `Themes`
   - 点击 `Actions` > `Edit code`
   - 找到 `theme.liquid` 文件
   - 在 `</head>` 标签前添加以下代码：

```html
<!-- PreOrder Pro 预购插件 -->
<script>
  window.PREORDER_APP_URL = 'https://your-vercel-app.vercel.app'; // 替换为你的Vercel应用URL
</script>
<script src="https://your-vercel-app.vercel.app/shopify-integration.js"></script>
```

3. **保存并测试**
   - 点击 `Save` 保存文件
   - 访问任意产品页面查看预购功能

### 方法2：通过产品页面模板集成

1. **编辑产品页面模板**
   - 在主题编辑器中找到 `sections/product-form.liquid` 或 `templates/product.liquid`

2. **添加预购按钮代码**
   - 在添加到购物车按钮附近添加：

```liquid
<!-- 预购功能集成 -->
<div id="preorder-container-{{ product.id }}">
  <script>
    // 检查库存状态
    {% assign current_variant = product.selected_or_first_available_variant %}
    {% if current_variant.inventory_quantity <= 0 or current_variant.available == false %}
      // 显示预购按钮
      document.addEventListener('DOMContentLoaded', function() {
        if (window.PreOrderIntegration) {
          window.PreOrderIntegration.init();
        }
      });
    {% endif %}
  </script>
</div>

<!-- 加载预购脚本 -->
<script>
  window.PREORDER_APP_URL = 'https://your-vercel-app.vercel.app'; // 替换为你的Vercel应用URL
</script>
<script src="https://your-vercel-app.vercel.app/shopify-integration.js"></script>
```

### 方法3：使用Shopify App Blocks（Shopify 2.0主题）

1. **创建App Block**
   - 在应用中创建 `blocks/preorder.liquid`

2. **添加到产品页面**
   - 在主题定制器中添加预购块到产品页面

## 🔧 配置选项

### 自定义预购按钮样式

在主题的 `assets/theme.css` 或 `assets/style.css` 中添加：

```css
/* 预购按钮样式 */
.preorder-btn {
  background: #ff6b35 !important;
  color: white !important;
  border: none !important;
  padding: 12px 24px !important;
  border-radius: 6px !important;
  font-weight: bold !important;
  cursor: pointer !important;
  width: 100% !important;
  font-size: 16px !important;
  transition: all 0.3s ease !important;
}

.preorder-btn:hover {
  background: #e55a2b !important;
  transform: translateY(-1px) !important;
}

/* 预购徽章样式 */
.preorder-badge {
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  background: #ff6b35 !important;
  color: white !important;
  padding: 6px 12px !important;
  border-radius: 4px !important;
  font-size: 12px !important;
  font-weight: bold !important;
  z-index: 100 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
}

/* 预购模态框样式 */
.preorder-modal {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preorder-btn {
    font-size: 14px !important;
    padding: 10px 20px !important;
  }
  
  .preorder-badge {
    font-size: 10px !important;
    padding: 4px 8px !important;
  }
}
```

## 🧪 测试步骤

### 1. 基本功能测试
- [ ] 访问产品页面
- [ ] 查看是否显示预购徽章
- [ ] 点击预购按钮
- [ ] 填写邮箱提交预购

### 2. 不同场景测试
- [ ] 有库存商品（应显示正常购买按钮）
- [ ] 无库存商品（应显示预购按钮）
- [ ] 变体切换（预购状态应正确更新）

### 3. 移动端测试
- [ ] 手机浏览器访问
- [ ] 预购按钮样式正常
- [ ] 模态框在移动端正常显示

## 🐛 常见问题

### Q: 预购按钮不显示？
A: 检查以下几点：
1. 脚本是否正确加载
2. 控制台是否有JavaScript错误
3. 产品是否真的缺货

### Q: 点击预购按钮没反应？
A: 检查：
1. 网络连接是否正常
2. API端点是否可访问
3. 浏览器控制台错误信息

### Q: 样式不正确？
A: 确保：
1. CSS样式优先级足够高（使用 !important）
2. 主题CSS没有冲突
3. 清除浏览器缓存

## 📞 技术支持

如果遇到问题，请检查：
1. 浏览器控制台错误信息
2. 网络请求是否成功
3. 应用服务器状态

---

**注意**: 这是简化版集成方案，适用于快速测试和演示。生产环境建议使用完整的App Bridge集成。
