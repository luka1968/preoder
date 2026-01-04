import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { registerWebhooksForShop } from '../../../lib/webhooks-register'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, shop, state, hmac } = req.query

    if (!code || !shop || !state) {
        console.error('❌ Missing required parameters')
        return res.status(400).json({ error: 'Missing required parameters' })
    }

    // ✅ 1. 解析 cookies
    const cookies = parseCookies(req.headers.cookie || '')
    const savedState = cookies.oauth_state
    const savedShop = cookies.oauth_shop

    // ✅ 2. 验证 state（防止 CSRF 攻击）
    if (!savedState || savedState !== state) {
        console.error('❌ Invalid state parameter', { savedState, receivedState: state })
        return res.status(403).json({ error: 'Invalid state parameter - possible CSRF attack' })
    }

    // ✅ 3. 验证 shop 匹配
    if (!savedShop || savedShop !== shop) {
        console.error('❌ Shop mismatch', { savedShop, receivedShop: shop })
        return res.status(403).json({ error: 'Shop domain mismatch' })
    }

    // ✅ 4. 验证 HMAC 签名（防止参数篡改）
    if (!verifyHmac(req.query)) {
        console.error('❌ Invalid HMAC signature')
        return res.status(403).json({ error: 'Invalid HMAC signature - request may be tampered' })
    }

    // ✅ 5. 清除验证用的 cookies
    res.setHeader('Set-Cookie', [
        'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        'oauth_shop=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    ])

    console.log(`✅ OAuth验证通过 for shop: ${shop}`)

    try {
        const apiKey = process.env.SHOPIFY_API_KEY
        const apiSecret = process.env.SHOPIFY_API_SECRET

        // 6. 获取 access token
        const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: apiKey, client_secret: apiSecret, code }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Shopify token exchange failed:', errorText)
            return res.status(500).json({ error: 'Failed to obtain access token' })
        }

        const data = await response.json()
        const accessToken = data.access_token

        if (!accessToken) {
            console.error('❌ No access token in response')
            return res.status(500).json({ error: 'No access token received' })
        }

        console.log(`✅ Access token obtained for ${shop}`)

        // 7. 保存到数据库
        const { error: dbError } = await supabaseAdmin.from('shops').upsert({
            shop_domain: shop,
            access_token: accessToken,
            scope: data.scope || '',
            installed_at: new Date().toISOString(),
            is_active: true
        }, { onConflict: 'shop_domain' })

        if (dbError) {
            console.error('❌ Database error:', dbError)
            return res.status(500).json({ error: 'Failed to save shop data' })
        }

        console.log(`✅ Shop data saved to database: ${shop}`)

        // ✅ 8. 自动注册 Webhooks
        try {
            await registerWebhooksForShop(shop as string, accessToken)
            console.log(`✅ Webhooks registered for ${shop}`)
        } catch (webhookError) {
            console.error('⚠️ Failed to register webhooks:', webhookError)
            // 不阻止安装流程
        }

        // ✅ 9. 检查是否需要创建订阅（新安装）
        const { data: shopData } = await supabaseAdmin
            .from('shops')
            .select('id, created_at, installed_at')
            .eq('shop_domain', shop)
            .single()

        const isNewInstall = shopData && new Date(shopData.installed_at).getTime() > Date.now() - 60000 // 1分钟内安装
        const billingEnabled = process.env.SHOPIFY_BILLING_ENABLED === 'true'

        if (isNewInstall && billingEnabled && shopData.id) {
            console.log(`✅ New installation detected, checking for subscription...`)

            // 检查是否已有订阅
            const { data: existingSub } = await supabaseAdmin
                .from('shop_subscriptions')
                .select('id')
                .eq('shop_id', shopData.id)
                .in('status', ['active', 'trialing'])
                .single()

            if (!existingSub) {
                console.log(`✅ Creating trial subscription for ${shop}`)

                try {
                    // 创建订阅并获取确认 URL
                    const protocol = req.headers['x-forwarded-proto'] || 'https'
                    const host = req.headers.host
                    const subscriptionUrl = `${protocol}://${host}/api/billing/create-subscription?shop=${shop}`

                    const subscriptionResponse = await fetch(subscriptionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })

                    const subscriptionData = await subscriptionResponse.json()

                    if (subscriptionData.success && subscriptionData.confirmation_url) {
                        console.log(`✅ Redirecting to subscription approval: ${subscriptionData.confirmation_url}`)
                        return res.redirect(subscriptionData.confirmation_url)
                    } else {
                        console.error('⚠️ Failed to create subscription:', subscriptionData.error)
                        // 继续到正常流程
                    }
                } catch (subError) {
                    console.error('⚠️ Error creating subscription:', subError)
                    // 继续到正常流程
                }
            }
        }

        // 10. 重定向到管理界面
        res.redirect(`/admin?shop=${shop}`)
    } catch (error: any) {
        console.error('❌ OAuth callback error:', error)
        res.status(500).json({
            error: 'Installation failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

/**
 * 解析 Cookie 字符串
 */
function parseCookies(cookieString: string): Record<string, string> {
    return cookieString.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        if (key && value) {
            acc[key] = value
        }
        return acc
    }, {} as Record<string, string>)
}

/**
 * 验证 Shopify HMAC 签名
 */
function verifyHmac(query: any): boolean {
    const { hmac: receivedHmac, ...params } = query

    if (!receivedHmac) {
        console.warn('⚠️ No HMAC in query parameters')
        return false
    }

    // 构建用于签名的消息（按键排序）
    const message = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&')

    // 计算期望的 HMAC
    const expectedHmac = crypto
        .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
        .update(message)
        .digest('hex')

    // 使用 timingSafeEqual 防止时序攻击
    const receivedBuffer = Buffer.from(receivedHmac as string, 'utf-8')
    const expectedBuffer = Buffer.from(expectedHmac, 'utf-8')

    if (receivedBuffer.length !== expectedBuffer.length) {
        return false
    }

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
}
