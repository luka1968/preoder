import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subscriptionId, shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  if (!subscriptionId || typeof subscriptionId !== 'string') {
    return res.status(400).json({ error: 'Subscription ID is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // Get specific subscription
      const { data: subscription, error } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('shop_id', shopData.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Subscription not found' })
        }
        console.error('Error fetching subscription:', error)
        return res.status(500).json({ error: 'Failed to fetch subscription' })
      }

      res.json(subscription)

    } else if (req.method === 'PUT') {
      // Update subscription
      const { status, customer_name, customer_email } = req.body

      const updates: any = {
        updated_at: new Date().toISOString()
      }

      if (status) updates.status = status
      if (customer_name !== undefined) updates.customer_name = customer_name
      if (customer_email) updates.customer_email = customer_email

      if (status === 'notified') {
        updates.notified_at = new Date().toISOString()
      }

      const { data: subscription, error } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .eq('shop_id', shopData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating subscription:', error)
        return res.status(500).json({ error: 'Failed to update subscription' })
      }

      res.json(subscription)

    } else if (req.method === 'DELETE') {
      // Cancel subscription (soft delete by updating status)
      const { data: subscription, error } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('shop_id', shopData.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Subscription not found' })
        }
        console.error('Error cancelling subscription:', error)
        return res.status(500).json({ error: 'Failed to cancel subscription' })
      }

      res.json({ success: true, subscription })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Subscription API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
