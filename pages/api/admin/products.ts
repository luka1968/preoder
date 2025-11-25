import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getShopifyProducts } from '../../../lib/shopify'

/**
 * GET /api/admin/products?shop=xxx&page_info=xxx
 * 
 * 获取商品列表（含预购状态）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop, page_info } = req.query

    if (!shop) {
        return res.status(400).json({ error: 'Missing shop parameter' })
    }

    try {
        // 1. 获取店铺信息
        const { data: shopData, error: shopError } = await supabaseAdmin
            .from('shops')
            .select('id, access_token')
            .eq('shop_domain', shop)
            .single()

        if (shopError || !shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        // 2. 获取 Shopify 商品
        const { products, page_info: nextPageInfo } = await getShopifyProducts(
            shopData.access_token,
            shop as string,
            50,
            page_info as string
        )

        // 3. 获取所有 variant_id 的预购状态
        const variantIds = products.flatMap(p => p.variants.map(v => v.id))

        const { data: preorderProducts } = await supabaseAdmin
            .from('preorder_products')
            .select('*')
            .eq('shop_id', shopData.id)
            .in('variant_id', variantIds)

        // 4. 合并数据
        const productsWithPreorderStatus = products.map(product => {
            const variants = product.variants.map(variant => {
                const preorderStatus = preorderProducts?.find(
                    p => p.variant_id === variant.id
                )

                return {
                    ...variant,
                    preorder: preorderStatus ? {
                        enabled: preorderStatus.enabled,
                        auto_enabled: preorderStatus.auto_enabled,
                        manual_override: preorderStatus.manual_override,
                        priority: preorderStatus.priority,
                        estimated_shipping_date: preorderStatus.estimated_shipping_date,
                        max_preorder_quantity: preorderStatus.max_preorder_quantity,
                        current_preorder_count: preorderStatus.current_preorder_count
                    } : null
                }
            })

            return {
                ...product,
                variants,
                // 产品级别的预购状态（如果任何变体启用了预购）
                has_preorder: variants.some(v => v.preorder?.enabled)
            }
        })

        res.status(200).json({
            products: productsWithPreorderStatus,
            page_info: nextPageInfo,
            total: productsWithPreorderStatus.length
        })

    } catch (error: any) {
        console.error('Admin products API error:', error)
        res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}
