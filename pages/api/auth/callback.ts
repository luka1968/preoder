import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../lib/supabase'

// 自动注入预购脚本到商店
async function autoInjectPreorderScript(shopDomain: string, accessToken: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopmall.dpdns.org'
  const scriptUrl = `${appUrl}/universal-preorder.js`
  
  // 首先检查是否已经存在我们的脚本
  const existingScripts = await getScriptTags(shopDomain, accessToken)
  const ourScript = existingScripts.find((script: any) => 
    script.src.includes('universal-preorder.js') || script.src.includes(appUrl)
  )
  
  if (ourScript) {
    console.log('PreOrder script already exists, skipping injection')
    return
  }
  
  // 创建新的script tag
  const response = await fetch(`https://${shopDomain}/admin/api/2023-10/script_tags.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script_tag: {
        event: 'onload',
        src: scriptUrl,
        display_scope: 'online_store'
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create script tag: ${error}`)
  }

  const result = await response.json()
  console.log('✅ PreOrder script tag created:', result.script_tag.id)
  return result
}

// 获取现有的script tags
async function getScriptTags(shopDomain: string, accessToken: string) {
  const response = await fetch(`https://${shopDomain}/admin/api/2023-10/script_tags.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get script tags')
  }

  const result = await response.json()
  return result.script_tags || []
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code, hmac, shop, state } = req.query

    console.log('📥 OAuth回调接收 (/api/auth/callback):', { shop, hasCode: !!code, hasHmac: !!hmac })

    // 验证必需参数
    if (!code || !shop || !hmac) {
      console.error('❌ 缺少必需参数')
      return res.status(400).send('缺少必需参数')
    }

    const shopDomain = shop as string

    // 验证店铺域名格式
    if (!shopDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      return res.status(400).json({ error: 'Invalid shop domain' })
    }

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
        plan: 'free',
        active: true
      }, {
        onConflict: 'shop_domain'
      })
      .select()

    if (error) {
      console.error('❌ 保存到数据库失败:', error)
      return res.status(500).send('保存店铺信息失败')
    }

    console.log('✅ 保存到数据库成功:', shopDomain)

    // 自动注入预购脚本到商店
    try {
      await autoInjectPreorderScript(shopDomain, access_token)
      console.log('✅ PreOrder script auto-injected for:', shopDomain)
    } catch (error) {
      console.warn('⚠️ Failed to auto-inject PreOrder script for:', shopDomain, error)
      // 不阻止安装流程，脚本注入失败不影响应用安装
    }

    // 重定向到成功页面
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL
    return res.redirect(`${appUrl}/install-success?shop=${shopDomain}`)

  } catch (error: any) {
    console.error('❌ OAuth回调错误:', error)
    return res.status(500).send('安装失败: ' + error.message)
  }
}
