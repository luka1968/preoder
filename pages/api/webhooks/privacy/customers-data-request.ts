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
      console.error('Invalid HMAC signature for customers data request webhook')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const shop = req.headers['x-shopify-shop-domain'] as string
    const payload = req.body

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    console.log('Processing customer data request for shop:', shop)
    console.log('Data request payload:', payload)

    // 根据GDPR要求，处理客户数据请求
    // 这里应该收集所有与该客户相关的数据
    const customerId = payload.customer?.id
    const customerEmail = payload.customer?.email

    if (customerId || customerEmail) {
      // 查询与该客户相关的所有数据
      const customerData = await collectCustomerData(shop, customerId, customerEmail)
      
      // 记录数据请求
      await logDataRequest(shop, payload, customerData)
      
      console.log('Customer data request processed for:', customerEmail || customerId)
    }

    res.status(200).json({ success: true })

  } catch (error) {
    console.error('Customer data request webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function collectCustomerData(shop: string, customerId?: string, customerEmail?: string) {
  try {
    const customerData: any = {
      shop_domain: shop,
      customer_id: customerId,
      customer_email: customerEmail,
      collected_at: new Date().toISOString(),
      data: {}
    }

    // 收集预订相关数据
    if (customerId) {
      const { data: preorders } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .select('*')
        .eq('shop_id', shop)
        .eq('customer_id', customerId)

      customerData.data.preorders = preorders || []
    }

    if (customerEmail) {
      const { data: subscriptions } = await supabaseAdmin
        .from('back_in_stock_subscriptions')
        .select('*')
        .eq('shop_id', shop)
        .eq('email', customerEmail)

      customerData.data.subscriptions = subscriptions || []
    }

    return customerData
  } catch (error) {
    console.error('Error collecting customer data:', error)
    return null
  }
}

async function logDataRequest(shop: string, payload: any, customerData: any) {
  try {
    await supabaseAdmin
      .from('privacy_requests')
      .insert({
        shop_domain: shop,
        request_type: 'data_request',
        customer_id: payload.customer?.id,
        customer_email: payload.customer?.email,
        request_payload: payload,
        collected_data: customerData,
        processed_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging data request:', error)
  }
}
