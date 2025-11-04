import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

/**
 * 诊断现有预购订单
 * 检查为什么 Draft Order 没有创建
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. 获取所有预购记录
    const { data: preorders, error: preordersError } = await supabaseAdmin
      .from('preorders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (preordersError) {
      throw new Error(`获取预购记录失败: ${preordersError.message}`)
    }

    console.log(`找到 ${preorders.length} 条预购记录`)

    // 2. 分析每条记录
    const analysis = await Promise.all(preorders.map(async (preorder) => {
      const issues = []
      const info: any = {
        id: preorder.id,
        created_at: preorder.created_at,
        shop_domain: preorder.shop_domain,
        product_id: preorder.product_id,
        variant_id: preorder.variant_id,
        customer_email: preorder.customer_email,
        status: preorder.status,
        has_draft_order: !!preorder.shopify_draft_order_id,
        draft_order_id: preorder.shopify_draft_order_id,
        draft_order_name: preorder.shopify_draft_order_name
      }

      // 检查是否缺少 Draft Order
      if (!preorder.shopify_draft_order_id) {
        issues.push('缺少 Shopify Draft Order ID')
      }

      // 检查是否有店铺信息
      if (preorder.shop_domain) {
        const { data: shopData, error: shopError } = await supabaseAdmin
          .from('shops')
          .select('shop_domain, access_token')
          .eq('shop_domain', preorder.shop_domain)
          .single()

        if (shopError || !shopData) {
          issues.push('店铺未找到或未授权')
          info.shop_status = 'not_found'
        } else {
          info.shop_status = 'found'
          info.has_access_token = !!shopData.access_token

          if (!shopData.access_token) {
            issues.push('店铺缺少 Access Token')
          }
        }
      } else {
        issues.push('缺少店铺域名')
      }

      // 检查是否有变体 ID
      if (!preorder.variant_id) {
        issues.push('缺少 Variant ID')
      }

      return {
        ...info,
        issues,
        can_create_draft_order: issues.length === 1 && issues[0] === '缺少 Shopify Draft Order ID'
      }
    }))

    // 3. 统计信息
    const stats = {
      total: preorders.length,
      with_draft_order: analysis.filter(a => a.has_draft_order).length,
      without_draft_order: analysis.filter(a => !a.has_draft_order).length,
      can_fix: analysis.filter(a => a.can_create_draft_order).length
    }

    return res.status(200).json({
      success: true,
      stats,
      preorders: analysis,
      recommendations: [
        stats.without_draft_order > 0 ? '有预购订单缺少 Draft Order' : null,
        stats.can_fix > 0 ? `可以为 ${stats.can_fix} 条记录补创建 Draft Order` : null,
        '确保店铺已完成 OAuth 授权',
        '确保前端传递了正确的 variant_id'
      ].filter(Boolean)
    })

  } catch (error: any) {
    console.error('诊断失败:', error)
    return res.status(500).json({
      error: '诊断失败',
      message: error.message
    })
  }
}
