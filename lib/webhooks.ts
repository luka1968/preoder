import { NextApiRequest, NextApiResponse } from 'next'
import { 
  getShopByDomain, 
  getBackInStockSubscriptions, 
  updateSubscriptionStatus,
  createPreorderOrder,
  updatePreorderOrder,
  logActivity,
  updateShop,
  supabaseAdmin
} from './supabase'
import { 
  sendBulkBackInStockNotifications,
  sendPreorderConfirmation
} from './brevo-email'
import { verifyWebhookSignature, createWebhook, getWebhooks, deleteWebhook } from './shopify'
import { 
  ProductUpdateWebhook, 
  OrderCreateWebhook, 
  OrderUpdateWebhook, 
  AppUninstalledWebhook 
} from '../types'

// Webhook verification middleware
export function verifyShopifyWebhook(req: NextApiRequest): boolean {
  const signature = req.headers['x-shopify-hmac-sha256'] as string
  const body = JSON.stringify(req.body)

  if (!signature) {
    console.error('Missing webhook signature')
    return false
  }

  try {
    return verifyWebhookSignature(body, signature)
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return false
  }
}

// Product update webhook handler
export async function handleProductUpdate(payload: ProductUpdateWebhook, shop: string): Promise<void> {
  try {
    console.log(`Processing product update webhook for product ${payload.id} in shop ${shop}`)

    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      console.error(`Shop not found: ${shop}`)
      return
    }

    // Check if any variants went from out-of-stock to in-stock
    const inStockVariants = payload.variants.filter(variant => {
      const hasInventory = variant.inventory_quantity > 0
      const allowsOverselling = variant.inventory_policy === 'continue'
      const isTracked = variant.inventory_management !== null
      
      return !isTracked || hasInventory || allowsOverselling
    })

    if (inStockVariants.length === 0) {
      console.log(`No variants in stock for product ${payload.id}`)
      return
    }

    // Process each variant that's now in stock
    for (const variant of inStockVariants) {
      await processVariantBackInStock(shopData.id, payload, variant)
    }

    // Log activity
    await logActivity(
      shopData.id,
      'product_updated',
      `Product "${payload.title}" inventory updated`,
      {
        product_id: payload.id,
        variants_in_stock: inStockVariants.length,
        total_variants: payload.variants.length
      }
    )

  } catch (error) {
    console.error('Error handling product update webhook:', error)
    throw error
  }
}

async function processVariantBackInStock(
  shopId: string, 
  product: ProductUpdateWebhook, 
  variant: any
): Promise<void> {
  try {
    // Get subscriptions for this product/variant
    const subscriptions = await getBackInStockSubscriptions(
      shopId,
      product.id,
      variant.id
    )

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for variant ${variant.id}`)
      return
    }

    console.log(`Found ${subscriptions.length} subscriptions for variant ${variant.id}`)

    // Construct product URL
    const shopDomain = await getShopDomain(shopId)
    const productUrl = `https://${shopDomain}/products/${product.handle}${variant.id ? `?variant=${variant.id}` : ''}`

    // Send bulk notifications
    const result = await sendBulkBackInStockNotifications(
      shopId,
      product.id,
      variant.id,
      product.title,
      productUrl,
      variant.title !== 'Default Title' ? variant.title : undefined
    )

    console.log(`Sent ${result.sent} notifications, ${result.failed} failed for variant ${variant.id}`)

    // Log activity
    await logActivity(
      shopId,
      'back_in_stock_notifications_sent',
      `Sent back-in-stock notifications for "${product.title}"`,
      {
        product_id: product.id,
        variant_id: variant.id,
        notifications_sent: result.sent,
        notifications_failed: result.failed
      }
    )

  } catch (error) {
    console.error(`Error processing variant ${variant.id}:`, error)
  }
}

// Order create webhook handler
export async function handleOrderCreate(payload: OrderCreateWebhook, shop: string): Promise<void> {
  try {
    console.log(`Processing order create webhook for order ${payload.id} in shop ${shop}`)

    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      console.error(`Shop not found: ${shop}`)
      return
    }

    // Check if this is a pre-order (look for pre-order tags or line item properties)
    const isPreorder = isPreorderOrder(payload)
    
    if (!isPreorder) {
      console.log(`Order ${payload.id} is not a pre-order`)
      return
    }

    // Process each line item that's a pre-order
    for (const lineItem of payload.line_items) {
      if (isPreorderLineItem(lineItem)) {
        await processPreorderLineItem(shopData.id, payload, lineItem)
      }
    }

    // Log activity
    await logActivity(
      shopData.id,
      'preorder_created',
      `Pre-order created: ${payload.name}`,
      {
        order_id: payload.id,
        order_number: payload.number,
        total_amount: payload.total_price,
        customer_email: payload.email
      }
    )

  } catch (error) {
    console.error('Error handling order create webhook:', error)
    throw error
  }
}

