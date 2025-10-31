import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query

  if (!shop) {
    return res.status(400).json({ error: '请提供店铺域名参数 ?shop=xxx.myshopify.com' })
  }

  try {
    // 查询 shops 表
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('shop_domain, installed_at, active, scope')
      .eq('shop_domain', shop)
      .single()

    if (shopError) {
      return res.status(200).json({
        found: false,
        message: '店铺未找到',
        error: shopError.message,
        action: '需要重新安装App'
      })
    }

    // 查询该店铺的预购记录数量
    const { count, error: countError } = await supabaseAdmin
      .from('preorders')
      .select('*', { count: 'exact', head: true })
      .eq('shop_domain', shop)

    return res.status(200).json({
      found: true,
      shop: {
        domain: shopData.shop_domain,
        installed_at: shopData.installed_at,
        is_active: shopData.active,
        scope: shopData.scope,
        has_access_token: true
      },
      preorders_count: count || 0,
      status: '✅ 店铺已安装，可以创建Shopify订单',
      message: '预购功能已就绪！'
    })

  } catch (error: any) {
    return res.status(500).json({
      error: '查询失败',
      details: error.message
    })
  }
}
