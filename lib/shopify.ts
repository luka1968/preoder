import crypto from 'crypto'

// Shopify API configuration
const SHOPIFY_API_VERSION = '2023-10'

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  vendor: string
  product_type: string
  created_at: string
  updated_at: string
  published_at: string
  status: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  options: ShopifyOption[]
}

export interface ShopifyVariant {
  id: string
  product_id: string
  title: string
  price: string
  sku: string
  position: number
  inventory_policy: string
  compare_at_price: string | null
  fulfillment_service: string
  inventory_management: string | null
  option1: string | null
  option2: string | null
  option3: string | null
  created_at: string
  updated_at: string
  taxable: boolean
  barcode: string | null
  grams: number
  image_id: string | null
  inventory_quantity: number
  weight: number
  weight_unit: string
  inventory_item_id: string
  old_inventory_quantity: number
  requires_shipping: boolean
}

export interface ShopifyImage {
  id: string
  product_id: string
  position: number
  created_at: string
  updated_at: string
  alt: string | null
  width: number
  height: number
  src: string
  variant_ids: string[]
}

export interface ShopifyOption {
  id: string
  product_id: string
  name: string
  position: number
  values: string[]
}

export interface ShopifyOrder {
  id: string
  email: string
  created_at: string
  updated_at: string
  number: number
  note: string | null
  token: string
  gateway: string
  test: boolean
  total_price: string
  subtotal_price: string
  total_weight: number
  total_tax: string
  taxes_included: boolean
  currency: string
  financial_status: string
  confirmed: boolean
  total_discounts: string
  buyer_accepts_marketing: boolean
  name: string
  referring_site: string | null
  landing_site: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  total_price_usd: string
  checkout_token: string | null
  reference: string | null
  user_id: string | null
  location_id: string | null
  source_identifier: string | null
  source_url: string | null
  processed_at: string
  device_id: string | null
  phone: string | null
  customer_locale: string | null
  app_id: number
  browser_ip: string | null
  landing_site_ref: string | null
  order_number: number
  discount_applications: any[]
  discount_codes: any[]
  note_attributes: any[]
  payment_gateway_names: string[]
  processing_method: string
  checkout_id: string | null
  source_name: string
  fulfillment_status: string | null
  tax_lines: any[]
  tags: string
  contact_email: string
  order_status_url: string
  presentment_currency: string
  total_line_items_price_set: any
  total_discounts_set: any
  total_shipping_price_set: any
  subtotal_price_set: any
  total_price_set: any
  total_tax_set: any
  line_items: ShopifyLineItem[]
  customer: any
}

export interface ShopifyLineItem {
  id: string
  variant_id: string
  title: string
  quantity: number
  sku: string
  variant_title: string | null
  vendor: string
  fulfillment_service: string
  product_id: string
  requires_shipping: boolean
  taxable: boolean
  gift_card: boolean
  name: string
  variant_inventory_management: string | null
  properties: any[]
  product_exists: boolean
  fulfillable_quantity: number
  grams: number
  price: string
  total_discount: string
  fulfillment_status: string | null
  price_set: any
  total_discount_set: any
  discount_allocations: any[]
  duties: any[]
  admin_graphql_api_id: string
  tax_lines: any[]
}

// OAuth functions
export function generateShopifyAuthUrl(shop: string): string {
  const apiKey = process.env.SHOPIFY_API_KEY
  const scopes = process.env.SHOPIFY_SCOPES
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/shopify`
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: apiKey!,
    scope: scopes!,
    redirect_uri: redirectUri,
    state,
  })

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(shop: string, code: string): Promise<string> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  const data = await response.json()
  return data.access_token
}

// Webhook verification
// Per Shopify docs: Webhooks are signed with the App's Client Secret (SHOPIFY_API_SECRET)
// Reference: https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const apiSecret = process.env.SHOPIFY_API_SECRET
  if (!apiSecret) {
    throw new Error('SHOPIFY_API_SECRET is not configured')
  }

  const hmac = crypto.createHmac('sha256', apiSecret)
  hmac.update(body, 'utf8')
  const hash = hmac.digest('base64')

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}

// Product API functions
export async function getShopifyProducts(accessToken: string, shop: string, limit = 50, page_info?: string): Promise<{ products: ShopifyProduct[], page_info?: string }> {
  let url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=${limit}`

  if (page_info) {
    url += `&page_info=${page_info}`
  }

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  const data = await response.json()

  // Extract pagination info from Link header
  const linkHeader = response.headers.get('Link')
  let nextPageInfo: string | undefined

  if (linkHeader) {
    const nextMatch = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>;\s*rel="next"/)
    if (nextMatch) {
      nextPageInfo = nextMatch[1]
    }
  }

  return {
    products: data.products,
    page_info: nextPageInfo
  }
}

