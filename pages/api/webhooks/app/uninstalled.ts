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
      console.error('Invalid HMAC signature for app uninstall webhook')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const shop = req.headers['x-shopify-shop-domain'] as string
    const payload = req.body

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop domain' })
    }

    console.log('Processing app uninstall for shop:', shop)

    // 标记应用为已卸载
    const { error } = await supabaseAdmin
      .from('shops')
      .update({ 
        uninstalled_at: new Date().toISOString(),
        access_token: null // 清除访问令牌
      })
      .eq('shop_domain', shop)

    if (error) {
      console.error('Error updating shop uninstall status:', error)
      return res.status(500).json({ error: 'Database error' })
    }

    console.log('App successfully uninstalled for shop:', shop)
    res.status(200).json({ success: true })

  } catch (error) {
    console.error('App uninstall webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
