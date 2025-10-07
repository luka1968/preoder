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
      console.error('Invalid HMAC signature for shop redact webhook')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const shop = req.headers['x-shopify-shop-domain'] as string
    const payload = req.body

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    console.log('Processing shop data redaction for shop:', shop)

    // 删除店铺的所有数据
    await redactShopData(shop)
    
    // 记录删除请求
    await logShopRedactionRequest(shop, payload)
    
    console.log('Shop data redaction completed for:', shop)

    res.status(200).json({ success: true })

  } catch (error) {
    console.error('Shop redact webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function redactShopData(shop: string) {
  try {
    // 删除所有与该店铺相关的数据
    const tables = [
      'back_in_stock_subscriptions',
      'notification_queue',
      'product_preorder_configs',
      'preorder_settings',
      'email_templates',
      'partial_payment_configs',
      'shops'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('shop_id', shop)
          .or(`shop_domain.eq.${shop}`)

        if (error && !error.message.includes('column "shop_id" does not exist')) {
          console.error(`Error deleting from ${table}:`, error)
        }
      } catch (tableError) {
        console.warn(`Could not delete from ${table}, may not exist:`, tableError)
      }
    }

    console.log('All shop data deleted for:', shop)
  } catch (error) {
    console.error('Error redacting shop data:', error)
    throw error
  }
}

async function logShopRedactionRequest(shop: string, payload: any) {
  try {
    // 在删除店铺数据之前记录请求
    await supabaseAdmin
      .from('privacy_requests')
      .insert({
        shop_domain: shop,
        request_type: 'shop_redaction',
        request_payload: payload,
        processed_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging shop redaction request:', error)
  }
}
