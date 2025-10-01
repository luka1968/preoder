import { NextApiRequest, NextApiResponse } from 'next'
import { withUsageCheck, UsageMiddleware } from '../../../lib/usage-middleware'
import { supabaseAdmin } from '../../../lib/supabase'

// Example of how to integrate billing checks into preorder creation
async function createPreorderHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { shop } = req.query
  const { 
    product_id, 
    variant_id, 
    customer_email, 
    customer_name,
    total_amount,
    deposit_amount 
  } = req.body

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  if (!product_id || !customer_email || !total_amount) {
    return res.status(400).json({ 
      error: 'Missing required fields: product_id, customer_email, total_amount' 
    })
  }

  try {
    // Get shop ID
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('domain', shop)
      .single()

    if (shopError || !shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    const shopId = shopData.id

    // Check if partial payments are allowed (if deposit_amount is provided)
    if (deposit_amount && parseFloat(deposit_amount) < parseFloat(total_amount)) {
      const partialPaymentCheck = await UsageMiddleware.checkPartialPaymentAccess(shop)
      
      if (!partialPaymentCheck.allowed) {
        return res.status(403).json({
          error: 'Partial payments not available',
          message: partialPaymentCheck.message,
          upgrade_required: true
        })
      }
    }

    // Increment preorder usage (this is handled by the middleware, but we can also do it manually)
    const usageResult = await UsageMiddleware.incrementAndCheck(shop, 'preorder_orders')
    
    if (!usageResult.allowed) {
      return res.status(403).json({
        error: 'Preorder limit exceeded',
        message: usageResult.message,
        current: usageResult.current,
        limit: usageResult.limit,
        upgrade_required: true
      })
    }

    // Create the preorder
    const { data: preorder, error: preorderError } = await supabaseAdmin
      .from('preorders')
      .insert({
        shop_id: shopId,
        product_id,
        variant_id,
        customer_email,
        customer_name,
        total_amount,
        deposit_amount: deposit_amount || total_amount,
        remaining_amount: deposit_amount ? 
          (parseFloat(total_amount) - parseFloat(deposit_amount)).toString() : '0',
        payment_status: deposit_amount && parseFloat(deposit_amount) < parseFloat(total_amount) ? 
          'partial' : 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (preorderError) {
      throw new Error(`Failed to create preorder: ${preorderError.message}`)
    }

    res.json({
      success: true,
      preorder,
      usage: {
        current: usageResult.current,
        limit: usageResult.limit
      }
    })

  } catch (error) {
    console.error('Error creating preorder:', error)
    res.status(500).json({
      error: 'Failed to create preorder',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Export with usage check middleware
export default withUsageCheck('preorder_orders', createPreorderHandler)
