import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * POST /api/preorder/enable
 * 为缺货产品启用预购功能
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop, variant_id } = req.body

    if (!shop || !variant_id) {
        return res.status(400).json({ error: 'Missing required parameters' })
    }

    try {
        // 获取 shop 信息
        const { data: shopData } = await supabaseAdmin
            .from('shops')
            .select('id, access_token')
            .eq('shop_domain', shop)
            .single()

        if (!shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        // 检查是否已有规则（确保类型匹配）
        const variantIdStr = variant_id.toString()
        const { data: existingRule } = await supabaseAdmin
            .from('products_rules')
            .select('*')
            .eq('shop_id', shopData.id)
            .eq('variant_id', variantIdStr)
            .single()

        if (existingRule) {
            // 更新现有规则
            await supabaseAdmin
                .from('products_rules')
                .update({
                    active: true,
                    manual_preorder: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingRule.id)
        } else {
            // 创建新规则
            await supabaseAdmin
                .from('products_rules')
                .insert({
                    shop_id: shopData.id,
                    variant_id: variantIdStr,
                    active: true,
                    manual_preorder: true,
                    auto_preorder: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
        }

        // 记录日志
        await supabaseAdmin.from('logs').insert({
            shop_id: shopData.id,
            type: 'manual_preorder',
            action: 'enable',
            level: 'info',
            variant_id: variantIdStr,
            message: `Manually enabled pre-order from inventory monitor`,
        })

        res.status(200).json({ success: true })
    } catch (error) {
        console.error('Error enabling preorder:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
