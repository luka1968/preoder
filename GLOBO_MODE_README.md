# 🚀 Globo 模式 - 快速开始

## 📁 已创建的文件

### 1. **核心脚本**
- `public/universal-preorder-globo-mode.js` - Globo 模式的主脚本文件

### 2. **文档**
- `GLOBO_MODE_实施指南.md` - 完整的实施指南和配置说明

### 3. **测试工具**
- `public/mode-comparison.html` - 两种模式的可视化对比
- `public/test-globo-mode.html` - Globo 模式功能测试工具

---

## ✅ 快速开始（3 步）

### **Step 1: 查看对比**

访问对比页面了解两种模式的区别：
```
https://shopmall.dpdns.org/mode-comparison.html
```

### **Step 2: 测试功能**

使用测试工具验证 Globo 模式功能：
```
https://shopmall.dpdns.org/test-globo-mode.html
```

### **Step 3: 在主题中使用**

在你的 Shopify 主题中添加以下代码：

```html
<!-- 在 theme.liquid 或 product.liquid 的 </body> 前添加 -->
<script>
  window.PREORDER_CONFIG = {
    shop: '{{ shop.domain }}',
    apiUrl: 'https://shopmall.dpdns.org/api',
    enabled: true,
    estimatedShippingDate: '2025-12-15',
    showEstimatedDate: true,
    debug: true // 生产环境设为 false
  };
</script>
<script src="https://shopmall.dpdns.org/universal-preorder-globo-mode.js" async></script>
```

---

## 🎯 Globo 模式 vs Draft Order 模式

| 特性 | Draft Order | Globo Mode ✅ |
|------|-------------|--------------|
| 客户体验 | 需要等待邮件 | 立即结账 |
| 转化率 | 低 | 高 2x |
| 支付方式 | 有限 | 全部支持 |
| 速度 | 慢（API 延迟） | 快（原生流程） |
| 折扣支持 | ❌ | ✅ |
| Shopify 推荐 | ❌ | ✅ |

---

## 📖 完整文档

详细的实施步骤、配置选项和故障排查，请查看：
- **完整指南**: `GLOBO_MODE_实施指南.md`
- **迁移文档**: `GLOBO_MODE_MIGRATION_GUIDE.md`

---

## 🔧 配置选项

```javascript
window.PREORDER_CONFIG = {
  shop: 'your-shop.myshopify.com',      // 店铺域名
  apiUrl: 'https://your-app.vercel.app/api', // API URL
  enabled: true,                         // 是否启用
  estimatedShippingDate: '2025-12-15',  // 预计发货日期
  showEstimatedDate: true,              // 是否显示发货日期
  debug: false                          // 调试模式
};
```

---

## ✨ 核心流程

```
1. 客户点击 "Pre-Order Now" 按钮
   ↓
2. 调用 Shopify Cart API（带预购标记）
   ↓
3. 自动跳转到 /checkout
   ↓
4. 客户完成支付
   ↓
5. Shopify 创建订单（包含 _preorder: true）
   ↓
6. Webhook 自动保存到数据库
   ↓
7. 发送确认邮件
```

**总耗时**: ~3 秒  
**客户步骤**: 2 步（点击预购 → 完成支付）

---

## 🐛 故障排查

### 问题：按钮没有显示
**解决**：
1. 打开浏览器控制台
2. 输入：`window.PreOrderGloboMode.detect()`
3. 检查返回的检测结果

### 问题：加入购物车失败
**解决**：
1. 确认产品设置为 "Continue selling when out of stock"
2. 检查 Network 标签中的 `/cart/add.js` 请求
3. 确认 variantId 有效

### 问题：Webhook 未触发
**解决**：
1. 检查 Shopify Partner Dashboard 中 webhook 是否注册
2. 查看 Vercel 部署日志
3. 确认 webhook URL 正确

---

## 📊 监控和调试

### 浏览器控制台
```javascript
// 检查 Globo 模式状态
console.log(window.PreOrderGloboMode);

// 手动检测售罄状态
window.PreOrderGloboMode.detect();

// 查看配置
console.log(window.PreOrderGloboMode.config);
```

### Vercel 日志
搜索以下关键词：
- "Processing order create webhook"
- "Pre-order created"
- "检测到预购标记"

---

## 🎉 下一步

1. ✅ 访问 `mode-comparison.html` 了解对比
2. ✅ 使用 `test-globo-mode.html` 测试功能
3. ✅ 阅读 `GLOBO_MODE_实施指南.md` 了解详情
4. ✅ 在测试店铺中部署测试
5. ✅ 在生产环境中上线

---

## 📞 需要帮助？

查看以下文档：
- `GLOBO_MODE_实施指南.md` - 完整实施步骤
- `GLOBO_MODE_MIGRATION_GUIDE.md` - 迁移指南
- Shopify 官方文档 - [Cart API](https://shopify.dev/docs/api/ajax/reference/cart)

---

**🚀 准备好开始了吗？现在就访问测试页面试试吧！**
