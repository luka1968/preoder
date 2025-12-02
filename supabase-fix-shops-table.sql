-- ✅ 修复 shops 表 - 添加缺失的列
-- 如果 shops 表已存在但缺少某些列，运行这个脚本

-- 添加 is_active 列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE shops ADD COLUMN is_active BOOLEAN DEFAULT true;
        COMMENT ON COLUMN shops.is_active IS '是否激活';
    END IF;
END $$;

-- 添加 uninstalled_at 列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' AND column_name = 'uninstalled_at'
    ) THEN
        ALTER TABLE shops ADD COLUMN uninstalled_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 添加 updated_at 列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE shops ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 添加 scope 列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' AND column_name = 'scope'
    ) THEN
        ALTER TABLE shops ADD COLUMN scope TEXT;
    END IF;
END $$;

-- 创建或替换更新触发器
CREATE OR REPLACE FUNCTION update_shops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shops_updated_at ON shops;
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_shops_updated_at();

-- 创建索引（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'shops' AND indexname = 'idx_shops_domain'
    ) THEN
        CREATE INDEX idx_shops_domain ON shops(shop_domain);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'shops' AND indexname = 'idx_shops_active'
    ) THEN
        CREATE INDEX idx_shops_active ON shops(is_active);
    END IF;
END $$;

-- 完成！✅
SELECT '✅ shops 表更新成功！' as result;
