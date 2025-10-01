import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'
import { 
  handleDepositPayment, 
  handleFinalPayment, 
  cancelPartialPaymentOrder,
  sendFinalPaymentInvoice
} from '../../../lib/partial-payments'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { paymentId, shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  if (!paymentId || typeof paymentId !== 'string') {
    return res.status(400).json({ error: 'Payment ID is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // Get specific partial payment order
      const { data: payment, error } = await supabaseAdmin
        .from('partial_payment_orders')
        .select('*')
        .eq('id', paymentId)
        .eq('shop_id', shopData.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Payment not found' })
        }
        console.error('Error fetching partial payment:', error)
        return res.status(500).json({ error: 'Failed to fetch payment' })
      }

      res.json({ payment })

    } else if (req.method === 'PUT') {
      // Handle payment updates
      const { 
        action,
        shopify_order_id,
        reason
      } = req.body

      try {
        switch (action) {
          case 'deposit_paid':
            if (!shopify_order_id) {
              return res.status(400).json({ error: 'shopify_order_id is required for deposit payment' })
            }
            await handleDepositPayment(shop, paymentId, parseInt(shopify_order_id))
            break

          case 'final_paid':
            if (!shopify_order_id) {
              return res.status(400).json({ error: 'shopify_order_id is required for final payment' })
            }
            await handleFinalPayment(shop, paymentId, parseInt(shopify_order_id))
            break

          case 'send_final_invoice':
            await sendFinalPaymentInvoice(shop, paymentId)
            break

          default:
            return res.status(400).json({ error: 'Invalid action' })
        }

        // Get updated payment
        const { data: updatedPayment, error } = await supabaseAdmin
          .from('partial_payment_orders')
          .select('*')
          .eq('id', paymentId)
          .eq('shop_id', shopData.id)
          .single()

        if (error) {
          throw new Error('Failed to fetch updated payment')
        }

        res.json({ success: true, payment: updatedPayment })

      } catch (error) {
        console.error('Error updating partial payment:', error)
        return res.status(500).json({ 
          error: 'Failed to update payment',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    } else if (req.method === 'DELETE') {
      // Cancel partial payment order
      const { reason } = req.body

      try {
        await cancelPartialPaymentOrder(shop, paymentId, reason)

        // Get updated payment
        const { data: cancelledPayment, error } = await supabaseAdmin
          .from('partial_payment_orders')
          .select('*')
          .eq('id', paymentId)
          .eq('shop_id', shopData.id)
          .single()

        if (error) {
          throw new Error('Failed to fetch cancelled payment')
        }

        res.json({ success: true, payment: cancelledPayment })

      } catch (error) {
        console.error('Error cancelling partial payment:', error)
        return res.status(500).json({ 
          error: 'Failed to cancel payment',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Partial payment API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
