import { NextApiRequest, NextApiResponse } from 'next'
import { verifyWebhookHmac } from '../../../../lib/shopify-auth'
import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 获取原始请求体用于HMAC验证
    const rawBody = JSON.stringify(req.body)
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string

    // 验证HMAC签名
    if (!hmacHeader || !verifyWebhookHmac(rawBody, hmacHeader)) {
      console.error('Invalid HMAC signature for customers redact webhook')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const shop = req.headers['x-shopify-shop-domain'] as string
    const payload = req.body

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    console.log('Processing customer data redaction for shop:', shop)

    const customerId = payload.customer?.id
    const customerEmail = payload.customer?.email

    if (customerId || customerEmail) {
      // 删除或匿名化客户数据
      await redactCustomerData(shop, customerId, customerEmail)
      
      // 记录删除请求
      await logRedactionRequest(shop, payload)
      
      console.log('Customer data redacted for:', customerEmail || customerId)
    }

    res.status(200).json({ success: true })

  } catch (error) {
    console.error('Customer redact webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function redactCustomerData(shop: string, customerId?: string, customerEmail?: string) {
  try {
    // 删除预订订阅数据
    if (customerId) {
      await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .delete()
        .eq('shop_id', shop)
        .eq('customer_id', customerId)
    }

    if (customerEmail) {
      await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .delete()
        .eq('shop_id', shop)
        .eq('email', customerEmail)
    }

    // 匿名化通知队列中的数据
    if (customerEmail) {
      await supabaseAdmin
        .from('notification_queue')
        .update({
          recipient_email: 'redacted@privacy.local',
          customer_data: null
        })
        .eq('shop_id', shop)
        .eq('recipient_email', customerEmail)
    }

    console.log('Customer data redaction completed')
  } catch (error) {
    console.error('Error redacting customer data:', error)
    throw error
  }
}

async function logRedactionRequest(shop: string, payload: any) {
  try {
    await supabaseAdmin
      .from('privacy_requests')
      .insert({
        shop_domain: shop,
        request_type: 'redaction',
        customer_id: payload.customer?.id,
        customer_email: payload.customer?.email,
        request_payload: payload,
        processed_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging redaction request:', error)
  }
}
