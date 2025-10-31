import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code, hmac, shop, state } = req.query

    console.log('📥 OAuth回调接收:', { shop, hasCode: !!code, hasHmac: !!hmac })

    // 验证必需参数
    if (!code || !shop || !hmac) {
      console.error('❌ 缺少必需参数')
      return res.status(400).send('缺少必需参数')
    }

    const shopDomain = shop as string

    // 验证 HMAC
    const apiSecret = process.env.SHOPIFY_API_SECRET
    if (!apiSecret) {
      console.error('❌ 缺少 SHOPIFY_API_SECRET')
      return res.status(500).send('服务器配置错误')
    }

    // 构建验证字符串
    const queryParams = { ...req.query }
    delete queryParams.hmac
    delete queryParams.signature
    
    const sortedParams = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${queryParams[key]}`)
      .join('&')

    const calculatedHmac = crypto
      .createHmac('sha256', apiSecret)
      .update(sortedParams)
      .digest('hex')

    if (calculatedHmac !== hmac) {
      console.error('❌ HMAC验证失败')
      return res.status(403).send('HMAC验证失败')
    }

    console.log('✅ HMAC验证通过')

    // 交换 access token
    const apiKey = process.env.SHOPIFY_API_KEY
    const tokenUrl = `https://${shopDomain}/admin/oauth/access_token`

    console.log('🔄 请求 access token...')

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ 获取 token 失败:', errorText)
      return res.status(500).send('获取访问令牌失败')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, scope } = tokenData

    console.log('✅ 获取 access token 成功')

    // 保存到数据库
    const { data, error } = await supabaseAdmin
      .from('shops')
      .upsert({
        shop_domain: shopDomain,
        access_token: access_token,
        scope: scope,
        installed_at: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: 'shop_domain'
      })
      .select()

    if (error) {
      console.error('❌ 保存到数据库失败:', error)
      return res.status(500).send('保存店铺信息失败')
    }

    console.log('✅ 保存到数据库成功:', shopDomain)

    // 重定向到成功页面
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL
    return res.redirect(`${appUrl}/install-success?shop=${shopDomain}`)

  } catch (error: any) {
    console.error('❌ OAuth回调错误:', error)
    return res.status(500).send('安装失败: ' + error.message)
  }
}
