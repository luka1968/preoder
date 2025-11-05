import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 从环境变量获取最新的 scope
    const newScope = process.env.SHOPIFY_SCOPES
    
    if (!newScope) {
      return res.status(500).json({ error: 'SHOPIFY_SCOPES 环境变量未设置' })
    }

    console.log('🔄 更新店铺权限范围...')
    console.log('店铺:', shop)
    console.log('新的 Scope:', newScope)

    // 获取当前的 scope
    const { data: currentShop, error: fetchError } = await supabaseAdmin
      .from('shops')
      .select('scope')
      .eq('shop_domain', shop)
      .single()

    if (fetchError) {
      return res.status(404).json({ error: '店铺未找到', details: fetchError.message })
    }

    const oldScope = currentShop.scope

    // 更新 scope
    const { data, error } = await supabaseAdmin
      .from('shops')
      .update({ 
        scope: newScope,
        updated_at: new Date().toISOString()
      })
      .eq('shop_domain', shop)
      .select()

    if (error) {
      console.error('❌ 更新失败:', error)
      return res.status(500).json({ error: '更新失败', details: error.message })
    }

    console.log('✅ Scope 更新成功!')

    return res.status(200).json({
      success: true,
      message: 'Scope 更新成功！',
      shop: shop,
      oldScope: oldScope,
      newScope: newScope,
      hasWriteDraftOrders: newScope.includes('write_draft_orders')
    })

  } catch (error: any) {
    console.error('❌ 更新 Scope 错误:', error)
    return res.status(500).json({
      error: '服务器错误',
      message: error.message
    })
  }
}
