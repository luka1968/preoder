import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase'

/**
 * 诊断为什么 Draft Order 没有创建
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { shop } = req.query

    try {
        const report: any = {
            timestamp: new Date().toISOString(),
            shop: shop || '未提供',
            issues: [],
            recommendations: []
        }

        // 1. 检查 shops 表
        console.log('📊 检查 shops 表...')
        const { data: shopData, error: shopError } = await supabaseAdmin
            .from('shops')
            .select('id, shop_domain, access_token, installed_at')
            .eq('shop_domain', shop || '')
            .single()

        if (shopError || !shopData) {
            report.issues.push('❌ 店铺未找到或未正确安装')
            report.recommendations.push('请重新安装应用并完成 OAuth 授权')
            report.shopData = null
        } else {
            report.shopData = {
                id: shopData.id,
                shop_domain: shopData.shop_domain,
                has_access_token: !!shopData.access_token,
                access_token_length: shopData.access_token?.length || 0,
                installed_at: shopData.installed_at
            }

            if (!shopData.access_token) {
                report.issues.push('❌ 缺少 access_token - 无法创建 Draft Order')
                report.recommendations.push('需要重新完成 OAuth 授权以获取 access_token')
            } else {
                report.issues.push('✅ access_token 存在')
            }
        }

        // 2. 检查最近的预购订单
        console.log('📊 检查最近的预购订单...')
        if (shopData?.id) {
            const { data: recentOrders, error: ordersError } = await supabaseAdmin
                .from('preorder_orders')
                .select('id, shopify_order_id, variant_id, created_at')
                .eq('shop_id', shopData.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (ordersError) {
                report.issues.push('❌ 无法查询预购订单: ' + ordersError.message)
            } else {
                report.recentOrders = {
                    count: recentOrders?.length || 0,
                    orders: recentOrders?.map(o => ({
                        id: o.id,
                        has_shopify_order_id: !!o.shopify_order_id,
                        shopify_order_id: o.shopify_order_id,
                        has_variant_id: !!o.variant_id,
                        variant_id: o.variant_id,
                        created_at: o.created_at
                    })) || []
                }

                const ordersWithoutDraftId = recentOrders?.filter(o => !o.shopify_order_id) || []
                if (ordersWithoutDraftId.length > 0) {
                    report.issues.push(`⚠️ 有 ${ordersWithoutDraftId.length} 条订单缺少 shopify_order_id（Draft Order 未创建）`)
                    report.recommendations.push('检查前端是否传递了 variantId 参数')
                }

                const ordersWithoutVariantId = recentOrders?.filter(o => !o.variant_id) || []
                if (ordersWithoutVariantId.length > 0) {
                    report.issues.push(`⚠️ 有 ${ordersWithoutVariantId.length} 条订单缺少 variant_id`)
                    report.recommendations.push('修改前端脚本，确保获取并传递 variantId')
                }
            }
        }

        // 3. 检查前端配置
        report.frontendCheck = {
            apiUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.SHOPIFY_APP_URL,
            scriptUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.SHOPIFY_APP_URL}/universal-preorder.js`
        }

        if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.SHOPIFY_APP_URL) {
            report.issues.push('⚠️ 环境变量 NEXT_PUBLIC_APP_URL 或 SHOPIFY_APP_URL 未设置')
            report.recommendations.push('检查 .env 文件，确保 API URL 配置正确')
        }

        // 4. 总结
        report.summary = {
            total_issues: report.issues.filter((i: string) => i.startsWith('❌') || i.startsWith('⚠️')).length,
            can_create_draft_orders: shopData?.access_token ? '是' : '否',
            main_problem: !shopData?.access_token ? 'OAuth 授权问题' :
                (ordersWithoutVariantId && ordersWithoutVariantId.length > 0) ? 'variantId 缺失' :
                    '未知'
        }

        return res.status(200).json({
            success: true,
            report
        })

    } catch (error: any) {
        console.error('诊断失败:', error)
        return res.status(500).json({
            error: '诊断失败',
            message: error.message
        })
    }
}
