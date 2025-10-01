import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../../lib/supabase'
import { getShopifyProduct, updateShopifyProduct } from '../../../../lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { productId } = req.query
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Product ID is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // Get product preorder configuration
      const { data: config, error } = await supabaseAdmin
        .from('product_preorder_configs')
        .select('*')
        .eq('shop_id', shopData.id)
        .eq('product_id', productId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching product config:', error)
        return res.status(500).json({ error: 'Failed to fetch configuration' })
      }

      // Get Shopify product data for inventory status
      const shopifyProduct = await getShopifyProduct(shopData.access_token, shop, productId)
      
      // Determine current status based on inventory and configuration
      const status = determineProductStatus(shopifyProduct, config)

      res.json({
        config: config || getDefaultConfig(productId, shopData.id),
        shopifyProduct,
        currentStatus: status,
        inventoryStatus: getInventoryStatus(shopifyProduct)
      })

    } else if (req.method === 'PUT') {
      // Update product preorder configuration
      const {
        enabled,
        preorder_type,
        preorder_start_date,
        preorder_end_date,
        estimated_delivery_date,
        delivery_note,
        custom_button_text,
        custom_badge_text,
        badge_color,
        allow_partial_payment,
        partial_payment_percentage,
        auto_tag_orders,
        order_tag,
        variants_config
      } = req.body

      // Validate dates
      if (preorder_start_date && preorder_end_date) {
        const startDate = new Date(preorder_start_date)
        const endDate = new Date(preorder_end_date)
        if (startDate >= endDate) {
          return res.status(400).json({ error: 'Start date must be before end date' })
        }
      }

      // Upsert configuration
      const { data: config, error } = await supabaseAdmin
        .from('product_preorder_configs')
        .upsert({
          shop_id: shopData.id,
          product_id: productId,
          enabled: enabled ?? true,
          preorder_type: preorder_type ?? 'out_of_stock',
          preorder_start_date,
          preorder_end_date,
          estimated_delivery_date,
          delivery_note,
          custom_button_text,
          custom_badge_text,
          badge_color,
          allow_partial_payment: allow_partial_payment ?? false,
          partial_payment_percentage: partial_payment_percentage ?? 50,
          auto_tag_orders: auto_tag_orders ?? true,
          order_tag: order_tag ?? 'preorder',
          variants_config: variants_config || {},
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'shop_id,product_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating product config:', error)
        return res.status(500).json({ error: 'Failed to update configuration' })
      }

      // Update Shopify product metafields if needed
      await updateProductMetafields(shopData.access_token, shop, productId, config)

      res.json(config)

    } else if (req.method === 'DELETE') {
      // Delete product preorder configuration
      const { error } = await supabaseAdmin
        .from('product_preorder_configs')
        .delete()
        .eq('shop_id', shopData.id)
        .eq('product_id', productId)

      if (error) {
        console.error('Error deleting product config:', error)
        return res.status(500).json({ error: 'Failed to delete configuration' })
      }

      res.json({ success: true })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Product preorder API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function getDefaultConfig(productId: string, shopId: string) {
  return {
    shop_id: shopId,
    product_id: productId,
    enabled: true,
    preorder_type: 'out_of_stock',
    custom_button_text: 'Pre-Order Now',
    custom_badge_text: 'Pre-Order',
    badge_color: '#ff6b35',
    allow_partial_payment: false,
    partial_payment_percentage: 50,
    auto_tag_orders: true,
    order_tag: 'preorder',
    variants_config: {}
  }
}

function determineProductStatus(shopifyProduct: any, config: any) {
  if (!config?.enabled) {
    return 'normal'
  }

  const now = new Date()
  const startDate = config.preorder_start_date ? new Date(config.preorder_start_date) : null
  const endDate = config.preorder_end_date ? new Date(config.preorder_end_date) : null

  // Check if we're in a scheduled preorder period
  if (startDate && now < startDate) {
    return 'coming_soon'
  }

  if (endDate && now > endDate) {
    return 'normal'
  }

  // Check inventory status
  const inventoryStatus = getInventoryStatus(shopifyProduct)
  
  if (config.preorder_type === 'always') {
    return 'preorder'
  }

  if (config.preorder_type === 'out_of_stock' && inventoryStatus.outOfStock) {
    return 'preorder'
  }

  if (config.preorder_type === 'coming_soon') {
    return startDate && now >= startDate ? 'preorder' : 'coming_soon'
  }

  return 'normal'
}

function getInventoryStatus(shopifyProduct: any) {
  if (!shopifyProduct?.variants) {
    return { outOfStock: true, totalInventory: 0, availableVariants: 0 }
  }

  let totalInventory = 0
  let availableVariants = 0
  let outOfStock = true
  const locationInventory: { [key: string]: number } = {}

  shopifyProduct.variants.forEach((variant: any) => {
    const inventory = variant.inventory_quantity || 0
    const policy = variant.inventory_policy || 'deny'
    const management = variant.inventory_management || null
    
    totalInventory += inventory
    
    // Handle multi-location inventory
    if (variant.inventory_levels && Array.isArray(variant.inventory_levels)) {
      let variantTotalInventory = 0
      variant.inventory_levels.forEach((level: any) => {
        const locationId = level.location_id
        const locationQuantity = level.available || 0
        
        if (!locationInventory[locationId]) {
          locationInventory[locationId] = 0
        }
        locationInventory[locationId] += locationQuantity
        variantTotalInventory += locationQuantity
      })
      
      // Use multi-location total if available
      if (variantTotalInventory > 0 || policy === 'continue') {
        availableVariants++
        outOfStock = false
      }
    } else {
      // Fallback to single inventory quantity
      // Consider variant available if:
      // 1. Has inventory > 0, OR
      // 2. Inventory policy allows overselling (continue), OR
      // 3. Inventory is not managed by Shopify
      if (inventory > 0 || policy === 'continue' || !management) {
        availableVariants++
        outOfStock = false
      }
    }
  })

  // Additional logic for multi-location stores
  const hasMultipleLocations = Object.keys(locationInventory).length > 1
  const totalLocationInventory = Object.values(locationInventory).reduce((sum, qty) => sum + qty, 0)

  return {
    outOfStock,
    totalInventory: hasMultipleLocations ? totalLocationInventory : totalInventory,
    availableVariants,
    totalVariants: shopifyProduct.variants.length,
    multiLocation: hasMultipleLocations,
    locationInventory,
    inventoryManaged: shopifyProduct.variants.some((v: any) => v.inventory_management)
  }
}

async function updateProductMetafields(accessToken: string, shop: string, productId: string, config: any) {
  try {
    // Update product metafields to store preorder configuration
    // This helps with theme integration and faster lookups
    const metafields = [
      {
        namespace: 'preorder_pro',
        key: 'enabled',
        value: config.enabled.toString(),
        type: 'boolean'
      },
      {
        namespace: 'preorder_pro',
        key: 'button_text',
        value: config.custom_button_text || 'Pre-Order Now',
        type: 'single_line_text_field'
      },
      {
        namespace: 'preorder_pro',
        key: 'badge_text',
        value: config.custom_badge_text || 'Pre-Order',
        type: 'single_line_text_field'
      },
      {
        namespace: 'preorder_pro',
        key: 'badge_color',
        value: config.badge_color || '#ff6b35',
        type: 'color'
      }
    ]

    if (config.estimated_delivery_date) {
      metafields.push({
        namespace: 'preorder_pro',
        key: 'delivery_date',
        value: config.estimated_delivery_date,
        type: 'date'
      })
    }

    if (config.delivery_note) {
      metafields.push({
        namespace: 'preorder_pro',
        key: 'delivery_note',
        value: config.delivery_note,
        type: 'multi_line_text_field'
      })
    }

    // Update metafields via Shopify API
    await updateShopifyProduct(accessToken, shop, productId, { metafields })

  } catch (error) {
    console.error('Error updating product metafields:', error)
    // Don't throw error as this is not critical
  }
}
