# 创建 Custom App 用于测试

## 为什么需要 Custom App？

Custom App 的优势：
- ✅ 配置更灵活，可以随时修改
- ✅ 不需要审核，立即可用
- ✅ 专门用于测试，不影响正式应用
- ✅ 可以直接在 Shopify 后台创建

## 步骤 1：在 Shopify 后台创建 Custom App

### 1.1 进入 Shopify 后台
```
https://admin.shopify.com/store/arivi-shop
```

### 1.2 进入 Apps 设置
1. 点击左侧菜单 **"Settings"**
2. 点击 **"Apps and sales channels"**
3. 点击 **"Develop apps"** 或 **"开发应用"**

### 1.3 创建新应用
1. 点击 **"Create an app"** 或 **"创建应用"**
2. 输入应用名称：`PreOrder Pro Test`
3. 点击 **"Create app"**

### 1.4 配置 API 权限
1. 点击 **"Configure Admin API scopes"**
2. 选择以下权限：
   ```
   ✅ read_products
   ✅ write_products
   ✅ read_orders
   ✅ write_orders
   ✅ read_draft_orders
   ✅ write_draft_orders
   ✅ read_inventory
   ✅ write_inventory
   ✅ read_customers
   ✅ write_customers
   ```
3. 点击 **"Save"**

### 1.5 安装应用
1. 点击 **"Install app"**
2. 确认权限
3. 安装完成后，会显示 **Admin API access token**
4. **⚠️ 重要：复制并保存这个 token！**

## 步骤 2：更新 Vercel 环境变量

使用 Custom App 的 Access Token：

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 找到或添加以下变量：

```env
# Custom App 的 Access Token
SHOPIFY_CUSTOM_APP_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxx

# 或者直接替换原来的（用于测试）
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxx
```

## 步骤 3：修改代码使用 Custom App Token

### 选项 A：创建专门的测试 API

创建 `pages/api/preorder/create-test.ts`：

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shop, productId, variantId, email, name } = req.body

    // 使用 Custom App Token（不需要从数据库查询）
    const accessToken = process.env.SHOPIFY_CUSTOM_APP_TOKEN

    if (!accessToken) {
      return res.status(500).json({ error: 'Custom App Token 未配置' })
    }

    // 保存到数据库
    const { data: preorder, error: dbError } = await supabaseAdmin
      .from('preorders')
      .insert([{
        shop_domain: shop,
        product_id: productId,
        variant_id: variantId,
        customer_email: email,
        customer_name: name,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (dbError) {
      console.error('数据库错误:', dbError)
      return res.status(500).json({ error: '保存失败' })
    }

    // 创建 Draft Order
    if (variantId) {
      const numericVariantId = parseInt(variantId.toString().replace(/\D/g, ''), 10)
      
      const draftOrderResponse = await fetch(
        `https://${shop}/admin/api/2023-10/draft_orders.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draft_order: {
              line_items: [{
                variant_id: numericVariantId,
                quantity: 1,
              }],
              customer: {
                email: email,
                first_name: name || email.split('@')[0],
              },
              tags: 'preorder,test',
              note: `测试预购订单 - ${email}`,
            }
          })
        }
      )

      if (draftOrderResponse.ok) {
        const draftOrder = await draftOrderResponse.json()
        
        // 更新数据库
        await supabaseAdmin
          .from('preorders')
          .update({
            shopify_draft_order_id: draftOrder.draft_order.id.toString(),
            shopify_draft_order_name: draftOrder.draft_order.name,
          })
          .eq('id', preorder.id)

        return res.status(200).json({
          success: true,
          message: '预购成功！Draft Order 已创建',
          preorder: {
            id: preorder.id,
            draftOrderId: draftOrder.draft_order.id,
            draftOrderName: draftOrder.draft_order.name,
          }
        })
      } else {
        const errorText = await draftOrderResponse.text()
        console.error('Draft Order 创建失败:', errorText)
        
        return res.status(200).json({
          success: true,
          message: '预购已保存，但 Draft Order 创建失败',
          preorder: { id: preorder.id },
          error: errorText
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: '预购已保存',
      preorder: { id: preorder.id }
    })

  } catch (error: any) {
    console.error('错误:', error)
    return res.status(500).json({ error: error.message })
  }
}
```

### 选项 B：直接使用 Custom App Token（临时测试）

修改 `pages/api/preorder/create.ts`，在获取 access token 的地方添加：

```typescript
// 优先使用 Custom App Token（用于测试）
const accessToken = process.env.SHOPIFY_CUSTOM_APP_TOKEN || shopData?.access_token
```

## 步骤 4：测试

1. 部署代码到 Vercel
2. 访问测试页面：
   ```
   https://shopmall.dpdns.org/test-draft-order
   ```
3. 填写产品信息并测试

## Custom App vs Partner App

| 特性 | Custom App | Partner App |
|------|-----------|-------------|
| 创建位置 | Shopify 后台 | Partner Dashboard |
| 安装方式 | 直接安装 | OAuth 流程 |
| 配置修改 | 随时修改 | 需要新版本 |
| 适用范围 | 单个店铺 | 多个店铺 |
| Access Token | 永久有效 | OAuth 获取 |
| 适合场景 | 测试、私有应用 | 公开发布 |

## 优势

使用 Custom App 进行测试：
- ✅ 不需要处理 OAuth 流程
- ✅ 不需要配置 Redirect URLs
- ✅ Access Token 永久有效
- ✅ 可以快速测试 Draft Order 创建
- ✅ 不影响正式的 Partner App

## 注意事项

⚠️ Custom App 的 Access Token 非常重要：
- 不要泄露给他人
- 不要提交到 Git
- 只在 Vercel 环境变量中配置
- 定期轮换 Token

## 完成后

Custom App 配置完成后，你就可以：
1. 直接测试 Draft Order 创建
2. 不用担心 OAuth 配置问题
3. 快速验证预购功能
4. 确认代码逻辑正确后，再处理 Partner App 的配置
