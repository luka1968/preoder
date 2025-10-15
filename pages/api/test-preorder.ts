import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // 简单的健康检查
    return res.status(200).json({
      success: true,
      message: 'PreOrder API is working!',
      timestamp: new Date().toISOString(),
      endpoints: {
        create: '/api/preorder/create',
        test: '/api/test-preorder'
      }
    })
  }

  if (req.method === 'POST') {
    // 测试预购API调用
    try {
      const testData = {
        shop: 'arivi-shop.myshopify.com',
        productId: '12345678901234567890',
        variantId: '98765432109876543210',
        email: 'test@example.com',
        name: '测试用户'
      }

      const response = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/preorder/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      const result = await response.json()

      return res.status(200).json({
        success: response.ok,
        status: response.status,
        result: result,
        testData: testData
      })

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
