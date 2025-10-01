import { NextApiRequest, NextApiResponse } from 'next'
import { BillingSystem } from '../../../lib/billing-system'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const plans = await BillingSystem.getPricingPlans()
    
    res.json({
      success: true,
      plans
    })
  } catch (error) {
    console.error('Error fetching pricing plans:', error)
    res.status(500).json({
      error: 'Failed to fetch pricing plans',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
