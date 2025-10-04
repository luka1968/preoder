import { NextApiRequest, NextApiResponse } from 'next'
import { getEnvironmentHealth } from '../../lib/env-validation'
import { checkDatabaseConnection } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 检查环境变量
    const envHealth = getEnvironmentHealth()
    
    // 检查数据库连接
    const dbConnected = await checkDatabaseConnection()
    
    // 检查关键服务
    const services = {
      environment: envHealth.status === 'healthy',
      database: dbConnected,
      api: true // API 本身正在响应
    }
    
    const allServicesHealthy = Object.values(services).every(Boolean)
    const overallStatus = allServicesHealthy ? 'healthy' : 
                         (envHealth.status === 'error' || !dbConnected) ? 'error' : 'warning'
    
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      environment_health: {
        status: envHealth.status,
        message: envHealth.message,
        details: envHealth.details
      }
    }
    
    // 根据健康状态返回适当的HTTP状态码
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'warning' ? 200 : 503
    
    res.status(httpStatus).json(response)
    
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
