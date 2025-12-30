import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * Campaign Management API
 * GET: List all campaigns for a shop
 * POST: Create new campaign
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop } = req.query

    if (!shop || typeof shop !== 'string') {
        return res.status(400).json({ error: 'Shop parameter required' })
    }

    // Get shop_id
    const { data: shopData, error: shopError } = await supabaseAdmin
        .from('shops')
        .select('id')
        .eq('shop_domain', shop)
        .single()

    if (shopError || !shopData) {
        return res.status(404).json({ error: 'Shop not found' })
    }

    const shopId = shopData.id

    if (req.method === 'GET') {
        return handleGet(shopId, res)
    } else if (req.method === 'POST') {
        return handlePost(shopId, req, res)
    } else {
        return res.status(405).json({ error: 'Method not allowed' })
    }
}

/**
 * GET: List all campaigns
 */
async function handleGet(shopId: string, res: NextApiResponse) {
    try {
        const { data: campaigns, error } = await supabaseAdmin
            .from('preorder_campaigns')
            .select(`
        *,
        product_count:campaign_products(count)
      `)
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Get order stats for each campaign
        const campaignsWithStats = await Promise.all(
            campaigns.map(async (campaign) => {
                const { data: orders } = await supabaseAdmin
                    .from('preorder_orders')
                    .select('id, payment_status')
                    .eq('campaign_id', campaign.id)

                const totalOrders = orders?.length || 0
                const pendingPayments = orders?.filter(o => o.payment_status === 'pending').length || 0

                return {
                    ...campaign,
                    stats: {
                        total_orders: totalOrders,
                        pending_payments: pendingPayments,
                        product_count: campaign.product_count?.[0]?.count || 0
                    }
                }
            })
        )

        return res.status(200).json({
            success: true,
            campaigns: campaignsWithStats
        })
    } catch (error: any) {
        console.error('❌ Get campaigns error:', error)
        return res.status(500).json({
            error: 'Failed to fetch campaigns',
            details: error.message
        })
    }
}

/**
 * POST: Create new campaign
 */
async function handlePost(shopId: string, req: NextApiRequest, res: NextApiResponse) {
    try {
        const {
            name,
            payment_mode = 'immediate',
            auto_cancel_days = 7,
            lock_inventory = true,
            send_payment_reminder = true,
            reminder_days_before_cancel = 2,
            enabled = true
        } = req.body

        if (!name) {
            return res.status(400).json({ error: 'Campaign name is required' })
        }

        // Validate payment_mode
        const validModes = ['immediate', 'pay_later', 'deposit']
        if (!validModes.includes(payment_mode)) {
            return res.status(400).json({
                error: 'Invalid payment_mode',
                valid_modes: validModes
            })
        }

        const { data: campaign, error } = await supabaseAdmin
            .from('preorder_campaigns')
            .insert({
                shop_id: shopId,
                name,
                payment_mode,
                auto_cancel_days,
                lock_inventory,
                send_payment_reminder,
                reminder_days_before_cancel,
                enabled
            })
            .select()
            .single()

        if (error) throw error

        console.log(`✅ Created campaign: ${campaign.name} (${campaign.payment_mode})`)

        return res.status(201).json({
            success: true,
            campaign
        })
    } catch (error: any) {
        console.error('❌ Create campaign error:', error)
        return res.status(500).json({
            error: 'Failed to create campaign',
            details: error.message
        })
    }
}
