import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, action } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    if (req.method === 'GET') {
      if (action === 'status') {
        // 简化的状态检查
        res.json({
          shop: shop,
          status: 'partial',
          appEmbedActive: false,
          scriptTagActive: false,
          recommendations: [
            '⚠️ 混合模式需要配置环境变量',
            '🔧 请先配置 Supabase 和 Shopify API 密钥',
            '📋 然后重新部署混合模式'
          ],
          timestamp: new Date().toISOString()
        })
      } else {
        // 返回混合模式信息
        res.json({
          message: 'PreOrder Pro 混合模式 API (简化版)',
          shop: shop,
          status: 'ready_for_configuration',
          nextSteps: [
            '1. 配置环境变量 (.env.local)',
            '2. 重新部署应用',
            '3. 测试混合模式功能'
          ]
        })
      }
    } else if (req.method === 'POST') {
      // 简化的部署逻辑
      res.json({
        success: false,
        method: 'hybrid',
        message: '⚠️ 需要先配置环境变量才能部署混合模式',
        details: {
          shop: shop,
          appUrl: 'https://preorder.orbrother.com',
          configurationRequired: true,
          missingConfig: [
            'SUPABASE_SERVICE_ROLE_KEY',
            'SHOPIFY_API_SECRET',
            'Database connection'
          ]
        }
      })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Simple hybrid API error:', error)
    res.status(500).json({
      error: 'Configuration required',
      message: '请先配置环境变量，然后重新访问此页面',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
