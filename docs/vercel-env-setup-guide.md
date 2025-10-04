# 🔧 Vercel 环境变量配置详细指南

## 🎯 为什么必须手动配置？

环境变量包含敏感信息（API密钥、数据库密码等），出于安全考虑：
- ❌ **不能**自动部署到Vercel
- ❌ **不能**提交到Git仓库
- ✅ **必须**手动在Vercel Dashboard中配置
- ✅ **必须**为每个环境单独设置

## 📋 完整配置步骤

### **第1步：获取所需的密钥**

#### 🏪 **Shopify Partner Dashboard**
```
1. 访问 https://partners.shopify.com
2. 登录你的Partner账号
3. 点击 "Apps" → "Create app"
4. 创建应用后，在 "App setup" 页面找到:
   - API key (复制这个)
   - API secret key (复制这个)
```

#### 🗄️ **Supabase Dashboard**
```
1. 访问 https://supabase.com
2. 登录并选择你的项目
3. 点击左侧 "Settings" → "API"
4. 复制以下内容:
   - Project URL
   - anon public key
   - service_role secret key
```

#### 🔐 **生成安全密钥**
```bash
# 在项目根目录运行
npm run secrets:generate

# 复制输出的密钥，特别是:
# JWT_SECRET=...
# CRON_SECRET=...
# SHOPIFY_WEBHOOK_SECRET=...
```

### **第2步：在 Vercel 中配置环境变量**

#### **方法A：Vercel Dashboard (推荐新手)**

1. **访问项目设置**
   ```
   https://vercel.com → 选择项目 → Settings → Environment Variables
   ```

2. **添加每个环境变量**
   ```
   点击 "Add New" 按钮，逐个添加：
   
   Name: SHOPIFY_API_KEY
   Value: [粘贴从Partner Dashboard复制的API Key]
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: SHOPIFY_API_SECRET
   Value: [粘贴从Partner Dashboard复制的API Secret]
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [粘贴Supabase项目URL]
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [粘贴Supabase anon key]
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: [粘贴Supabase service role key]
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: JWT_SECRET
   Value: [粘贴生成的JWT密钥]
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: SHOPIFY_SCOPES
   Value: read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: SHOPIFY_APP_URL
   Value: https://your-app-name.vercel.app
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: CRON_SECRET
   Value: [粘贴生成的Cron密钥]
   Environments: ✓ Production ✓ Preview ✓ Development
   
   Name: SHOPIFY_WEBHOOK_SECRET
   Value: [粘贴生成的Webhook密钥]
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

#### **方法B：Vercel CLI (推荐有经验用户)**

1. **安装并登录 Vercel CLI**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 登录
   vercel login
   
   # 链接到项目
   vercel link
   ```

2. **使用自动配置脚本**
   ```bash
   # 运行配置脚本
   bash scripts/setup-vercel-env.sh
   
   # 或者手动添加
   vercel env add SHOPIFY_API_KEY
   vercel env add SHOPIFY_API_SECRET
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # ... 其他变量
   ```

### **第3步：验证配置**

#### **重新部署应用**
```bash
# 方法1: 推送代码触发自动部署
git add .
git commit -m "Update environment variables"
git push origin main

# 方法2: 使用 Vercel CLI 手动部署
vercel --prod
```

#### **测试环境变量**
```bash
# 测试健康检查端点
curl https://your-app-name.vercel.app/api/health

# 预期响应:
{
  "status": "healthy",
  "environment_health": {
    "status": "healthy",
    "message": "All environment variables are properly configured"
  }
}
```

## 🔍 常见问题解决

### **问题1: 环境变量未生效**
```bash
# 解决方案:
1. 检查变量名拼写是否正确
2. 确保选择了所有环境 (Production, Preview, Development)
3. 重新部署应用
4. 清除浏览器缓存
```

### **问题2: API 返回 401 错误**
```bash
# 检查:
1. SHOPIFY_API_KEY 和 SHOPIFY_API_SECRET 是否正确
2. Shopify App URL 是否与 SHOPIFY_APP_URL 一致
3. 权限范围 (Scopes) 是否正确设置
```

### **问题3: 数据库连接失败**
```bash
# 检查:
1. NEXT_PUBLIC_SUPABASE_URL 格式是否正确
2. SUPABASE_SERVICE_ROLE_KEY 是否有效
3. Supabase 项目是否正常运行
```

### **问题4: JWT 错误**
```bash
# 检查:
1. JWT_SECRET 长度是否至少32字符
2. 是否使用了安全的随机字符串
3. 所有环境的JWT_SECRET是否一致
```

## 📱 环境变量管理最佳实践

### **1. 安全原则**
```bash
✅ 使用强随机密钥 (64字符+)
✅ 定期轮换敏感密钥
✅ 不同环境使用不同密钥
✅ 限制访问权限

❌ 不要在代码中硬编码
❌ 不要提交到Git
❌ 不要在日志中输出
❌ 不要使用弱密码
```

### **2. 环境分离**
```bash
Production:   真实的生产环境密钥
Preview:      测试环境密钥 (可以与开发环境共享)
Development:  本地开发密钥
```

### **3. 备份和恢复**
```bash
# 导出环境变量 (用于备份)
vercel env pull .env.backup

# 批量导入环境变量
vercel env add < env-list.txt
```

## 🚀 部署后检查清单

### **✅ 必须验证的项目**
- [ ] 所有环境变量都已在Vercel中配置
- [ ] 应用成功部署且无错误
- [ ] `/api/health` 端点返回 "healthy" 状态
- [ ] Shopify App 可以正常安装
- [ ] 数据库连接正常
- [ ] 邮件发送功能正常

### **🔧 调试命令**
```bash
# 查看环境变量列表
vercel env ls

# 查看特定变量
vercel env get SHOPIFY_API_KEY

# 删除错误的变量
vercel env rm VARIABLE_NAME

# 查看部署日志
vercel logs
```

## 📞 获取帮助

如果遇到问题，可以：
1. 查看 Vercel 部署日志
2. 检查 `/api/health` 端点响应
3. 参考 `docs/deployment-guide.md`
4. 联系 Vercel 技术支持

---

**🎯 记住：环境变量配置是部署成功的关键步骤，必须仔细完成每一项！**
