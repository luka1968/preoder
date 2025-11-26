import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop } = req.query
    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    try {
        const { data: shopData } = await supabaseAdmin
            .from('shops')
            .select('id')
            .eq('shop_domain', shop)
            .single()

        if (!shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        const shopId = shopData.id

        const [preorderCount, orderStats, webhookStatus, recentErrors] = await Promise.all([
            supabaseAdmin
                .from('products_rules')
                .select('id', { count: 'exact', head: true })
                .eq('shop_id', shopId)
                .eq('active', true),

            getOrderStats(shopId),

            supabaseAdmin
                .from('webhook_status')
                .select('*')
                .eq('shop_id', shopId),

            supabaseAdmin
                .from('logs')
                .select('*')
                .eq('shop_id', shopId)
                .eq('level', 'error')
                .order('created_at', { ascending: false })
                .limit(5)
        ])

        const stats = {
            overview: {
                total_preorder_products: preorderCount.count || 0,
            },
            orders: {
                today_count: orderStats.todayCount,
                total_count: orderStats.totalCount,
            },
            health: {
                webhooks_healthy: webhookStatus.data?.every(w => w.is_healthy) || false,
                recent_errors_count: recentErrors.data?.length || 0,
            },
            alerts: [],
        }

        res.status(200).json({ stats })
    } catch (error) {
        console.error('Dashboard stats error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

async function getOrderStats(shopId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayOrders } = await supabaseAdmin
        .from('logs')
        .select('payload')
        .eq('shop_id', shopId)
        .eq('type', 'order_created')
        .gte('created_at', today.toISOString())

    const { data: allOrders } = await supabaseAdmin
        .from('logs')
        .select('payload')
        .eq('shop_id', shopId)
        .eq('type', 'order_created')

    return {
        todayCount: todayOrders?.length || 0,
        totalCount: allOrders?.length || 0,
    }
}
