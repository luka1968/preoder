import { NextApiRequest, NextApiResponse } from 'next'
import { requireSessionToken, ShopifySessionPayload } from '../../../lib/session-token-auth'
import { supabaseAdmin } from '../../../lib/supabase'

async function handler(req: NextApiRequest, res: NextApiResponse, session: ShopifySessionPayload) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const shop = session.dest.replace('https://', '').replace('/admin', '')
    
    // 获取店铺数据
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', shop)
      .single()

    if (shopError) {
      console.error('Error fetching shop data:', shopError)
      return res.status(404).json({ error: 'Shop not found' })
    }

    // 获取预订设置
    const { data: preorderSettings, error: settingsError } = await supabaseAdmin
      .from('preorder_settings')
      .select('*')
      .eq('shop_id', shop)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching preorder settings:', settingsError)
    }

    // 获取产品配置统计
    const { count: productCount } = await supabaseAdmin
      .from('product_preorder_configs')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shop)

    // 获取订阅统计
    const { count: subscriptionCount } = await supabaseAdmin
      .from('back_in_stock_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shop)

    res.status(200).json({
      shop: {
        domain: shop,
        name: shopData.shop_name,
        email: shopData.email,
        currency: shopData.currency,
        timezone: shopData.timezone,
        plan_name: shopData.plan_name,
        installed_at: shopData.installed_at
      },
      settings: preorderSettings || {
        enabled: false,
        default_message: 'This item is available for pre-order',
        email_notifications: true
      },
      stats: {
        products_configured: productCount || 0,
        active_subscriptions: subscriptionCount || 0
      },
      session: {
        user_id: session.sub,
        shop_id: session.dest,
        expires_at: new Date(session.exp * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('App data API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireSessionToken(handler)
