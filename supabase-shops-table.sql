-- PreOrder Pro - Shops 表结构
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建 shops 表（存储店铺信息和 access token）
CREATE TABLE IF NOT EXISTS shops (
  id BIGSERIAL PRIMARY KEY,
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uninstalled_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shop_domain);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);

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

-- 添加注释
COMMENT ON TABLE shops IS '店铺信息表';
COMMENT ON COLUMN shops.shop_domain IS '店铺域名 (例如: mystore.myshopify.com)';
COMMENT ON COLUMN shops.access_token IS 'Shopify Admin API Access Token';
COMMENT ON COLUMN shops.scope IS '授权范围';
COMMENT ON COLUMN shops.installed_at IS '安装时间';
COMMENT ON COLUMN shops.is_active IS '是否激活';
