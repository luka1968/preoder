import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const shop = 'arivi-shop.myshopify.com'
    
    // 1. 获取当前数据
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

    // 2. 从环境变量获取应该有的 scope
    const expectedScope = process.env.SHOPIFY_SCOPES || ''
    
    console.log('当前 scope:', currentData.scope)
    console.log('期望 scope:', expectedScope)

    // 3. 使用当前的 access_token 测试是否有 write_draft_orders 权限
    // 尝试调用 draft orders API
    const testResponse = await fetch(`https://${shop}/admin/api/2025-01/draft_orders.json?limit=1`, {
      headers: {
        'X-Shopify-Access-Token': currentData.access_token,
        'Content-Type': 'application/json',
      }
    })

    const canAccessDraftOrders = testResponse.ok

    if (canAccessDraftOrders) {
      // Token 实际上已经有权限了，只需要更新数据库中的 scope 字段
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
        message: '✅ Token 已经有 draft orders 权限，数据库已更新！',
        canAccessDraftOrders: true,
        before: {
          scope: currentData.scope,
        },
        after: {
          scope: updatedData.scope,
        },
        nextStep: '现在可以直接测试 Draft Order 创建功能了'
      })
    } else {
      // Token 确实没有权限
      return res.status(200).json({
        success: false,
        message: '❌ Token 没有 draft orders 权限',
        canAccessDraftOrders: false,
        apiResponse: {
          status: testResponse.status,
          statusText: testResponse.statusText
        },
        recommendation: '必须重新授权应用才能获得新权限。请先在 Shopify Admin 中完全卸载应用，然后重新安装。'
      })
    }

  } catch (error: any) {
    console.error('强制更新错误:', error)
    return res.status(500).json({
      error: '服务器错误',
      message: error.message
    })
  }
}
