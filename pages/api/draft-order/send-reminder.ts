import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { sendDraftOrderInvoice } from '../../../lib/shopify'

/**
 * Send Payment Reminder API
 * POST: Send payment reminder email for Draft Order
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { preorder_id, shop } = req.body

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

        // Get preorder
        const { data: preorder, error: preorderError } = await supabaseAdmin
            .from('preorder_orders')
            .select(`
        *,
        campaign:preorder_campaigns(name, auto_cancel_days)
      `)
            .eq('id', preorder_id)
            .single()

        if (preorderError || !preorder) {
            return res.status(404).json({ error: 'Preorder not found' })
        }

        // Check if already paid
        if (preorder.payment_status === 'paid') {
            return res.status(400).json({
                error: 'Order already paid',
                payment_status: preorder.payment_status
            })
        }

        // Check if already cancelled
        if (preorder.payment_status === 'cancelled') {
            return res.status(400).json({
                error: 'Order already cancelled',
                payment_status: preorder.payment_status
            })
        }

        // Check if draft_order_id exists
        if (!preorder.draft_order_id) {
            return res.status(400).json({
                error: 'No draft order ID found',
                payment_mode: preorder.payment_mode
            })
        }

        // Calculate days until auto-cancel
        const daysLeft = preorder.auto_cancel_at
            ? Math.ceil((new Date(preorder.auto_cancel_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0

        const reminderMessage = `
⏰ 付款提醒

您的预购订单即将过期！

订单编号: ${preorder.shopify_order_id}
活动名称: ${preorder.campaign?.name || '预购活动'}
剩余时间: ${daysLeft} 天

请尽快完成支付，否则订单将在 ${new Date(preorder.auto_cancel_at).toLocaleDateString('zh-CN')} 自动取消。

点击下方链接完成支付 👇
`.trim()

        // Send reminder via Shopify
        console.log(`📧 Sending payment reminder for preorder ${preorder_id}...`)

        await sendDraftOrderInvoice(
            shopData.shop_domain,
            shopData.access_token,
            parseInt(preorder.draft_order_id),
            reminderMessage
        )

        // Update reminder_sent_at timestamp
        await supabaseAdmin
            .from('preorder_orders')
            .update({
                reminder_sent_at: new Date().toISOString()
            })
            .eq('id', preorder_id)

        console.log(`✅ Payment reminder sent for preorder ${preorder_id}`)

        return res.status(200).json({
            success: true,
            message: 'Payment reminder sent successfully',
            days_until_cancel: daysLeft
        })
    } catch (error: any) {
        console.error('❌ Send reminder error:', error)
        return res.status(500).json({
            error: 'Failed to send reminder',
            details: error.message
        })
    }
}
