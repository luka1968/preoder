import { createClient } from '@supabase/supabase-js'

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database interfaces
export interface Shop {
  id: string
  shop_domain: string
  access_token: string
  scope: string
  installed_at: string
  updated_at: string
  plan: string
  email?: string
  name?: string
  currency?: string
  timezone?: string
  country_code?: string
  active: boolean
}

export interface PreorderSettings {
  id: string
  shop_id: string
  enabled: boolean
  button_text: string
  badge_text: string
  badge_color: string
  show_estimated_date: boolean
  allow_partial_payment: boolean
  partial_payment_percentage: number
  auto_tag_orders: boolean
  order_tag: string
  created_at: string
  updated_at: string
}

export interface ProductPreorderConfig {
  id: string
  shop_id: string
  product_id: string
  enabled: boolean
  preorder_type: 'out_of_stock' | 'always' | 'coming_soon'
  preorder_start_date?: string
  preorder_end_date?: string
  estimated_delivery_date?: string
  delivery_note?: string
  custom_button_text?: string
  custom_badge_text?: string
  badge_color?: string
  allow_partial_payment: boolean
  partial_payment_percentage: number
  auto_tag_orders: boolean
  order_tag: string
  variants_config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface BackInStockSubscription {
  id: string
  shop_id: string
  product_id: string
  variant_id?: string
  customer_email: string
  customer_name?: string
  status: 'active' | 'notified' | 'cancelled'
  created_at: string
  updated_at: string
  notified_at?: string
}

export interface PreorderOrder {
  id: string
  shop_id: string
  shopify_order_id: string
  product_id: string
  variant_id?: string
  customer_email: string
  total_amount: string
  paid_amount: string
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  fulfillment_status: 'pending' | 'fulfilled' | 'cancelled'
  estimated_delivery_date?: string
  order_tags: string[]
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  shop_id: string
  template_type: 'back_in_stock' | 'preorder_confirmation' | 'payment_reminder' | 'delivery_update'
  subject: string
  html_content: string
  text_content: string
  variables: Record<string, string>
  active: boolean
  created_at: string
  updated_at: string
}

export interface NotificationQueue {
  id: string
  shop_id: string
  template_type: string
  recipient_email: string
  subject: string
  html_content: string
  text_content: string
  status: 'pending' | 'sent' | 'failed'
  scheduled_at?: string
  sent_at?: string
  error_message?: string
  retry_count: number
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  shop_id: string
  plan_name: string
  plan_price: number
  billing_cycle: 'monthly' | 'yearly'
  features: Record<string, any>
  status: 'active' | 'cancelled' | 'past_due'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  shop_id: string
  activity_type: string
  description: string
  metadata: Record<string, any>
  created_at: string
}

// Shop management functions
export async function getShopByDomain(shopDomain: string): Promise<Shop | null> {
  const { data, error } = await supabaseAdmin
    .from('shops')
    .select('*')
    .eq('shop_domain', shopDomain)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw error
  }

  return data
}

