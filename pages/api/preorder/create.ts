import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shop, productId, variantId, email, name } = req.body

    console.log('📥 收到预购请求:', { shop, productId, variantId, email, name })

    // 基本验证
    if (!email) {
      console.error('❌ 缺少邮箱')
      return res.status(400).json({ error: '请提供邮箱地址' })
    }

    if (!productId) {
      console.error('❌ 缺少产品ID')
      return res.status(400).json({ error: '产品信息缺失' })
    }

    if (!shop) {
      console.error('❌ 缺少店铺信息')
      return res.status(400).json({ error: '店铺信息缺失' })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ 邮箱格式错误:', email)
      return res.status(400).json({ error: '邮箱格式不正确' })
    }

    // 获取店铺的 access token
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shop)
      .single()

    if (shopError || !shopData) {
      console.error('❌ 店铺未找到:', shop)
      // 即使找不到店铺，也保存预购记录
    }

    const accessToken = shopData?.access_token

    // 创建预购记录到数据库
    const preorderData = {
      shop_domain: shop,
      product_id: productId,
      variant_id: variantId || null,
      customer_email: email,
      customer_name: name || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    console.log('💾 准备保存到数据库:', preorderData)

    // 1. 保存到 Supabase 数据库
    let savedPreorder = null
    try {
      const { data, error } = await supabaseAdmin
        .from('preorders')
        .insert([preorderData])
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase 错误:', error)
      } else {
        savedPreorder = data
        console.log('✅ 保存到数据库成功:', data)
      }
    } catch (dbError) {
      console.error('❌ 数据库异常:', dbError)
    }

    // 2. 创建 Shopify Draft Order（如果有 access token）
    let draftOrder = null
    if (accessToken && variantId) {
      try {
        console.log('📝 创建 Shopify Draft Order...')
        
        const draftOrderResponse = await fetch(
          `https://${shop}/admin/api/2024-01/draft_orders.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              draft_order: {
                line_items: [
                  {
                    variant_id: variantId,
                    quantity: 1,
                  }
                ],
                customer: {
                  email: email,
                  first_name: name || email.split('@')[0],
                },
                tags: 'preorder',
                note: `预购订单 - 客户邮箱: ${email}`,
                email: email,
              }
            })
          }
        )

        if (draftOrderResponse.ok) {
          draftOrder = await draftOrderResponse.json()
          console.log('✅ Draft Order 创建成功:', draftOrder.draft_order.id)
          
          // 更新数据库记录，关联 draft order ID
          if (savedPreorder) {
            await supabaseAdmin
              .from('preorders')
              .update({ 
                shopify_draft_order_id: draftOrder.draft_order.id,
                shopify_draft_order_name: draftOrder.draft_order.name
              })
              .eq('id', savedPreorder.id)
          }
        } else {
          const errorText = await draftOrderResponse.text()
          console.error('❌ Draft Order 创建失败:', errorText)
        }
      } catch (draftError) {
        console.error('❌ Draft Order 异常:', draftError)
      }
    }

    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '预购提交成功！我们会在商品到货时通知您。',
      preorder: {
        id: savedPreorder?.id || `temp_${Date.now()}`,
        email: email,
        productId: productId,
        status: 'pending',
        draftOrderId: draftOrder?.draft_order?.id,
        draftOrderName: draftOrder?.draft_order?.name
      }
    })

  } catch (error: any) {
    console.error('❌ 预购处理错误:', error)
    return res.status(500).json({ 
      error: '服务器错误',
      message: '预购提交失败，请稍后重试',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
