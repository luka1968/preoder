import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getShopifyOrders } from '../../../lib/shopify'

/**
 * GET /api/orders/preorder?shop=xxx&status=all
 * 
 * 预购订单管理
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop, status = 'all', limit = 50 } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    try {
        const { data: shopData } = await supabaseAdmin
            .from('shops')
            .select('id, access_token')
            .eq('shop_domain', shop)
            .single()

        if (!shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        // 从日志中获取预购订单记录
        let query = supabaseAdmin
            .from('logs')
            .select('*')
            .eq('shop_id', shopData.id)
            .eq('type', 'order_created')
            .order('created_at', { ascending: false })
            .limit(parseInt(limit as string))

        const { data: orderLogs } = await query

        // 解析订单数据
        const orders = orderLogs?.map(log => {
            const payload = log.payload as any
            return {
                id: log.id,
                order_id: payload.order_id,
                order_number: payload.order_number,
                customer_email: payload.customer_email,
                total_price: payload.total_price,
                financial_status: payload.financial_status,
                fulfillment_status: payload.fulfillment_status,
                created_at: log.created_at,
                line_items: payload.line_items,
                is_preorder: payload.tags?.includes('preorder') || false,
            }
        }) || []

        // 筛选预购订单
        const preorderOrders = orders.filter(o => o.is_preorder)

        res.status(200).json({
            orders: preorderOrders,
            total: preorderOrders.length,
        })

    } catch (error: any) {
        console.error('Preorder orders error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
