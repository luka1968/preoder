import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../lib/supabase'

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
      // Get all subscriptions for the shop with product information
      const { data: subscriptions, error } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .select(`
          *,
          product_title:product_id,
          variant_title:variant_id
        `)
        .eq('shop_id', shopData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching subscriptions:', error)
        return res.status(500).json({ error: 'Failed to fetch subscriptions' })
      }

      // Enhance with product information from Shopify if needed
      const enhancedSubscriptions = await Promise.all(
        (subscriptions || []).map(async (subscription) => {
          try {
            // Try to get product info from Shopify
            const productResponse = await fetch(
              `https://${shop}/admin/api/2023-10/products/${subscription.product_id}.json`,
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
              if (subscription.variant_id) {
                const variant = product.variants?.find((v: any) => v.id.toString() === subscription.variant_id)
                variantTitle = variant?.title !== 'Default Title' ? variant?.title : undefined
              }

              return {
                ...subscription,
                product_title: product.title,
                variant_title: variantTitle
              }
            }
          } catch (error) {
            console.error(`Error fetching product ${subscription.product_id}:`, error)
          }

          return subscription
        })
      )

      res.json({ subscriptions: enhancedSubscriptions })

    } else if (req.method === 'POST') {
      // Create new subscription
      const {
        product_id,
        variant_id,
        customer_email,
        customer_name
      } = req.body

      if (!product_id || !customer_email) {
        return res.status(400).json({ error: 'product_id and customer_email are required' })
      }

      // Check if subscription already exists
      const { data: existingSubscription } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .select('*')
        .eq('shop_id', shopData.id)
        .eq('product_id', product_id)
        .eq('customer_email', customer_email)
        .eq('status', 'active')
        .maybeSingle()

      if (existingSubscription) {
        return res.status(409).json({ error: 'Subscription already exists for this customer and product' })
      }

      // Create new subscription
      const { data: subscription, error } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .insert({
          shop_id: shopData.id,
          product_id,
          variant_id,
          customer_email,
          customer_name,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating subscription:', error)
        return res.status(500).json({ error: 'Failed to create subscription' })
      }

      res.status(201).json(subscription)

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Subscriptions API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
