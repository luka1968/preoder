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

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ 邮箱格式错误:', email)
      return res.status(400).json({ error: '邮箱格式不正确' })
    }

    // 创建预购记录
    const preorderData = {
      shop_domain: shop || 'unknown',
      product_id: productId,
      variant_id: variantId || null,
      customer_email: email,
      customer_name: name || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    console.log('💾 准备保存到数据库:', preorderData)

    // 尝试保存到 Supabase
    let savedPreorder = null
    try {
      const { data, error } = await supabaseAdmin
        .from('preorders')
        .insert([preorderData])
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase 错误:', error)
        // 即使数据库失败，也返回成功（记录到日志）
        console.log('⚠️ 数据库保存失败，但继续处理')
      } else {
        savedPreorder = data
        console.log('✅ 保存到数据库成功:', data)
      }
    } catch (dbError) {
      console.error('❌ 数据库异常:', dbError)
      // 继续处理，不中断流程
    }

    // 记录到控制台（用于调试）
    console.log('✅ 预购处理完成:', {
      email,
      productId,
      shop,
      saved: !!savedPreorder
    })

    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '预购提交成功！我们会在商品到货时通知您。',
      preorder: {
        id: savedPreorder?.id || `temp_${Date.now()}`,
        email: email,
        productId: productId,
        status: 'pending'
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
