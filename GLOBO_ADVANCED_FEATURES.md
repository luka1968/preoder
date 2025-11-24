# 📋 可选高级功能实现指南

本文档说明 **Globo Pre-Order 的高级功能**，这些是可选的增值功能，核心预购流程不依赖它们。

---

## ⚠️ 功能 1：自动补货检测（可选）

### 功能描述
当商品重新补货时（库存从 0 变为 > 0），自动禁用预购并恢复正常销售。

### 实现方式

#### 1. 注册 Webhook
```typescript
// pages/api/webhooks/setup.ts
await createWebhook(
  accessToken,
  shop,
  'inventory_levels/update',
  `${process.env.SHOPIFY_APP_URL}/api/webhooks/inventory/updated`
);
```

#### 2. 创建 Webhook 处理器
```typescript
// pages/api/webhooks/inventory/updated.ts
export default async function handler(req, res) {
  const payload = req.body;
  const { inventory_item_id, available } = payload;
  
  // 如果库存 > 0，检查是否启用了预购
  if (available > 0) {
    // 获取关联的 variant_id
    const variant = await getVariantByInventoryItemId(inventory_item_id);
    
    // 检查是否启用了预购
    const preorderEnabled = await checkPreorderEnabled(variant.id);
    
    if (preorderEnabled) {
      // 自动禁用预购
      await disablePreorderForVariant(shop, accessToken, variant.id);
      console.log(`✅ 自动禁用预购：库存已补充 ${variant.id}`);
    }
  }
  
  res.status(200).json({ success: true });
}
```

#### 3. 配置选项
```javascript
// 允许商家选择是否启用自动恢复
window.PREORDER_CONFIG = {
  autoRestoreOnRestock: true, // 默认开启
  minStockToRestore: 1, // 最小库存数量
};
```

### 优先级
🟡 **中等** - 提升用户体验，但不是必需

---

## ❌ 功能 2：Stock Buffer 机制（Pro 功能）

### 功能描述
限制预购数量，防止过度销售。

### 实现方式

#### 1. 数据库扩展
```sql
-- 添加到 preorder_products 表
ALTER TABLE preorder_products ADD COLUMN max_preorder_quantity INTEGER;
ALTER TABLE preorder_products ADD COLUMN current_preorder_count INTEGER DEFAULT 0;
ALTER TABLE preorder_products ADD COLUMN buffer_quantity INTEGER DEFAULT 0;
```

#### 2. API 扩展
```typescript
// pages/api/products/enable-preorder.ts
interface EnablePreorderRequest {
  shop: string;
  variantId: string;
  enabled: boolean;
  maxPreorderQuantity?: number; // 新增
  bufferQuantity?: number; // 新增
}

async function enablePreorderForVariant(...) {
  // 保存限制数量
  await supabaseAdmin
    .from('preorder_products')
    .upsert({
      variant_id: variantId,
      max_preorder_quantity: maxPreorderQuantity,
      buffer_quantity: bufferQuantity,
      current_preorder_count: 0
    });
}
```

#### 3. 订单创建时检查
```typescript
// lib/webhooks.ts - handleOrderCreate
async function handlePreorderOrderCreate(order) {
  for (const item of order.line_items) {
    if (item.properties._preorder) {
      // 检查剩余数量
      const { data: preorderProduct } = await supabaseAdmin
        .from('preorder_products')
        .select('*')
        .eq('variant_id', item.variant_id)
        .single();
      
      if (preorderProduct) {
        const newCount = preorderProduct.current_preorder_count + item.quantity;
        const maxAllowed = preorderProduct.max_preorder_quantity;
        
        // 检查是否超限
        if (maxAllowed && newCount >= maxAllowed) {
          // 自动禁用预购
          await disablePreorderForVariant(shop, variantId);
          console.log(`🚫 预购已达上限，自动关闭: ${variantId}`);
        } else {
          // 更新计数
          await supabaseAdmin
            .from('preorder_products')
            .update({ current_preorder_count: newCount })
            .eq('variant_id', item.variant_id);
        }
      }
    }
  }
}
```

#### 4. 前端检查
```javascript
// public/universal-preorder-globo.js
async function checkPreorderAvailability(variantId) {
  const response = await fetch(`/api/preorder/variant/${variantId}`);
  const data = await response.json();
  
  if (!data.preorder_enabled) {
    return { available: false, reason: 'not_enabled' };
  }
  
  if (data.max_preorder_quantity) {
    const remaining = data.max_preorder_quantity - data.current_preorder_count;
    if (remaining <= 0) {
      return { available: false, reason: 'sold_out' };
    }
    return { available: true, remaining };
  }
  
  return { available: true };
}
```

#### 5. UI 显示剩余数量
```javascript
// 显示剩余预购名额
function showPreorderButton() {
  const availability = await checkPreorderAvailability(variantId);
  
  if (!availability.available) {
    if (availability.reason === 'sold_out') {
      button.textContent = 'Pre-Order Sold Out';
      button.disabled = true;
    }
    return;
  }
  
  if (availability.remaining) {
    button.innerHTML = `
      Pre-Order Now 
      <span style="font-size: 12px;">(${availability.remaining} left)</span>
    `;
  }
}
```

### 优先级
🔴 **低** - 适合大规模商家，小商家通常不需要

---

## 🎯 实现建议优先级

| 功能 | 优先级 | 难度 | 价值 |
|------|--------|------|------|
| 1. 自动补货检测 | 🟡 中 | ⭐⭐ 中 | 提升用户体验 |
| 2. Stock Buffer | 🔴 低 | ⭐⭐⭐ 高 | 适合大规模商家 |

---

## 📝 当前状态

### ✅ 核心功能（100% 完成）
- inventory_policy 修改
- metafield 控制
- 前端按钮显示
- 订单标记
- 手动启用/禁用

### ⚠️ 可选功能（未实现）
- 自动补货检测
- Stock Buffer 机制

---

## 🚀 下一步

如果您需要这些高级功能：

1. **优先实现自动补货检测**
   - 注册 `inventory_levels/update` webhook
   - 创建处理器
   - 测试自动恢复流程

2. **考虑 Stock Buffer**
   - 评估是否真的需要
   - 大多数小商家不需要此功能
   - 如需要，按照上述步骤实现

---

**✅ 核心预购功能已完整实现，可以开始使用了！**
