import { NextApiRequest, NextApiResponse } from 'next'

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

    // 基本验证
    if (!shop || !productId || !email) {
      return res.status(400).json({ error: 'Missing required fields: shop, productId, email' })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // 模拟预购记录创建（暂时不使用数据库）
    const preorderData = {
      id: `preorder_${Date.now()}`,
      shop: shop,
      productId: productId,
      variantId: variantId,
      email: email,
      customerName: name || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    // 记录到控制台（用于调试）
    console.log('预购请求:', preorderData)

    // 模拟邮件发送
    console.log(`发送预购确认邮件到: ${email}`)
    console.log(`商品ID: ${productId}, 商店: ${shop}`)

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '预购创建成功！',
      preorder: {
        id: preorderData.id,
        status: preorderData.status,
        created_at: preorderData.createdAt,
        email: preorderData.email,
        productId: preorderData.productId
      }
    })

  } catch (error) {
    console.error('Preorder creation error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}
