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
export async function getEmailTemplate(shopId: string, templateType: EmailTemplate['template_type']): Promise<EmailTemplate | null> {
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