export async function createShop(shopData: Omit<Shop, 'id' | 'installed_at' | 'updated_at'>): Promise<Shop> {
  const { data, error } = await supabaseAdmin
    .from('shops')
    .insert({
      ...shopData,
      installed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop> {
  const { data, error } = await supabaseAdmin
    .from('shops')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', shopId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteShop(shopId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('shops')
    .delete()
    .eq('id', shopId)

  if (error) {
    throw error
  }
}

// GDPR-compliant data deletion functions

/**
 * Permanently delete all data associated with a shop (GDPR shop/redact webhook)
 * This is triggered 48 hours after app uninstallation
 */
export async function deleteShopData(shopDomain: string): Promise<void> {
  console.log(`[GDPR] Starting shop data deletion for: ${shopDomain}`)

  try {
    // Get shop ID first
    const shop = await getShopByDomain(shopDomain)
    if (!shop) {
      console.log(`[GDPR] Shop not found: ${shopDomain}`)
      return
    }

    const shopId = shop.id

    // Log deletion event before removing data (for audit trail)
    await logActivity(
      shopId,
      'gdpr_shop_redact',
      `GDPR shop data deletion initiated for ${shopDomain}`,
      {
        shop_id: shopId,
        shop_domain: shopDomain,
        deletion_timestamp: new Date().toISOString()
      }
    )

    // Delete data in order (respecting foreign key dependencies)
    // Note: Some tables have CASCADE delete, but we do it explicitly for clarity

    console.log(`[GDPR] Deleting products_rules for shop ${shopId}`)
    await supabaseAdmin.from('products_rules').delete().eq('shop_id', shopId)

    console.log(`[GDPR] Deleting preorder_settings for shop ${shopId}`)
    await supabaseAdmin.from('preorder_settings').delete().eq('shop_id', shopId)

    console.log(`[GDPR] Deleting frontend_settings for shop ${shopId}`)
    await supabaseAdmin.from('frontend_settings').delete().eq('shop_id', shopId)

    console.log(`[GDPR] Deleting preorder_orders for shop ${shopId}`)
    await supabaseAdmin.from('preorder_orders').delete().eq('shop_id', shopId)

    console.log(`[GDPR] Deleting back_in_stock_subscriptions for shop ${shopId}`)
    await supabaseAdmin.from('back_in_stock_subscriptions').delete().eq('shop_id', shopId)

    console.log(`[GDPR] Deleting shop_subscriptions for shop ${shopId}`)
    await supabaseAdmin.from('shop_subscriptions').delete().eq('shop_id', shopId)

    console.log(`[GDPR] Deleting usage_tracking for shop ${shopId}`)
    await supabaseAdmin.from('usage_tracking').delete().eq('shop_id', shopId)

    console.log(`[GDPR] Deleting billing_events for shop ${shopId}`)
    await supabaseAdmin.from('billing_events').delete().eq('shop_id', shopId)

    // Delete logs last (except the GDPR deletion log which we'll keep briefly)
    console.log(`[GDPR] Deleting activity_logs for shop ${shopId}`)
    await supabaseAdmin
      .from('logs')
      .delete()
      .eq('shop_id', shopId)
      .neq('activity_type', 'gdpr_shop_redact')

    // Finally, delete the shop record itself
    console.log(`[GDPR] Deleting shop record for ${shopId}`)
    await supabaseAdmin.from('shops').delete().eq('id', shopId)

    console.log(`[GDPR] ✅ Successfully deleted all data for shop: ${shopDomain}`)

  } catch (error) {
    console.error(`[GDPR] ❌ Error deleting shop data for ${shopDomain}:`, error)
    throw error
  }
}

/**
 * Anonymize customer PII (GDPR customers/redact webhook)
 * Replaces customer email with anonymized placeholder while keeping order records
 */
export async function deleteCustomerData(
  shopId: string,
  customerEmail: string
): Promise<void> {
  console.log(`[GDPR] Starting customer data anonymization for: ${customerEmail}`)

  try {
    const timestamp = new Date().getTime()
    const anonymizedEmail = `redacted-${timestamp}@privacy.invalid`

    // Log deletion event before anonymizing
    await logActivity(
      shopId,
      'gdpr_customer_redact',
      `GDPR customer data redaction for ${customerEmail}`,
      {
        shop_id: shopId,
        original_email: customerEmail,
        anonymized_email: anonymizedEmail,
        redaction_timestamp: new Date().toISOString()
      }
    )

    // Anonymize email in preorder_orders
    const { data: orders, error: fetchError } = await supabaseAdmin
      .from('preorder_orders')
      .select('id')
      .eq('shop_id', shopId)
      .eq('customer_email', customerEmail)

    if (fetchError) {
      throw fetchError
    }

    if (orders && orders.length > 0) {
      console.log(`[GDPR] Anonymizing ${orders.length} preorder records`)
      const { error: updateError } = await supabaseAdmin
        .from('preorder_orders')
        .update({ customer_email: anonymizedEmail })
        .eq('shop_id', shopId)
        .eq('customer_email', customerEmail)

      if (updateError) {
        throw updateError
      }
    }

    // Delete back-in-stock subscriptions (these can be fully removed)
    const { data: subscriptions, error: subFetchError } = await supabaseAdmin
      .from('back_in_stock_subscriptions')
      .select('id')
      .eq('shop_id', shopId)
      .eq('customer_email', customerEmail)

    if (subFetchError) {
      throw subFetchError
    }

    if (subscriptions && subscriptions.length > 0) {
      console.log(`[GDPR] Deleting ${subscriptions.length} back-in-stock subscriptions`)
      const { error: deleteError } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .delete()
        .eq('shop_id', shopId)
        .eq('customer_email', customerEmail)

      if (deleteError) {
        throw deleteError
      }
    }

    console.log(`[GDPR] ✅ Successfully anonymized customer data: ${customerEmail}`)

  } catch (error) {
    console.error(`[GDPR] ❌ Error anonymizing customer data for ${customerEmail}:`, error)
    throw error
  }
}

/**
 * Export all customer data (GDPR customers/data_request webhook)
 * Returns JSON object with all data associated with customer email
 */
export async function exportCustomerData(
  shopId: string,
  customerEmail: string
): Promise<object> {
  console.log(`[GDPR] Exporting customer data for: ${customerEmail}`)

  try {
    // Log data export request
    await logActivity(
      shopId,
      'gdpr_customer_data_request',
      `GDPR customer data export request for ${customerEmail}`,
      {
        shop_id: shopId,
        customer_email: customerEmail,
        request_timestamp: new Date().toISOString()
      }
    )

    // Fetch preorder orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('preorder_orders')
      .select('*')
      .eq('shop_id', shopId)
      .eq('customer_email', customerEmail)

    if (ordersError) {
      throw ordersError
    }

    // Fetch back-in-stock subscriptions
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('back_in_stock_subscriptions')
      .select('*')
      .eq('shop_id', shopId)
      .eq('customer_email', customerEmail)

    if (subsError) {
      throw subsError
    }

    const exportData = {
      customer_email: customerEmail,
      export_date: new Date().toISOString(),
      preorder_orders: orders || [],
      back_in_stock_subscriptions: subscriptions || [],
      data_summary: {
        total_preorders: orders?.length || 0,
        total_subscriptions: subscriptions?.length || 0
      }
    }

    console.log(`[GDPR] ✅ Successfully exported customer data: ${customerEmail}`)
    console.log(`[GDPR] Export summary:`, exportData.data_summary)

    return exportData

  } catch (error) {
    console.error(`[GDPR] ❌ Error exporting customer data for ${customerEmail}:`, error)
    throw error
  }
}


// Preorder settings functions
export async function getPreorderSettings(shopId: string): Promise<PreorderSettings | null> {
  const { data, error } = await supabaseAdmin
    .from('preorder_settings')
    .select('*')
    .eq('shop_id', shopId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function createOrUpdatePreorderSettings(shopId: string, settings: Partial<PreorderSettings>): Promise<PreorderSettings> {
  const { data, error } = await supabaseAdmin
    .from('preorder_settings')
    .upsert({
      shop_id: shopId,
      ...settings,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_id'
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Product preorder config functions
export async function getProductPreorderConfig(shopId: string, productId: string): Promise<ProductPreorderConfig | null> {
  const { data, error } = await supabaseAdmin
    .from('product_preorder_configs')
    .select('*')
    .eq('shop_id', shopId)
    .eq('product_id', productId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function createOrUpdateProductConfig(shopId: string, productId: string, config: Partial<ProductPreorderConfig>): Promise<ProductPreorderConfig> {
  const { data, error } = await supabaseAdmin
    .from('product_preorder_configs')
    .upsert({
      shop_id: shopId,
      product_id: productId,
      ...config,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_id,product_id'
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getProductConfigs(shopId: string, limit = 50, offset = 0): Promise<ProductPreorderConfig[]> {
  const { data, error } = await supabaseAdmin
    .from('product_preorder_configs')
    .select('*')
    .eq('shop_id', shopId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw error
  }

  return data || []
}

// Back in stock subscription functions
export async function createBackInStockSubscription(subscription: Omit<BackInStockSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<BackInStockSubscription> {
  const { data, error } = await supabaseAdmin
    .from('back_in_stock_subscriptions')
    .insert({
      ...subscription,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getBackInStockSubscriptions(shopId: string, productId?: string, variantId?: string): Promise<BackInStockSubscription[]> {
  let query = supabaseAdmin
    .from('back_in_stock_subscriptions')
    .select('*')
    .eq('shop_id', shopId)
    .eq('status', 'active')

  if (productId) {
    query = query.eq('product_id', productId)
  }

  if (variantId) {
    query = query.eq('variant_id', variantId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function updateSubscriptionStatus(subscriptionId: string, status: BackInStockSubscription['status'], notifiedAt?: string): Promise<void> {
  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (notifiedAt) {
    updates.notified_at = notifiedAt
  }

  const { error } = await supabaseAdmin
    .from('back_in_stock_subscriptions')
    .update(updates)
    .eq('id', subscriptionId)

  if (error) {
    throw error
  }
}

// Preorder order functions
export async function createPreorderOrder(order: Omit<PreorderOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PreorderOrder> {
  const { data, error } = await supabaseAdmin
    .from('preorder_orders')
    .insert({
      ...order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getPreorderOrders(shopId: string, limit = 50, offset = 0): Promise<PreorderOrder[]> {
  const { data, error } = await supabaseAdmin
    .from('preorder_orders')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw error
  }

  return data || []
}

export async function updatePreorderOrder(orderId: string, updates: Partial<PreorderOrder>): Promise<PreorderOrder> {
  const { data, error } = await supabaseAdmin
    .from('preorder_orders')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Email template functions
export async function getEmailTemplate(shopId: string, templateType: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('shop_id', shopId)
    .eq('template_type', templateType)
    .eq('active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function createOrUpdateEmailTemplate(shopId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .upsert({
      shop_id: shopId,
      ...template,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_id,template_type'
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Notification queue functions
export async function addToNotificationQueue(notification: Omit<NotificationQueue, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationQueue> {
  const { data, error } = await supabaseAdmin
    .from('notification_queue')
    .insert({
      ...notification,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getPendingNotifications(limit = 100): Promise<NotificationQueue[]> {
  const { data, error } = await supabaseAdmin
    .from('notification_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw error
  }

  return data || []
}

export async function updateNotificationStatus(notificationId: string, status: NotificationQueue['status'], errorMessage?: string): Promise<void> {
  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (status === 'sent') {
    updates.sent_at = new Date().toISOString()
  }

  if (errorMessage) {
    updates.error_message = errorMessage
  }

  if (status === 'failed') {
    // Increment retry count
    const { data: current } = await supabaseAdmin
      .from('notification_queue')
      .select('retry_count')
      .eq('id', notificationId)
      .single()

    if (current) {
      updates.retry_count = (current.retry_count || 0) + 1
    }
  }

  const { error } = await supabaseAdmin
    .from('notification_queue')
    .update(updates)
    .eq('id', notificationId)

  if (error) {
    throw error
  }
}

// Activity logging
export async function logActivity(shopId: string, activityType: string, description: string, metadata: Record<string, any> = {}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('activity_logs')
    .insert({
      shop_id: shopId,
      activity_type: activityType,
      description,
      metadata,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error logging activity:', error)
    // Don't throw error for logging failures
  }
}

export async function getRecentActivity(shopId: string, limit = 20): Promise<ActivityLog[]> {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data || []
}

// Subscription plan functions
export async function getSubscriptionPlan(shopId: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('shop_id', shopId)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function createOrUpdateSubscriptionPlan(shopId: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .upsert({
      shop_id: shopId,
      ...plan,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_id'
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Utility functions
export function formatTimestamp(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateId(): string {
  return crypto.randomUUID()
}

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('shops')
      .select('id')
      .limit(1)

    return !error
  } catch {
    return false
  }
}
