-- 🎯 Globo 同款预购产品表
-- 用于记录哪些产品启用了预购功能

CREATE TABLE IF NOT EXISTS preorder_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  estimated_shipping_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  --唯一约束：每个店铺的每个变体只能有一条记录
  CONSTRAINT unique_shop_variant UNIQUE(shop_id, variant_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_preorder_products_shop_id ON preorder_products(shop_id);
CREATE INDEX IF NOT EXISTS idx_preorder_products_variant_id ON preorder_products(variant_id);
CREATE INDEX IF NOT EXISTS idx_preorder_products_enabled ON preorder_products(enabled);

-- 注释
COMMENT ON TABLE preorder_products IS 'Globo 同款：记录启用预购的产品';
COMMENT ON COLUMN preorder_products.shop_id IS '店铺 ID';
COMMENT ON COLUMN preorder_products.product_id IS 'Shopify 产品 ID';
COMMENT ON COLUMN preorder_products.variant_id IS 'Shopify 变体 ID';
COMMENT ON COLUMN preorder_products.enabled IS '是否启用预购';
COMMENT ON COLUMN preorder_products.estimated_shipping_date IS '预计发货日期';

-- RLS 策略
ALTER TABLE preorder_products ENABLE ROW LEVEL SECURITY;

-- 允许服务角色全部操作
CREATE POLICY "Service role can do anything on preorder_products"
  ON preorder_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
