-- 修复 shops 表结构，匹配代码期望

-- 1. 添加缺失的字段
ALTER TABLE shops ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS country_code TEXT;

-- 2. 重命名字段（如果需要）
-- 注意：如果 is_active 已存在，这会失败，但没关系
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='shops' AND column_name='is_active') THEN
        ALTER TABLE shops RENAME COLUMN is_active TO active;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. 如果 active 不存在，添加它
ALTER TABLE shops ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 4. 确保 id 是文本类型（UUID）
-- 注意：这会删除现有数据！如果表里有数据，请先备份
-- 如果表是空的，可以直接重建
DROP TABLE IF EXISTS shops CASCADE;

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan TEXT DEFAULT 'free',
  email TEXT,
  name TEXT,
  currency TEXT,
  timezone TEXT,
  country_code TEXT,
  active BOOLEAN DEFAULT true
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shop_domain);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(active);

-- 创建更新时间触发器
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

-- 禁用 RLS
ALTER TABLE shops DISABLE ROW LEVEL SECURITY;

-- 添加注释
COMMENT ON TABLE shops IS '店铺信息表';
COMMENT ON COLUMN shops.shop_domain IS '店铺域名';
COMMENT ON COLUMN shops.access_token IS 'Shopify Admin API Access Token';
COMMENT ON COLUMN shops.plan IS '订阅计划: free, basic, pro';
COMMENT ON COLUMN shops.active IS '是否激活';
