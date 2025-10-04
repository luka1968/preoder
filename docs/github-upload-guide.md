# GitHub 上传安全指南

## 🚨 上传前必读

在将代码上传到 GitHub 之前，请务必完成以下安全检查，确保敏感信息不会泄露。

## 🔐 敏感信息清单

以下信息**绝对不能**出现在 GitHub 代码中：

### Shopify 配置
- ✅ **Client ID**: `your_client_id_here` (可以在 shopify.app.toml 中)
- ❌ **Client Secret**: `your_client_secret_here` (敏感信息)

### Supabase 配置
- ❌ **URL**: `https://your-project.supabase.co`
- ❌ **Anon Key**: `your_anon_key_here`
- ❌ **Service Role Key**: `your_service_role_key_here`

### Brevo 配置
- ❌ **API Key**: `your_brevo_api_key_here`

## 🛡️ 安全检查步骤

### 1. 运行安全检查脚本

```bash
npm run security:check
```

这个脚本会扫描所有文件，检测是否包含敏感信息。

### 2. 检查 .gitignore 配置

确保以下文件被忽略：

```gitignore
# 环境变量文件
.env*.local
.env
.env.production
.env.deploy

# Vercel 配置
.vercel

# Supabase 本地配置
.supabase/
```

### 3. 验证敏感文件状态

```bash
# 检查哪些文件会被提交
git status

# 确保敏感文件不在列表中
git ls-files | grep -E "\.(env|local)$"
```

## 📋 上传前检查清单

- [ ] 运行 `npm run security:check` 通过
- [ ] `.env.local` 文件不存在或已被 `.gitignore` 忽略
- [ ] 代码中没有硬编码的 API 密钥
- [ ] `shopify.app.toml` 只包含 Client ID
- [ ] 所有敏感信息已记录在 `docs/vercel-environment-variables.md`

## 🚀 GitHub 上传步骤

### 1. 初始化 Git 仓库（如果尚未初始化）

```bash
git init
git add .
git commit -m "Initial commit: PreOrder Pro Shopify App"
```

### 2. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击 "New repository"
3. 仓库名称：`preorder-pro`
4. 设置为 **Private**（推荐）
5. 不要初始化 README（本地已有）

### 3. 连接远程仓库

```bash
git remote add origin https://github.com/your-username/preorder-pro.git
git branch -M main
git push -u origin main
```

### 4. 验证上传结果

- 检查 GitHub 仓库中没有敏感文件
- 确认 `.env` 相关文件未被上传
- 验证代码结构完整

## 🔧 Vercel 部署配置

### 1. 连接 GitHub 仓库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 框架预设选择 "Next.js"

### 2. 配置环境变量

在 Vercel 项目设置中添加所有环境变量：

```bash
# 参考 docs/vercel-environment-variables.md 中的完整列表
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
# ... 其他变量
```

### 3. 更新应用 URL

获得 Vercel 部署 URL 后，更新以下配置：

1. **Shopify Partner Dashboard**:
   - App URL: `https://your-app.vercel.app`
   - Allowed redirection URLs: `https://your-app.vercel.app/api/auth/callback`

2. **本地 shopify.app.toml**:
   ```toml
   application_url = "https://your-app.vercel.app"
   ```

## 🔄 后续更新流程

### 代码更新

```bash
git add .
git commit -m "描述你的更改"
git push origin main
```

### 环境变量更新

1. 在 Vercel Dashboard 中更新
2. 触发重新部署
3. 不要在代码中硬编码

## 🚨 紧急情况处理

### 如果意外上传了敏感信息

1. **立即删除仓库**（如果是新仓库）
2. **或者清理 Git 历史**：
   ```bash
   # 从历史中完全删除敏感文件
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env.local' \
   --prune-empty --tag-name-filter cat -- --all
   
   # 强制推送清理后的历史
   git push origin --force --all
   ```

3. **重新生成所有密钥**：
   - Shopify: 重新生成 Client Secret
   - Supabase: 重置 Service Role Key
   - Brevo: 重新生成 API Key

## 📞 支持

如果在上传过程中遇到问题：

1. 检查安全检查脚本输出
2. 验证 .gitignore 配置
3. 确认环境变量配置正确
4. 查看 Vercel 部署日志

---

**记住**: 安全第一！宁可多检查几遍，也不要泄露敏感信息。
