import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/dashboard/stats?shop=xxx
 * 
 * Dashboard 统计数据
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    try {
        // 获取店铺信息
        const { data: shopData } = await supabaseAdmin
            .from('shops')
            .select('id')
            .eq('shop_domain', shop)
            .single()

        if (!shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        const shopId = shopData.id

        // 并行获取所有统计数据
        const [
            preorderProductsCount,
            activePreordersCount,
            autoPreordersCount,
            orderStats,
            webhookStatus,
            recentErrors
        ] = await Promise.all([
            // 1. 总预购商品数
            supabaseAdmin
                .from('products_rules')
                .select('id', { count: 'exact', head: true })
                .eq('shop_id', shopId)
                .eq('active', true),

            // 2. 手动启用的预购数
            supabaseAdmin
                .from('products_rules')
                .select('id', { count: 'exact', head: true })
                .eq('shop_id', shopId)
                .eq('manual_preorder', true)
                .eq('active', true),

            // 3. 自动预购商品数
            supabaseAdmin
                .from('products_rules')
                .select('id', { count: 'exact', head: true })
                .eq('shop_id', shopId)
                .eq('auto_preorder', true)
                .eq('active', true),

            // 4. 预购订单统计（今天和总数）
            getOrderStats(shopId),

            // 5. Webhook 健康状态
            supabaseAdmin
                .from('webhook_status')
                .select('*')
                .eq('shop_id', shopId),

            // 6. 最近错误日志
            supabaseAdmin
                .from('logs')
                .select('*')
                .eq('shop_id', shopId)
                .eq('level', 'error')
                .order('created_at', { ascending: false })
                .limit(5)
        ])

        // 7. 缺货商品数（需要查询Shopify API或缓存）
        const outOfStockCount = await getOutOfStockCount(shopId)

        // 构建响应
        const stats = {
            overview: {
                total_preorder_products: preorderProductsCount.count || 0,
                active_manual_preorders: activePreordersCount.count || 0,
                active_auto_preorders: autoPreordersCount.count || 0,
                out_of_stock_products: outOfStockCount,
            },

            orders: {
                today_count: orderStats.todayCount,
                today_revenue: orderStats.todayRevenue,
                total_count: orderStats.totalCount,
                pending_shipment: orderStats.pendingShipment,
            },

            health: {
                webhooks_healthy: webhookStatus.data?.every(w => w.is_healthy) || false,
                total_webhooks: webhookStatus.data?.length || 0,
                unhealthy_webhooks: webhookStatus.data?.filter(w => !w.is_healthy).length || 0,
                recent_errors_count: recentErrors.data?.length || 0,
            },

            alerts: generateAlerts(webhookStatus.data, recentErrors.data, outOfStockCount),
        }

        res.status(200).json({ stats })

    } catch (error: any) {
        console.error('Dashboard stats error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * 获取订单统计
 */
async function getOrderStats(shopId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 从 preorder_products 表获取预购订单数据
    // 注意：这需要在订单创建时记录到表中
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
        todayRevenue: calculateRevenue(todayOrders),
        totalCount: allOrders?.length || 0,
        pendingShipment: 0, // TODO: 从Shopify API获取
    }
}

/**
 * 获取缺货商品数量
 */
async function getOutOfStockCount(shopId: string) {
    // 从缓存或database获取
    // 实际应该定期同步Shopify库存数据
    const { count } = await supabaseAdmin
        .from('products_rules')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('auto_preorder', true)
        .eq('active', true)

    return count || 0
}

/**
 * 计算订单总额
 */
function calculateRevenue(orders: any[] | null) {
    if (!orders) return 0
    return orders.reduce((sum, order) => {
        const payload = order.payload
        return sum + (parseFloat(payload?.total_price) || 0)
    }, 0)
}

/**
 * 生成告警信息
 */
function generateAlerts(webhooks: any[] | null, errors: any[] | null, outOfStock: number) {
    const alerts: any[] = []

    // Webhook告警
    if (webhooks) {
        webhooks.forEach(webhook => {
            if (!webhook.is_healthy) {
                alerts.push({
                    type: 'webhook_error',
                    severity: 'high',
                    message: `Webhook "${webhook.topic}" is not responding`,
                    action: 'Check webhook configuration',
                })
            }
        })
    }

    // 缺货告警
    if (outOfStock > 10) {
        alerts.push({
            type: 'inventory',
            severity: 'medium',
            message: `${outOfStock} products are out of stock`,
            action: 'Review inventory settings',
        })
    }

    // 错误告警
    if (errors && errors.length > 0) {
        alerts.push({
            type: 'errors',
            severity: 'high',
            message: `${errors.length} recent errors detected`,
            action: 'View error logs',
        })
    }

    return alerts
}
