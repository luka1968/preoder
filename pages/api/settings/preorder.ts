import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/settings/preorder?shop=xxx
 * POST /api/settings/preorder
 * 
 * 全局预购设置API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    try {
        // 获取店铺信息
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
            return handleGet(res, shopId)
        } else if (req.method === 'POST') {
            return handlePost(req, res, shopId)
        } else {
            return res.status(405).json({ error: 'Method not allowed' })
        }
    } catch (error: any) {
        console.error('Settings API error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * GET - 获取设置
 */
async function handleGet(res: NextApiResponse, shopId: string) {
    const { data, error } = await supabaseAdmin
        .from('preorder_settings')
        .select('*')
        .eq('shop_id', shopId)
        .single()

    if (error) {
        // 如果没有设置，创建默认设置
        const { data: newSettings, error: createError } = await supabaseAdmin
            .from('preorder_settings')
            .insert({
                shop_id: shopId,
                auto_preorder_enabled: false,
                auto_threshold: 0,
                auto_restore_on_restock: true,
                allow_batch_operations: true,
                default_estimated_shipping_days: 30
            })
            .select()
            .single()

        if (createError) {
            return res.status(500).json({ error: 'Failed to create settings' })
        }

        return res.status(200).json({ settings: newSettings })
    }

    return res.status(200).json({ settings: data })
}

/**
 * POST - 更新设置
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, shopId: string) {
    const {
        auto_preorder_enabled,
        auto_threshold,
        auto_restore_on_restock,
        allow_batch_operations,
        default_estimated_shipping_days,
        default_preorder_message
    } = req.body

    const updates: any = { updated_at: new Date().toISOString() }

    if (typeof auto_preorder_enabled === 'boolean') {
        updates.auto_preorder_enabled = auto_preorder_enabled
    }
    if (typeof auto_threshold === 'number') {
        updates.auto_threshold = auto_threshold
    }
    if (typeof auto_restore_on_restock === 'boolean') {
        updates.auto_restore_on_restock = auto_restore_on_restock
    }
    if (typeof allow_batch_operations === 'boolean') {
        updates.allow_batch_operations = allow_batch_operations
    }
    if (typeof default_estimated_shipping_days === 'number') {
        updates.default_estimated_shipping_days = default_estimated_shipping_days
    }
    if (default_preorder_message) {
        updates.default_preorder_message = default_preorder_message
    }

    const { data, error } = await supabaseAdmin
        .from('preorder_settings')
        .upsert({
            shop_id: shopId,
            ...updates
        }, {
            onConflict: 'shop_id'
        })
        .select()
        .single()

    if (error) {
        console.error('Failed to update settings:', error)
        return res.status(500).json({ error: 'Failed to update settings' })
    }

    return res.status(200).json({
        success: true,
        settings: data,
        message: 'Settings updated successfully'
    })
}