export async function getShopifyProduct(accessToken: string, shop: string, productId: string): Promise<ShopifyProduct | null> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch product: ${response.statusText}`)
  }

  const data = await response.json()
  return data.product
}

export async function getShopifyVariant(accessToken: string, shop: string, variantId: string): Promise<ShopifyVariant | null> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/variants/${variantId}.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch variant: ${response.statusText}`)
  }

  const data = await response.json()
  return data.variant
}

export async function updateShopifyProduct(accessToken: string, shop: string, productId: string, updates: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product: updates }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update product: ${response.statusText}`)
  }

  const data = await response.json()
  return data.product
}

export async function getProductInventoryLevels(accessToken: string, shop: string, productId: string) {
  // First get the product to get variant IDs
  const product = await getShopifyProduct(accessToken, shop, productId)
  if (!product || !product.variants) {
    return []
  }

  const inventoryLevels = []

  for (const variant of product.variants) {
    if (variant.inventory_item_id) {
      try {
        const response = await fetch(
          `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/inventory_levels.json?inventory_item_ids=${variant.inventory_item_id}`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          inventoryLevels.push({
            variant_id: variant.id,
            inventory_levels: data.inventory_levels
          })
        }
      } catch (error) {
        console.error(`Error fetching inventory for variant ${variant.id}:`, error)
      }
    }
  }

  return inventoryLevels
}

export async function searchProducts(accessToken: string, shop: string, query: string, limit = 20): Promise<ShopifyProduct[]> {
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?title=${encodeURIComponent(query)}&limit=${limit}`,
    {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.statusText}`)
  }

  const data = await response.json()
  return data.products
}

// Order API functions
export async function getShopifyOrders(accessToken: string, shop: string, limit = 50, status = 'any'): Promise<ShopifyOrder[]> {
  const response = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/orders.json?limit=${limit}&status=${status}`,
    {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`)
  }

  const data = await response.json()
  return data.orders
}

export async function getShopifyOrder(accessToken: string, shop: string, orderId: string): Promise<ShopifyOrder | null> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch order: ${response.statusText}`)
  }

  const data = await response.json()
  return data.order
}

export async function updateShopifyOrder(accessToken: string, shop: string, orderId: string, updates: any): Promise<ShopifyOrder> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order: updates }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update order: ${response.statusText}`)
  }

  const data = await response.json()
  return data.order
}

// Webhook management
export async function createWebhook(accessToken: string, shop: string, topic: string, address: string): Promise<any> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhook: {
        topic,
        address,
        format: 'json'
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create webhook: ${response.statusText}`)
  }

  const data = await response.json()
  return data.webhook
}

export async function getWebhooks(accessToken: string, shop: string): Promise<any[]> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch webhooks: ${response.statusText}`)
  }

  const data = await response.json()
  return data.webhooks
}

export async function deleteWebhook(accessToken: string, shop: string, webhookId: string): Promise<void> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks/${webhookId}.json`, {
    method: 'DELETE',
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete webhook: ${response.statusText}`)
  }
}

// Metafield functions
export async function createProductMetafield(accessToken: string, shop: string, productId: string, metafield: any): Promise<any> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}/metafields.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metafield }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create metafield: ${response.statusText}`)
  }

  const data = await response.json()
  return data.metafield
}

