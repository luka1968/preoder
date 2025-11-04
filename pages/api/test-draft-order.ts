import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

/**
 * 测试 Draft Order 创建
 * 用于诊断预购订单无法在 Shopify 后台显示的问题
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shop, variantId, email, name } = req.body

    console.log('🧪 测试 Draft Order 创建')
    console.log('参数:', { shop, variantId, email, name })

    // 1. 检查店铺是否存在
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', shop)
      .single()

    if (shopError || !shopData) {
      return res.status(404).json({ 
        error: '店铺未找到',
        details: shopError?.message,
        shop 
      })
    }

    console.log('✅ 店铺找到:', shopData.shop_domain)
    console.log('Access Token 存在:', !!shopData.access_token)

    if (!shopData.access_token) {
      return res.status(400).json({ 
        error: '店铺未授权',
        message: '请先完成 OAuth 授权'
      })
    }

    // 2. 测试 Shopify API 连接
    console.log('🔍 测试 Shopify API 连接...')
    
    const shopInfoResponse = await fetch(
      `https://${shop}/admin/api/2023-10/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': shopData.access_token,
        }
      }
    )

    if (!shopInfoResponse.ok) {
      const errorText = await shopInfoResponse.text()
      return res.status(500).json({
        error: 'Shopify API 连接失败',
        status: shopInfoResponse.status,
        details: errorText
      })
    }

    const shopInfo = await shopInfoResponse.json()
    console.log('✅ Shopify API 连接成功:', shopInfo.shop.name)

    // 3. 获取变体信息
    if (variantId) {
      console.log('🔍 获取变体信息...')
      const numericVariantId = parseInt(variantId.toString().replace(/\D/g, ''), 10)
      
      const variantResponse = await fetch(
        `https://${shop}/admin/api/2023-10/variants/${numericVariantId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': shopData.access_token,
          }
        }
      )

      if (variantResponse.ok) {
        const variantData = await variantResponse.json()
        console.log('✅ 变体信息:', {
          id: variantData.variant.id,
          title: variantData.variant.title,
          price: variantData.variant.price,
          product_id: variantData.variant.product_id
        })
      } else {
        const errorText = await variantResponse.text()
        console.log('⚠️ 无法获取变体信息:', errorText)
      }
    }

    // 4. 创建 Draft Order
    console.log('📝 创建 Draft Order...')
    
    const numericVariantId = parseInt(variantId.toString().replace(/\D/g, ''), 10)
    
    const draftOrderPayload = {
      draft_order: {
        line_items: [
          {
            variant_id: numericVariantId,
            quantity: 1,
          }
        ],
        customer: {
          email: email,
          first_name: name || email.split('@')[0],
        },
        tags: 'preorder,test',
        note: `测试预购订单 - 客户邮箱: ${email}`,
        email: email,
      }
    }

    console.log('Draft Order 请求体:', JSON.stringify(draftOrderPayload, null, 2))

    const draftOrderResponse = await fetch(
      `https://${shop}/admin/api/2023-10/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopData.access_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftOrderPayload)
      }
    )

    const responseText = await draftOrderResponse.text()
    console.log('Draft Order 响应状态:', draftOrderResponse.status)
    console.log('Draft Order 响应内容:', responseText)

    if (!draftOrderResponse.ok) {
      return res.status(500).json({
        error: 'Draft Order 创建失败',
        status: draftOrderResponse.status,
        details: responseText,
        payload: draftOrderPayload
      })
    }

    const draftOrder = JSON.parse(responseText)
    console.log('✅ Draft Order 创建成功!')
    console.log('Draft Order ID:', draftOrder.draft_order.id)
    console.log('Draft Order Name:', draftOrder.draft_order.name)
    console.log('Draft Order Status:', draftOrder.draft_order.status)

    // 5. 保存到数据库
    console.log('💾 保存到数据库...')
    
    const { data: preorder, error: preorderError } = await supabaseAdmin
      .from('preorders')
      .insert([{
        shop_domain: shop,
        product_id: draftOrder.draft_order.line_items[0].product_id.toString(),
        variant_id: variantId,
        customer_email: email,
        customer_name: name || null,
        status: 'pending',
        shopify_draft_order_id: draftOrder.draft_order.id.toString(),
        shopify_draft_order_name: draftOrder.draft_order.name,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (preorderError) {
      console.error('❌ 数据库保存失败:', preorderError)
      return res.status(500).json({
        error: '数据库保存失败',
        details: preorderError.message,
        draftOrder: draftOrder.draft_order
      })
    }

    console.log('✅ 数据库保存成功:', preorder.id)

    // 返回成功结果
    return res.status(200).json({
      success: true,
      message: '测试成功！Draft Order 已创建',
      data: {
        preorder_id: preorder.id,
        draft_order_id: draftOrder.draft_order.id,
        draft_order_name: draftOrder.draft_order.name,
        draft_order_status: draftOrder.draft_order.status,
        invoice_url: draftOrder.draft_order.invoice_url,
        admin_url: `https://${shop}/admin/draft_orders/${draftOrder.draft_order.id}`
      }
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
