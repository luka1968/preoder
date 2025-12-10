import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/inventory/all-products
 * 获取所有产品的库存状态（不依赖 products_rules）
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
        // 从环境变量或数据库获取 access token
        let accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
        let shopDomain = process.env.SHOPIFY_SHOP_DOMAIN || shop

        // 如果环境变量没有，尝试从数据库获取
        if (!accessToken) {
            const { data: shopData } = await supabaseAdmin
                .from('shops')
                .select('access_token')
                .eq('shop_domain', shop)
                .single()

            if (shopData) {
                accessToken = shopData.access_token
            }
        }

        if (!accessToken) {
            return res.status(500).json({ error: 'No access token found' })
        }

        // 从 Shopify 获取所有产品
        const response = await fetch(
            `https://${shopDomain}/admin/api/2024-01/products.json?limit=250`,
            {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                },
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Shopify API error:', errorText)
            return res.status(response.status).json({ error: 'Failed to fetch products from Shopify' })
        }

        const data = await response.json()
        const products = data.products || []

        // 获取所有已启用预购的 variant_id
        let preorderVariants = new Set<string>()
        try {
            const { data: shopData } = await supabaseAdmin
                .from('shops')
                .select('id')
                .eq('shop_domain', shopDomain)
                .single()

            if (shopData) {
                const { data: rules } = await supabaseAdmin
                    .from('products_rules')
                    .select('variant_id')
                    .eq('shop_id', shopData.id)
                    .eq('active', true)

                if (rules) {
                    preorderVariants = new Set(rules.map(r => r.variant_id.toString()))
                }
            }
        } catch (e) {
            console.error('Error fetching preorder rules:', e)
        }

        // 统计缺货产品
        const outOfStock = []
        for (const product of products) {
            for (const variant of product.variants) {
                const qty = variant.inventory_quantity || 0
                if (qty <= 0) {
                    outOfStock.push({
                        product_id: product.id,
                        product_title: product.title,
                        variant_id: variant.id,
                        variant_title: variant.title,
                        quantity: qty,
                        sku: variant.sku,
                        preorder_enabled: preorderVariants.has(variant.id.toString()),
                    })
                }
            }
        }

        res.status(200).json({
            total_products: products.length,
            out_of_stock: outOfStock,
            total_out_of_stock: outOfStock.length,
        })
    } catch (error) {
        console.error('Error fetching products:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}
