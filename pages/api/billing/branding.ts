import { NextApiRequest, NextApiResponse } from 'next'
import { UsageMiddleware } from '../../../lib/usage-middleware'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    const showBranding = await UsageMiddleware.shouldShowBranding(shop)
    
    res.json({
      success: true,
      showBranding
    })
  } catch (error) {
    console.error('Error checking branding settings:', error)
    res.status(500).json({
      error: 'Failed to check branding settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
