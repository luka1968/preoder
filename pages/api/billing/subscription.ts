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
      // Get current subscription
      const subscription = await BillingSystem.getShopSubscription(shopId)
      
      res.json({
        success: true,
        subscription
      })
    } else if (req.method === 'POST') {
      // Create new subscription
      const { plan_id, billing_cycle = 'monthly' } = req.body

      if (!plan_id) {
        return res.status(400).json({ error: 'Plan ID is required' })
      }

      const subscription = await BillingSystem.createSubscription(
        shopId, 
        plan_id, 
        billing_cycle
      )
      
      res.json({
        success: true,
        subscription
      })
    } else if (req.method === 'PUT') {
      // Update subscription (change plan)
      const { plan_id, billing_cycle } = req.body

      if (!plan_id) {
        return res.status(400).json({ error: 'Plan ID is required' })
      }

      const subscription = await BillingSystem.changePlan(
        shopId, 
        plan_id, 
        billing_cycle
      )
      
      res.json({
        success: true,
        subscription
      })
    } else if (req.method === 'DELETE') {
      // Cancel subscription
      await BillingSystem.cancelSubscription(shopId)
      
      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error handling subscription request:', error)
    res.status(500).json({
      error: 'Failed to handle subscription request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
