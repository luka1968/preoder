-- 扩展 preorder_products 表，支持自动/手动预购模式
-- Migration: 2024-11-24-extend-preorder-products

-- 1. 添加新列
ALTER TABLE preorder_products 
ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_preorder_quantity INTEGER,
ADD COLUMN IF NOT EXISTS current_preorder_count INTEGER DEFAULT 0;

-- 2. 添加注释
COMMENT ON COLUMN preorder_products.manual_override IS '手动覆盖自动设置（最高优先级）';
COMMENT ON COLUMN preorder_products.auto_enabled IS '是否通过自动模式启用';
COMMENT ON COLUMN preorder_products.priority IS '优先级（1=最高，手动>自动）';
COMMENT ON COLUMN preorder_products.max_preorder_quantity IS '最大预购数量（可选）';
COMMENT ON COLUMN preorder_products.current_preorder_count IS '当前已预购数量';

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_preorder_products_auto_enabled 
ON preorder_products(auto_enabled);

CREATE INDEX IF NOT EXISTS idx_preorder_products_priority 
ON preorder_products(priority DESC);

-- 4. 更新现有记录（已有的记录标记为手动启用）
UPDATE preorder_products 
SET manual_override = true,
    auto_enabled = false,
    priority = 1
WHERE enabled = true;
