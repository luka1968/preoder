-- 创建全局预购设置表
-- Migration: 2024-11-24-create-preorder-settings

-- 1. 创建表
CREATE TABLE IF NOT EXISTS preorder_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- 自动预购设置
  auto_preorder_enabled BOOLEAN DEFAULT false,
  auto_threshold INTEGER DEFAULT 0,
  auto_restore_on_restock BOOLEAN DEFAULT true,
  
  -- 批量操作设置
  allow_batch_operations BOOLEAN DEFAULT true,
  
  -- 默认配置
  default_estimated_shipping_days INTEGER DEFAULT 30,
  default_preorder_message TEXT DEFAULT 'This item is available for pre-order. Expected to ship within {days} days.',
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 唯一约束：每个店铺只有一个设置
  UNIQUE(shop_id)
);

-- 2. 添加注释
COMMENT ON TABLE preorder_settings IS '全局预购设置（每个店铺一个）';
COMMENT ON COLUMN preorder_settings.auto_preorder_enabled IS '是否启用自动预购模式';
COMMENT ON COLUMN preorder_settings.auto_threshold IS '库存阈值（<=此值时自动启用预购）';
COMMENT ON COLUMN preorder_settings.auto_restore_on_restock IS '补货时自动关闭预购';

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_preorder_settings_shop_id 
ON preorder_settings(shop_id);

-- 4. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_preorder_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_preorder_settings_updated_at
BEFORE UPDATE ON preorder_settings
FOR EACH ROW
EXECUTE FUNCTION update_preorder_settings_updated_at();

-- 5. 为现有店铺创建默认设置
INSERT INTO preorder_settings (shop_id, auto_preorder_enabled)
SELECT id, false FROM shops
ON CONFLICT (shop_id) DO NOTHING;
