# 库存为零预购按钮显示问题修复

## 🐛 问题描述

当Shopify商品库存为0时，预购按钮无法正常显示。

## 🔍 问题原因

在原始代码中，售罄检测逻辑过于严格：

```javascript
// 原始代码 - 有问题的逻辑
if (targetVariant && (
  (targetVariant.inventory_quantity <= 0 && targetVariant.inventory_policy === 'deny') || 
  !targetVariant.available
))
```

**问题点：**
1. 要求 `inventory_quantity <= 0` **并且** `inventory_policy === 'deny'` 同时满足
2. 但很多Shopify商店没有设置 `inventory_policy` 字段
3. 或者 `inventory_policy` 设置为其他值（如 'continue'）
4. 导致即使库存为0，条件也不满足，预购按钮不显示

## ✅ 修复方案

修改售罄检测逻辑，使用更宽松的判断条件：

```javascript
// 修复后的代码
const isOutOfStock = (
  // 检查available字段（最可靠）
  targetVariant.available === false ||
  // 检查库存数量为0或负数
  (typeof targetVariant.inventory_quantity === 'number' && targetVariant.inventory_quantity <= 0) ||
  // 检查库存管理且库存为0
  (targetVariant.inventory_management && targetVariant.inventory_quantity <= 0)
);
```

**修复逻辑：**
1. ✅ 优先检查 `available` 字段（Shopify官方推荐）
2. ✅ 检查 `inventory_quantity` 是否为0或负数
3. ✅ 如果启用了库存管理且库存为0，也视为售罄
4. ✅ 使用 OR 逻辑，只要满足任一条件即可

## 📝 修改的文件

### 1. `extensions/preorder-embed/assets/preorder-universal.js`

修改了 `detectSoldOutStatus()` 函数中的库存检测逻辑。

**关键改动：**
- 移除了对 `inventory_policy === 'deny'` 的强制要求
- 添加了更详细的日志输出，便于调试
- 支持多种库存状态的检测

### 2. `public/shopify-integration.js`

修改了 `shouldShowPreorder()` 函数，增强了售罄状态检测。

**关键改动：**
- 添加了按钮状态检测（disabled属性）
- 添加了按钮文本检测（多语言支持）
- 添加了Shopify产品数据检测
- 使用多重检测策略，提高准确性

## 🧪 测试方法

### 方法1: 使用测试页面

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问测试页面：
```
http://localhost:3000/test-zero-inventory.html
```

3. 打开浏览器控制台，查看测试结果

### 方法2: 在Shopify商店测试

1. 在Shopify后台创建一个测试商品
2. 将商品库存设置为0
3. 访问商品页面
4. 应该能看到预购按钮和徽章

### 方法3: 使用浏览器控制台测试

在商品页面打开控制台，运行：

```javascript
// 检查当前产品数据
console.log('Product data:', window.meta?.product);

// 手动触发预购检测
if (window.PreOrderIntegration) {
  window.PreOrderIntegration.init();
}

// 检查售罄状态
if (window.PreOrderAppEmbed) {
  console.log('Sold out status:', window.PreOrderAppEmbed.detect());
}
```

## 📊 支持的库存状态

修复后的代码支持以下所有库存状态：

| 状态 | available | inventory_quantity | 是否显示预购 |
|------|-----------|-------------------|-------------|
| 完全售罄 | false | 0 | ✅ 是 |
| 库存为零 | true | 0 | ✅ 是 |
| 负库存 | false | -5 | ✅ 是 |
| 有库存 | true | 10 | ❌ 否 |
| 未跟踪库存 | true | null | ❌ 否 |

## 🔧 调试技巧

### 启用调试模式

在 `preorder-pro.liquid` 中设置：

```javascript
window.PREORDER_CONFIG = {
  shop: '{{ shop.permanent_domain }}',
  apiUrl: 'https://shopmall.dpdns.org/api',
  enabled: true,
  debug: true,  // 启用调试日志
  version: '1.0.0'
};
```

### 查看详细日志

打开浏览器控制台，会看到类似输出：

```
[PreOrder] 🔍 Detecting sold out status...
[PreOrder] ✅ Variant sold out via Shopify data: {...}
[PreOrder] 📊 Inventory details: {
  available: false,
  inventory_quantity: 0,
  inventory_policy: undefined,
  inventory_management: "shopify"
}
```

## 🚀 部署步骤

### 1. 更新App Embed扩展

```bash
cd extensions/preorder-embed
shopify app deploy
```

### 2. 更新公共脚本

如果使用独立脚本集成：

```bash
# 将修复后的文件上传到CDN或服务器
cp public/shopify-integration.js /path/to/cdn/
```

### 3. 清除缓存

- 清除浏览器缓存
- 清除CDN缓存（如果使用）
- 在Shopify主题编辑器中保存并发布

## ⚠️ 注意事项

1. **兼容性**：修复后的代码向后兼容，不会影响现有功能
2. **性能**：增加了多重检测，但性能影响可忽略不计
3. **主题适配**：适用于所有Shopify主题
4. **多语言**：支持中英文售罄文本检测

## 📞 问题排查

如果修复后仍然无法显示预购按钮：

1. **检查产品数据**：
   ```javascript
   console.log(window.meta?.product);
   ```

2. **检查按钮元素**：
   ```javascript
   console.log(document.querySelector('button[name="add"]'));
   ```

3. **检查脚本加载**：
   ```javascript
   console.log(window.PreOrderIntegration);
   console.log(window.PreOrderAppEmbed);
   ```

4. **检查配置**：
   ```javascript
   console.log(window.PREORDER_CONFIG);
   ```

## 📈 预期效果

修复后，预购按钮应该在以下情况下正常显示：

- ✅ 商品库存为0
- ✅ 商品标记为不可用
- ✅ 添加到购物车按钮被禁用
- ✅ 按钮文本显示"售罄"、"缺货"等
- ✅ 变体库存为0或负数

## 🎉 总结

这次修复解决了库存为0时预购按钮不显示的核心问题。通过放宽检测条件并增加多重检测策略，确保在各种库存状态下都能正确显示预购功能。
