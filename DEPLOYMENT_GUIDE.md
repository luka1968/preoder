# 🚀 PreOrder Pro 部署指南

## ⚠️ 重要：避免404错误的部署步骤

### 📋 部署前检查清单

#### ✅ 1. 确保应用正常运行
```bash
# 检查应用健康状态
curl http://localhost:3000/api/health

# 测试预购API
curl -X POST http://localhost:3000/api/preorder/create \
  -H "Content-Type: application/json" \
  -d '{"shop":"test.myshopify.com","productId":"123","email":"test@test.com"}'
```

#### ✅ 2. 验证环境变量配置
确保以下环境变量已正确设置：
```env
# 必需的Shopify配置
NEXT_PUBLIC_SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret

# 应用URL（重要！）
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
SHOPIFY_APP_URL=https://your-domain.vercel.app
```

### 🌐 部署到Vercel

#### 步骤1：准备部署
```bash
# 1. 提交所有更改
git add .
git commit -m "feat: Complete PreOrder Pro implementation"
git push

# 2. 部署到Vercel
vercel --prod
```

#### 步骤2：配置环境变量
在Vercel Dashboard中设置：
- `NEXT_PUBLIC_SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `NEXT_PUBLIC_APP_URL`

#### 步骤3：更新Shopify应用配置
在Shopify Partner Dashboard中更新：
- **App URL**: `https://your-domain.vercel.app`
- **Allowed redirection URLs**: 
  - `https://your-domain.vercel.app/api/auth/callback`
  - `https://your-domain.vercel.app/api/auth/shopify/callback`

### 🔧 Shopify主题集成

#### 方法1：直接添加脚本（推荐）
在主题的 `theme.liquid` 文件的 `</head>` 前添加：
```html
<!-- PreOrder Pro 预购插件 -->
<script>
  window.PREORDER_API_URL = 'https://your-domain.vercel.app/api';
</script>
<script src="https://your-domain.vercel.app/shopify-integration.js"></script>
```

#### 方法2：条件加载（更安全）
```liquid
{% comment %} 只在产品页面加载预购脚本 {% endcomment %}
{% if template contains 'product' %}
  <script>
    window.PREORDER_API_URL = 'https://your-domain.vercel.app/api';
  </script>
  <script src="https://your-domain.vercel.app/shopify-integration.js"></script>
{% endif %}
```

### 🧪 部署后测试

#### 1. 基本功能测试
- [ ] 访问 `https://your-domain.vercel.app`
- [ ] 检查应用在Shopify Admin中是否正常加载
- [ ] 测试预购API端点

#### 2. Shopify集成测试
- [ ] 在开发商店中安装应用
- [ ] 添加预购脚本到主题
- [ ] 访问缺货商品页面
- [ ] 验证预购按钮显示
- [ ] 测试预购表单提交

#### 3. 错误排查
如果遇到404错误：

**检查应用URL配置**：
```bash
# 验证应用响应
curl https://your-domain.vercel.app/api/health
```

**检查Shopify配置**：
- Partner Dashboard中的App URL是否正确
- 重定向URL是否包含正确的域名
- API密钥是否正确设置

**检查主题集成**：
- 脚本URL是否正确
- 是否有JavaScript错误
- 网络请求是否成功

### 🔒 安全注意事项

#### 1. API密钥保护
- ✅ 使用环境变量存储敏感信息
- ✅ 不要在前端代码中暴露API密钥
- ✅ 定期轮换API密钥

#### 2. CORS配置
API已配置适当的CORS头：
```javascript
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
```

### 📊 监控和维护

#### 健康检查端点
- **URL**: `https://your-domain.vercel.app/api/health`
- **用途**: 监控应用状态
- **响应**: JSON格式的健康状态

#### 日志监控
在Vercel Dashboard中查看：
- 函数日志
- 错误报告
- 性能指标

### 🆘 常见问题解决

#### Q: Shopify Admin中点击应用出现404
**解决方案**：
1. 检查Partner Dashboard中的App URL配置
2. 确保应用已正确部署到指定域名
3. 验证环境变量设置

#### Q: 预购按钮不显示
**解决方案**：
1. 检查主题中的脚本是否正确加载
2. 查看浏览器控制台是否有错误
3. 确认商品确实缺货

#### Q: 预购API调用失败
**解决方案**：
1. 检查API端点是否可访问
2. 验证请求格式是否正确
3. 查看服务器日志了解错误详情

### 📞 技术支持

如果遇到问题，请检查：
1. **应用健康状态**: `https://your-domain.vercel.app/api/health`
2. **测试页面**: `https://your-domain.vercel.app/test-preorder`
3. **浏览器控制台**：查看JavaScript错误
4. **Vercel日志**：查看服务器端错误

---

**重要提醒**: 部署前请务必在本地环境完成所有测试，确保功能正常后再部署到生产环境。
