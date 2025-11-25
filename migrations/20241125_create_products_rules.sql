-- 企业级预购系统 - 详细规则表
-- Migration: 2024-11-25-create-products-rules

-- 1. 创建详细规则表
CREATE TABLE IF NOT EXISTS products_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  
  -- 预购控制
  manual_preorder BOOLEAN DEFAULT false,
  auto_preorder BOOLEAN DEFAULT false,
  auto_threshold INTEGER DEFAULT 0,
  
  -- 文案配置
  button_text TEXT DEFAULT 'Pre-Order Now',
  badge_text TEXT DEFAULT 'Pre-Order',
  note_to_customer TEXT,
  
  -- 业务规则
  expected_ship_date DATE,
  allow_when_in_stock BOOLEAN DEFAULT false,
  preorder_limit INTEGER,
  current_preorder_count INTEGER DEFAULT 0,
  
  -- 状态
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(shop_id, variant_id)
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_products_rules_shop_id ON products_rules(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_rules_variant_id ON products_rules(variant_id);
CREATE INDEX IF NOT EXISTS idx_products_rules_active ON products_rules(active);
CREATE INDEX IF NOT EXISTS idx_products_rules_auto ON products_rules(auto_preorder);

-- 3. 注释
COMMENT ON TABLE products_rules IS '商品预购详细规则表';
COMMENT ON COLUMN products_rules.manual_preorder IS '是否手动开启预购';
COMMENT ON COLUMN products_rules.auto_preorder IS '是否启用自动预购';
COMMENT ON COLUMN products_rules.auto_threshold IS '自动预购库存阈值';
COMMENT ON COLUMN products_rules.button_text IS '前端按钮文本';
COMMENT ON COLUMN products_rules.badge_text IS '商品徽章文本';
COMMENT ON COLUMN products_rules.note_to_customer IS '给客户的额外提示';
COMMENT ON COLUMN products_rules.expected_ship_date IS '预计发货日期';
COMMENT ON COLUMN products_rules.allow_when_in_stock IS '库存充足时是否允许预购';
COMMENT ON COLUMN products_rules.preorder_limit IS '预购限购数量';
COMMENT ON COLUMN products_rules.current_preorder_count IS '当前已预购数量';

-- 4. 更新时间触发器
CREATE OR REPLACE FUNCTION update_products_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_rules_updated_at
BEFORE UPDATE ON products_rules
FOR EACH ROW
EXECUTE FUNCTION update_products_rules_updated_at();

-- 5. 迁移现有 preorder_products 数据到新表
INSERT INTO products_rules (
  shop_id,
  product_id,
  variant_id,
  manual_preorder,
  auto_preorder,
  auto_threshold,
  expected_ship_date,
  preorder_limit,
  current_preorder_count,
  active,
  priority,
  created_at,
  updated_at
)
SELECT 
  shop_id,
  product_id,
  variant_id,
  COALESCE(manual_override, enabled) as manual_preorder,
  COALESCE(auto_enabled, false) as auto_preorder,
  0 as auto_threshold,
  estimated_shipping_date::DATE,
  max_preorder_quantity,
  current_preorder_count,
  enabled as active,
  COALESCE(priority, 5),
  created_at,
  updated_at
FROM preorder_products
ON CONFLICT (shop_id, variant_id) DO NOTHING;
