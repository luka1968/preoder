import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/frontend/settings?shop=xxx
 * POST /api/frontend/settings
 * 
 * 前端Widget配置
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    const { data: shopData } = await supabaseAdmin
        .from('shops')
        .select('id')
        .eq('shop_domain', shop)
        .single()

    if (!shopData) {
        return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
        const { data } = await supabaseAdmin
            .from('frontend_settings')
            .select('*')
            .eq('shop_id', shopData.id)
            .single()

        return res.status(200).json({ settings: data })
    }

    if (req.method === 'POST') {
        const settings = req.body

        const { data, error } = await supabaseAdmin
            .from('frontend_settings')
            .upsert({
                shop_id: shopData.id,
                ...settings,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'shop_id'
            })
            .select()
            .single()

        if (error) {
            return res.status(500).json({ error: 'Failed to save settings' })
        }

        return res.status(200).json({
            success: true,
            settings: data,
        })
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
