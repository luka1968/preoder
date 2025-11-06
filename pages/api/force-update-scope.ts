import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 从环境变量获取当前配置的 scope
    const envScope = process.env.SHOPIFY_SCOPES
    
    if (!envScope) {
      return res.status(500).json({ error: 'SHOPIFY_SCOPES 环境变量未设置' })
    }

    console.log('🔄 强制更新店铺权限范围...')
    console.log('店铺:', shop)
    console.log('新的 Scope:', envScope)

    // 获取当前数据库中的数据
    const { data: currentShop, error: fetchError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', shop)
      .single()

    if (fetchError) {
      return res.status(404).json({ error: '店铺未找到', details: fetchError.message })
    }

    const oldScope = currentShop.scope
    const oldAccessToken = currentShop.access_token

    console.log('📊 当前数据库状态:')
    console.log('- 旧 Scope:', oldScope)
    console.log('- Access Token 长度:', oldAccessToken?.length || 0)

    // 强制更新 scope
    const { data, error } = await supabaseAdmin
      .from('shops')
      .update({ 
        scope: envScope,
        updated_at: new Date().toISOString()
      })
      .eq('shop_domain', shop)
      .select()

    if (error) {
      console.error('❌ 更新失败:', error)
      return res.status(500).json({ error: '更新失败', details: error.message })
    }

    console.log('✅ Scope 强制更新成功!')

    return res.status(200).json({
      success: true,
      message: 'Scope 强制更新成功！现在可以测试 Draft Order 创建了。',
      shop: shop,
      oldScope: oldScope,
      newScope: envScope,
      hasWriteDraftOrders: envScope.includes('write_draft_orders'),
      warning: '注意：这只是临时修复。正确的方法是重新授权应用以获取新的 access_token。'
    })

  } catch (error: any) {
    console.error('❌ 强制更新 Scope 错误:', error)
    return res.status(500).json({
      error: '服务器错误',
      message: error.message
    })
  }
}
