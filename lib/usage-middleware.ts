import { NextApiRequest, NextApiResponse } from 'next'
import { BillingSystem } from './billing-system'
import { supabaseAdmin } from './supabase'

export interface UsageCheckResult {
  allowed: boolean
  current: number
  limit: number
  message?: string
}

/**
 * Middleware to check usage limits before allowing actions
 */
export class UsageMiddleware {
  
  /**
   * Check if shop can create a preorder
   */
  static async checkPreorderLimit(shopDomain: string): Promise<UsageCheckResult> {
    try {
      const shopId = await this.getShopId(shopDomain)
      if (!shopId) {
        return { allowed: false, current: 0, limit: 0, message: 'Shop not found' }
      }

      const usageCheck = await BillingSystem.checkUsageLimit(shopId, 'preorder_orders')
      
      return {
        allowed: usageCheck.allowed,
        current: usageCheck.current,
        limit: usageCheck.limit,
        message: usageCheck.allowed 
          ? undefined 
          : `Preorder limit reached (${usageCheck.current}/${usageCheck.limit}). Upgrade to Pro for higher limits.`
      }
    } catch (error) {
      console.error('Error checking preorder limit:', error)
      return { allowed: false, current: 0, limit: 0, message: 'Error checking limits' }
    }
  }

  /**
   * Check if shop can send restock emails
   */
  static async checkRestockEmailLimit(shopDomain: string): Promise<UsageCheckResult> {
    try {
      const shopId = await this.getShopId(shopDomain)
      if (!shopId) {
        return { allowed: false, current: 0, limit: 0, message: 'Shop not found' }
      }

      const usageCheck = await BillingSystem.checkUsageLimit(shopId, 'restock_emails')
      
      return {
        allowed: usageCheck.allowed,
        current: usageCheck.current,
        limit: usageCheck.limit,
        message: usageCheck.allowed 
          ? undefined 
          : `Restock email limit reached (${usageCheck.current}/${usageCheck.limit}). Upgrade to Pro for higher limits.`
      }
    } catch (error) {
      console.error('Error checking restock email limit:', error)
      return { allowed: false, current: 0, limit: 0, message: 'Error checking limits' }
    }
  }

  /**
   * Check if shop can use partial payments
   */
  static async checkPartialPaymentAccess(shopDomain: string): Promise<UsageCheckResult> {
    try {
      const shopId = await this.getShopId(shopDomain)
      if (!shopId) {
        return { allowed: false, current: 0, limit: 0, message: 'Shop not found' }
      }

      const hasAccess = await BillingSystem.canUseFeature(shopId, 'partial_payments')
      
      return {
        allowed: hasAccess,
        current: 0,
        limit: hasAccess ? 999999 : 0,
        message: hasAccess 
          ? undefined 
          : 'Partial payments are only available on Pro plan. Upgrade to unlock this feature.'
      }
    } catch (error) {
      console.error('Error checking partial payment access:', error)
      return { allowed: false, current: 0, limit: 0, message: 'Error checking access' }
    }
  }

  /**
   * Check if shop can edit email templates
   */
  static async checkEmailTemplateAccess(shopDomain: string): Promise<UsageCheckResult> {
    try {
      const shopId = await this.getShopId(shopDomain)
      if (!shopId) {
        return { allowed: false, current: 0, limit: 0, message: 'Shop not found' }
      }

      const hasAccess = await BillingSystem.canUseFeature(shopId, 'email_template_editing')
      
      return {
        allowed: hasAccess,
        current: 0,
        limit: hasAccess ? 1 : 0,
        message: hasAccess 
          ? undefined 
          : 'Email template editing is only available on Pro plan. Upgrade to customize your emails.'
      }
    } catch (error) {
      console.error('Error checking email template access:', error)
      return { allowed: false, current: 0, limit: 0, message: 'Error checking access' }
    }
  }

