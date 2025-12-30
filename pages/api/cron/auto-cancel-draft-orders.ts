import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * Auto-Cancel Unpaid Dream Orders (Daily Cron Job)
 * 
 * Queries orders where:
 * - payment_status = 'pending'
 * - auto_cancel_at < NOW()
 * 
 * Cancels each order via /api/draft-order/cancel
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verify cron secret for security
    const { token } = req.query
    if (token !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('🤖 Running auto-cancel cron job...')

    try {
        // Query orders that need to be cancelled
        const { data: ordersToCancel, error: queryError } = await supabaseAdmin
            .from('preorder_orders')
            .select(`
        *,
        shop:shops(shop_domain, access_token)
      `)
            .eq('payment_status', 'pending')
            .lt('auto_cancel_at', new Date().toISOString())
            .order('auto_cancel_at', { ascending: true })

        if (queryError) throw queryError

        if (!ordersToCancel || ordersToCancel.length === 0) {
            console.log('✅ No orders to cancel')
            return res.status(200).json({
                success: true,
                message: 'No orders to cancel',
                cancelled_count: 0
            })
        }

        console.log(`📋 Found ${ordersToCancel.length} orders to cancel`)

        const results = []

        for (const order of ordersToCancel) {
            try {
                console.log(`⏳ Cancelling order ${order.id}...`)

                // Call cancel API
                const cancelResult = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || process.env.SHOPIFY_APP_URL}/api/draft-order/cancel`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            preorder_id: order.id,
                            shop: order.shop?.shop_domain,
                            reason: 'Auto-cancelled: Payment deadline expired'
                        })
                    }
                )

                const cancelData = await cancelResult.json()

                if (cancelResult.ok) {
                    results.push({
                        success: true,
                        order_id: order.id,
                        customer_email: order.customer_email,
                        ...cancelData
                    })
                    console.log(`✅ Order ${order.id} cancelled`)
                } else {
                    results.push({
                        success: false,
                        order_id: order.id,
                        error: cancelData.error
                    })
                    console.error(`❌ Failed to cancel order ${order.id}:`, cancelData.error)
                }
            } catch (err: any) {
                results.push({
                    success: false,
                    order_id: order.id,
                    error: err.message
                })
                console.error(`❌ Error cancelling order ${order.id}:`, err)
            }
        }

        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length

        console.log(`✅ Auto-cancel completed: ${successCount} cancelled, ${failCount} failed`)

        return res.status(200).json({
            success: true,
            message: `Auto-cancel job completed`,
            total_processed: ordersToCancel.length,
            cancelled_count: successCount,
            failed_count: failCount,
            results
        })
    } catch (error: any) {
        console.error('❌ Auto-cancel cron error:', error)
        return res.status(500).json({
            error: 'Cron job failed',
            details: error.message
        })
    }
}
