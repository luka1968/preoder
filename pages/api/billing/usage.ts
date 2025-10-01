import { NextApiRequest, NextApiResponse } from 'next'
import { BillingSystem } from '../../../lib/billing-system'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  // Get shop ID
  const { data: shopData, error: shopError } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('domain', shop)
    .single()

  if (shopError || !shopData) {
    return res.status(404).json({ error: 'Shop not found' })
  }

  const shopId = shopData.id

  try {
    if (req.method === 'GET') {
      // Get usage summary
      const usage = await BillingSystem.getUsageSummary(shopId)
      
      res.json({
        success: true,
        usage
      })
    } else if (req.method === 'POST') {
      // Increment usage
      const { usage_type } = req.body

      if (!usage_type || !['preorder_orders', 'restock_emails', 'partial_payments'].includes(usage_type)) {
        return res.status(400).json({ error: 'Valid usage_type is required' })
      }

      // Check if usage is allowed
      const usageCheck = await BillingSystem.checkUsageLimit(shopId, usage_type)
      
      if (!usageCheck.allowed) {
        return res.status(403).json({ 
          error: 'Usage limit exceeded',
          current: usageCheck.current,
          limit: usageCheck.limit,
          usage_type
        })
      }

      // Increment usage
      await BillingSystem.incrementUsage(shopId, usage_type)
      
      // Get updated usage
      const updatedUsage = await BillingSystem.getUsageSummary(shopId)
      
      res.json({
        success: true,
        usage: updatedUsage
      })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error handling usage request:', error)
    res.status(500).json({
      error: 'Failed to handle usage request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
