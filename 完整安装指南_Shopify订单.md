# 🎯 完整安装指南 - 让预购订单显示在Shopify后台

## 📋 第一步：创建数据库表

1. 打开 Supabase 控制台
2. 进入 **SQL Editor**
3. 复制并运行 `supabase-shops-table.sql` 文件内容
4. ✅ 确认 `shops` 表创建成功

## 🚀 第二步：推送代码到 Vercel

```bash
git add .
git commit -m "添加OAuth安装功能"
git push
```

Vercel 会自动部署，等待部署完成。

## 🔧 第三步：配置 Shopify App（如果还没配置）

### 在 Shopify Partners 后台：

1. 进入你的 App 设置
2. 配置 **App URL**:
   ```
   https://你的域名.vercel.app/install
   ```

3. 配置 **Allowed redirection URL(s)**:
   ```
   https://你的域名.vercel.app/api/auth/callback
   ```

4. 保存设置

## 🎉 第四步：安装 App 到你的店铺

### 方法1：通过安装页面（推荐）

1. 访问: `https://你的域名.vercel.app/install`
2. 输入你的店铺域名（例如：mystore.myshopify.com）
3. 点击"安装到 Shopify"
4. 在 Shopify 授权页面点击"安装"
5. ✅ 安装成功！

### 方法2：直接访问安装URL

访问以下URL（替换你的信息）:
```
https://你的域名.vercel.app/api/auth/install?shop=你的店铺.myshopify.com
```

## ✅ 第五步：验证安装

### 检查数据库：

1. 打开 Supabase 控制台
2. 进入 **Table Editor**
3. 查看 `shops` 表
4. 确认你的店铺记录存在，并且有 `access_token`

### 测试预购功能：

1. 在你的 Shopify 店铺找一个库存为0的产品
2. 点击"预购"按钮
3. 填写邮箱提交
4. 🎯 **去 Shopify 后台查看**：
   - 进入 **订单** → **草稿订单**
   - 查找带有 **"preorder"** 标签的订单
   - ✅ 应该能看到刚才的预购订单！

## 🔍 故障排查

### 如果看不到 Shopify 订单：

1. **检查 shops 表**
   ```sql
   SELECT * FROM shops WHERE shop_domain = '你的店铺.myshopify.com';
   ```
   确认有 access_token

2. **检查 Vercel 日志**
   - 进入 Vercel 项目
   - 查看 Functions 日志
   - 搜索 "Draft Order" 相关日志

3. **检查权限范围**
   - 确认 SHOPIFY_SCOPES 包含 `write_orders`
   - 如果不包含，需要重新安装 App

### 如果安装失败：

1. 检查 Vercel 环境变量：
   - ✅ SHOPIFY_API_KEY
   - ✅ SHOPIFY_API_SECRET
   - ✅ SHOPIFY_APP_URL（你的 Vercel 域名）
   - ✅ SHOPIFY_SCOPES

2. 检查 Shopify Partners 后台：
   - ✅ App URL 配置正确
   - ✅ Redirect URL 配置正确

## 📊 预期结果

安装成功后，每次用户提交预购：

1. ✅ 保存到 Supabase `preorders` 表
2. ✅ 在 Shopify 后台创建草稿订单
3. ✅ 草稿订单带有 "preorder" 标签
4. ✅ 包含客户邮箱和产品信息

## 🎊 完成！

现在你的预购系统已经完全集成到 Shopify 了！

每个预购都会：
- 显示在你的管理页面
- 显示在 Shopify 后台
- 可以直接在 Shopify 处理订单
