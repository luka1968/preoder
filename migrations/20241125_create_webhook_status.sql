-- 企业级预购系统 - Webhook 监控表
-- Migration: 2024-11-25-create-webhook-status

-- 1. 创建 webhook 状态表
CREATE TABLE IF NOT EXISTS webhook_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- Webhook 信息
  topic TEXT NOT NULL, -- 'inventory_levels/update', 'products/update', 'orders/create'
  webhook_id TEXT, -- Shopify webhook ID
  
  -- 监控数据
  last_received_at TIMESTAMP,
  last_success_at TIMESTAMP,
  last_failure_at TIMESTAMP,
  
  -- 统计
  total_received INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  -- 最后的请求/错误
  last_payload JSONB,
  last_error TEXT,
  last_status_code INTEGER,
  
  -- 健康状态
  is_healthy BOOLEAN DEFAULT true,
  is_registered BOOLEAN DEFAULT false,
  
  -- 性能指标
  avg_process_time_ms INTEGER,
  max_process_time_ms INTEGER,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(shop_id, topic)
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_webhook_status_shop_id ON webhook_status(shop_id);
CREATE INDEX IF NOT EXISTS idx_webhook_status_topic ON webhook_status(topic);
CREATE INDEX IF NOT EXISTS idx_webhook_status_healthy ON webhook_status(is_healthy);
CREATE INDEX IF NOT EXISTS idx_webhook_status_last_received ON webhook_status(last_received_at DESC);

-- 3. 注释
COMMENT ON TABLE webhook_status IS 'Webhook 健康监控和统计';
COMMENT ON COLUMN webhook_status.topic IS 'Webhook 主题';
COMMENT ON COLUMN webhook_status.is_healthy IS '是否健康（1小时内有接收）';
COMMENT ON COLUMN webhook_status.is_registered IS '是否已在Shopify注册';

-- 4. 更新时间触发器
CREATE OR REPLACE FUNCTION update_webhook_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_webhook_status_updated_at
BEFORE UPDATE ON webhook_status
FOR EACH ROW
EXECUTE FUNCTION update_webhook_status_updated_at();

-- 5. 为每个店铺初始化默认 webhook 状态
INSERT INTO webhook_status (shop_id, topic, is_registered)
SELECT id, 'inventory_levels/update', false FROM shops
ON CONFLICT (shop_id, topic) DO NOTHING;

INSERT INTO webhook_status (shop_id, topic, is_registered)
SELECT id, 'products/update', false FROM shops
ON CONFLICT (shop_id, topic) DO NOTHING;

INSERT INTO webhook_status (shop_id, topic, is_registered)
SELECT id, 'orders/create', false FROM shops
ON CONFLICT (shop_id, topic) DO NOTHING;

INSERT INTO webhook_status (shop_id, topic, is_registered)
SELECT id, 'app/uninstalled', false FROM shops
ON CONFLICT (shop_id, topic) DO NOTHING;
