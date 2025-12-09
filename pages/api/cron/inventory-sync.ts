import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/cron/inventory-sync
 * 
 * 定时任务：每10分钟检查库存同步状态
 * 修复 webhook 遗漏的库存变化
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 验证 cron secret 或允许手动触发
    const cronSecret = req.headers['x-cron-secret']
    const isManualTrigger = cronSecret === 'manual'
    const isValidCronSecret = cronSecret === process.env.CRON_SECRET

    if (!isManualTrigger && !isValidCronSecret) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        console.log('⏰ Starting inventory sync cron job...')

        // 获取所有启用了自动预购的店铺
        const { data: shops } = await supabaseAdmin
            .from('shops')
            .select('id, shop_domain, access_token')

        if (!shops) {
            return res.status(200).json({ message: 'No shops found' })
        }

        let totalSynced = 0
        let totalFixed = 0

        for (const shop of shops) {
            try {
                const result = await syncShopInventory(shop)
                totalSynced++
                totalFixed += result.fixed
            } catch (error) {
                console.error(`Failed to sync shop ${shop.shop_domain}:`, error)
            }
        }

        console.log(`✅ Cron completed: ${totalSynced} shops, ${totalFixed} fixed`)

        res.status(200).json({
            success: true,
            synced: totalSynced,
            fixed: totalFixed,
        })

    } catch (error: any) {
        console.error('Cron error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * 同步单个店铺的库存
 */
async function syncShopInventory(shop: any) {
    const { data: rules } = await supabaseAdmin
        .from('products_rules')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('auto_preorder', true)

    if (!rules || rules.length === 0) {
        return { fixed: 0 }
    }

    let fixed = 0

    for (const rule of rules) {
        try {
            // 获取实际库存
            const response = await fetch(
                `https://${shop.shop_domain}/admin/api/2025-10/variants/${rule.variant_id}.json`,
                {
                    headers: {
                        'X-Shopify-Access-Token': shop.access_token,
                    },
                }
            )

            if (!response.ok) continue

            const data = await response.json()
            const actualQuantity = data.variant.inventory_quantity || 0
            const threshold = rule.auto_threshold || 0

            const shouldBeEnabled = actualQuantity <= threshold
            const isEnabled = rule.active

            // 检测不一致
            if (shouldBeEnabled && !isEnabled && !rule.manual_preorder) {
                // 应该启用但未启用 → 修复
                await autoEnablePreorder(shop, rule.variant_id)
                fixed++

                await supabaseAdmin.from('logs').insert({
                    shop_id: shop.id,
                    type: 'auto_preorder',
                    action: 'enable',
                    level: 'info',
                    variant_id: rule.variant_id,
                    message: `Auto-enabled by cron (stock: ${actualQuantity})`,
                })
            } else if (!shouldBeEnabled && isEnabled && rule.auto_preorder && !rule.manual_preorder) {
                // 不应该启用但启用了 → 修复
                await autoDisablePreorder(shop, rule.variant_id)
                fixed++

                await supabaseAdmin.from('logs').insert({
                    shop_id: shop.id,
                    type: 'auto_preorder',
                    action: 'disable',
                    level: 'info',
                    variant_id: rule.variant_id,
                    message: `Auto-disabled by cron (stock: ${actualQuantity})`,
                })
            }
        } catch (error) {
            console.error(`Failed to sync variant ${rule.variant_id}:`, error)
        }
    }

    return { fixed }
}

async function autoEnablePreorder(shop: any, variantId: string) {
    await supabaseAdmin
        .from('products_rules')
        .update({ active: true, updated_at: new Date().toISOString() })
        .eq('shop_id', shop.id)
        .eq('variant_id', variantId)
}

async function autoDisablePreorder(shop: any, variantId: string) {
    await supabaseAdmin
        .from('products_rules')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('shop_id', shop.id)
        .eq('variant_id', variantId)
}
