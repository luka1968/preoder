# 数据库迁移脚本执行指南

## 📋 新增表清单（5个）

1. **products_rules** - 详细预购规则配置
2. **logs** - 系统操作和错误日志
3. **webhook_status** - Webhook监控和健康检查
4. **frontend_settings** - 前端Widget样式配置
5. **user_permissions** - 用户角色权限管理

---

## 🚀 执行顺序（重要！）

请按以下顺序在 Supabase SQL Editor 中执行：

### 1. products_rules（详细规则表）
```bash
文件：migrations/20241125_create_products_rules.sql
```
- 会自动迁移现有 `preorder_products` 数据
- 新增详细规则字段（按钮文案、徽章、备注等）

### 2. logs（日志表）
```bash
文件：migrations/20241125_create_logs.sql
```
- 用于记录所有操作
- 自动清理90天前的日志

### 3. webhook_status（webhook监控）
```bash
文件：migrations/20241125_create_webhook_status.sql
```
- 监控 webhook 健康状态
- 自动为现有店铺初始化4个 webhook 记录

### 4. frontend_settings（前端配置）
```bash
文件：migrations/20241125_create_frontend_settings.sql
```
- Widget 样式和显示配置
- 自动为现有店铺创建默认配置

### 5. user_permissions（权限管理）
```bash
文件：migrations/20241125_create_user_permissions.sql
```
- 角色权限系统
- 包含 owner/manager/staff 三种角色

---

## ✅ 验证

执行完成后，检查：

```sql
-- 检查所有表是否创建成功
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'products_rules',
  'logs',
  'webhook_status',
  'frontend_settings',
  'user_permissions'
);

-- 应该返回 5 行

-- 检查索引
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
  'products_rules',
  'logs',
  'webhook_status',
  'frontend_settings',
  'user_permissions'
);

-- 检查数据迁移
SELECT COUNT(*) FROM products_rules;
SELECT COUNT(*) FROM webhook_status;
SELECT COUNT(*) FROM frontend_settings;

-- 应该有数据
```

---

## ⚠️ 注意事项

1. **备份数据** - 执行前建议备份 `preorder_products` 表
2. **顺序执行** - 严格按照上述顺序执行
3. **检查错误** - 每个脚本执行后检查是否有错误
4. **依赖关系** - 所有表都依赖 `shops` 表的外键

---

## 🔄 回滚（如果需要）

如果出现问题，可以执行：

```sql
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS frontend_settings CASCADE;
DROP TABLE IF EXISTS webhook_status CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS products_rules CASCADE;
```

---

## 📞 执行完成后

告诉我"数据库迁移完成"，我将继续开发后端API和UI界面！
