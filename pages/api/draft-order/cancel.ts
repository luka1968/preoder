import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { deleteDraftOrder } from '../../../lib/shopify'

/**
 * Cancel Draft Order API
 * POST: Cancel unpaid Draft Order and release inventory
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { preorder_id, shop, reason = 'Auto-cancelled due to non-payment' } = req.body

        if (!preorder_id || !shop) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['preorder_id', 'shop']
            })
        }

        // Get shop data
        const { data: shopData, error: shopError } = await supabaseAdmin
            .from('shops')
            .select('access_token, shop_domain')
            .eq('shop_domain', shop)
            .single()

        if (shopError || !shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        // Get preorder with campaign info
        const { data: preorder, error: preorderError } = await supabaseAdmin
            .from('preorder_orders')
            .select(`
        *,
        campaign:preorder_campaigns(lock_inventory)
      `)
            .eq('id', preorder_id)
            .single()

        if (preorderError || !preorder) {
            return res.status(404).json({ error: 'Preorder not found' })
        }

        // Check if already paid
        if (preorder.payment_status === 'paid') {
            return res.status(400).json({
                error: 'Cannot cancel paid order',
                payment_status: preorder.payment_status
            })
        }

        // Check if already cancelled
        if (preorder.payment_status === 'cancelled') {
            return res.status(200).json({
                success: true,
                message: 'Order already cancelled',
                already_cancelled: true
            })
        }

        let draftOrderDeleted = false

        // Delete Draft Order from Shopify (this releases inventory automatically)
        if (preorder.draft_order_id) {
            try {
                console.log(`🗑️ Deleting Draft Order ${preorder.draft_order_id}...`)

                await deleteDraftOrder(
                    shopData.shop_domain,
                    shopData.access_token,
                    parseInt(preorder.draft_order_id)
                )

                draftOrderDeleted = true
                console.log(`✅ Draft Order ${preorder.draft_order_id} deleted`)
            } catch (error: any) {
                console.warn(`⚠️ Failed to delete Draft Order: ${error.message}`)
                // Continue anyway - update database
            }
        }

        // Update database - mark as cancelled
        const { error: updateError } = await supabaseAdmin
            .from('preorder_orders')
            .update({
                payment_status: 'cancelled',
                fulfillment_status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', preorder_id)

        if (updateError) {
            console.error('❌ Database update failed:', updateError)
            return res.status(500).json({
                error: 'Failed to update order status',
                draft_order_deleted: draftOrderDeleted,
                details: updateError.message
            })
        }

        console.log(`✅ Preorder ${preorder_id} cancelled`)

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            preorder_id,
            draft_order_deleted: draftOrderDeleted,
            inventory_released: preorder.campaign?.lock_inventory || false,
            reason
        })
    } catch (error: any) {
        console.error('❌ Cancel draft order error:', error)
        return res.status(500).json({
            error: 'Failed to cancel order',
            details: error.message
        })
    }
}
