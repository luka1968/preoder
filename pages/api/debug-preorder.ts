import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { shop } = req.query

    if (!shop) {k哦
      return res.status(400).json({ error: '请提供店铺域名 ?shop=xxx' })
    }

    // 1. 检查 shops 表
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', shop)
      .single()

    if (shopError || !shopData) {
      return res.status(200).json({
        success: false,
        error: '店铺未找到',
        shop_domain: shop
      })
    }

    // 2. 检查最近的预购记录
    const { data: preorders, error: preordersError } = await supabaseAdmin
      .from('preorders')
      .select('*')
      .eq('shop_domain', shop)
      .order('created_at', { ascending: false })
      .limit(5)

    // 3. 测试创建 Draft Order
    const testVariantId = req.query.variantId
    let testResult = null

    if (testVariantId) {
      try {
        const draftOrderResponse = await fetch(
          `https://${shop}/admin/api/2024-01/draft_orders.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': shopData.access_token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              draft_order: {
                line_items: [
                  {
                    variant_id: testVariantId,
                    quantity: 1,
                  }
                ],
                customer: {
                  email: 'test@example.com',
                  first_name: 'Test',
                },
                tags: 'preorder,test',
                note: `测试预购订单`,
              }
            })
          }
        )

        if (draftOrderResponse.ok) {
          testResult = await draftOrderResponse.json()
        } else {
          const errorText = await draftOrderResponse.text()
          testResult = { error: errorText, status: draftOrderResponse.status }
        }
      } catch (error: any) {
        testResult = { error: error.message }
      }
    }

    return res.status(200).json({
      success: true,
      shop: {
        domain: shopData.shop_domain,
        has_access_token: !!shopData.access_token,
        token_preview: shopData.access_token?.substring(0, 10) + '...',
        scope: shopData.scope,
        active: shopData.active
      },
      preorders: {
        count: preorders?.length || 0,
        recent: preorders?.map(p => ({
          id: p.id,
          email: p.customer_email,
          product_id: p.product_id,
          variant_id: p.variant_id,
          created_at: p.created_at,
          shopify_draft_order_id: p.shopify_draft_order_id,
          shopify_draft_order_name: p.shopify_draft_order_name
        }))
      },
      test_draft_order: testResult
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
