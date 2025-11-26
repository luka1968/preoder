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

        const { data: webhooks } = await supabaseAdmin
            .from('webhook_status')
            .select('*')
            .eq('shop_id', shopData.id)

        res.status(200).json({
            webhooks: webhooks || [],
            total: webhooks?.length || 0,
            healthy: webhooks?.filter(w => w.is_healthy).length || 0,
        })
    } catch (error) {
        console.error('Webhook status error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
