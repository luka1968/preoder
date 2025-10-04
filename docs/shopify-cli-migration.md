# Shopify CLI Migration Guide

## 概述

本指南帮助你将 PreOrder Pro 项目从传统的 Shopify Partner Dashboard 配置迁移到新的 `shopify.app.toml` 配置模式。

## 新模式的优势

- **单一可信来源**: `shopify.app.toml` 文件统一管理所有配置
- **自动同步**: Partner Dashboard 会自动从配置文件同步更新
- **版本控制**: 配置文件可以纳入 Git 版本控制
- **开发体验**: 更好的本地开发和部署体验

## 迁移步骤

### 1. 安装依赖

```bash
npm install
```

这将安装新添加的 Shopify CLI 依赖：
- `@shopify/cli`: Shopify 官方 CLI 工具
- `@shopify/theme`: 主题开发工具

### 2. 配置 shopify.app.toml

运行配置脚本：

```bash
npm run shopify:setup
```

或手动编辑 `shopify.app.toml` 文件，更新以下字段：

- `client_id`: 你的 Shopify 应用客户端 ID
- `application_url`: 你的应用 URL（Vercel 部署地址）
- `dev_store_url`: 开发商店 URL
- `redirect_urls`: OAuth 回调 URL

### 3. 认证 Shopify CLI

首次使用需要认证：

```bash
npx shopify auth login
```

### 4. 开发模式

使用新的开发命令：

```bash
npm run shopify:dev
```

这将：
- 启动本地开发服务器
- 自动创建 ngrok 隧道
- 更新 Partner Dashboard 配置

### 5. 部署应用

使用 Shopify CLI 部署：

```bash
npm run shopify:deploy
```

## 配置文件说明

### shopify.app.toml 主要配置

```toml
name = "PreOrder Pro"                    # 应用名称
client_id = "YOUR_CLIENT_ID"            # 客户端 ID
application_url = "https://..."         # 应用 URL
embedded = true                         # 嵌入式应用

[access_scopes]
scopes = "write_products,read_products,..." # 权限范围

[auth]
redirect_urls = [...]                   # OAuth 回调 URL

[webhooks]
api_version = "2023-10"                # Webhook API 版本

[web]
frontend = { command = "npm run dev", port = 3000 }
backend = { command = "npm run dev", port = 3000 }
```

## 新的 npm 脚本

项目添加了以下新脚本：

- `npm run shopify:dev`: 启动开发模式
- `npm run shopify:deploy`: 部署应用
- `npm run shopify:info`: 查看应用信息
- `npm run shopify:generate`: 生成扩展
- `npm run shopify:setup`: 配置向导

## 环境变量

确保以下环境变量已正确设置：

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=write_products,read_products,write_orders,read_orders,write_customers,read_customers,write_inventory,read_inventory,write_draft_orders,read_draft_orders
SHOPIFY_APP_URL=https://your-app.vercel.app
```

## 部署流程变化

### 旧流程
1. 手动在 Partner Dashboard 更新 URL
2. 部署到 Vercel
3. 手动测试配置

### 新流程
1. 更新 `shopify.app.toml`
2. 运行 `npm run shopify:deploy`
3. Partner Dashboard 自动同步

## 故障排除

### 常见问题

1. **认证失败**
   ```bash
   npx shopify auth logout
   npx shopify auth login
   ```

2. **配置不同步**
   - 检查 `client_id` 是否正确
   - 确认网络连接正常
   - 重新运行 `shopify:deploy`

3. **开发服务器问题**
   - 确保端口 3000 未被占用
   - 检查防火墙设置
   - 重启开发服务器

### 回滚到旧模式

如果需要回滚：

1. 删除 `shopify.app.toml`
2. 卸载 Shopify CLI 依赖
3. 恢复手动配置模式

## 最佳实践

1. **版本控制**: 将 `shopify.app.toml` 纳入 Git
2. **环境分离**: 为不同环境使用不同配置
3. **定期更新**: 保持 Shopify CLI 版本最新
4. **备份配置**: 保存 Partner Dashboard 配置截图

## 参考资源

- [Shopify CLI 官方文档](https://shopify.dev/docs/apps/tools/cli)
- [shopify.app.toml 配置参考](https://shopify.dev/docs/apps/tools/cli/configuration)
- [应用部署指南](https://shopify.dev/docs/apps/deployment)

---

**注意**: 迁移后，Partner Dashboard 的配置将由 `shopify.app.toml` 文件控制，手动修改将被覆盖。
