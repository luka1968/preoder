import { NextApiRequest, NextApiResponse } from 'next'
import { 
  verifyOAuthCallback, 
  getAccessToken, 
  saveShopData, 
  createSessionToken,
  installRequiredWebhooks 
} from '../../../lib/shopify-auth'

// 自动注入预购脚本到商店
async function autoInjectPreorderScript(shopDomain: string, accessToken: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://preorder-pro-fix.vercel.app'
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
  const { shop, hmac, code, state, timestamp } = req.query

  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  const shopDomain = shop as string
  
  // 验证shop域名格式
  if (!shopDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
    return res.status(400).json({ error: 'Invalid shop domain' })
  }

  try {
    const apiKey = process.env.SHOPIFY_API_KEY
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders,write_orders'
    const appUrl = process.env.SHOPIFY_APP_URL

    if (!apiKey || !appUrl) {
      console.error('Missing required environment variables:', { 
        hasApiKey: !!apiKey, 
        hasAppUrl: !!appUrl 
      })
      return res.status(500).json({ error: 'App configuration error' })
    }

    // 如果没有code参数，开始OAuth流程
    if (!code) {
      const redirectUri = `${appUrl}/api/auth/shopify`
      const nonce = Math.random().toString(36).substring(7)
      
      const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
        `client_id=${apiKey}&` +
        `scope=${scopes}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${nonce}`

      return res.redirect(authUrl)
    }

    // OAuth回调处理
    console.log('Processing OAuth callback for shop:', shopDomain)

    // 1. 验证HMAC签名
    if (!verifyOAuthCallback(req.query)) {
      console.error('HMAC verification failed for shop:', shopDomain)
      return res.status(401).json({ error: 'Invalid HMAC signature' })
    }

    // 2. 用code换取access token
    const accessToken = await getAccessToken(shopDomain, code as string)
    if (!accessToken) {
      console.error('Failed to get access token for shop:', shopDomain)
      return res.status(500).json({ error: 'Failed to get access token' })
    }

    // 3. 保存店铺信息到数据库
    const saved = await saveShopData(shopDomain, accessToken)
    if (!saved) {
      console.error('Failed to save shop data for:', shopDomain)
      return res.status(500).json({ error: 'Failed to save shop data' })
    }

    // 4. 安装必需的webhooks
    const webhooksInstalled = await installRequiredWebhooks(shopDomain, accessToken)
    if (!webhooksInstalled) {
      console.warn('Failed to install some webhooks for:', shopDomain)
      // 不阻止安装流程，只记录警告
    }

    // 5. 自动注入预购脚本到商店
    try {
      await autoInjectPreorderScript(shopDomain, accessToken)
      console.log('✅ PreOrder script auto-injected for:', shopDomain)
    } catch (error) {
      console.warn('⚠️ Failed to auto-inject PreOrder script for:', shopDomain, error)
      // 不阻止安装流程，脚本注入失败不影响应用安装
    }

    // 5. 创建会话令牌
    const sessionToken = createSessionToken(shopDomain)

    // 6. 设置会话cookie
    res.setHeader('Set-Cookie', [
      `shopify_session=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400`,
      `shop_domain=${shopDomain}; Secure; SameSite=None; Path=/; Max-Age=86400`
    ])

    // 7. 立即重定向到应用主界面
    console.log('Authentication successful, redirecting to app UI for:', shopDomain)
    return res.redirect(`/?shop=${shopDomain}&session=${sessionToken}`)

  } catch (error) {
    console.error('Shopify auth error:', error)
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
