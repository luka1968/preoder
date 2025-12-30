import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * Single Campaign Management API
 * GET: Get campaign details
 * PUT: Update campaign
 * DELETE: Delete campaign
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { campaignId } = req.query

    if (!campaignId || typeof campaignId !== 'string') {
        return res.status(400).json({ error: 'Campaign ID required' })
    }

    if (req.method === 'GET') {
        return handleGet(campaignId, res)
    } else if (req.method === 'PUT') {
        return handlePut(campaignId, req, res)
    } else if (req.method === 'DELETE') {
        return handleDelete(campaignId, res)
    } else {
        return res.status(405).json({ error: 'Method not allowed' })
    }
}

/**
 * GET: Get campaign details with products
 */
async function handleGet(campaignId: string, res: NextApiResponse) {
    try {
        const { data: campaign, error } = await supabaseAdmin
            .from('preorder_campaigns')
            .select('*')
            .eq('id', campaignId)
            .single()

        if (error) throw error

        // Get associated products
        const { data: products, error: productsError } = await supabaseAdmin
            .from('campaign_products')
            .select('*')
            .eq('campaign_id', campaignId)

        if (productsError) throw productsError

        // Get order statistics
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('preorder_orders')
            .select('id, payment_status, total_amount, created_at')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        return res.status(200).json({
            success: true,
            campaign: {
                ...campaign,
                products: products || [],
                orders: orders || [],
                stats: {
                    total_orders: orders?.length || 0,
                    pending_payments: orders?.filter(o => o.payment_status === 'pending').length || 0,
                    total_revenue: orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
                }
            }
        })
    } catch (error: any) {
        console.error('❌ Get campaign error:', error)
        return res.status(500).json({
            error: 'Failed to fetch campaign',
            details: error.message
        })
    }
}

/**
 * PUT: Update campaign settings
 */
async function handlePut(campaignId: string, req: NextApiRequest, res: NextApiResponse) {
    try {
        const {
            name,
            payment_mode,
            auto_cancel_days,
            lock_inventory,
            send_payment_reminder,
            reminder_days_before_cancel,
            enabled
        } = req.body

        const updates: any = {}
        if (name !== undefined) updates.name = name
        if (payment_mode !== undefined) updates.payment_mode = payment_mode
        if (auto_cancel_days !== undefined) updates.auto_cancel_days = auto_cancel_days
        if (lock_inventory !== undefined) updates.lock_inventory = lock_inventory
        if (send_payment_reminder !== undefined) updates.send_payment_reminder = send_payment_reminder
        if (reminder_days_before_cancel !== undefined) updates.reminder_days_before_cancel = reminder_days_before_cancel
        if (enabled !== undefined) updates.enabled = enabled

        const { data: campaign, error } = await supabaseAdmin
            .from('preorder_campaigns')
            .update(updates)
            .eq('id', campaignId)
            .select()
            .single()

        if (error) throw error

        console.log(`✅ Updated campaign: ${campaign.name}`)

        return res.status(200).json({
            success: true,
            campaign
        })
    } catch (error: any) {
        console.error('❌ Update campaign error:', error)
        return res.status(500).json({
            error: 'Failed to update campaign',
            details: error.message
        })
    }
}

/**
 * DELETE: Delete campaign and remove product associations
 */
async function handleDelete(campaignId: string, res: NextApiResponse) {
    try {
        // Check if there are active orders
        const { data: activeOrders } = await supabaseAdmin
            .from('preorder_orders')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('payment_status', 'pending')

        if (activeOrders && activeOrders.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete campaign with pending orders',
                pending_count: activeOrders.length
            })
        }

        // Delete campaign (cascade will handle campaign_products)
        const { error } = await supabaseAdmin
            .from('preorder_campaigns')
            .delete()
            .eq('id', campaignId)

        if (error) throw error

        console.log(`✅ Deleted campaign: ${campaignId}`)

        return res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully'
        })
    } catch (error: any) {
        console.error('❌ Delete campaign error:', error)
        return res.status(500).json({
            error: 'Failed to delete campaign',
            details: error.message
        })
    }
}
