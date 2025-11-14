import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 1. 从环境变量获取最新的 scope
    const envScope = process.env.SHOPIFY_SCOPES
    
    if (!envScope) {
      return res.status(500).json({ 
        success: false,
        error: 'SHOPIFY_SCOPES 环境变量未配置' 
      })
    }

    console.log('🔧 开始快速修复权限...')
    console.log('环境变量 scope:', envScope)

    // 2. 获取当前数据库中的数据
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from('shops')
      .select('scope, access_token')
      .eq('shop_domain', shop)
      .single()

    if (fetchError || !currentData) {
      return res.status(404).json({ 
        success: false,
        error: '店铺未找到' 
      })
    }

    console.log('当前数据库 scope:', currentData.scope)

    // 3. 更新数据库中的 scope
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('shops')
      .update({ scope: envScope })
      .eq('shop_domain', shop)
      .select()
      .single()

    if (updateError) {
      console.error('更新失败:', updateError)
      return res.status(500).json({ 
        success: false,
        error: '数据库更新失败',
        details: updateError.message 
      })
    }

    console.log('✅ 权限更新成功!')

    return res.status(200).json({
      success: true,
      message: '权限已更新！现在可以创建 Draft Orders 了。',
      before: {
        scope: currentData.scope,
        hasWriteDraftOrders: currentData.scope?.includes('write_draft_orders')
      },
      after: {
        scope: updatedData.scope,
        hasWriteDraftOrders: updatedData.scope?.includes('write_draft_orders')
      },
      note: '这是临时修复。建议稍后重新授权应用以获取新的 access token。'
    })

  } catch (error: any) {
    console.error('快速修复错误:', error)
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: error.message
    })
  }
}
