-- Create shop_translations table for multi-language support
CREATE TABLE IF NOT EXISTS shop_translations (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL,
  translation_key VARCHAR(255) NOT NULL,
  translation_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of shop, locale, and key
  UNIQUE(shop_id, locale, translation_key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shop_translations_shop_locale 
ON shop_translations(shop_id, locale);

CREATE INDEX IF NOT EXISTS idx_shop_translations_key 
ON shop_translations(translation_key);

-- Add RLS policies
ALTER TABLE shop_translations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access translations for their own shop
CREATE POLICY "Users can access their shop translations" ON shop_translations
  FOR ALL USING (
    shop_id IN (
      SELECT id FROM shops WHERE domain = current_setting('request.jwt.claims', true)::json->>'shop'
    )
  );

-- Add badge configuration columns to product_preorder_configs
ALTER TABLE product_preorder_configs 
ADD COLUMN IF NOT EXISTS badge_position VARCHAR(20) DEFAULT 'top-right',
ADD COLUMN IF NOT EXISTS badge_size VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS badge_style VARCHAR(10) DEFAULT 'rounded',
ADD COLUMN IF NOT EXISTS badge_animation VARCHAR(10) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS badge_custom_css TEXT,
ADD COLUMN IF NOT EXISTS show_countdown BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS countdown_style VARCHAR(20) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS merchant_timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS current_status VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS last_inventory_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS inventory_status JSONB,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON TABLE shop_translations IS 'Stores custom translations for preorder functionality in different languages';
COMMENT ON COLUMN shop_translations.locale IS 'Language code (e.g., en, zh, es, fr, de)';
COMMENT ON COLUMN shop_translations.translation_key IS 'Translation key (e.g., preorder.button.text)';
COMMENT ON COLUMN shop_translations.translation_value IS 'Translated text value';
