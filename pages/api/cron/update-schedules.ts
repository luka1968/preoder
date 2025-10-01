import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getShopifyProduct } from '../../../lib/shopify'
import { getCurrentScheduleStatus } from '../../../lib/timezone-utils'

// Cron job to automatically update preorder schedules and statuses
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a legitimate cron request
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Starting scheduled preorder status update...')
    
    // Get all active preorder configurations that need status updates
    const { data: configs, error: configError } = await supabaseAdmin
      .from('product_preorder_configs')
      .select(`
        *,
        shops!inner(domain, access_token, timezone)
      `)
      .eq('enabled', true)
      .or('preorder_start_date.not.is.null,preorder_end_date.not.is.null')

    if (configError) {
      throw new Error(`Failed to fetch preorder configs: ${configError.message}`)
    }

    if (!configs || configs.length === 0) {
      console.log('No active preorder configurations found')
      return res.json({ message: 'No configurations to update', updated: 0 })
    }

    console.log(`Found ${configs.length} preorder configurations to check`)

    let updatedCount = 0
    const updatePromises = configs.map(async (config) => {
      try {
        const shop = config.shops
        if (!shop) {
          console.warn(`No shop found for config ${config.id}`)
          return
        }

        // Get current product status from Shopify
        const shopifyProduct = await getShopifyProduct(
          shop.access_token,
          shop.domain,
          config.product_id
        )

        // Determine current status based on schedule and inventory
        const currentStatus = getCurrentScheduleStatus({
          preorder_start_date: config.preorder_start_date,
          preorder_end_date: config.preorder_end_date,
          preorder_type: config.preorder_type,
          enabled: config.enabled,
          merchant_timezone: shop.timezone || 'UTC'
        })

        // Check if status has changed or if we need to update inventory info
        const needsUpdate = await checkIfUpdateNeeded(config, shopifyProduct, currentStatus)

        if (needsUpdate) {
          await updateConfigStatus(config, shopifyProduct, currentStatus)
          updatedCount++
          
          console.log(`Updated config ${config.id} for product ${config.product_id} to status: ${currentStatus}`)
        }

      } catch (error) {
        console.error(`Error updating config ${config.id}:`, error)
      }
    })

    await Promise.all(updatePromises)

    console.log(`Completed scheduled update. Updated ${updatedCount} configurations.`)

    res.json({
      message: 'Schedule update completed',
      checked: configs.length,
      updated: updatedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in scheduled preorder update:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function checkIfUpdateNeeded(
  config: any,
  shopifyProduct: any,
  currentStatus: string
): Promise<boolean> {
  // Check if the schedule status has changed
  if (config.current_status !== currentStatus) {
    return true
  }

  // Check if inventory status has changed significantly
  const now = new Date()
  const lastInventoryCheck = config.last_inventory_check ? 
    new Date(config.last_inventory_check) : new Date(0)
  
  // Update inventory info every hour
  const hoursSinceLastCheck = (now.getTime() - lastInventoryCheck.getTime()) / (1000 * 60 * 60)
  if (hoursSinceLastCheck >= 1) {
    return true
  }

  // Check if product has been updated in Shopify recently
  if (shopifyProduct?.updated_at) {
    const productUpdated = new Date(shopifyProduct.updated_at)
    const configUpdated = new Date(config.updated_at)
    
    if (productUpdated > configUpdated) {
      return true
    }
  }

  return false
}

async function updateConfigStatus(
  config: any,
  shopifyProduct: any,
  currentStatus: string
): Promise<void> {
  const now = new Date().toISOString()
  
  // Calculate inventory status
  const inventoryStatus = calculateInventoryStatus(shopifyProduct)
  
  // Prepare update data
  const updateData: any = {
    current_status: currentStatus,
    last_inventory_check: now,
    updated_at: now
  }

  // Add inventory information
  if (inventoryStatus) {
    updateData.inventory_status = inventoryStatus
  }

  // Handle status-specific updates
  switch (currentStatus) {
    case 'expired':
      // Disable expired preorders
      updateData.enabled = false
      updateData.expired_at = now
      break
      
    case 'coming_soon':
      // Ensure coming soon products are properly configured
      updateData.show_countdown = config.show_countdown ?? true
      break
      
    case 'preorder':
      // Activate preorder mode
      updateData.activated_at = updateData.activated_at || now
      break
  }

  // Update the configuration
  const { error } = await supabaseAdmin
    .from('product_preorder_configs')
    .update(updateData)
    .eq('id', config.id)

  if (error) {
    throw new Error(`Failed to update config ${config.id}: ${error.message}`)
  }

  // Log the activity
  await logScheduleActivity(config, currentStatus, updateData)
}

function calculateInventoryStatus(shopifyProduct: any): any {
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
      
      if (variantTotalInventory > 0 || policy === 'continue') {
        availableVariants++
        outOfStock = false
      }
    } else {
      if (inventory > 0 || policy === 'continue' || !management) {
        availableVariants++
        outOfStock = false
      }
    }
  })

  const hasMultipleLocations = Object.keys(locationInventory).length > 1
  const totalLocationInventory = Object.values(locationInventory).reduce((sum, qty) => sum + qty, 0)

  return {
    outOfStock,
    totalInventory: hasMultipleLocations ? totalLocationInventory : totalInventory,
    availableVariants,
    totalVariants: shopifyProduct.variants.length,
    multiLocation: hasMultipleLocations,
    locationInventory,
    inventoryManaged: shopifyProduct.variants.some((v: any) => v.inventory_management),
    lastChecked: new Date().toISOString()
  }
}

async function logScheduleActivity(
  config: any,
  newStatus: string,
  updateData: any
): Promise<void> {
  try {
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        shop_id: config.shop_id,
        activity_type: 'schedule_update',
        description: `Preorder schedule updated for product ${config.product_id}`,
        metadata: {
          product_id: config.product_id,
          old_status: config.current_status,
          new_status: newStatus,
          update_data: updateData,
          automated: true
        },
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log schedule activity:', error)
    // Don't throw error as this is not critical
  }
}
