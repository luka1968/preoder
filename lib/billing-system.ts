import { supabaseAdmin } from './supabase'

// Pricing Plan Types
export interface PricingPlan {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: PlanFeatures
  limits: PlanLimits
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlanFeatures {
  preorder_orders: boolean
  restock_emails: boolean
  basic_badges: boolean
  advanced_badges?: boolean
  email_notifications: boolean
  advanced_scheduling?: boolean
  order_management: boolean
  multilingual: boolean
  partial_payments?: boolean
  discount_codes?: boolean
  email_template_editing?: boolean
  analytics?: boolean
  priority_support?: boolean
  remove_branding?: boolean
}

export interface PlanLimits {
  preorder_orders_per_month: number
  restock_emails_per_month: number
  partial_payments: boolean
  discount_codes: boolean
  email_template_editing: boolean
  remove_branding: boolean
  priority_support: boolean
}

export interface ShopSubscription {
  id: string
  shop_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  billing_cycle: 'monthly' | 'yearly'
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  pricing_plans?: PricingPlan
}

export interface UsageTracking {
  id: string
  shop_id: string
  subscription_id: string
  usage_type: 'preorder_orders' | 'restock_emails' | 'partial_payments'
  usage_count: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface BillingEvent {
  id: string
  shop_id: string
  subscription_id?: string
  event_type: string
  event_data: any
  created_at: string
}

// Billing System Class
export class BillingSystem {
  
  // Get all available pricing plans
  static async getPricingPlans(): Promise<PricingPlan[]> {
    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch pricing plans: ${error.message}`)
    }

    return data || []
  }

  // Get shop's current subscription
  static async getShopSubscription(shopId: string): Promise<ShopSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from('shop_subscriptions')
      .select(`
        *,
        pricing_plans (*)
      `)
      .eq('shop_id', shopId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch shop subscription: ${error.message}`)
    }

    return data
  }

  // Create new subscription for shop
  static async createSubscription(
    shopId: string, 
    planId: string, 
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<ShopSubscription> {
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setDate(periodEnd.getDate() + 30) // 30 days billing cycle

    const { data, error } = await supabaseAdmin
      .from('shop_subscriptions')
      .insert({
        shop_id: shopId,
        plan_id: planId,
        billing_cycle: billingCycle,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`)
    }

    // Log billing event
    await this.logBillingEvent(shopId, data.id, 'subscription_created', {
      plan_id: planId,
      billing_cycle: billingCycle
    })

    // Initialize usage tracking for the new period
    await this.initializeUsageTracking(shopId, data.id, now, periodEnd)

    return data
  }

  // Change subscription plan
  static async changePlan(
    shopId: string, 
    newPlanId: string, 
    billingCycle?: 'monthly' | 'yearly'
  ): Promise<ShopSubscription> {
    const currentSubscription = await this.getShopSubscription(shopId)
    
    if (!currentSubscription) {
      throw new Error('No active subscription found')
    }

    const updateData: any = {
      plan_id: newPlanId,
      updated_at: new Date().toISOString()
    }

    if (billingCycle) {
      updateData.billing_cycle = billingCycle
    }

    const { data, error } = await supabaseAdmin
      .from('shop_subscriptions')
      .update(updateData)
      .eq('id', currentSubscription.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to change plan: ${error.message}`)
    }

    // Log billing event
    await this.logBillingEvent(shopId, data.id, 'plan_changed', {
      old_plan_id: currentSubscription.plan_id,
      new_plan_id: newPlanId,
      billing_cycle: billingCycle || currentSubscription.billing_cycle
    })

    return data
  }

  // Cancel subscription
  static async cancelSubscription(shopId: string): Promise<void> {
    const subscription = await this.getShopSubscription(shopId)
    
    if (!subscription) {
      throw new Error('No active subscription found')
    }

    const { error } = await supabaseAdmin
      .from('shop_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`)
    }

    // Log billing event
    await this.logBillingEvent(shopId, subscription.id, 'subscription_cancelled', {
      plan_id: subscription.plan_id
    })
  }

  // Check if shop can use a feature
  static async canUseFeature(shopId: string, feature: keyof PlanFeatures): Promise<boolean> {
    const subscription = await this.getShopSubscription(shopId)
    
    if (!subscription || !subscription.pricing_plans) {
      // Default to free plan features
      const freePlan = await this.getFreePlan()
      return freePlan?.features[feature] || false
    }

    return subscription.pricing_plans.features[feature] || false
  }

  // Check usage limits
  static async checkUsageLimit(
    shopId: string, 
    usageType: 'preorder_orders' | 'restock_emails' | 'partial_payments'
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const subscription = await this.getShopSubscription(shopId)
    
    let limits: PlanLimits
    if (!subscription || !subscription.pricing_plans) {
      const freePlan = await this.getFreePlan()
      limits = freePlan?.limits || {
        preorder_orders_per_month: 1,
        restock_emails_per_month: 50,
        partial_payments: false,
        discount_codes: false,
        email_template_editing: false,
        remove_branding: false,
        priority_support: false
      }
    } else {
      limits = subscription.pricing_plans.limits
    }

    // Get current usage for this period
    const currentUsage = await this.getCurrentUsage(shopId, usageType)
    
    let limit: number
    switch (usageType) {
      case 'preorder_orders':
        limit = limits.preorder_orders_per_month
        break
      case 'restock_emails':
        limit = limits.restock_emails_per_month
        break
      case 'partial_payments':
        limit = limits.partial_payments ? 999999 : 0 // Unlimited if allowed, 0 if not
        break
      default:
        limit = 0
    }

    return {
      allowed: currentUsage < limit,
      current: currentUsage,
      limit: limit
    }
  }

  // Increment usage counter
  static async incrementUsage(
    shopId: string, 
    usageType: 'preorder_orders' | 'restock_emails' | 'partial_payments'
  ): Promise<void> {
    const subscription = await this.getShopSubscription(shopId)
    
    if (!subscription) {
      throw new Error('No active subscription found')
    }

    const now = new Date()
    const periodStart = new Date(subscription.current_period_start)
    const periodEnd = new Date(subscription.current_period_end)

    // Upsert usage tracking record
    const { error } = await supabaseAdmin
      .from('usage_tracking')
      .upsert({
        shop_id: shopId,
        subscription_id: subscription.id,
        usage_type: usageType,
        usage_count: 1, // This will be incremented by the database
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      }, {
        onConflict: 'shop_id,usage_type,period_start',
        ignoreDuplicates: false
      })

    if (error) {
      // If record exists, increment the count
      const { error: updateError } = await supabaseAdmin
        .rpc('increment_usage_count', {
          p_shop_id: shopId,
          p_usage_type: usageType,
          p_period_start: periodStart.toISOString()
        })

      if (updateError) {
        throw new Error(`Failed to increment usage: ${updateError.message}`)
      }
    }
  }

  // Get current usage for a shop and usage type
  static async getCurrentUsage(
    shopId: string, 
    usageType: 'preorder_orders' | 'restock_emails' | 'partial_payments'
  ): Promise<number> {
    const subscription = await this.getShopSubscription(shopId)
    
    if (!subscription) {
      return 0
    }

    const periodStart = new Date(subscription.current_period_start)
    const periodEnd = new Date(subscription.current_period_end)

    const { data, error } = await supabaseAdmin
      .from('usage_tracking')
      .select('usage_count')
      .eq('shop_id', shopId)
      .eq('usage_type', usageType)
      .eq('period_start', periodStart.toISOString())
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get current usage: ${error.message}`)
    }

    return data?.usage_count || 0
  }

  // Get free plan
  static async getFreePlan(): Promise<PricingPlan | null> {
    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .eq('name', 'Free')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get free plan: ${error.message}`)
    }

