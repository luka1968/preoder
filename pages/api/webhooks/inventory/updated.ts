import { NextApiRequest, NextApiResponse } from 'next'
import { getRawBodyFromRequest } from '../../../../lib/raw-body'
import { verifyWebhookSignature } from '../../../../lib/shopify'
import { supabaseAdmin } from '../../../../lib/supabase'

/**
 * POST /api/webhooks/inventory/updated
 * 
 * 监听库存变化，实现自动预购逻辑
 * 
 * Shopify Webhook: inventory_levels/update
 */

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // 验证 webhook
        const rawBody = await getRawBodyFromRequest(req)
        const rawBodyString = rawBody.toString('utf8')
        const signature = req.headers['x-shopify-hmac-sha256'] as string

        if (!verifyWebhookSignature(rawBodyString, signature)) {
            console.error('❌ Invalid webhook signature')
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const shop = req.headers['x-shopify-shop-domain'] as string
        const payload = JSON.parse(rawBodyString)

        console.log('📦 Inventory webhook received:', {
            shop,
            inventory_item_id: payload.inventory_item_id,
            available: payload.available
        })

        await handleInventoryUpdate(shop, payload)

        res.status(200).json({ success: true })
    } catch (error) {
        console.error('❌ Inventory webhook error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * 处理库存更新
 */
async function handleInventoryUpdate(shop: string, payload: any) {
    const { inventory_item_id, available } = payload

    // 1. 获取店铺信息
    const { data: shopData } = await supabaseAdmin
        .from('shops')
        .select('id, access_token')
        .eq('shop_domain', shop)
        .single()

    if (!shopData) {
        console.error('Shop not found:', shop)
        return
    }

    // 2. 检查是否启用了自动预购
    const { data: settings } = await supabaseAdmin
        .from('preorder_settings')
        .select('*')
        .eq('shop_id', shopData.id)
        .single()

    if (!settings || !settings.auto_preorder_enabled) {
        console.log('⚠️ Auto pre-order is disabled for this shop')
        return
    }

    // 3. 通过 inventory_item_id 获取 variant_id
    const variant = await getVariantByInventoryItemId(
        shop,
        shopData.access_token,
        inventory_item_id
    )

    if (!variant) {
        console.log('⚠️ Variant not found for inventory_item_id:', inventory_item_id)
        return
    }

    const variantId = variant.id.toString()

    // 4. 检查是否有手动覆盖
    const { data: existingPreorder } = await supabaseAdmin
        .from('preorder_products')
        .select('manual_override')
        .eq('shop_id', shopData.id)
        .eq('variant_id', variantId)
        .single()

    // 如果手动覆盖，不执行自动逻辑
    if (existingPreorder?.manual_override) {
        console.log('⚠️ Manual override active, skipping auto logic:', variantId)
        return
    }

    // 5. 根据库存决定是否启用/禁用预购
    const threshold = settings.auto_threshold || 0

    if (available <= threshold) {
        // 库存不足，自动启用预购
        console.log(`✅ Auto-enabling pre-order (stock: ${available} <= ${threshold})`)
        await autoEnablePreorder(
            shop,
            shopData.access_token,
            shopData.id,
            variantId,
            settings
        )
    } else if (available > threshold && settings.auto_restore_on_restock) {
        // 库存充足，自动关闭预购
        console.log(`✅ Auto-disabling pre-order (stock: ${available} > ${threshold})`)
        await autoDisablePreorder(
            shop,
            shopData.access_token,
            shopData.id,
            variantId
        )
    }
}

/**
 * 自动启用预购
 */
async function autoEnablePreorder(
    shop: string,
    accessToken: string,
    shopId: string,
    variantId: string,
    settings: any
) {
    // 1. 设置 inventory_policy = continue
    await updateInventoryPolicy(shop, accessToken, variantId, 'continue')

    // 2. 设置 metafield
    await setMetafield(shop, accessToken, variantId, 'preorder_enabled', 'true')
    await setMetafield(shop, accessToken, variantId, 'auto_enabled', 'true')

    // 3. 保存到数据库
    const estimatedDays = settings.default_estimated_shipping_days || 30
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays)

    await supabaseAdmin
        .from('preorder_products')
        .upsert({
            shop_id: shopId,
            variant_id: variantId,
            enabled: true,
            auto_enabled: true, // 标记为自动启用
            manual_override: false,
            priority: 5, // 自动模式优先级较低
            estimated_shipping_date: estimatedDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'shop_id,variant_id'
        })

    console.log(`✅ Auto pre-order enabled: ${variantId}`)
}

/**
 * 自动禁用预购
 */
async function autoDisablePreorder(
    shop: string,
    accessToken: string,
    shopId: string,
    variantId: string
) {
    // 只禁用自动启用的预购
    const { data } = await supabaseAdmin
        .from('preorder_products')
        .select('auto_enabled')
        .eq('shop_id', shopId)
        .eq('variant_id', variantId)
        .single()

    // 如果不是自动启用的，不要禁用
    if (!data || !data.auto_enabled) {
        console.log('⚠️ Not auto-enabled, skipping disable:', variantId)
        return
    }

    // 1. 恢复 inventory_policy
    await updateInventoryPolicy(shop, accessToken, variantId, 'deny')

    // 2. 删除 metafield
    await deleteMetafield(shop, accessToken, variantId, 'preorder_enabled')
    await deleteMetafield(shop, accessToken, variantId, 'auto_enabled')

    // 3. 从数据库删除
    await supabaseAdmin
        .from('preorder_products')
        .delete()
        .eq('shop_id', shopId)
        .eq('variant_id', variantId)

    console.log(`✅ Auto pre-order disabled: ${variantId}`)
}

/**
 * 通过 inventory_item_id 获取 variant
 */
async function getVariantByInventoryItemId(
    shop: string,
    accessToken: string,
    inventoryItemId: string
): Promise<any> {
    const response = await fetch(
        `https://${shop}/admin/api/2024-01/variants.json?limit=250`,
        {
            headers: {
                'X-Shopify-Access-Token': accessToken,
            },
        }
    )

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    return data.variants?.find((v: any) =>
        v.inventory_item_id?.toString() === inventoryItemId?.toString()
    )
}

async function updateInventoryPolicy(
    shop: string,
    accessToken: string,
    variantId: string,
    policy: 'continue' | 'deny'
) {
    await fetch(
        `https://${shop}/admin/api/2024-01/variants/${variantId}.json`,
        {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variant: { id: variantId, inventory_policy: policy }
            })
        }
    )
}

async function setMetafield(
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

async function deleteMetafield(
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
