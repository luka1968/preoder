import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { supabaseAdmin } from '../../lib/supabase'

/**
 * GET /auth/callback?code=xxx&shop=xxx&state=xxx
 * 
 * Shopify OAuth 回调处理
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, shop, state } = req.query

    if (!code || !shop) {
        return res.status(400).json({ error: 'Missing required parameters' })
    }

    try {
        // 1. 用 code 换取 access_token
        const accessToken = await getAccessToken(shop as string, code as string)

        // 2. 保存到数据库
        await saveShopData(shop as string, accessToken)

        // 3. 注册必要的 webhooks
        await registerWebhooks(shop as string, accessToken)

        // 4. 重定向到应用首页
        res.redirect(`/admin?shop=${shop}`)

    } catch (error: any) {
        console.error('OAuth callback error:', error)
        res.status(500).json({ error: 'Failed to complete installation' })
    }
}

/**
 * 获取 access token
 */
async function getAccessToken(shop: string, code: string): Promise<string> {
    const apiKey = process.env.SHOPIFY_API_KEY
    const apiSecret = process.env.SHOPIFY_API_SECRET

    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: apiKey,
            client_secret: apiSecret,
            code,
        }),
    })

    if (!response.ok) {
        throw new Error('Failed to get access token')
    }

    const data = await response.json()
    return data.access_token
}

/**
 * 保存店铺数据
 */
async function saveShopData(shop: string, accessToken: string) {
    await supabaseAdmin
        .from('shops')
        .upsert({
            shop_domain: shop,
            access_token: accessToken,
            installed_at: new Date().toISOString(),
        }, {
            onConflict: 'shop_domain'
        })

    // 同时初始化默认设置
    const { data: shopData } = await supabaseAdmin
        .from('shops')
        .select('id')
        .eq('shop_domain', shop)
        .single()

    if (shopData) {
        // 创建默认全局设置
        await supabaseAdmin
            .from('preorder_settings')
            .upsert({
                shop_id: shopData.id,
                auto_preorder_enabled: false,
                auto_threshold: 0,
            }, {
                onConflict: 'shop_id'
            })

        // 创建默认前端设置
        await supabaseAdmin
            .from('frontend_settings')
            .upsert({
                shop_id: shopData.id,
            }, {
                onConflict: 'shop_id'
            })

        // 初始化 webhook 状态
        const webhookTopics = [
            'inventory_levels/update',
            'products/update',
            'orders/create',
            'app/uninstalled'
        ]

        for (const topic of webhookTopics) {
            await supabaseAdmin
                .from('webhook_status')
                .upsert({
                    shop_id: shopData.id,
                    topic,
                    is_registered: false,
                }, {
                    onConflict: 'shop_id,topic'
                })
        }
    }
}

/**
 * 注册 webhooks
 */
async function registerWebhooks(shop: string, accessToken: string) {
    const webhooks = [
        {
            topic: 'inventory_levels/update',
            address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/inventory/updated`,
        },
        {
            topic: 'orders/create',
            address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/orders/created`,
        },
        {
            topic: 'app/uninstalled',
            address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/app/uninstalled`,
        },
    ]

    for (const webhook of webhooks) {
        try {
            await fetch(`https://${shop}/admin/api/2025-10/webhooks.json`, {
                method: 'POST',
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    webhook: {
                        topic: webhook.topic,
                        address: webhook.address,
                        format: 'json',
                    },
                }),
            })
            console.log(`✅ Registered webhook: ${webhook.topic}`)
        } catch (error) {
            console.error(`Failed to register webhook ${webhook.topic}:`, error)
        }
    }
}
