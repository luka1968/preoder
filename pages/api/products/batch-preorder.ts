import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * POST /api/products/batch-preorder
 * 
 * 批量启用/禁用预购
 * 
 * Body: {
 *   shop: 'shop.myshopify.com',
 *   variantIds: ['123', '456', '789'],
 *   enabled: true/false,
 *   estimatedShippingDate: '2025-12-31' (可选)
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { shop, variantIds, enabled = true, estimatedShippingDate } = req.body

        if (!shop || !variantIds || !Array.isArray(variantIds)) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['shop', 'variantIds (array)']
            })
        }

        // 获取店铺信息
        const { data: shopData, error: shopError } = await supabaseAdmin
            .from('shops')
            .select('id, access_token')
            .eq('shop_domain', shop)
            .single()

        if (shopError || !shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        // 检查是否允许批量操作
        const { data: settings } = await supabaseAdmin
            .from('preorder_settings')
            .select('allow_batch_operations')
            .eq('shop_id', shopData.id)
            .single()

        if (settings && !settings.allow_batch_operations) {
            return res.status(403).json({ error: 'Batch operations are disabled' })
        }

        const accessToken = shopData.access_token
        const shopId = shopData.id

        const results = []
        let successCount = 0
        let failCount = 0

        // 批量处理
        for (const variantId of variantIds) {
            try {
                if (enabled) {
                    await enablePreorderForVariant(
                        shop,
                        accessToken,
                        shopId,
                        variantId,
                        estimatedShippingDate
                    )
                } else {
                    await disablePreorderForVariant(
                        shop,
                        accessToken,
                        shopId,
                        variantId
                    )
                }

                results.push({
                    variantId,
                    success: true,
                    action: enabled ? 'enabled' : 'disabled'
                })
                successCount++
            } catch (error: any) {
                console.error(`Failed for variant ${variantId}:`, error)
                results.push({
                    variantId,
                    success: false,
                    error: error.message
                })
                failCount++
            }
        }

        return res.status(200).json({
            success: true,
            message: `Batch operation completed. Success: ${successCount}, Failed: ${failCount}`,
            results,
            summary: {
                total: variantIds.length,
                success: successCount,
                failed: failCount
            }
        })

    } catch (error: any) {
        console.error('Batch preorder error:', error)
        return res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

/**
 * 启用预购（手动模式，优先级=1）
 */
async function enablePreorderForVariant(
    shop: string,
    accessToken: string,
    shopId: string,
    variantId: string,
    estimatedShippingDate?: string
) {
    // 1. 修改 inventory_policy
    await updateVariantInventoryPolicy(shop, accessToken, variantId, 'continue')

    // 2. 设置 metafield
    await setVariantMetafield(shop, accessToken, variantId, 'preorder_enabled', 'true')
    await setVariantMetafield(shop, accessToken, variantId, 'manual_enabled', 'true')

    // 3. 保存到数据库（手动模式，最高优先级）
    await supabaseAdmin
        .from('preorder_products')
        .upsert({
            shop_id: shopId,
            variant_id: variantId,
            enabled: true,
            manual_override: true, // 手动启用=最高优先级
            auto_enabled: false,
            priority: 1, // 最高优先级
            estimated_shipping_date: estimatedShippingDate,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'shop_id,variant_id'
        })
}

/**
 * 禁用预购
 */
async function disablePreorderForVariant(
    shop: string,
    accessToken: string,
    shopId: string,
    variantId: string
) {
    // 1. 恢复 inventory_policy
    await updateVariantInventoryPolicy(shop, accessToken, variantId, 'deny')

    // 2. 删除 metafield
    await deleteVariantMetafield(shop, accessToken, variantId, 'preorder_enabled')
    await deleteVariantMetafield(shop, accessToken, variantId, 'manual_enabled')
    await deleteVariantMetafield(shop, accessToken, variantId, 'auto_enabled')

    // 3. 从数据库删除
    await supabaseAdmin
        .from('preorder_products')
        .delete()
        .eq('shop_id', shopId)
        .eq('variant_id', variantId)
}

async function updateVariantInventoryPolicy(
    shop: string,
    accessToken: string,
    variantId: string,
    policy: 'continue' | 'deny'
) {
    const response = await fetch(
        `https://${shop}/admin/api/2024-01/variants/${variantId}.json`,
        {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variant: {
                    id: variantId,
                    inventory_policy: policy
                }
            })
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to update variant policy: ${await response.text()}`)
    }
}

async function setVariantMetafield(
    shop: string,
    accessToken: string,
    variantId: string,
    key: string,
    value: string
) {
    await fetch(
        `https://${shop}/admin/api/2024-01/variants/${variantId}/metafields.json`,
        {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metafield: {
                    namespace: 'preorder_pro',
                    key,
                    value,
                    type: 'single_line_text_field'
                }
            })
        }
    )
}

async function deleteVariantMetafield(
    shop: string,
    accessToken: string,
    variantId: string,
    key: string
) {
    const listResponse = await fetch(
        `https://${shop}/admin/api/2024-01/variants/${variantId}/metafields.json`,
        {
            headers: {
                'X-Shopify-Access-Token': accessToken,
            },
        }
    )

    if (listResponse.ok) {
        const data = await listResponse.json()
        const metafield = data.metafields?.find((m: any) =>
            m.namespace === 'preorder_pro' && m.key === key
        )

        if (metafield) {
            await fetch(
                `https://${shop}/admin/api/2024-01/metafields/${metafield.id}.json`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                    },
                }
            )
        }
    }
}
