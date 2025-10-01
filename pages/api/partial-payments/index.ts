import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'
import { createPartialPaymentOrder } from '../../../lib/partial-payments'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // Get all partial payment orders for the shop
      const { data: payments, error } = await supabaseAdmin
        .from('partial_payment_orders')
        .select('*')
        .eq('shop_id', shopData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching partial payments:', error)
        return res.status(500).json({ error: 'Failed to fetch payments' })
      }

      res.json({ payments: payments || [] })

    } else if (req.method === 'POST') {
      // Create new partial payment order using Draft Orders
      const {
        customer_email,
        customer_name,
        product_id,
        variant_id,
        product_title,
        variant_title,
        quantity,
        unit_price,
        deposit_percentage,
        shipping_address,
        billing_address,
        notes
      } = req.body

      if (!customer_email || !product_id || !product_title || !quantity || !unit_price) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      try {
        const partialPaymentOrder = await createPartialPaymentOrder(shop, {
          customer_email,
          customer_name,
          product_id,
          variant_id,
          product_title,
          variant_title,
          quantity: parseInt(quantity),
          unit_price,
          deposit_percentage,
          shipping_address,
          billing_address,
          notes
        })

        res.status(201).json({ 
          success: true, 
          partial_payment_order: partialPaymentOrder 
        })

      } catch (error) {
        console.error('Error creating partial payment order:', error)
        return res.status(500).json({ 
          error: 'Failed to create partial payment order',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Partial payments API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
