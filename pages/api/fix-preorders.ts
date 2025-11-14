import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

/**
 * 修复现有预购订单
 * 为缺少 Draft Order 的预购记录补创建
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { preorderId } = req.body

    if (!preorderId) {
      return res.status(400).json({ error: '请提供 preorderId' })
    }

    // 1. 获取预购记录
    const { data: preorder, error: preorderError } = await supabaseAdmin
      .from('preorder_orders')
      .select('*')
      .eq('id', preorderId)
      .single()

    if (preorderError || !preorder) {
      return res.status(404).json({ error: '预购记录未找到' })
    }

    console.log('找到预购记录:', preorder.id)

    // 2. 检查是否已有 Draft Order
    if (preorder.shopify_draft_order_id) {
      return res.status(400).json({ 
        error: '该预购记录已有 Draft Order',
        draft_order_id: preorder.shopify_draft_order_id
      })
    }

    // 3. 获取店铺信息
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', preorder.shop_domain)
      .single()

    if (shopError || !shopData || !shopData.access_token) {
      return res.status(400).json({ 
        error: '店铺未授权或 Access Token 缺失',
        shop: preorder.shop_domain
      })
    }

    console.log('店铺已授权:', shopData.shop_domain)

    // 4. 检查是否有 variant_id
    if (!preorder.variant_id) {
      return res.status(400).json({ 
        error: '该预购记录缺少 variant_id，无法创建 Draft Order'
      })
    }

    // 5. 创建 Draft Order
    console.log('开始创建 Draft Order...')
    
    const numericVariantId = parseInt(preorder.variant_id.toString().replace(/\D/g, ''), 10)
    
    const draftOrderPayload = {
      draft_order: {
        line_items: [
          {
            variant_id: numericVariantId,
            quantity: 1,
          }
        ],
        customer: {
          email: preorder.customer_email,
          first_name: preorder.customer_name || preorder.customer_email.split('@')[0],
        },
        tags: 'preorder',
        note: `预购订单 - 客户邮箱: ${preorder.customer_email}`,
        email: preorder.customer_email,
      }
    }

    const draftOrderResponse = await fetch(
      `https://${preorder.shop_domain}/admin/api/2023-10/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopData.access_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftOrderPayload)
      }
    )

    if (!draftOrderResponse.ok) {
      const errorText = await draftOrderResponse.text()
      console.error('Draft Order 创建失败:', errorText)
      return res.status(500).json({
        error: 'Draft Order 创建失败',
        details: errorText
      })
    }

    const draftOrder = await draftOrderResponse.json()
    console.log('✅ Draft Order 创建成功:', draftOrder.draft_order.id)

    // 6. 更新数据库
    const { error: updateError } = await supabaseAdmin
      .from('preorder_orders')
      .update({
        shopify_order_id: draftOrder.draft_order.id.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', preorderId)

    if (updateError) {
      console.error('数据库更新失败:', updateError)
      return res.status(500).json({
        error: '数据库更新失败',
        details: updateError.message,
        draft_order_created: true,
        draft_order_id: draftOrder.draft_order.id
      })
    }

    console.log('✅ 数据库更新成功')

    return res.status(200).json({
      success: true,
      message: 'Draft Order 创建成功',
      data: {
        preorder_id: preorderId,
        draft_order_id: draftOrder.draft_order.id,
        draft_order_name: draftOrder.draft_order.name,
        admin_url: `https://${preorder.shop_domain}/admin/draft_orders/${draftOrder.draft_order.id}`
      }
    })

  } catch (error: any) {
    console.error('修复失败:', error)
    return res.status(500).json({
      error: '修复失败',
      message: error.message
    })
  }
}
