# 🔧 Shopify Partner 配置修复指南

## ❌ 你遇到的错误
访问 OAuth 链接时看到：**"Sorry, this shop is currently unavailable."**

## ✅ 已修复的问题
OAuth 重定向 URI 路径已修复：
- ❌ 错误：`/auth/callback`
- ✅ 正确：`/api/auth/callback`

---

## 🛠️ 现在需要在 Shopify Partner 中更新配置

### Step 1: 访问 Shopify Partner Dashboard

1. 登录 https://partners.shopify.com
2. 点击 **Apps**
3. 找到你的预购应用（或创建新的）

---

### Step 2: 更新应用URL设置

在应用设置页面，找到 **App URL** 部分：

#### ✅ 需要配置的 URLs：

1. **App URL**（应用首页）:
   ```
   https://shopmall.dpdns.org/admin
   ```

2. **Allowed redirection URL(s)**（重定向白名单）:
   ```
   https://shopmall.dpdns.org/api/auth/callback
   ```

   **重要**：确保是 `/api/auth/callback` 而不是 `/auth/callback`！

---

### Step 3: 配置 API 权限（Scopes）

在 **API access scopes** 部分，确保选中：

必需的权限：
- ✅ `read_products`
- ✅ `write_products`
- ✅ `read_orders`
- ✅ `write_orders`
- ✅ `read_draft_orders`
- ✅ `write_draft_orders`
- ✅ `read_inventory`
- ✅ `write_inventory`

可选的权限（如果需要）：
- ⭕ `read_customers`
- ⭕ `write_customers`
- ⭕ `read_script_tags`
- ⭕ `write_script_tags`

---

### Step 4: 获取 API 凭证

在 **Overview** 或 **API credentials** 部分：

1. **API Key (Client ID)**
   - 复制这个值
   - 设置为 Vercel 环境变量：`SHOPIFY_API_KEY`

2. **API Secret (Client Secret)**
   - 点击 "Reveal" 查看
   - 复制这个值
   - 设置为 Vercel 环境变量：`SHOPIFY_API_SECRET`

---

### Step 5: 验证 Vercel 环境变量

登录 Vercel Dashboard，确保设置了以下环境变量：

```env
# Shopify 凭证
SHOPIFY_API_KEY=你的API_Key
SHOPIFY_API_SECRET=你的API_Secret

# 应用 URL
SHOPIFY_APP_URL=https://shopmall.dpdns.org

# Shopify 权限范围（可选，有默认值）
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_draft_orders,write_draft_orders,read_inventory,write_inventory

# Supabase 配置
SUPABASE_URL=你的Supabase_URL
SUPABASE_SERVICE_ROLE_KEY=你的Supabase_Key
```

**重要**：更新环境变量后，记得在 Vercel 重新部署！

---

### Step 6: 等待 Vercel 重新部署

代码已推送到 GitHub，Vercel 会自动部署。等待 2-3 分钟。

---

### Step 7: 再次测试 OAuth 安装

部署完成后，重新访问：
```
https://shopmall.dpdns.org/api/auth?shop=anvi-shop.myshopify.com
```

#### ✅ 期望看到：

1. **跳转到 Shopify 授权页面**
   - 显示你的应用名称
   - 显示需要的权限列表
   - 有 "Install" 或 "Install app" 按钮

2. **点击 Install 后**
   - 跳转回你的应用
   - URL 类似：`https://shopmall.dpdns.org/api/auth/callback?code=xxx&shop=anvi-shop.myshopify.com`
   - 应该自动重定向到管理界面或显示成功消息

---

## 🐛 如果还是失败

### 检查清单：

1. **Shopify Partner 配置**
   - [ ] Allowed redirection URL 是 `https://shopmall.dpdns.org/api/auth/callback`
   - [ ] App URL 设置为 `https://shopmall.dpdns.org/admin`
   - [ ] API scopes 包含所有必需的权限

2. **Vercel 环境变量**
   - [ ] `SHOPIFY_API_KEY` 正确
   - [ ] `SHOPIFY_API_SECRET` 正确
   - [ ] `SHOPIFY_APP_URL=https://shopmall.dpdns.org`（不要末尾的斜杠）
   - [ ] 已重新部署

3. **测试 API 端点**
   访问这些URL检查是否正常：
   
   ```
   https://shopmall.dpdns.org/api/health
   ```
   应该返回 JSON，例如：`{"status":"ok"}`

4. **查看 Vercel Logs**
   - 访问 Vercel Dashboard
   - 选择你的项目
   - 点击 "Logs" 或 "Functions"
   - 看是否有错误信息

---

## 📸 Shopify Partner 配置截图参考

### App URLs 应该这样配置：

```
┌─────────────────────────────────────────────┐
│ App URL                                     │
│ https://shopmall.dpdns.org/admin            │
│                                             │
│ Allowed redirection URL(s)                  │
│ https://shopmall.dpdns.org/api/auth/callback│
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✨ 成功后的下一步

安装成功后，你可以：

1. **访问管理界面**：
   ```
   https://shopmall.dpdns.org/admin?shop=anvi-shop.myshopify.com
   ```

2. **管理预购产品**
3. **查看订单统计**
4. **配置前端脚本**

---

**需要帮助？** 检查 Vercel Logs 和浏览器控制台的错误信息。
