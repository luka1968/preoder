import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop, type = 'all', limit = 100 } = req.query
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

        let query = supabaseAdmin
            .from('logs')
            .select('*')
            .eq('shop_id', shopData.id)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit as string))

        if (type && type !== 'all') {
            query = query.eq('type', type)
        }

        const { data: logs } = await query

        res.status(200).json({ logs: logs || [], total: logs?.length || 0 })
    } catch (error) {
        console.error('Logs error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
