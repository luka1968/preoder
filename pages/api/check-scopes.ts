import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 1. 检查环境变量中的 scope
    const envScope = process.env.SHOPIFY_SCOPES || ''
    const envScopes = envScope.split(',').map(s => s.trim())
    const envHasWriteDraftOrders = envScopes.includes('write_draft_orders')
    
    console.log('🔍 环境变量 SHOPIFY_SCOPES:', envScope)
    console.log('包含 write_draft_orders:', envHasWriteDraftOrders)
    
    // 2. 检查数据库中的 scope
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('shop_domain, scope')
      .eq('shop_domain', shop)
      .maybeSingle()
    
    if (shopError) {
      return res.status(500).json({
        error: '数据库查询错误',
        details: shopError.message
      })
    }
    
    if (!shopData) {
      return res.status(404).json({
        error: '店铺未找到',
        details: `店铺 ${shop} 未在数据库中找到，可能需要先安装应用`,
        shop,
        envScope,
        envHasWriteDraftOrders
      })
    }
    
    const dbScope = shopData.scope || ''
    const dbScopes = dbScope.split(',').map(s => s.trim())
    const dbHasWriteDraftOrders = dbScopes.includes('write_draft_orders')
    
    console.log('🔍 数据库 scope:', dbScope)
    console.log('包含 write_draft_orders:', dbHasWriteDraftOrders)
    
    // 3. 生成权限对比
    const allScopes = new Set([...envScopes, ...dbScopes])
    const scopeComparison = Array.from(allScopes).map(scope => ({
      scope,
      inEnv: envScopes.includes(scope),
      inDb: dbScopes.includes(scope)
    }))
    
    // 4. 判断是否需要重新授权
    const needsReauthorization = envHasWriteDraftOrders && !dbHasWriteDraftOrders
    
    return res.status(200).json({
      shop,
      envScope,
      envHasWriteDraftOrders,
      dbScope,
      dbHasWriteDraftOrders,
      needsReauthorization,
      scopeComparison,
      recommendation: needsReauthorization 
        ? '需要重新授权应用以更新数据库中的权限'
        : envHasWriteDraftOrders && dbHasWriteDraftOrders
        ? '配置正确，可以创建 Draft Orders'
        : '请先在 Vercel 中添加 write_draft_orders 到 SHOPIFY_SCOPES'
    })
    
  } catch (error: any) {
    console.error('❌ 检查 Scopes 错误:', error)
    return res.status(500).json({
      error: '服务器错误',
      message: error.message
    })
  }
}
