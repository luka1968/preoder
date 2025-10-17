import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // Get shop from database
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    if (req.method === 'GET') {
      // 检查 App Embed 状态
      const embedStatus = await checkAppEmbedStatus(shopData.access_token, shop)
      res.json(embedStatus)
      
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('App Embed Status API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function checkAppEmbedStatus(accessToken: string, shop: string) {
  try {
    // 获取当前主题信息
    const themesResponse = await fetch(`https://${shop}/admin/api/2023-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!themesResponse.ok) {
      throw new Error('Failed to fetch themes')
    }

    const themesData = await themesResponse.json()
    const currentTheme = themesData.themes.find((theme: any) => theme.role === 'main')

    if (!currentTheme) {
      return {
        status: 'error',
        message: 'No main theme found',
        embedEnabled: false
      }
    }

    // 检查主题资源中是否有我们的 App Embed
    const assetsResponse = await fetch(`https://${shop}/admin/api/2023-10/themes/${currentTheme.id}/assets.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!assetsResponse.ok) {
      throw new Error('Failed to fetch theme assets')
    }

    const assetsData = await assetsResponse.json()
    
    // 查找我们的 App Embed 相关文件
    const hasPreorderEmbed = assetsData.assets.some((asset: any) => 
      asset.key.includes('preorder') || 
      asset.key.includes('app-embed') ||
      asset.key.includes('extensions')
    )

    // 检查 theme.liquid 中是否包含我们的 App Embed
    const themeResponse = await fetch(`https://${shop}/admin/api/2023-10/themes/${currentTheme.id}/assets.json?asset[key]=layout/theme.liquid`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    let themeContent = ''
    if (themeResponse.ok) {
      const themeData = await themeResponse.json()
      themeContent = themeData.asset?.value || ''
    }

    const hasEmbedInTheme = themeContent.includes('preorder') || 
                           themeContent.includes('app-embed') ||
                           themeContent.includes('theme_app_extension')

    return {
      status: 'success',
      embedEnabled: hasPreorderEmbed || hasEmbedInTheme,
      themeId: currentTheme.id,
      themeName: currentTheme.name,
      themeRole: currentTheme.role,
      hasPreorderAssets: hasPreorderEmbed,
      hasEmbedInTheme: hasEmbedInTheme,
      assetsCount: assetsData.assets.length
    }

  } catch (error) {
    console.error('Error checking App Embed status:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      embedEnabled: false
    }
  }
}
