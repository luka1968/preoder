import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain, supabaseAdmin } from '../../../../lib/supabase'
import { getShopifyVariant } from '../../../../lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { variantId } = req.query
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  if (!variantId || typeof variantId !== 'string') {
    return res.status(400).json({ error: 'Variant ID is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // Get variant preorder status
      const shopifyVariant = await getShopifyVariant(shopData.access_token, shop, variantId)

      if (!shopifyVariant) {
        return res.status(404).json({ error: 'Variant not found' })
      }

      // Get product-level configuration
      const { data: productConfig } = await supabaseAdmin
        .from('product_preorder_configs')
        .select('*')
        .eq('shop_id', shopData.id)
        .eq('product_id', shopifyVariant.product_id.toString())
        .single()

      // Determine variant status
      const variantStatus = determineVariantStatus(shopifyVariant, productConfig)

      // 🆕 Check if variant is in any campaign
      const { data: campaignProduct } = await supabaseAdmin
        .from('campaign_products')
        .select(`
          *,
          campaign:preorder_campaigns(*)
        `)
        .eq('variant_id', variantId)
        .single()

      // Return campaign info if exists
      const campaignInfo = campaignProduct?.campaign && campaignProduct.campaign.enabled
        ? {
          id: campaignProduct.campaign.id,
          name: campaignProduct.campaign.name,
          payment_mode: campaignProduct.campaign.payment_mode,
          auto_cancel_days: campaignProduct.campaign.auto_cancel_days,
          lock_inventory: campaignProduct.campaign.lock_inventory
        }
        : null

      res.json({
        variant: shopifyVariant,
        productConfig,
        campaign: campaignInfo, // 🆕 Campaign info for frontend
        preorder_enabled: variantStatus === 'preorder',
        status: variantStatus,
        inventoryStatus: getVariantInventoryStatus(shopifyVariant)
      })

    } else if (req.method === 'PUT') {
      // Update variant-specific configuration
      const { productId, variantConfig } = req.body

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' })
      }

      // Get existing product configuration
      const { data: existingConfig, error: fetchError } = await supabaseAdmin
        .from('product_preorder_configs')
        .select('*')
        .eq('shop_id', shopData.id)
        .eq('product_id', productId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching product config:', fetchError)
        return res.status(500).json({ error: 'Failed to fetch configuration' })
      }

      // Update variants configuration
      const currentVariantsConfig = existingConfig?.variants_config || {}
      const updatedVariantsConfig = {
        ...currentVariantsConfig,
        [variantId]: variantConfig
      }

      // Upsert product configuration with updated variants config
      const { data: config, error } = await supabaseAdmin
        .from('product_preorder_configs')
        .upsert({
          shop_id: shopData.id,
          product_id: productId,
          enabled: existingConfig?.enabled ?? true,
          preorder_type: existingConfig?.preorder_type ?? 'out_of_stock',
          variants_config: updatedVariantsConfig,
          updated_at: new Date().toISOString(),
          // Keep other existing settings
          ...existingConfig
        }, {
          onConflict: 'shop_id,product_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating variant config:', error)
        return res.status(500).json({ error: 'Failed to update configuration' })
      }

      res.json({
        config,
        variantConfig: updatedVariantsConfig[variantId]
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Variant preorder API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function determineVariantStatus(variant: any, productConfig: any) {
  if (!productConfig?.enabled) {
    return 'normal'
  }

  const now = new Date()
  const startDate = productConfig.preorder_start_date ? new Date(productConfig.preorder_start_date) : null
  const endDate = productConfig.preorder_end_date ? new Date(productConfig.preorder_end_date) : null

  // Check variant-specific configuration
  const variantConfig = productConfig.variants_config?.[variant.id]
  if (variantConfig) {
    if (!variantConfig.enabled) {
      return 'normal'
    }

    // Use variant-specific dates if available
    const variantStartDate = variantConfig.preorder_start_date ? new Date(variantConfig.preorder_start_date) : startDate
    const variantEndDate = variantConfig.preorder_end_date ? new Date(variantConfig.preorder_end_date) : endDate

    if (variantStartDate && now < variantStartDate) {
      return 'coming_soon'
    }

    if (variantEndDate && now > variantEndDate) {
      return 'normal'
    }
  } else {
    // Use product-level dates
    if (startDate && now < startDate) {
      return 'coming_soon'
    }

    if (endDate && now > endDate) {
      return 'normal'
    }
  }

  // Check inventory and preorder type
  const inventoryStatus = getVariantInventoryStatus(variant)
  const preorderType = variantConfig?.preorder_type || productConfig.preorder_type

  if (preorderType === 'always') {
    return 'preorder'
  }

  if (preorderType === 'out_of_stock' && inventoryStatus.outOfStock) {
    return 'preorder'
  }

  if (preorderType === 'coming_soon') {
    const relevantStartDate = variantConfig?.preorder_start_date ?
      new Date(variantConfig.preorder_start_date) : startDate
    return relevantStartDate && now >= relevantStartDate ? 'preorder' : 'coming_soon'
  }

  return 'normal'
}

function getVariantInventoryStatus(variant: any) {
  const inventory = variant.inventory_quantity || 0
  const policy = variant.inventory_policy || 'deny'
  const tracked = variant.inventory_management !== null

  return {
    outOfStock: tracked ? (inventory <= 0 && policy === 'deny') : false,
    inventory,
    policy,
    tracked,
    available: !tracked || inventory > 0 || policy === 'continue'
  }
}
