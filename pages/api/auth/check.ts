import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 检查认证状态的逻辑
    // 这里可以检查JWT token、session等
    
    const authHeader = req.headers.authorization
    const shopDomain = req.headers['x-shop-domain'] || req.query.shop
    
    if (!shopDomain) {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'No shop domain provided' 
      })
    }

    // 简单的认证检查 - 在实际应用中应该验证JWT token
    // 这里先返回未认证状态，让应用重定向到安装流程
    return res.status(401).json({ 
      authenticated: false, 
      shop: shopDomain,
      message: 'Please install the app first' 
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(500).json({ 
      authenticated: false, 
      error: 'Internal server error' 
    })
  }
}
