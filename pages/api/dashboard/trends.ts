import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/dashboard/trends?shop=xxx&days=30
 * 
 * Dashboard 趋势图表数据
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop, days = 30 } = req.query

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
        const daysNum = parseInt(days as string)

        // 获取趋势数据
        const trends = await getTrendsData(shopId, daysNum)

        res.status(200).json({ trends })

    } catch (error: any) {
        console.error('Dashboard trends error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * 获取趋势数据
 */
async function getTrendsData(shopId: string, days: number) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 1. 预购订单趋势
    const { data: orderLogs } = await supabaseAdmin
        .from('logs')
        .select('created_at, payload')
        .eq('shop_id', shopId)
        .eq('type', 'order_created')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    // 2. 自动预购启用趋势
    const { data: autoPreorderLogs } = await supabaseAdmin
        .from('logs')
        .select('created_at, variant_id')
        .eq('shop_id', shopId)
        .eq('type', 'auto_preorder')
        .eq('action', 'enable')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    // 3. 活跃预购商品数趋势
    const { data: activeProductsLogs } = await supabaseAdmin
        .from('logs')
        .select('created_at, action')
        .eq('shop_id', shopId)
        .eq('type', 'manual_action')
        .in('action', ['enable', 'disable'])
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    // 处理数据并按天分组
    const dailyData = groupByDay(orderLogs, autoPreorderLogs, activeProductsLogs, days)

    return {
        labels: dailyData.labels,
        datasets: [
            {
                label: 'Pre-order Orders',
                data: dailyData.orders,
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
            },
            {
                label: 'Auto Pre-orders Enabled',
                data: dailyData.autoEnabled,
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
            },
            {
                label: 'Active Pre-order Products',
                data: dailyData.activeProducts,
                borderColor: '#ed8936',
                backgroundColor: 'rgba(237, 137, 54, 0.1)',
            },
        ],
    }
}

/**
 * 按天分组数据
 */
function groupByDay(orders: any[] | null, autoEnabled: any[] | null, activeProducts: any[] | null, days: number) {
    const labels: string[] = []
    const ordersData: number[] = []
    const autoEnabledData: number[] = []
    const activeProductsData: number[] = []

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

        // 统计当天的订单数
        const dayOrders = orders?.filter(o => {
            const createdAt = new Date(o.created_at)
            return createdAt >= date && createdAt < nextDate
        }) || []
        ordersData.push(dayOrders.length)

        // 统计当天自动启用的预购数
        const dayAutoEnabled = autoEnabled?.filter(a => {
            const createdAt = new Date(a.created_at)
            return createdAt >= date && createdAt < nextDate
        }) || []
        autoEnabledData.push(dayAutoEnabled.length)

        // 统计当天的活跃商品变化
        const dayActive = activeProducts?.filter(a => {
            const createdAt = new Date(a.created_at)
            return createdAt >= date && createdAt < nextDate
        }) || []
        activeProductsData.push(dayActive.length)
    }

    return {
        labels,
        orders: ordersData,
        autoEnabled: autoEnabledData,
        activeProducts: activeProductsData,
    }
}
