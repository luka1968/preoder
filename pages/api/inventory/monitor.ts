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
            .select('id, access_token')
            .eq('shop_domain', shop)
            .single()

        if (!shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        const { data: rules } = await supabaseAdmin
            .from('products_rules')
            .select('*')
            .eq('shop_id', shopData.id)
            .eq('auto_preorder', true)

        const outOfStock = []
        if (rules && rules.length > 0) {
            for (const rule of rules) {
                try {
                    const response = await fetch(
                        `https://${shop}/admin/api/2025-10/variants/${rule.variant_id}.json`,
                        { headers: { 'X-Shopify-Access-Token': shopData.access_token } }
                    )
                    if (response.ok) {
                        const data = await response.json()
                        const qty = data.variant.inventory_quantity || 0
                        if (qty <= (rule.auto_threshold || 0)) {
                            outOfStock.push({
                                variant_id: rule.variant_id,
                                quantity: qty,
                                threshold: rule.auto_threshold,
                                auto_enabled: rule.active,
                            })
                        }
                    }
                } catch (e) { }
            }
        }

        res.status(200).json({
            out_of_stock: outOfStock,
            total: outOfStock.length,
            synced: true,
        })
    } catch (error) {
        console.error('Inventory monitor error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
