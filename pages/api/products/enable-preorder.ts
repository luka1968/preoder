import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * 🎯 Globo 同款预购 API
 * 
 * 启用预购时：
 * 1. 设置 inventory_policy = "continue"
 * 2. 添加 metafield: preorder_enabled = true
 * 3. 保存到数据库
 * 
 * 禁用预购时：
 * 1.还原 inventory_policy = "deny"
 * 2. 删除 metafield
 * 3. 从数据库删除
 * 
 * POST /api/products/enable-preorder
 * Body: {
 *   shop: 'shop.myshopify.com',
 *   productId: '123456789',
 *   variantId: '987654321' (可选),
 *   estimatedShippingDate: '2025-12-31' (可选),
 *   enabled: true/false
 * }
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { shop, productId, variantId, estimatedShippingDate, enabled = true } = req.body

        if (!shop || !productId) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['shop', 'productId']
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

        const accessToken = shopData.access_token
        const shopId = shopData.id

        // 获取产品变体
        const variants = variantId
            ? [{ id: variantId }]
            : await getProductVariants(shop, accessToken, productId)

        const results = []

        for (const variant of variants) {
            try {
                if (enabled) {
                    // ✅ 启用预购
                    await enablePreorderForVariant(
                        shop,
                        accessToken,
                        shopId,
                        productId,
                        variant.id,
                        estimatedShippingDate
                    )
                    results.push({ variantId: variant.id, success: true, action: 'enabled' })
                } else {
                    // ❌ 禁用预购
                    await disablePreorderForVariant(
                        shop,
                        accessToken,
                        shopId,
                        productId,
                        variant.id
                    )
                    results.push({ variantId: variant.id, success: true, action: 'disabled' })
                }
            } catch (error: any) {
                console.error(`❌ Failed for variant ${variant.id}:`, error)
                results.push({
                    variantId: variant.id,
                    success: false,
                    error: error.message
                })
            }
        }

        const successCount = results.filter(r => r.success).length

        return res.status(200).json({
            success: true,
            message: `${enabled ? 'Enabled' : 'Disabled'} preorder for ${successCount} variant(s)`,
            results: results
        })

    } catch (error: any) {
        console.error('❌ Enable/Disable preorder error:', error)
        return res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

/**
 * 获取产品的所有变体
 */
async function getProductVariants(shop: string, accessToken: string, productId: string) {
    const response = await fetch(
        `https://${shop}/admin/api/2024-01/products/${productId}.json`,
        {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to get product: ${response.statusText}`)
    }

    const data = await response.json()
    return data.product.variants || []
}

/**
 * 🟢 启用预购
 */
async function enablePreorderForVariant(
    shop: string,
    accessToken: string,
    shopId: string,
    productId: string,
    variantId: string,
    estimatedShippingDate?: string
) {
    console.log(`🎯 启用预购：Variant ${variantId}`)

    // 1. 修改 inventory_policy = "continue"
    await updateVariantInventoryPolicy(shop, accessToken, variantId, 'continue')

    // 2. 添加 metafield: preorder_enabled = true
    await setVariantMetafield(shop, accessToken, variantId, 'preorder_enabled', 'true')

    // 3. 如果有发货日期，也保存到 metafield
    if (estimatedShippingDate) {
        await setVariantMetafield(shop, accessToken, variantId, 'preorder_shipping_date', estimatedShippingDate)
    }

    // 4. 保存到数据库
    await savePreorderProductToDatabase(shopId, productId, variantId, estimatedShippingDate)

    console.log(`✅ 预购已启用：Variant ${variantId}`)
}

/**
 * 🔴 禁用预购
 */
async function disablePreorderForVariant(
    shop: string,
    accessToken: string,
    shopId: string,
    productId: string,
    variantId: string
) {
    console.log(`🎯 禁用预购：Variant ${variantId}`)

    // 1. 恢复 inventory_policy = "deny"
    await updateVariantInventoryPolicy(shop, accessToken, variantId, 'deny')

    // 2. 删除 metafield
    await deleteVariantMetafield(shop, accessToken, variantId, 'preorder_enabled')
    await deleteVariantMetafield(shop, accessToken, variantId, 'preorder_shipping_date')

    // 3. 从数据库删除
    await removePreorderProductFromDatabase(shopId, variantId)

    console.log(`✅ 预购已禁用：Variant ${variantId}`)
}

/**
 * 更新变体的库存策略
 */
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
        const errorText = await response.text()
        throw new Error(`Failed to update variant policy: ${errorText}`)
    }

    const data = await response.json()
    console.log(`📝 Inventory policy updated: ${policy}`, variantId)
    return data.variant
}

/**
 * 设置变体的 metafield
 */
async function setVariantMetafield(
    shop: string,
    accessToken: string,
    variantId: string,
    key: string,
    value: string
) {
    const response = await fetch(
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
                    key: key,
                    value: value,
                    type: 'single_line_text_field'
                }
            })
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        console.warn(`⚠️ Failed to set metafield: ${errorText}`)
        // 不抛出错误，metafield 是辅助功能
    } else {
        console.log(`🏷️ Metafield set: ${key} = ${value}`)
    }
}

/**
 * 删除变体的 metafield
 */
async function deleteVariantMetafield(
    shop: string,
    accessToken: string,
    variantId: string,
    key: string
) {
    // 先获取 metafield ID
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
            console.log(`🗑️ Metafield deleted: ${key}`)
        }
    }
}

/**
 * 保存预购产品到数据库
 */
async function savePreorderProductToDatabase(
    shopId: string,
    productId: string,
    variantId: string,
    estimatedShippingDate?: string
) {
    const { error } = await supabaseAdmin
        .from('preorder_products')
        .upsert({
            shop_id: shopId,
            product_id: productId,
            variant_id: variantId,
            enabled: true,
            estimated_shipping_date: estimatedShippingDate,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'shop_id,variant_id'
        })

    if (error) {
        console.error('❌ Failed to save to database:', error)
    } else {
        console.log('💾 Saved to database')
    }
}

/**
 * 从数据库删除预购产品
 */
async function removePreorderProductFromDatabase(shopId: string, variantId: string) {
    const { error } = await supabaseAdmin
        .from('preorder_products')
        .delete()
        .eq('shop_id', shopId)
        .eq('variant_id', variantId)

    if (error) {
        console.error('❌ Failed to delete from database:', error)
    } else {
        console.log('🗑️ Deleted from database')
    }
}
