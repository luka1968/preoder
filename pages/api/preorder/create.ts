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

    // 获取店铺的 ID 和 access token
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('id, access_token')
      .eq('shop_domain', shop)
      .single()

    if (shopError || !shopData) {
      console.error('❌ 店铺未找到:', shop)
      return res.status(404).json({ error: '店铺未找到' })
    }

    const shopId = shopData.id
    const accessToken = shopData.access_token

    // 创建预购订单记录到数据库 (使用preorder_orders表)
    const preorderData = {
      shop_id: shopId,
      product_id: productId,
      variant_id: variantId || null,
      customer_email: email,
      total_amount: '0.00',
      paid_amount: '0.00',
      payment_status: 'pending',
      fulfillment_status: 'pending',
      order_tags: [],
      created_at: new Date().toISOString()
    }

    console.log('💾 准备保存到数据库:', preorderData)

    // 1. 保存到 Supabase 数据库
    let savedPreorder = null
    try {
      const { data, error } = await supabaseAdmin
        .from('preorder_orders')
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
    let draftOrderError = null
    
    if (accessToken && variantId) {
      try {
        console.log('📝 创建 Shopify Draft Order...')
        console.log('使用参数:', { shop, variantId, email, name })
        
        // 确保 variantId 是数字类型
        const numericVariantId = parseInt(variantId.toString().replace(/\D/g, ''), 10)
        
        if (isNaN(numericVariantId)) {
          throw new Error(`Invalid variant ID: ${variantId}`)
        }
        
        const requestBody = {
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
            tags: 'preorder',
            note: `预购订单 - 客户邮箱: ${email}`,
            email: email,
          }
        }
        
        console.log('📤 Draft Order 请求体:', JSON.stringify(requestBody, null, 2))
        
        const draftOrderResponse = await fetch(
          `https://${shop}/admin/api/2023-10/draft_orders.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          }
        )

        const responseText = await draftOrderResponse.text()
        console.log('📥 Draft Order 响应状态:', draftOrderResponse.status)
        console.log('📥 Draft Order 响应内容:', responseText)

        if (draftOrderResponse.ok) {
          draftOrder = JSON.parse(responseText)
          console.log('✅ Draft Order 创建成功:', draftOrder.draft_order.id)
          
          // 更新数据库记录，关联 draft order ID
          if (savedPreorder) {
            const updateResult = await supabaseAdmin
              .from('preorder_orders')
              .update({ 
                shopify_order_id: draftOrder.draft_order.id.toString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', savedPreorder.id)
            
            if (updateResult.error) {
              console.error('❌ 更新数据库失败:', updateResult.error)
            } else {
              console.log('✅ 数据库更新成功，Draft Order ID:', draftOrder.draft_order.id)
            }
          }
        } else {
          draftOrderError = responseText
          console.error('❌ Draft Order 创建失败 (HTTP ' + draftOrderResponse.status + '):', responseText)
          console.error('请求详情:', {
            url: `https://${shop}/admin/api/2023-10/draft_orders.json`,
            shop,
            variantId: numericVariantId,
            email,
            hasAccessToken: !!accessToken,
            accessTokenLength: accessToken?.length
          })
          
          // 尝试解析错误信息
          try {
            const errorJson = JSON.parse(responseText)
            console.error('❌ Shopify API 错误详情:', errorJson)
          } catch (e) {
            // 无法解析为 JSON
          }
        }
      } catch (draftError: any) {
        draftOrderError = draftError.message
        console.error('❌ Draft Order 异常:', draftError)
        console.error('异常堆栈:', draftError.stack)
      }
    } else {
      const reason = !accessToken ? '缺少 access token' : '缺少 variant ID'
      console.log('⚠️ 跳过 Draft Order 创建:', reason, { 
        hasAccessToken: !!accessToken, 
        hasVariantId: !!variantId,
        shop,
        productId
      })
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
        draftOrderName: draftOrder?.draft_order?.name,
        draftOrderCreated: !!draftOrder,
        draftOrderError: draftOrderError
      },
      debug: {
        hasAccessToken: !!accessToken,
        hasVariantId: !!variantId,
        shop,
        savedToDatabase: !!savedPreorder
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
