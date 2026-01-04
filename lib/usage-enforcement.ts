/**
 * Usage Enforcement Middleware
 * Centralized usage limit checking and enforcement for billing
 */

import { supabaseAdmin } from './supabase'
import { BillingSystem } from './billing-system'

export interface UsageCheckResult {
    allowed: boolean
    current: number
    limit: number
    percentage: number
    message?: string
    requires_upgrade?: boolean
}

export class UsageEnforcement {

    /**
     * Check if shop can create a preorder (before creating)
     */
    static async checkPreorderLimit(shop: string): Promise<UsageCheckResult> {
        try {
            const shopId = await this.getShopId(shop)
            if (!shopId) {
                throw new Error('Shop not found')
            }

            const usageCheck = await BillingSystem.checkUsageLimit(shopId, 'preorder_orders')

            const percentage = Math.round((usageCheck.current / usageCheck.limit) * 100)

            return {
                allowed: usageCheck.allowed,
                current: usageCheck.current,
                limit: usageCheck.limit,
                percentage,
                message: this.getUsageMessage(usageCheck.current, usageCheck.limit, 'preorder'),
                requires_upgrade: !usageCheck.allowed
            }

        } catch (error) {
            console.error('Error checking preorder limit:', error)
            // Fail open - allow the operation but log the error
            return {
                allowed: true,
                current: 0,
                limit: 1000,
                percentage: 0,
                message: 'Unable to verify usage limit'
            }
        }
    }

    /**
     * Increment preorder usage counter
     */
    static async incrementPreorderUsage(shop: string): Promise<void> {
        try {
            const shopId = await this.getShopId(shop)
            if (!shopId) {
                throw new Error('Shop not found')
            }

            await BillingSystem.incrementUsage(shopId, 'preorder_orders')
            console.log('Incremented preorder usage for shop:', shop)

        } catch (error) {
            console.error('Error incrementing preorder usage:', error)
            // Don't throw - we don't want to block the operation if usage tracking fails
        }
    }

    /**
     * Check and increment in one operation
     */
    static async checkAndIncrementPreorder(shop: string): Promise<UsageCheckResult> {
        const result = await this.checkPreorderLimit(shop)

        if (result.allowed) {
            await this.incrementPreorderUsage(shop)
        }

        return result
    }

    /**
     * Get current usage status for a shop
     */
    static async getUsageStatus(shop: string): Promise<{
        preorders: UsageCheckResult
        restock_emails: UsageCheckResult
    }> {
        try {
            const shopId = await this.getShopId(shop)
            if (!shopId) {
                throw new Error('Shop not found')
            }

            const [preorderCheck, restockCheck] = await Promise.all([
                BillingSystem.checkUsageLimit(shopId, 'preorder_orders'),
                BillingSystem.checkUsageLimit(shopId, 'restock_emails')
            ])

            return {
                preorders: {
                    allowed: preorderCheck.allowed,
                    current: preorderCheck.current,
                    limit: preorderCheck.limit,
                    percentage: Math.round((preorderCheck.current / preorderCheck.limit) * 100),
                    message: this.getUsageMessage(preorderCheck.current, preorderCheck.limit, 'preorder')
                },
                restock_emails: {
                    allowed: restockCheck.allowed,
                    current: restockCheck.current,
                    limit: restockCheck.limit,
                    percentage: Math.round((restockCheck.current / restockCheck.limit) * 100),
                    message: this.getUsageMessage(restockCheck.current, restockCheck.limit, 'restock email')
                }
            }

        } catch (error) {
            console.error('Error getting usage status:', error)
            throw error
        }
    }

    /**
     * Check if shop has an active subscription
     */
    static async hasActiveSubscription(shop: string): Promise<boolean> {
        try {
            const shopId = await this.getShopId(shop)
            if (!shopId) {
                return false
            }

            const { data: subscription } = await supabaseAdmin
                .from('shop_subscriptions')
                .select('id, status')
                .eq('shop_id', shopId)
                .in('status', ['active', 'trialing'])
                .single()

            return !!subscription

        } catch (error) {
            console.error('Error checking subscription:', error)
            return false
        }
    }

    /**
     * Get shop ID from shop domain
     */
    private static async getShopId(shop: string): Promise<string | null> {
        const { data, error } = await supabaseAdmin
            .from('shops')
            .select('id')
            .eq('shop_domain', shop)
            .single()

        if (error || !data) {
            console.error('Failed to get shop ID:', error)
            return null
        }

        return data.id
    }

    /**
     * Generate user-friendly message based on usage
     */
    private static getUsageMessage(current: number, limit: number, type: string): string {
        const percentage = (current / limit) * 100

        if (percentage >= 100) {
            return `You've reached your monthly ${type} limit of ${limit}. Please upgrade to Pro to continue.`
        } else if (percentage >= 90) {
            return `You're using ${current} of ${limit} ${type}s (${Math.round(percentage)}%). Consider upgrading soon.`
        } else if (percentage >= 80) {
            return `You're using ${current} of ${limit} ${type}s (${Math.round(percentage)}%).`
        } else {
            return `${current} of ${limit} ${type}s used this month.`
        }
    }

    /**
     * Get grace period allowance
     * Allow a few extra orders with upgrade prompts
     */
    static async isWithinGracePeriod(shop: string): Promise<boolean> {
        const GRACE_LIMIT = 10 // Allow 10 extra orders

        try {
            const shopId = await this.getShopId(shop)
            if (!shopId) {
                return false
            }

            const usageCheck = await BillingSystem.checkUsageLimit(shopId, 'preorder_orders')
            const overage = usageCheck.current - usageCheck.limit

            return overage > 0 && overage <= GRACE_LIMIT

        } catch (error) {
            console.error('Error checking grace period:', error)
            return false
        }
    }
}
