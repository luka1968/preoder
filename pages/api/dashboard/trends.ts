import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

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

        const daysNum = parseInt(days as string)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - daysNum)

        const { data: orderLogs } = await supabaseAdmin
            .from('logs')
            .select('created_at')
            .eq('shop_id', shopData.id)
            .eq('type', 'order_created')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true })

        const dailyData = groupByDay(orderLogs, daysNum)

        const trends = {
            labels: dailyData.labels,
            datasets: [{
                label: 'Orders',
                data: dailyData.orders,
                borderColor: '#4299e1',
            }],
        }

        res.status(200).json({ trends })
    } catch (error) {
        console.error('Trends error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

function groupByDay(orders: any[] | null, days: number) {
    const labels: string[] = []
    const ordersData: number[] = []

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

        const dayOrders = orders?.filter(o => {
            const createdAt = new Date(o.created_at)
            return createdAt >= date && createdAt < nextDate
        }) || []

        ordersData.push(dayOrders.length)
    }

    return { labels, orders: ordersData }
}
