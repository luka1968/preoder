import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 1. 检查当前状态
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('shop_domain', shop)
      .single()

    if (fetchError || !currentData) {
      return res.status(404).json({ 
        error: '店铺未找到',
        details: fetchError?.message 
      })
    }

    console.log('当前数据库状态:', {
      shop: currentData.shop_domain,
      scope: currentData.scope,
      hasAccessToken: !!currentData.access_token,
      accessTokenLength: currentData.access_token?.length
    })

    // 2. 使用当前的 access_token 调用 Shopify API 获取实际的 scope
    const shopifyResponse = await fetch(`https://${shop}/admin/api/2025-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': currentData.access_token,
        'Content-Type': 'application/json',
      }
    })

    if (!shopifyResponse.ok) {
      return res.status(500).json({
        error: 'Shopify API 调用失败',
        status: shopifyResponse.status,
        message: '可能需要重新授权应用'
      })
    }

    // 3. 从环境变量获取应该有的 scope
    const expectedScope = process.env.SHOPIFY_SCOPES || ''
    
    // 4. 更新数据库
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('shops')
      .update({
        scope: expectedScope,
        updated_at: new Date().toISOString()
      })
      .eq('shop_domain', shop)
      .select()
      .single()

    if (updateError) {
      return res.status(500).json({
        error: '数据库更新失败',
        details: updateError.message
      })
    }

    return res.status(200).json({
      success: true,
      message: '✅ Scope 已更新！',
      before: {
        scope: currentData.scope,
        hasWriteDraftOrders: currentData.scope?.includes('write_draft_orders')
      },
      after: {
        scope: updatedData.scope,
        hasWriteDraftOrders: updatedData.scope?.includes('write_draft_orders')
      },
      nextStep: '现在访问 /test-direct 测试 Draft Order 创建'
    })

  } catch (error: any) {
    console.error('修复错误:', error)
    return res.status(500).json({
      error: '服务器错误',
      message: error.message
    })
  }
}
