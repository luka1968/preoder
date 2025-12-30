import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * Send Payment Reminders (Daily Cron Job)
 * 
 * Queries orders where:
 * - payment_status = 'pending'
 * - reminder_sent_at IS NULL (not sent yet)
 * - auto_cancel_at - NOW() <= campaign.reminder_days_before_cancel
 * - campaign.send_payment_reminder = true
 * 
 * Sends reminder email for each order
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verify cron secret for security
    const { token } = req.query
    if (token !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('🤖 Running payment reminder cron job...')

    try {
        // Query orders that need reminders
        const { data: ordersNeedingReminder, error: queryError } = await supabaseAdmin
            .from('preorder_orders')
            .select(`
        *,
        shop:shops(shop_domain, access_token),
        campaign:preorder_campaigns(
          name,
          auto_cancel_days,
          send_payment_reminder,
          reminder_days_before_cancel
        )
      `)
            .eq('payment_status', 'pending')
            .is('reminder_sent_at', null)
            .not('auto_cancel_at', 'is', null)

        if (queryError) throw queryError

        if (!ordersNeedingReminder || ordersNeedingReminder.length === 0) {
            console.log('✅ No reminders to send')
            return res.status(200).json({
                success: true,
                message: 'No reminders to send',
                sent_count: 0
            })
        }

        // Filter orders that should receive reminders
        const now = new Date()
        const ordersToRemind = ordersNeedingReminder.filter(order => {
            // Check if campaign has reminders enabled
            if (!order.campaign?.send_payment_reminder) {
                return false
            }

            // Check if it's time to send reminder
            const autoCancelDate = new Date(order.auto_cancel_at)
            const daysUntilCancel = Math.ceil((autoCancelDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const reminderThreshold = order.campaign?.reminder_days_before_cancel || 2

            return daysUntilCancel <= reminderThreshold && daysUntilCancel > 0
        })

        if (ordersToRemind.length === 0) {
            console.log('✅ No orders meet reminder criteria')
            return res.status(200).json({
                success: true,
                message: 'No orders meet reminder criteria',
                total_pending: ordersNeedingReminder.length,
                sent_count: 0
            })
        }

        console.log(`📋 Sending reminders for ${ordersToRemind.length} orders`)

        const results = []

        for (const order of ordersToRemind) {
            try {
                console.log(`⏳ Sending reminder for order ${order.id}...`)

                // Call reminder API
                const reminderResult = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || process.env.SHOPIFY_APP_URL}/api/draft-order/send-reminder`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            preorder_id: order.id,
                            shop: order.shop?.shop_domain
                        })
                    }
                )

                const reminderData = await reminderResult.json()

                if (reminderResult.ok) {
                    results.push({
                        success: true,
                        order_id: order.id,
                        customer_email: order.customer_email,
                        ...reminderData
                    })
                    console.log(`✅ Reminder sent for order ${order.id}`)
                } else {
                    results.push({
                        success: false,
                        order_id: order.id,
                        error: reminderData.error
                    })
                    console.error(`❌ Failed to send reminder for order ${order.id}:`, reminderData.error)
                }
            } catch (err: any) {
                results.push({
                    success: false,
                    order_id: order.id,
                    error: err.message
                })
                console.error(`❌ Error sending reminder for order ${order.id}:`, err)
            }
        }

        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length

        console.log(`✅ Payment reminders completed: ${successCount} sent, ${failCount} failed`)

        return res.status(200).json({
            success: true,
            message: `Payment reminder job completed`,
            total_pending: ordersNeedingReminder.length,
            eligible_for_reminder: ordersToRemind.length,
            sent_count: successCount,
            failed_count: failCount,
            results
        })
    } catch (error: any) {
        console.error('❌ Payment reminder cron error:', error)
        return res.status(500).json({
            error: 'Cron job failed',
            details: error.message
        })
    }
}