    return data
  }

  // Initialize usage tracking for new billing period
  static async initializeUsageTracking(
    shopId: string, 
    subscriptionId: string, 
    periodStart: Date, 
    periodEnd: Date
  ): Promise<void> {
    const usageTypes = ['preorder_orders', 'restock_emails', 'partial_payments']
    
    const records = usageTypes.map(type => ({
      shop_id: shopId,
      subscription_id: subscriptionId,
      usage_type: type,
      usage_count: 0,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString()
    }))

    const { error } = await supabaseAdmin
      .from('usage_tracking')
      .insert(records)

    if (error) {
      console.error('Failed to initialize usage tracking:', error)
    }
  }

  // Log billing event
  static async logBillingEvent(
    shopId: string, 
    subscriptionId: string | null, 
    eventType: string, 
    eventData: any
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('billing_events')
      .insert({
        shop_id: shopId,
        subscription_id: subscriptionId,
        event_type: eventType,
        event_data: eventData
      })

    if (error) {
      console.error('Failed to log billing event:', error)
    }
  }

  // Get usage summary for shop
  static async getUsageSummary(shopId: string): Promise<{
    preorder_orders: { current: number; limit: number }
    restock_emails: { current: number; limit: number }
    partial_payments: { current: number; limit: number }
  }> {
    const [preorderUsage, restockUsage, partialPaymentUsage] = await Promise.all([
      this.checkUsageLimit(shopId, 'preorder_orders'),
      this.checkUsageLimit(shopId, 'restock_emails'),
      this.checkUsageLimit(shopId, 'partial_payments')
    ])

    return {
      preorder_orders: { current: preorderUsage.current, limit: preorderUsage.limit },
      restock_emails: { current: restockUsage.current, limit: restockUsage.limit },
      partial_payments: { current: partialPaymentUsage.current, limit: partialPaymentUsage.limit }
    }
  }
}

// Database function to increment usage count
export const createIncrementUsageFunction = `
CREATE OR REPLACE FUNCTION increment_usage_count(
  p_shop_id UUID,
  p_usage_type VARCHAR,
  p_period_start TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  UPDATE usage_tracking 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE shop_id = p_shop_id 
    AND usage_type = p_usage_type 
    AND period_start = p_period_start;
END;
$$ LANGUAGE plpgsql;
`
