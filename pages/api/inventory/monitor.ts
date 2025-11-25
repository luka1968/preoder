import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getShopifyProducts } from '../../../lib/shopify'

/**
 * GET /api/inventory/monitor?shop=xxx
 * 
 * 库存监控 - 检测缺货商品和同步状态
 */
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

        // 获取所有启用了自动预购的商品规则
        const { data: rules } = await supabaseAdmin
            .from('products_rules')
            .select('*')
            .eq('shop_id', shopData.id)
            .eq('auto_preorder', true)

        if (!rules || rules.length === 0) {
            return res.status(200).json({
                out_of_stock: [],
                total: 0,
                synced: true,
            })
        }

        // 获取 Shopify 实际库存
        const variantIds = rules.map(r => r.variant_id)
        const inventoryData = await checkInventoryLevels(
            shop as string,
            shopData.access_token,
            variantIds
        )

        // 对比数据库状态和实际库存
        const outOfStockProducts = []
        const discrepancies = []

        for (const rule of rules) {
            const inventory = inventoryData[rule.variant_id]

            if (!inventory) continue

            const isOutOfStock = inventory.quantity <= (rule.auto_threshold || 0)

            if (isOutOfStock) {
                outOfStockProducts.push({
                    variant_id: rule.variant_id,
                    product_id: rule.product_id,
                    quantity: inventory.quantity,
                    threshold: rule.auto_threshold,
                    auto_enabled: rule.active,
                    button_text: rule.button_text,
                })
            }

            // 检查不一致
            if (isOutOfStock && !rule.active) {
                discrepancies.push({
                    variant_id: rule.variant_id,
                    issue: 'should_be_enabled',
                    current_status: 'disabled',
                    expected_status: 'enabled',
                })
            } else if (!isOutOfStock && rule.active && rule.auto_preorder && !rule.manual_preorder) {
                discrepancies.push({
                    variant_id: rule.variant_id,
                    issue: 'should_be_disabled',
                    current_status: 'enabled',
                    expected_status: 'disabled',
                })
            }
        }

        res.status(200).json({
            out_of_stock: outOfStockProducts,
            discrepancies,
            total: outOfStockProducts.length,
            synced: discrepencies.length === 0,
            last_check: new Date().toISOString(),
        })

    } catch (error: any) {
        console.error('Inventory monitor error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * 检查库存水平
 */
async function checkInventoryLevels(
    shop: string,
    accessToken: string,
    variantIds: string[]
): Promise<Record<string, { quantity: number }>> {
    const result: Record<string, { quantity: number }> = {}

    // 批量获取变体信息
    for (const variantId of variantIds) {
        try {
            const response = await fetch(
                `https://${shop}/admin/api/2024-01/variants/${variantId}.json`,
                {
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                    },
                }
            )

            if (response.ok) {
                const data = await response.json()
                result[variantId] = {
                    quantity: data.variant.inventory_quantity || 0,
                }
            }
        } catch (error) {
            console.error(`Failed to fetch variant ${variantId}:`, error)
        }
    }

    return result
}
