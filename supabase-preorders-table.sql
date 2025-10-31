-- PreOrder Pro - Preorders 表结构
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建 preorders 表（如果不存在）
CREATE TABLE IF NOT EXISTS preorders (
  id BIGSERIAL PRIMARY KEY,
  shop_domain TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status TEXT DEFAULT 'pending',
  shopify_draft_order_id BIGINT,
  shopify_draft_order_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_preorders_shop ON preorders(shop_domain);
CREATE INDEX IF NOT EXISTS idx_preorders_email ON preorders(customer_email);
CREATE INDEX IF NOT EXISTS idx_preorders_status ON preorders(status);
CREATE INDEX IF NOT EXISTS idx_preorders_product ON preorders(product_id);
CREATE INDEX IF NOT EXISTS idx_preorders_created ON preorders(created_at DESC);

-- 如果表已存在，添加新字段
ALTER TABLE preorders ADD COLUMN IF NOT EXISTS shopify_draft_order_id BIGINT;
ALTER TABLE preorders ADD COLUMN IF NOT EXISTS shopify_draft_order_name TEXT;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_preorders_updated_at ON preorders;
CREATE TRIGGER update_preorders_updated_at
  BEFORE UPDATE ON preorders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE preorders IS '预购订单表';
COMMENT ON COLUMN preorders.shop_domain IS '店铺域名';
COMMENT ON COLUMN preorders.product_id IS '产品ID';
COMMENT ON COLUMN preorders.variant_id IS '变体ID';
COMMENT ON COLUMN preorders.customer_email IS '客户邮箱';
COMMENT ON COLUMN preorders.customer_name IS '客户姓名';
COMMENT ON COLUMN preorders.status IS '状态: pending, notified, completed, cancelled';
COMMENT ON COLUMN preorders.shopify_draft_order_id IS 'Shopify 草稿订单ID';
COMMENT ON COLUMN preorders.shopify_draft_order_name IS 'Shopify 草稿订单编号';