  /**
   * Check if shop should show branding
   */
  static async shouldShowBranding(shopDomain: string): Promise<boolean> {
    try {
      const shopId = await this.getShopId(shopDomain)
      if (!shopId) return true // Show branding by default

      const canRemoveBranding = await BillingSystem.canUseFeature(shopId, 'remove_branding')
      return !canRemoveBranding // Show branding if can't remove it
    } catch (error) {
      console.error('Error checking branding settings:', error)
      return true // Show branding on error
    }
  }

  /**
   * Increment usage and check limits
   */
  static async incrementAndCheck(
    shopDomain: string, 
    usageType: 'preorder_orders' | 'restock_emails' | 'partial_payments'
  ): Promise<UsageCheckResult> {
    try {
      const shopId = await this.getShopId(shopDomain)
      if (!shopId) {
        return { allowed: false, current: 0, limit: 0, message: 'Shop not found' }
      }

      // Check limit first
      const usageCheck = await BillingSystem.checkUsageLimit(shopId, usageType)
      
      if (!usageCheck.allowed) {
        return {
          allowed: false,
          current: usageCheck.current,
          limit: usageCheck.limit,
          message: `${usageType.replace('_', ' ')} limit reached (${usageCheck.current}/${usageCheck.limit}). Upgrade to Pro for higher limits.`
        }
      }

      // Increment usage
      await BillingSystem.incrementUsage(shopId, usageType)
      
      return {
        allowed: true,
        current: usageCheck.current + 1,
        limit: usageCheck.limit
      }
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return { allowed: false, current: 0, limit: 0, message: 'Error updating usage' }
    }
  }

  /**
   * Get shop ID from domain
   */
  private static async getShopId(shopDomain: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('domain', shopDomain)
      .single()

    if (error || !data) {
      return null
    }

    return data.id
  }
}

/**
 * Express-style middleware function for API routes
 */
export function withUsageCheck(
  usageType: 'preorder_orders' | 'restock_emails' | 'partial_payments',
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { shop } = req.query

    if (!shop || typeof shop !== 'string') {
      return res.status(400).json({ error: 'Shop parameter is required' })
    }

    // Check usage limit
    let usageCheck: UsageCheckResult
    
    switch (usageType) {
      case 'preorder_orders':
        usageCheck = await UsageMiddleware.checkPreorderLimit(shop)
        break
      case 'restock_emails':
        usageCheck = await UsageMiddleware.checkRestockEmailLimit(shop)
        break
      case 'partial_payments':
        usageCheck = await UsageMiddleware.checkPartialPaymentAccess(shop)
        break
      default:
        return res.status(400).json({ error: 'Invalid usage type' })
    }

    if (!usageCheck.allowed) {
      return res.status(403).json({
        error: 'Usage limit exceeded',
        message: usageCheck.message,
        current: usageCheck.current,
        limit: usageCheck.limit,
        usage_type: usageType
      })
    }

    // If allowed, proceed with the handler
    return handler(req, res)
  }
}

/**
 * Feature access middleware
 */
export function withFeatureCheck(
  feature: keyof import('./billing-system').PlanFeatures,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { shop } = req.query

    if (!shop || typeof shop !== 'string') {
      return res.status(400).json({ error: 'Shop parameter is required' })
    }

    let hasAccess: boolean
    
    switch (feature) {
      case 'email_template_editing':
        const emailAccess = await UsageMiddleware.checkEmailTemplateAccess(shop)
        hasAccess = emailAccess.allowed
        break
      case 'partial_payments':
        const partialAccess = await UsageMiddleware.checkPartialPaymentAccess(shop)
        hasAccess = partialAccess.allowed
        break
      default:
        // For other features, check directly
        const shopId = await UsageMiddleware['getShopId'](shop)
        if (!shopId) {
          return res.status(404).json({ error: 'Shop not found' })
        }
        hasAccess = await BillingSystem.canUseFeature(shopId, feature)
    }

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Feature not available',
        message: `${feature.replace('_', ' ')} is only available on Pro plan. Upgrade to unlock this feature.`,
        feature
      })
    }

    // If has access, proceed with the handler
    return handler(req, res)
  }
}
