import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { variantId, email, name } = req.body
    const shop = 'arivi-shop.myshopify.com'

    console.log('🧪 开始测试 Draft Order 创建...')
    console.log('参数:', { shop, variantId, email, name })

    // 1. 从数据库获取 access token
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('access_token, scope')
      .eq('shop_domain', shop)
      .single()

    if (shopError || !shopData) {
      console.error('❌ 店铺未找到:', shopError)
      return res.status(404).json({ 
        error: '店铺未找到',
        details: shopError?.message 
      })
    }

    if (!shopData.access_token) {
      console.error('❌ Access Token 不存在')
      return res.status(500).json({ error: 'Access Token 不存在' })
    }

    console.log('✅ Access Token 存在，长度:', shopData.access_token.length)
    console.log('✅ 权限范围:', shopData.scope)

    // 2. 检查权限
    const hasWriteDraftOrders = shopData.scope?.includes('write_draft_orders')
    console.log('✅ 有 write_draft_orders 权限:', hasWriteDraftOrders)

    if (!hasWriteDraftOrders) {
      return res.status(403).json({
        error: '缺少 write_draft_orders 权限',
        currentScope: shopData.scope
      })
    }

    // 3. 准备 Draft Order 数据
    const numericVariantId = parseInt(variantId.toString().replace(/\D/g, ''), 10)
    
    if (isNaN(numericVariantId)) {
      return res.status(400).json({ error: 'Variant ID 格式错误' })
    }

    const draftOrderData = {
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
        email: email,
      }
    }

    console.log('📤 Draft Order 请求数据:', JSON.stringify(draftOrderData, null, 2))

    // 4. 调用 Shopify API
    const apiUrl = `https://${shop}/admin/api/2023-10/draft_orders.json`
    console.log('📡 API URL:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopData.access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draftOrderData)
    })

    const responseText = await response.text()
    console.log('📥 响应状态:', response.status)
    console.log('📥 响应内容:', responseText)

    // 5. 处理响应
    if (response.ok) {
      const draftOrder = JSON.parse(responseText)
      console.log('✅ Draft Order 创建成功!')
      console.log('Draft Order ID:', draftOrder.draft_order.id)
      console.log('Draft Order Name:', draftOrder.draft_order.name)

      return res.status(200).json({
        success: true,
        message: 'Draft Order 创建成功！',
        draftOrder: {
          id: draftOrder.draft_order.id,
          name: draftOrder.draft_order.name,
          admin_url: `https://${shop}/admin/draft_orders/${draftOrder.draft_order.id}`,
        },
        debug: {
          hasAccessToken: true,
          hasWritePermission: hasWriteDraftOrders,
          variantId: numericVariantId,
          apiUrl,
        }
      })
    } else {
      console.error('❌ Draft Order 创建失败')
      
      let errorDetails
      try {
        errorDetails = JSON.parse(responseText)
      } catch {
        errorDetails = responseText
      }

      return res.status(response.status).json({
        success: false,
        error: 'Draft Order 创建失败',
        statusCode: response.status,
        details: errorDetails,
        debug: {
          hasAccessToken: true,
          hasWritePermission: hasWriteDraftOrders,
          variantId: numericVariantId,
          apiUrl,
        }
      })
    }

  } catch (error: any) {
    console.error('❌ 异常:', error)
    return res.status(500).json({
      error: '服务器错误',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
