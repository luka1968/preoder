import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, getProductConfigs, supabaseAdmin } from '../../../lib/supabase'
import { getShopifyProducts } from '../../../lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, limit = '50', page = '1', search } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // Get products from Shopify
      const shopifyProducts = await getShopifyProducts(
        shopData.access_token,
        shop,
        parseInt(limit as string)
      )

      // Get preorder configurations for these products
      const productConfigs = await getProductConfigs(shopData.id, 100)
      const configMap = new Map(
        productConfigs.map(config => [config.product_id, config])
      )

      // Merge Shopify products with preorder configurations
      const productsWithConfig = shopifyProducts.products.map(product => ({
        ...product,
        preorder_config: configMap.get(product.id.toString()) || null
      }))

      // Apply search filter if provided
      let filteredProducts = productsWithConfig
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase()
        filteredProducts = productsWithConfig.filter(product =>
          product.title.toLowerCase().includes(searchLower) ||
          product.vendor.toLowerCase().includes(searchLower) ||
          product.product_type.toLowerCase().includes(searchLower)
        )
      }

      res.json({
        products: filteredProducts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: filteredProducts.length,
          hasNext: shopifyProducts.page_info ? true : false
        }
      })

    } else if (req.method === 'POST') {
      // Bulk update products (for bulk configuration)
      const { product_ids, config } = req.body

      if (!product_ids || !Array.isArray(product_ids)) {
        return res.status(400).json({ error: 'product_ids array is required' })
      }

      const results: Array<{
        product_id: string
        success: boolean
        error?: string
        config?: any
      }> = []
      
      for (const productId of product_ids) {
        try {
          const { data, error } = await supabaseAdmin
            .from('product_preorder_configs')
            .upsert({
              shop_id: shopData.id,
              product_id: productId,
              ...config,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'shop_id,product_id'
            })
            .select()
            .single()

          if (error) {
            results.push({ product_id: productId, success: false, error: error.message })
          } else {
            results.push({ product_id: productId, success: true, config: data })
          }
        } catch (error) {
          results.push({ 
            product_id: productId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
      }

      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      res.json({
        success: true,
        message: `Updated ${successful} products successfully, ${failed} failed`,
        results
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Products API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
