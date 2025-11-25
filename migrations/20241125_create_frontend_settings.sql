-- 企业级预购系统 - 前端Widget配置表
-- Migration: 2024-11-25-create-frontend-settings

-- 1. 创建前端配置表
CREATE TABLE IF NOT EXISTS frontend_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE UNIQUE,
  
  -- 按钮样式
  button_color TEXT DEFAULT '#4299e1',
  button_text_color TEXT DEFAULT '#ffffff',
  button_hover_color TEXT DEFAULT '#3182ce',
  button_border_radius INTEGER DEFAULT 6,
  button_font_size INTEGER DEFAULT 14,
  button_font_weight TEXT DEFAULT '500',
  button_padding TEXT DEFAULT '12px 24px',
  
  -- 徽章样式
  badge_color TEXT DEFAULT '#2563eb',
  badge_text_color TEXT DEFAULT '#ffffff',
  badge_position TEXT DEFAULT 'top-left', -- 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  
  -- 显示选项
  show_countdown BOOLEAN DEFAULT false,
  show_sold_count BOOLEAN DEFAULT false,
  show_shipping_date BOOLEAN DEFAULT true,
  show_stock_status BOOLEAN DEFAULT true,
  show_preorder_badge BOOLEAN DEFAULT true,
  
  -- 文案模板
  preorder_message_template TEXT DEFAULT 'Expected to ship {date}',
  countdown_message_template TEXT DEFAULT 'Pre-order ends in {time}',
  sold_count_message_template TEXT DEFAULT '{count} pre-ordered',
  
  -- 高级选项
  enable_analytics BOOLEAN DEFAULT true,
  enable_email_notifications BOOLEAN DEFAULT true,
  custom_css TEXT,
  custom_js TEXT,
  
  -- App Extension 配置
  app_extension_enabled BOOLEAN DEFAULT true,
  app_extension_block_id TEXT,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_frontend_settings_shop_id ON frontend_settings(shop_id);

-- 3. 注释
COMMENT ON TABLE frontend_settings IS '前端Widget样式和配置';
COMMENT ON COLUMN frontend_settings.button_color IS '按钮背景颜色';
COMMENT ON COLUMN frontend_settings.show_countdown IS '是否显示倒计时';
COMMENT ON COLUMN frontend_settings.preorder_message_template IS '预购提示文案模板';
COMMENT ON COLUMN frontend_settings.custom_css IS '自定义CSS';
COMMENT ON COLUMN frontend_settings.app_extension_enabled IS '是否启用Theme App Extension';

-- 4. 更新时间触发器
CREATE OR REPLACE FUNCTION update_frontend_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_frontend_settings_updated_at
BEFORE UPDATE ON frontend_settings
FOR EACH ROW
EXECUTE FUNCTION update_frontend_settings_updated_at();

-- 5. 为所有现有店铺创建默认配置
INSERT INTO frontend_settings (shop_id)
SELECT id FROM shops
ON CONFLICT (shop_id) DO NOTHING;
