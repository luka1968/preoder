import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 基本健康检查
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: true,
        preorder: true
      },
      message: 'PreOrder Pro is running successfully',
      endpoints: {
        health: '/api/health',
        preorder_create: '/api/preorder/create',
        test: '/api/test-preorder'
      }
    }
    
    res.status(200).json(response)
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