export async function updateProductMetafield(accessToken: string, shop: string, productId: string, metafieldId: string, updates: any): Promise<any> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}/metafields/${metafieldId}.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metafield: updates }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update metafield: ${response.statusText}`)
  }

  const data = await response.json()
  return data.metafield
}

// Utility functions
export function isValidShopDomain(shop: string): boolean {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/
  return shopRegex.test(shop)
}

export function extractShopFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.endsWith('.myshopify.com')) {
      return urlObj.hostname
    }
    return null
  } catch {
    return null
  }
}

export function formatShopifyPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice)
}

// Draft Order interfaces
export interface DraftOrderLineItem {
  variant_id?: number
  product_id?: number
  quantity: number
  price: string
  title?: string
  sku?: string
  grams?: number
  vendor?: string
  taxable?: boolean
  requires_shipping?: boolean
  properties?: Array<{
    name: string
    value: string
  }>
}

export interface DraftOrderShippingAddress {
  first_name?: string
  last_name?: string
  company?: string
  address1: string
  address2?: string
  city: string
  province?: string
  country: string
  zip: string
  phone?: string
}

export interface CreateDraftOrderData {
  line_items: DraftOrderLineItem[]
  customer?: {
    id?: number
    email?: string
    first_name?: string
    last_name?: string
  }
  shipping_address?: DraftOrderShippingAddress
  billing_address?: DraftOrderShippingAddress
  note?: string
  email?: string
  currency?: string
  invoice_sent_at?: string
  invoice_url?: string
  name?: string
  tags?: string
  tax_exempt?: boolean
  tax_exemptions?: string[]
  use_customer_default_address?: boolean
}

export interface DraftOrder {
  id: number
  note: string
  email: string
  taxes_included: boolean
  currency: string
  invoice_sent_at: string | null
  created_at: string
  updated_at: string
  tax_exempt: boolean
  completed_at: string | null
  name: string
  status: 'open' | 'invoice_sent' | 'completed'
  line_items: DraftOrderLineItem[]
  shipping_address: DraftOrderShippingAddress | null
  billing_address: DraftOrderShippingAddress | null
  invoice_url: string | null
  applied_discount: any
  order_id: number | null
  shipping_line: any
  tax_lines: any[]
  tags: string
  note_attributes: any[]
  total_price: string
  subtotal_price: string
  total_tax: string
  customer: any
}

// Draft Order API functions
export async function createDraftOrder(
  shop: string,
  accessToken: string,
  draftOrderData: CreateDraftOrderData
): Promise<DraftOrder> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/draft_orders.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      draft_order: draftOrderData
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create draft order: ${error}`)
  }

  const data = await response.json()
  return data.draft_order
}

export async function getDraftOrder(
  shop: string,
  accessToken: string,
  draftOrderId: number
): Promise<DraftOrder> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/draft_orders/${draftOrderId}.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get draft order: ${error}`)
  }

  const data = await response.json()
  return data.draft_order
}

export async function updateDraftOrder(
  shop: string,
  accessToken: string,
  draftOrderId: number,
  updateData: Partial<CreateDraftOrderData>
): Promise<DraftOrder> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/draft_orders/${draftOrderId}.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      draft_order: updateData
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update draft order: ${error}`)
  }

  const data = await response.json()
  return data.draft_order
}

export async function completeDraftOrder(
  shop: string,
  accessToken: string,
  draftOrderId: number,
  paymentPending?: boolean
): Promise<DraftOrder> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/draft_orders/${draftOrderId}/complete.json`, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment_pending: paymentPending || false
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to complete draft order: ${error}`)
  }

  const data = await response.json()
  return data.draft_order
}

export async function sendDraftOrderInvoice(
  shop: string,
  accessToken: string,
  draftOrderId: number,
  customMessage?: string
): Promise<DraftOrder> {
  const body: any = {}
  if (customMessage) {
    body.draft_order_invoice = {
      to: undefined, // Will use draft order email
      from: undefined, // Will use shop email
      subject: undefined, // Will use default
      custom_message: customMessage
    }
  }

  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/draft_orders/${draftOrderId}/send_invoice.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send draft order invoice: ${error}`)
  }

  const data = await response.json()
  return data.draft_order
}

export async function deleteDraftOrder(
  shop: string,
  accessToken: string,
  draftOrderId: number
): Promise<void> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/draft_orders/${draftOrderId}.json`, {
    method: 'DELETE',
    headers: {
      'X-Shopify-Access-Token': accessToken,
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete draft order: ${error}`)
  }
}

// Refund API functions
export interface RefundLineItem {
  line_item_id: number
  quantity: number
  restock_type?: 'no_restock' | 'cancel' | 'return'
}

export interface CreateRefundData {
  refund: {
    currency?: string
    notify?: boolean
    note?: string
    shipping?: {
      full_refund?: boolean
      amount?: string
    }
    refund_line_items?: RefundLineItem[]
    transactions?: Array<{
      parent_id: number
      amount: string
      kind: 'refund'
      gateway: string
    }>
  }
}

export async function createRefund(
  shop: string,
  accessToken: string,
  orderId: number,
  refundData: CreateRefundData
): Promise<any> {
  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}/refunds.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(refundData)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create refund: ${error}`)
  }

  const data = await response.json()
  return data.refund
}
