-- 🚀 Globo Pro 高级功能数据库扩展
-- 添加预购数量限制和库存管理字段

-- 1. 扩展 preorder_products 表
ALTER TABLE preorder_products 
ADD COLUMN IF NOT EXISTS max_preorder_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS current_preorder_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS buffer_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_disable_on_restock BOOLEAN DEFAULT TRUE;

-- 2. 添加注释
COMMENT ON COLUMN preorder_products.max_preorder_quantity IS '最大预购数量限制（NULL = 无限制）';
COMMENT ON COLUMN preorder_products.current_preorder_count IS '当前已预购数量';
COMMENT ON COLUMN preorder_products.buffer_quantity IS '库存缓冲数量';
COMMENT ON COLUMN preorder_products.auto_disable_on_restock IS '补货后自动关闭预购';

-- 3. 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_preorder_products_quantity 
ON preorder_products(variant_id, current_preorder_count);

CREATE INDEX IF NOT EXISTS idx_preorder_products_auto_disable 
ON preorder_products(shop_id, auto_disable_on_restock);

-- 4. 验证更改
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'preorder_products'
  AND column_name IN ('max_preorder_quantity', 'current_preorder_count', 'buffer_quantity', 'auto_disable_on_restock');
