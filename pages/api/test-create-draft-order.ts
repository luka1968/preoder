import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 1. 获取店铺信息和 access token
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', shop)
      .single()

    if (shopError || !shopData) {
      return res.status(404).json({
        error: '店铺未找到',
        details: shopError?.message
      })
    }

    console.log('✅ 找到店铺:', shop)
    console.log('📊 店铺数据:', {
      shop_domain: shopData.shop_domain,
      hasAccessToken: !!shopData.access_token,
      scope: shopData.scope
    })

    const accessToken = shopData.access_token

    // 2. 创建 Draft Order 测试
    const testEmail = 'test@example.com'
    const draftOrderData = {
      draft_order: {
        line_items: [
          {
            title: '测试预购商品',
            quantity: 1,
            price: '99.99'
          }
        ],
        customer: {
          email: testEmail
        },
        tags: 'preorder'
      }
    }

    console.log('🔄 正在创建 Draft Order...')
    console.log('📋 Draft Order 数据:', JSON.stringify(draftOrderData, null, 2))

    const draftOrderResponse = await fetch(
      `https://${shop}/admin/api/2023-10/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftOrderData)
      }
    )

    const draftOrderResult = await draftOrderResponse.json()

    if (!draftOrderResponse.ok) {
      console.error('❌ Draft Order 创建失败:', draftOrderResult)
      return res.status(500).json({
        error: 'Draft Order 创建失败',
        details: draftOrderResult,
        accessTokenLength: accessToken?.length
      })
    }

    console.log('✅ Draft Order 创建成功:', draftOrderResult.draft_order.id)

    return res.status(200).json({
      success: true,
      message: 'Draft Order 创建成功！这证明权限和 API 连接都正常',
      draftOrder: {
        id: draftOrderResult.draft_order.id,
        email: draftOrderResult.draft_order.customer?.email,
        lineItems: draftOrderResult.draft_order.line_items,
        tags: draftOrderResult.draft_order.tags
      },
      nextStep: '现在去 Shopify 后台查看，应该能看到这个草稿订单'
    })

  } catch (error: any) {
    console.error('❌ 测试失败:', error)
    return res.status(500).json({
      error: '测试失败',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
