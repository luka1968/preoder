import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/rules/:variantId?shop=xxx
 * POST /api/rules (create/update)
 * DELETE /api/rules/:variantId
 * 
 * 详细预购规则管理
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { shop } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    const { data: shopData } = await supabaseAdmin
        .from('shops')
        .select('id, access_token')
        .eq('shop_domain', shop)
        .single()

    if (!shopData) {
        return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
        return handleGet(req, res, shopData.id)
    } else if (req.method === 'POST') {
        return handlePost(req, res, shopData)
    } else if (req.method === 'DELETE') {
        return handleDelete(req, res, shopData.id)
    } else {
        return res.status(405).json({ error: 'Method not allowed' })
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, shopId: string) {
    const { variantId } = req.query

    if (variantId) {
        // 获取单个规则
        const { data, error } = await supabaseAdmin
            .from('products_rules')
            .select('*')
            .eq('shop_id', shopId)
            .eq('variant_id', variantId)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Rule not found' })
        }

        return res.status(200).json({ rule: data })
    } else {
        // 获取所有规则
        const { data, error } = await supabaseAdmin
            .from('products_rules')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })

        return res.status(200).json({ rules: data || [] })
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, shopData: any) {
    const {
        product_id,
        variant_id,
        manual_preorder,
        auto_preorder,
        auto_threshold,
        button_text,
        badge_text,
        note_to_customer,
        expected_ship_date,
        allow_when_in_stock,
        preorder_limit,
    } = req.body

    if (!variant_id) {
        return res.status(400).json({ error: 'Missing variant_id' })
    }

    // 🔧 如果没有提供 product_id，从 Shopify API 获取
    let resolvedProductId = product_id
    if (!resolvedProductId) {
        try {
            const variantResponse = await fetch(
                `https://${shopData.shop_domain}/admin/api/2025-10/variants/${variant_id}.json`,
                {
                    headers: {
                        'X-Shopify-Access-Token': shopData.access_token,
                    },
                }
            )

            if (variantResponse.ok) {
                const variantData = await variantResponse.json()
                resolvedProductId = variantData.variant?.product_id?.toString()
                console.log(`✅ Fetched product_id from Shopify: ${resolvedProductId}`)
            } else {
                console.error('❌ Failed to fetch variant from Shopify:', await variantResponse.text())
            }
        } catch (error) {
            console.error('❌ Error fetching product_id:', error)
        }
    }

    // 如果还是没有 product_id，返回错误
    if (!resolvedProductId) {
        return res.status(400).json({
            error: 'Failed to resolve product_id',
            details: 'product_id must be provided or variant must exist in Shopify'
        })
    }

    // 更新或创建规则
    const { data, error } = await supabaseAdmin
        .from('products_rules')
        .upsert({
            shop_id: shopData.id,
            product_id: resolvedProductId,
            variant_id,
            manual_preorder: manual_preorder || false,
            auto_preorder: auto_preorder || false,
            auto_threshold: auto_threshold || 0,
            button_text: button_text || 'Pre-Order Now',
            badge_text: badge_text || 'Pre-Order',
            note_to_customer,
            expected_ship_date,
            allow_when_in_stock: allow_when_in_stock || false,
            preorder_limit,
            active: manual_preorder || auto_preorder,
            priority: manual_preorder ? 1 : 5,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'shop_id,variant_id'
        })
        .select()
        .single()

    if (error) {
        console.error('❌ Database error:', error)
        return res.status(500).json({ error: 'Failed to save rule', details: error.message })
    }

    // 同步到 Shopify (更新 metafields 和 inventory_policy)
    if (manual_preorder || auto_preorder) {
        await enablePreorderOnShopify(shopData, variant_id, button_text, badge_text)
    } else {
        await disablePreorderOnShopify(shopData, variant_id)
    }

    // 记录日志
    await supabaseAdmin.from('logs').insert({
        shop_id: shopData.id,
        type: 'manual_action',
        action: manual_preorder ? 'enable' : 'disable',
        variant_id,
        message: `Rule ${manual_preorder ? 'enabled' : 'disabled'} for variant ${variant_id}`,
    })

    return res.status(200).json({
        success: true,
        rule: data,
    })
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, shopId: string) {
    const { variantId } = req.query

    if (!variantId) {
        return res.status(400).json({ error: 'Missing variant_id' })
    }

    const { error } = await supabaseAdmin
        .from('products_rules')
        .delete()
        .eq('shop_id', shopId)
        .eq('variant_id', variantId)

    if (error) {
        return res.status(500).json({ error: 'Failed to delete rule' })
    }

    return res.status(200).json({ success: true })
}

async function enablePreorderOnShopify(shopData: any, variantId: string, buttonText?: string, badgeText?: string) {
    const shop = shopData.shop_domain
    const accessToken = shopData.access_token

    // 1. 更新 inventory_policy
    await fetch(`https://${shop}/admin/api/2025-10/variants/${variantId}.json`, {
        method: 'PUT',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            variant: {
                id: variantId,
                inventory_policy: 'continue',
            },
        }),
    })

    // 2. 设置 metafields
    const metafields = [
        { key: 'preorder_enabled', value: 'true' },
        { key: 'button_text', value: buttonText || 'Pre-Order Now' },
        { key: 'badge_text', value: badgeText || 'Pre-Order' },
    ]

    for (const metafield of metafields) {
        await fetch(`https://${shop}/admin/api/2025-10/variants/${variantId}/metafields.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metafield: {
                    namespace: 'preorder_pro',
                    key: metafield.key,
                    value: metafield.value,
                    type: 'single_line_text_field',
                },
            }),
        })
    }
}

async function disablePreorderOnShopify(shopData: any, variantId: string) {
    const shop = shopData.shop_domain
    const accessToken = shopData.access_token

    // 恢复 inventory_policy
    await fetch(`https://${shop}/admin/api/2025-10/variants/${variantId}.json`, {
        method: 'PUT',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            variant: {
                id: variantId,
                inventory_policy: 'deny',
            },
        }),
    })
}