function isPreorderOrder(order: OrderCreateWebhook): boolean {
  // Check order tags
  if (order.tags && order.tags.includes('preorder')) {
    return true
  }

  // Check line item properties
  return order.line_items.some(item => isPreorderLineItem(item))
}

function isPreorderLineItem(lineItem: any): boolean {
  // Check line item properties for pre-order indicators
  if (lineItem.properties) {
    return lineItem.properties.some((prop: any) => 
      prop.name.toLowerCase().includes('preorder') ||
      prop.name.toLowerCase().includes('pre-order') ||
      prop.value.toLowerCase().includes('preorder')
    )
  }

  return false
}

async function processPreorderLineItem(
  shopId: string,
  order: OrderCreateWebhook,
  lineItem: any
): Promise<void> {
  try {
    // Extract delivery information from line item properties
    let estimatedDeliveryDate: string | undefined
    let deliveryNote: string | undefined

    if (lineItem.properties) {
      lineItem.properties.forEach((prop: any) => {
        if (prop.name.toLowerCase().includes('delivery_date')) {
          estimatedDeliveryDate = prop.value
        }
        if (prop.name.toLowerCase().includes('delivery_note')) {
          deliveryNote = prop.value
        }
      })
    }

    // Create pre-order record
    const preorderOrder = await createPreorderOrder({
      shop_id: shopId,
      shopify_order_id: order.id,
      product_id: lineItem.product_id,
      variant_id: lineItem.variant_id,
      customer_email: order.email,
      total_amount: lineItem.price,
      paid_amount: lineItem.price, // Assume full payment initially
      payment_status: 'paid',
      fulfillment_status: 'pending',
      estimated_delivery_date: estimatedDeliveryDate,
      order_tags: order.tags ? order.tags.split(', ') : []
    })

    // Send pre-order confirmation email
    const customerName = order.customer ? 
      `${order.customer.first_name} ${order.customer.last_name}`.trim() : 
      'Customer'

    await sendPreorderConfirmation(
      shopId,
      order.email,
      customerName,
      lineItem.title,
      order.order_number?.toString(),
      order.order_status_url,
      lineItem.variant_title !== 'Default Title' ? lineItem.variant_title : undefined,
      estimatedDeliveryDate,
      deliveryNote
    )

    console.log(`Created pre-order record ${preorderOrder.id} for line item ${lineItem.id}`)

  } catch (error) {
    console.error(`Error processing pre-order line item ${lineItem.id}:`, error)
  }
}

// Order update webhook handler
export async function handleOrderUpdate(payload: OrderUpdateWebhook, shop: string): Promise<void> {
  try {
    console.log(`Processing order update webhook for order ${payload.id} in shop ${shop}`)

    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      console.error(`Shop not found: ${shop}`)
      return
    }

    // Find existing pre-order records for this order
    const { data: preorderOrders, error } = await supabaseAdmin
      .from('preorder_orders')
      .select('*')
      .eq('shop_id', shopData.id)
      .eq('shopify_order_id', payload.id)

    if (error) {
      console.error('Error fetching pre-order records:', error)
      return
    }

    if (!preorderOrders || preorderOrders.length === 0) {
      console.log(`No pre-order records found for order ${payload.id}`)
      return
    }

    // Update pre-order records based on order changes
    for (const preorderOrder of preorderOrders) {
      await updatePreorderFromOrder(preorderOrder, payload)
    }

    // Log activity
    await logActivity(
      shopData.id,
      'preorder_updated',
      `Pre-order updated: ${payload.name}`,
      {
        order_id: payload.id,
        order_number: payload.number,
        financial_status: payload.financial_status,
        fulfillment_status: payload.fulfillment_status
      }
    )

  } catch (error) {
    console.error('Error handling order update webhook:', error)
    throw error
  }
}

