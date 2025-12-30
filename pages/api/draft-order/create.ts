import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { createDraftOrder, sendDraftOrderInvoice } from '../../../lib/shopify'

/**
 * Create Draft Order API (Pay Later Mode)
 * POST: Create Draft Order for a pre-order with payment pending
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const {
            shop,
            variant_id,
            customer_email,
            customer_name,
            campaign_id,
            quantity = 1
        } = req.body

        // Validation
        if (!shop || !variant_id || !customer_email || !campaign_id) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['shop', 'variant_id', 'customer_email', 'campaign_id']
            })
        }

        // Get shop data
        const { data: shopData, error: shopError } = await supabaseAdmin
            .from('shops')
            .select('id, access_token, shop_domain')
            .eq('shop_domain', shop)
            .single()

        if (shopError || !shopData) {
            return res.status(404).json({ error: 'Shop not found' })
        }

        // Get campaign settings
        const { data: campaign, error: campaignError } = await supabaseAdmin
            .from('preorder_campaigns')
            .select('*')
            .eq('id', campaign_id)
            .eq('shop_id', shopData.id)
            .single()

        if (campaignError || !campaign) {
            return res.status(404).json({ error: 'Campaign not found' })
        }

        // Verify campaign is pay_later mode
        if (campaign.payment_mode !== 'pay_later') {
            return res.status(400).json({
                error: 'Campaign is not in pay_later mode',
                current_mode: campaign.payment_mode
            })
        }

        // Get variant info from Shopify
        const variantResponse = await fetch(
            `https://${shop}/admin/api/2025-10/variants/${variant_id}.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': shopData.access_token,
                },
            }
        )

        if (!variantResponse.ok) {
            return res.status(400).json({ error: 'Invalid variant_id' })
        }

        const variantData = await variantResponse.json()
        const variant = variantData.variant

        // Create Draft Order in Shopify
        const draftOrderData = {
            line_items: [
                {
                    variant_id: parseInt(variant_id),
                    quantity: quantity,
                    properties: [
                        { name: '_preorder', value: 'true' },
                        { name: '_payment_mode', value: 'pay_later' },
                        { name: '_campaign_id', value: campaign_id.toString() }
                    ]
                }
            ],
            customer: {
                email: customer_email,
                first_name: customer_name || customer_email.split('@')[0],
            },
            tags: `preorder,pay_later,campaign_${campaign_id}`,
            note: `预购订单 (先单后付) - Campaign: ${campaign.name}`,
            email: customer_email,
        }

        console.log('📝 Creating Draft Order...')
        const draftOrder = await createDraftOrder(
            shop,
            shopData.access_token,
            draftOrderData
        )

        console.log(`✅ Draft Order created: ${draftOrder.id}`)

        // Calculate auto_cancel_at
        const autoCancelAt = new Date()
        autoCancelAt.setDate(autoCancelAt.getDate() + campaign.auto_cancel_days)

        // Save to database
        const { data: preorderOrder, error: dbError } = await supabaseAdmin
            .from('preorder_orders')
            .insert({
                shop_id: shopData.id,
                campaign_id: campaign.id,
                product_id: variant.product_id.toString(),
                variant_id: variant_id,
                customer_email: customer_email,
                total_amount: (parseFloat(variant.price) * quantity).toString(),
                paid_amount: '0.00',
                payment_status: 'pending',
                payment_mode: 'pay_later',
                draft_order_id: draftOrder.id.toString(),
                invoice_url: draftOrder.invoice_url,
                auto_cancel_at: autoCancelAt.toISOString(),
                shopify_order_id: draftOrder.id.toString(),
            })
            .select()
            .single()

        if (dbError) {
            console.error('❌ Database save failed:', dbError)
            // Draft Order created but DB failed - log for manual recovery
            return res.status(500).json({
                error: 'Database error',
                draft_order_id: draftOrder.id,
                details: dbError.message
            })
        }

        // Send invoice email automatically
        try {
            console.log('📧 Sending invoice email...')
            await sendDraftOrderInvoice(
                shop,
                shopData.access_token,
                draftOrder.id,
                `您的预购订单已创建！请在 ${campaign.auto_cancel_days} 天内完成支付。`
            )

            // Update invoice_sent_at
            await supabaseAdmin
                .from('preorder_orders')
                .update({ invoice_sent_at: new Date().toISOString() })
                .eq('id', preorderOrder.id)

            console.log('✅ Invoice email sent')
        } catch (emailError: any) {
            console.warn('⚠️ Email send failed:', emailError.message)
            // Don't fail the request, customer can still pay via dashboard
        }

        return res.status(201).json({
            success: true,
            message: '预购订单创建成功！支付链接已发送到您的邮箱。',
            preorder: {
                id: preorderOrder.id,
                draft_order_id: draftOrder.id,
                draft_order_name: draftOrder.name,
                invoice_url: draftOrder.invoice_url,
                auto_cancel_at: autoCancelAt,
                auto_cancel_days: campaign.auto_cancel_days
            }
        })
    } catch (error: any) {
        console.error('❌ Create draft order error:', error)
        return res.status(500).json({
            error: 'Failed to create draft order',
            details: error.message
        })
    }
}
