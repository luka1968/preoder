-- 企业级预购系统 - 系统日志表
-- Migration: 2024-11-25-create-logs

-- 1. 创建日志表
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- 日志分类
  type TEXT NOT NULL, -- 'inventory_webhook', 'auto_preorder', 'error', 'api_call', 'manual_action'
  action TEXT NOT NULL, -- 'enable', 'disable', 'sync', 'error'
  level TEXT DEFAULT 'info', -- 'info', 'warning', 'error'
  
  -- 关联数据
  product_id TEXT,
  variant_id TEXT,
  order_id TEXT,
  user_email TEXT,
  
  -- 详细信息
  message TEXT,
  payload JSONB,
  error_message TEXT,
  stack_trace TEXT,
  
  -- HTTP 相关（API调用）
  request_method TEXT,
  request_path TEXT,
  response_status INTEGER,
  duration_ms INTEGER,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_logs_shop_id ON logs(shop_id);
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_variant_id ON logs(variant_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_type_created ON logs(shop_id, type, created_at DESC);

-- 3. 注释
COMMENT ON TABLE logs IS '系统操作和错误日志';
COMMENT ON COLUMN logs.type IS '日志类型';
COMMENT ON COLUMN logs.action IS '执行的操作';
COMMENT ON COLUMN logs.level IS '日志级别';
COMMENT ON COLUMN logs.payload IS '完整请求/响应数据';
COMMENT ON COLUMN logs.error_message IS '错误信息';
COMMENT ON COLUMN logs.stack_trace IS '错误堆栈';

-- 4. 自动清理旧日志（保留90天）
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 可以设置定时任务每天执行：
-- SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_logs()');
