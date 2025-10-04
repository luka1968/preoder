# 🔒 安全配置和环境变量管理指南

## ⚠️ 重要安全原则

### ❌ 绝对不要做的事情
```typescript
// ❌ 永远不要在代码中硬编码敏感信息
const API_KEY = "sk_test_abc123..."
const DATABASE_URL = "postgresql://user:password@host:port/db"
const SECRET_KEY = "my-secret-key-123"

// ❌ 不要在前端代码中暴露后端密钥
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIs..."
```

### ✅ 正确的做法
```typescript
// ✅ 始终使用环境变量
const API_KEY = process.env.SHOPIFY_API_SECRET!
const DATABASE_URL = process.env.SUPABASE_URL!
const SECRET_KEY = process.env.JWT_SECRET!
```

## 📋 环境变量清单

### 🔑 必需的环境变量

#### Shopify App 配置
```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
SHOPIFY_APP_URL=https://your-app.vercel.app
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
```

#### Supabase 数据库配置
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_PROJECT_ID=your-project-id
```

#### 应用安全配置
```env
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
NEXTAUTH_SECRET=your_nextauth_secret_32_characters
NEXTAUTH_URL=https://your-app.vercel.app
CRON_SECRET=your_cron_secret_for_scheduled_tasks
```

#### 邮件服务配置
```env
BREVO_API_KEY=xkeysib-your-brevo-api-key
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password
```

#### 可选配置
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

## 🚀 Vercel 环境变量配置

### 1. 在 Vercel Dashboard 中配置

1. 访问你的 Vercel 项目
2. 点击 **Settings** 标签
3. 选择 **Environment Variables**
4. 逐一添加所有环境变量

### 2. 环境变量类型设置

```bash
# 生产环境变量 (Production)
SHOPIFY_API_KEY=prod_key_here
SHOPIFY_API_SECRET=prod_secret_here

# 预览环境变量 (Preview) 
SHOPIFY_API_KEY=preview_key_here
SHOPIFY_API_SECRET=preview_secret_here

# 开发环境变量 (Development)
SHOPIFY_API_KEY=dev_key_here
SHOPIFY_API_SECRET=dev_secret_here
```

### 3. 使用 Vercel CLI 批量导入

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 从 .env.local 文件导入环境变量
vercel env pull .env.local

# 或者批量添加环境变量
vercel env add SHOPIFY_API_KEY
vercel env add SHOPIFY_API_SECRET
# ... 其他变量
```

## 🔐 代码中的安全实践

### ✅ 正确的环境变量使用

```typescript
// lib/supabase.ts - 正确示例
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 使用断言 (!) 确保变量存在
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}
```

### ✅ API 路由中的安全验证

```typescript
// pages/api/webhooks/orders/create.ts - 正确示例
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 验证 Webhook 签名
  const signature = req.headers['x-shopify-hmac-sha256'] as string
  const body = JSON.stringify(req.body)
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET!
  
  if (!verifyWebhookSignature(body, signature, webhookSecret)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // 处理 webhook...
}
```

### ✅ 前端环境变量使用

```typescript
// 只有 NEXT_PUBLIC_ 前缀的变量可以在前端使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ❌ 这些变量在前端是 undefined
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // undefined in browser
const apiSecret = process.env.SHOPIFY_API_SECRET // undefined in browser
```

## 🛡️ 安全最佳实践

### 1. 密钥轮换
```bash
# 定期更换敏感密钥
# 1. 生成新的密钥
# 2. 在 Vercel 中更新环境变量
# 3. 重新部署应用
# 4. 撤销旧密钥
```

### 2. 权限最小化
```typescript
// 只请求必要的 Shopify 权限
const SHOPIFY_SCOPES = [
  'read_products',
  'write_products', 
  'read_orders',
  'write_orders',
  'read_inventory',
  'write_inventory'
].join(',')
```

### 3. 输入验证和清理
```typescript
// 验证所有输入参数
function validateShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop)
}

// 清理用户输入
function sanitizeInput(input: string): string {
  return input.trim().toLowerCase()
}
```

### 4. 错误处理不泄露信息
```typescript
// ❌ 不要暴露敏感错误信息
catch (error) {
  res.status(500).json({ error: error.message }) // 可能泄露敏感信息
}

// ✅ 使用通用错误消息
catch (error) {
  console.error('Database error:', error) // 只在服务器日志中记录
  res.status(500).json({ error: 'Internal server error' })
}
```

## 🔍 环境变量验证

### 创建验证函数
```typescript
// lib/env-validation.ts
export function validateEnvironmentVariables() {
  const required = [
    'SHOPIFY_API_KEY',
    'SHOPIFY_API_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  // 验证格式
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL!.startsWith('https://')) {
    throw new Error('SUPABASE_URL must be a valid HTTPS URL')
  }
}
```

### 在应用启动时验证
```typescript
// pages/_app.tsx 或 middleware.ts
import { validateEnvironmentVariables } from '../lib/env-validation'

// 只在服务器端验证
if (typeof window === 'undefined') {
  validateEnvironmentVariables()
}
```

## 📝 .env 文件管理

### .env 文件层次结构
```
.env                # 默认环境变量
.env.local          # 本地开发 (不提交到 Git)
.env.development    # 开发环境
.env.production     # 生产环境 (不提交到 Git)
```

### .gitignore 配置
```gitignore
# 环境变量文件
.env.local
.env.production
.env*.local

# 但保留模板文件
!.env.example
```

### 环境变量模板
```bash
# .env.example - 提交到 Git 的模板文件
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# ... 其他变量模板
```

## 🚨 安全检查清单

### ✅ 部署前检查
- [ ] 所有敏感信息都使用环境变量
- [ ] 没有硬编码的 API 密钥或密码
- [ ] .env.local 文件在 .gitignore 中
- [ ] 前端代码不包含后端密钥
- [ ] Webhook 签名验证已实现
- [ ] 输入验证和清理已实现
- [ ] 错误处理不泄露敏感信息

### ✅ 运行时检查
- [ ] 环境变量在 Vercel 中正确配置
- [ ] 所有 API 端点都有适当的认证
- [ ] 数据库连接使用加密连接
- [ ] HTTPS 强制启用
- [ ] CORS 策略正确配置

## 🔧 故障排除

### 常见环境变量问题

1. **环境变量未定义**
```typescript
// 检查环境变量是否存在
console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? 'Set' : 'Not set')
```

2. **前端无法访问环境变量**
```typescript
// 确保使用 NEXT_PUBLIC_ 前缀
const publicVar = process.env.NEXT_PUBLIC_SUPABASE_URL // ✅ 可以在前端使用
const privateVar = process.env.SUPABASE_SERVICE_ROLE_KEY // ❌ 前端为 undefined
```

3. **Vercel 部署后环境变量不生效**
- 检查 Vercel Dashboard 中的环境变量配置
- 确保选择了正确的环境 (Production/Preview/Development)
- 重新部署应用以应用新的环境变量

### 调试命令
```bash
# 本地检查环境变量
node -e "console.log(process.env.SHOPIFY_API_KEY)"

# Vercel 环境变量列表
vercel env ls

# 拉取 Vercel 环境变量到本地
vercel env pull .env.local
```

## 📚 相关资源

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Shopify App 安全最佳实践](https://shopify.dev/apps/best-practices/security)
- [Supabase 安全指南](https://supabase.com/docs/guides/auth/row-level-security)

---

**🔒 记住：安全是第一优先级！永远不要在代码中硬编码敏感信息。**
