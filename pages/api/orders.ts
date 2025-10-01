import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../lib/supabase'
import { getShopifyProducts } from '../../lib/shopify'

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
      // Get all pre-order orders for the shop
      const { data: orders, error } = await supabaseAdmin
        .from('preorder_orders')
        .select('*')
        .eq('shop_id', shopData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return res.status(500).json({ error: 'Failed to fetch orders' })
      }

      // Enhance orders with product information
      const enhancedOrders = await Promise.all(
        (orders || []).map(async (order) => {
          try {
            // Get product info from Shopify
            const productResponse = await fetch(
              `https://${shop}/admin/api/2023-10/products/${order.product_id}.json`,
              {
                headers: {
                  'X-Shopify-Access-Token': shopData.access_token,
                },
              }
            )

            if (productResponse.ok) {
              const productData = await productResponse.json()
              const product = productData.product
              
              let variantTitle = undefined
              if (order.variant_id) {
                const variant = product.variants?.find((v: any) => v.id.toString() === order.variant_id)
                variantTitle = variant?.title !== 'Default Title' ? variant?.title : undefined
              }

              return {
                ...order,
                product_title: product.title,
                variant_title: variantTitle
              }
            }
          } catch (error) {
            console.error(`Error fetching product ${order.product_id}:`, error)
          }

          return {
            ...order,
            product_title: `Product ${order.product_id}`,
            variant_title: undefined
          }
        })
      )

      res.json({ orders: enhancedOrders })

    } else if (req.method === 'PUT') {
      // Update order status
      const { order_id, payment_status, fulfillment_status, estimated_delivery_date } = req.body

      if (!order_id) {
        return res.status(400).json({ error: 'order_id is required' })
      }

      const updates: any = {
        updated_at: new Date().toISOString()
      }

      if (payment_status) updates.payment_status = payment_status
      if (fulfillment_status) updates.fulfillment_status = fulfillment_status
      if (estimated_delivery_date) updates.estimated_delivery_date = estimated_delivery_date

      const { data: order, error } = await supabaseAdmin
        .from('preorder_orders')
        .update(updates)
        .eq('id', order_id)
        .eq('shop_id', shopData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating order:', error)
        return res.status(500).json({ error: 'Failed to update order' })
      }

      res.json({ success: true, order })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Orders API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
