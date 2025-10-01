import { NextApiRequest, NextApiResponse } from 'next'
import { verifyShopifyWebhook } from '../../../../lib/webhooks'
import { supabaseAdmin, getShopByDomain } from '../../../../lib/supabase'
import { handleDepositPayment, handleFinalPayment } from '../../../../lib/partial-payments'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify webhook signature
  if (!verifyShopifyWebhook(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const draftOrder = req.body
    const shopDomain = req.headers['x-shopify-shop-domain'] as string

    if (!shopDomain) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    console.log('Draft order completed webhook:', {
      draft_order_id: draftOrder.id,
      order_id: draftOrder.order_id,
      shop: shopDomain,
      tags: draftOrder.tags
    })

    // Get shop from database
    const shop = await getShopByDomain(shopDomain)
    if (!shop) {
      console.error('Shop not found:', shopDomain)
      return res.status(404).json({ error: 'Shop not found' })
    }

    // Check if this is a partial payment draft order
    const tags = draftOrder.tags ? draftOrder.tags.split(',').map((tag: string) => tag.trim()) : []
    const isPartialPayment = tags.includes('partial-payment')
    const isDeposit = tags.includes('deposit')
    const isFinalPayment = tags.includes('final-payment')

    if (!isPartialPayment) {
      // Not a partial payment order, ignore
      return res.status(200).json({ message: 'Not a partial payment order' })
    }

    // Find the partial payment order in our database
    let partialPaymentOrder
    
    if (isDeposit) {
      // This is a deposit payment
      const { data: order, error } = await supabaseAdmin
        .from('partial_payment_orders')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('deposit_draft_order_id', draftOrder.id)
        .single()

      if (error || !order) {
        console.error('Deposit partial payment order not found:', draftOrder.id)
        return res.status(404).json({ error: 'Partial payment order not found' })
      }

      partialPaymentOrder = order

      // Handle deposit payment completion
      await handleDepositPayment(shopDomain, partialPaymentOrder.id, draftOrder.order_id)

      console.log('Deposit payment processed:', {
        partial_payment_id: partialPaymentOrder.id,
        draft_order_id: draftOrder.id,
        shopify_order_id: draftOrder.order_id
      })

    } else if (isFinalPayment) {
      // This is a final payment
      const { data: order, error } = await supabaseAdmin
        .from('partial_payment_orders')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('remaining_draft_order_id', draftOrder.id)
        .single()

      if (error || !order) {
        console.error('Final partial payment order not found:', draftOrder.id)
        return res.status(404).json({ error: 'Partial payment order not found' })
      }

      partialPaymentOrder = order

      // Handle final payment completion
      await handleFinalPayment(shopDomain, partialPaymentOrder.id, draftOrder.order_id)

      console.log('Final payment processed:', {
        partial_payment_id: partialPaymentOrder.id,
        draft_order_id: draftOrder.id,
        shopify_order_id: draftOrder.order_id
      })

    } else {
      console.error('Unknown partial payment type:', tags)
      return res.status(400).json({ error: 'Unknown partial payment type' })
    }

    // Log the activity
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        shop_id: shop.id,
        action: isDeposit ? 'deposit_payment_completed' : 'final_payment_completed',
        resource_type: 'partial_payment_order',
        resource_id: partialPaymentOrder.id,
        details: {
          draft_order_id: draftOrder.id,
          shopify_order_id: draftOrder.order_id,
          amount: draftOrder.total_price,
          customer_email: draftOrder.email
        },
        created_at: new Date().toISOString()
      })

    res.status(200).json({ 
      success: true, 
      message: `${isDeposit ? 'Deposit' : 'Final'} payment processed successfully` 
    })

  } catch (error) {
    console.error('Draft order completed webhook error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