async function updatePreorderFromOrder(preorderOrder: any, order: OrderUpdateWebhook): Promise<void> {
  try {
    const updates: any = {}

    // Update payment status based on financial status
    switch (order.financial_status) {
      case 'paid':
        updates.payment_status = 'paid'
        updates.paid_amount = order.total_price
        break
      case 'partially_paid':
        updates.payment_status = 'partial'
        // Calculate paid amount from order (this might need adjustment based on your setup)
        break
      case 'pending':
        updates.payment_status = 'pending'
        break
      case 'refunded':
      case 'partially_refunded':
        updates.payment_status = 'refunded'
        break
    }

    // Update fulfillment status
    switch (order.fulfillment_status) {
      case 'fulfilled':
        updates.fulfillment_status = 'fulfilled'
        break
      case 'partial':
        updates.fulfillment_status = 'pending'
        break
      case null:
        updates.fulfillment_status = 'pending'
        break
    }

    // Update order tags
    if (order.tags) {
      updates.order_tags = order.tags.split(', ')
    }

    if (Object.keys(updates).length > 0) {
      await updatePreorderOrder(preorderOrder.id, updates)
      console.log(`Updated pre-order ${preorderOrder.id} with:`, updates)
    }

  } catch (error) {
    console.error(`Error updating pre-order ${preorderOrder.id}:`, error)
  }
}

// App uninstalled webhook handler
export async function handleAppUninstalled(payload: AppUninstalledWebhook, shop: string): Promise<void> {
  try {
    console.log(`Processing app uninstall webhook for shop ${shop}`)

    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      console.error(`Shop not found: ${shop}`)
      return
    }

    // Log the uninstallation
    await logActivity(
      shopData.id,
      'app_uninstalled',
      `App uninstalled from shop ${shop}`,
      {
        shop_id: shopData.id,
        shop_name: payload.name,
        uninstalled_at: new Date().toISOString()
      }
    )

    // Mark shop as inactive instead of deleting (for data retention)
    await updateShop(shopData.id, { 
      active: false,
      updated_at: new Date().toISOString()
    })

    // Optionally: Cancel all active subscriptions
    await supabaseAdmin
      .from('back_in_stock_subscriptions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('shop_id', shopData.id)
      .eq('status', 'active')

    console.log(`Successfully processed app uninstall for shop ${shop}`)

  } catch (error) {
    console.error('Error handling app uninstall webhook:', error)
    throw error
  }
}

// Webhook router
export async function handleWebhook(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    // Verify webhook signature
    if (!verifyShopifyWebhook(req)) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const topic = req.headers['x-shopify-topic'] as string
    const shop = req.headers['x-shopify-shop-domain'] as string
    const payload = req.body

    if (!topic || !shop) {
      res.status(400).json({ error: 'Missing required headers' })
      return
    }

    console.log(`Received webhook: ${topic} from shop: ${shop}`)

    // Route to appropriate handler
    switch (topic) {
      case 'products/update':
        await handleProductUpdate(payload as ProductUpdateWebhook, shop)
        break

      case 'orders/create':
        await handleOrderCreate(payload as OrderCreateWebhook, shop)
        break

      case 'orders/updated':
        await handleOrderUpdate(payload as OrderUpdateWebhook, shop)
        break

      case 'app/uninstalled':
        await handleAppUninstalled(payload as AppUninstalledWebhook, shop)
        break

      default:
        console.log(`Unhandled webhook topic: ${topic}`)
    }

    res.status(200).json({ success: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Utility functions
async function getShopDomain(shopId: string): Promise<string> {
  const { data: shop, error } = await supabaseAdmin
    .from('shops')
    .select('shop_domain')
    .eq('id', shopId)
    .single()

  if (error || !shop) {
    throw new Error(`Shop not found: ${shopId}`)
  }

  return shop.shop_domain
}

// Webhook registration helper
export async function registerWebhooks(accessToken: string, shop: string): Promise<void> {
  const webhooks = [
    {
      topic: 'products/update',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/products/update`
    },
    {
      topic: 'orders/create',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/orders/create`
    },
    {
      topic: 'orders/updated',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/orders/updated`
    },
    {
      topic: 'app/uninstalled',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/app/uninstalled`
    }
  ]

  for (const webhook of webhooks) {
    try {
      await createWebhook(accessToken, shop, webhook.topic, webhook.address)
      console.log(`Registered webhook: ${webhook.topic}`)
    } catch (error) {
      console.error(`Failed to register webhook ${webhook.topic}:`, error)
    }
  }
}

// Webhook cleanup helper
export async function cleanupWebhooks(accessToken: string, shop: string): Promise<void> {
  try {
    const existingWebhooks = await getWebhooks(accessToken, shop)
    
    // Filter webhooks created by this app
    const appWebhooks = existingWebhooks.filter(webhook => 
      webhook.address.includes(process.env.SHOPIFY_APP_URL || '')
    )

    for (const webhook of appWebhooks) {
      try {
        await deleteWebhook(accessToken, shop, webhook.id)
        console.log(`Deleted webhook: ${webhook.topic}`)
      } catch (error) {
        console.error(`Failed to delete webhook ${webhook.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Error cleaning up webhooks:', error)
  }
}
