-- 企业级预购系统 - 用户权限表
-- Migration: 2024-11-25-create-user-permissions

-- 1. 创建权限表
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- 用户信息
  user_email TEXT NOT NULL,
  user_name TEXT,
  
  -- 角色
  role TEXT DEFAULT 'staff', -- 'owner', 'manager', 'staff'
  
  -- 详细权限（JSONB 格式）
  permissions JSONB DEFAULT '{
    "products": {"read": true, "write": false, "delete": false},
    "orders": {"read": true, "write": false, "delete": false},
    "settings": {"read": false, "write": false, "delete": false},
    "logs": {"read": false, "write": false, "delete": false},
    "users": {"read": false, "write": false, "delete": false}
  }'::jsonb,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(shop_id, user_email)
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_user_permissions_shop_id ON user_permissions(shop_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_email ON user_permissions(user_email);
CREATE INDEX IF NOT EXISTS idx_user_permissions_role ON user_permissions(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_active ON user_permissions(is_active);

-- 3. 注释
COMMENT ON TABLE user_permissions IS '用户角色和权限管理';
COMMENT ON COLUMN user_permissions.role IS '用户角色：owner/manager/staff';
COMMENT ON COLUMN user_permissions.permissions IS '详细权限配置（JSONB）';

-- 4. 更新时间触发器
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_permissions_updated_at
BEFORE UPDATE ON user_permissions
FOR EACH ROW
EXECUTE FUNCTION update_user_permissions_updated_at();

-- 5. 创建角色权限模板函数
CREATE OR REPLACE FUNCTION get_role_permissions(role_name TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE role_name
    WHEN 'owner' THEN '{
      "products": {"read": true, "write": true, "delete": true},
      "orders": {"read": true, "write": true, "delete": true},
      "settings": {"read": true, "write": true, "delete": true},
      "logs": {"read": true, "write": false, "delete": true},
      "users": {"read": true, "write": true, "delete": true}
    }'::jsonb
    WHEN 'manager' THEN '{
      "products": {"read": true, "write": true, "delete": false},
      "orders": {"read": true, "write": true, "delete": false},
      "settings": {"read": true, "write": true, "delete": false},
      "logs": {"read": true, "write": false, "delete": false},
      "users": {"read": true, "write": false, "delete": false}
    }'::jsonb
    WHEN 'staff' THEN '{
      "products": {"read": true, "write": false, "delete": false},
      "orders": {"read": true, "write": false, "delete": false},
      "settings": {"read": false, "write": false, "delete": false},
      "logs": {"read": false, "write": false, "delete": false},
      "users": {"read": false, "write": false, "delete": false}
    }'::jsonb
    ELSE '{}'::jsonb
  END;
END;
$$ LANGUAGE plpgsql;

-- 6. 为每个店铺创建默认 owner（从 shops 表获取店主信息）
-- 注意：需要 shops 表有 owner_email 字段
-- INSERT INTO user_permissions (shop_id, user_email, user_name, role, permissions)
-- SELECT id, owner_email, owner_name, 'owner', get_role_permissions('owner')
-- FROM shops
-- WHERE owner_email IS NOT NULL
-- ON CONFLICT (shop_id, user_email) DO NOTHING;
