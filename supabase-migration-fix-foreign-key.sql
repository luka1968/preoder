-- ⚠️ 数据库迁移脚本 - 修复 preorder_orders 外键类型
-- 修复时间: 2025-12-02
-- 问题: shop_id 类型为 UUID，但 shops.id 是 BIGSERIAL

-- 步骤 1: 备份现有数据（如果有）
-- 在 Supabase SQL Editor 中运行前，先导出 preorder_orders 表的数据

-- 步骤 2: 删除旧表
DROP TABLE IF EXISTS preorder_orders CASCADE;

-- 步骤 3: 重新创建表（使用正确的类型）
CREATE TABLE preorder_orders (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,  -- ✅ 正确的类型
  shopify_order_id TEXT,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  customer_email TEXT NOT NULL,
  total_amount VARCHAR(20) DEFAULT '0.00',
  paid_amount VARCHAR(20) DEFAULT '0.00',
  payment_status VARCHAR(20) DEFAULT 'pending',
  fulfillment_status VARCHAR(20) DEFAULT 'pending',
  estimated_delivery_date TIMESTAMP WITH TIME ZONE,
  order_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 步骤 4: 创建索引
CREATE INDEX IF NOT EXISTS idx_preorder_orders_shop_id ON preorder_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_preorder_orders_customer_email ON preorder_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_preorder_orders_status ON preorder_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_preorder_orders_product_id ON preorder_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_preorder_orders_created_at ON preorder_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_preorder_orders_shopify_order_id ON preorder_orders(shopify_order_id);

-- 步骤 5: 创建更新触发器
CREATE OR REPLACE FUNCTION update_preorder_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_preorder_orders_updated_at ON preorder_orders;
CREATE TRIGGER update_preorder_orders_updated_at
  BEFORE UPDATE ON preorder_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_preorder_orders_updated_at();

-- 步骤 6: 添加注释
COMMENT ON TABLE preorder_orders IS '预购订单主表 - 存储所有预购订单信息';
COMMENT ON COLUMN preorder_orders.shop_id IS '关联的店铺ID (BIGINT)';
COMMENT ON COLUMN preorder_orders.shopify_order_id IS 'Shopify 订单/Draft Order ID';
COMMENT ON COLUMN preorder_orders.product_id IS '产品ID';
COMMENT ON COLUMN preorder_orders.variant_id IS '变体ID';
COMMENT ON COLUMN preorder_orders.customer_email IS '客户邮箱';
COMMENT ON COLUMN preorder_orders.total_amount IS '订单总金额';
COMMENT ON COLUMN preorder_orders.paid_amount IS '已支付金额';
COMMENT ON COLUMN preorder_orders.payment_status IS '支付状态: pending, partial, paid, refunded';
COMMENT ON COLUMN preorder_orders.fulfillment_status IS '履行状态: pending, fulfilled, cancelled';
COMMENT ON COLUMN preorder_orders.order_tags IS '订单标签数组';

-- 完成！✅
-- 如果之前有数据，需要手动导入（调整 shop_id 为正确的 BIGINT 值）
