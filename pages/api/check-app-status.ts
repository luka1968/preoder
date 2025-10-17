import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // 获取商店信息
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found in database' })
    }

    // 检查应用安装状态
    const appStatus = await checkAppInstallation(shopData.access_token, shop)
    
    // 检查 Script Tags
    const scriptStatus = await checkScriptTags(shopData.access_token, shop)
    
    // 检查 Webhooks
    const webhookStatus = await checkWebhooks(shopData.access_token, shop)

    res.json({
      shop: shop,
      appInstalled: true,
      installMethod: 'manual_link', // 基于你的描述
      appStatus,
      scriptStatus,
      webhookStatus,
      recommendations: generateRecommendations(appStatus, scriptStatus)
    })

  } catch (error) {
    console.error('App status check error:', error)
    res.status(500).json({ error: 'Failed to check app status' })
  }
}

async function checkAppInstallation(accessToken: string, shop: string) {
  try {
    // 检查应用是否有访问权限
    const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        installed: true,
        shopName: data.shop.name,
        shopDomain: data.shop.domain,
        hasAccess: true
      }
    } else {
      return {
        installed: false,
        hasAccess: false,
        error: 'No API access'
      }
    }
  } catch (error) {
    return {
      installed: false,
      hasAccess: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkScriptTags(accessToken: string, shop: string) {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/script_tags.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (response.ok) {
      const data = await response.json()
      const scriptTags = data.script_tags || []
      
      const preorderScripts = scriptTags.filter((tag: any) => 
        tag.src.includes('preorder') || 
        tag.src.includes('universal') ||
        tag.src.includes('simple-preorder')
      )

      return {
        total: scriptTags.length,
        preorderScripts: preorderScripts.length,
        scripts: preorderScripts.map((script: any) => ({
          id: script.id,
          src: script.src,
          event: script.event,
          created_at: script.created_at
        }))
      }
    } else {
      return {
        error: 'Failed to fetch script tags',
        total: 0,
        preorderScripts: 0
      }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      total: 0,
      preorderScripts: 0
    }
  }
}

async function checkWebhooks(accessToken: string, shop: string) {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (response.ok) {
      const data = await response.json()
      const webhooks = data.webhooks || []
      
      const appWebhooks = webhooks.filter((webhook: any) => 
        webhook.address && webhook.address.includes('preorder-pro-fix.vercel.app')
      )

      return {
        total: webhooks.length,
        appWebhooks: appWebhooks.length,
        webhooks: appWebhooks.map((webhook: any) => ({
          id: webhook.id,
          topic: webhook.topic,
          address: webhook.address,
          created_at: webhook.created_at
        }))
      }
    } else {
      return {
        error: 'Failed to fetch webhooks',
        total: 0,
        appWebhooks: 0
      }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      total: 0,
      appWebhooks: 0
    }
  }
}

function generateRecommendations(appStatus: any, scriptStatus: any) {
  const recommendations = []

  if (!appStatus.installed) {
    recommendations.push({
      type: 'error',
      message: '应用未正确安装',
      action: '重新安装应用'
    })
  }

  if (scriptStatus.preorderScripts === 0) {
    recommendations.push({
      type: 'warning',
      message: '没有检测到预购脚本',
      action: '使用 Script Tags 方案或部署 App Embed Block'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: '应用状态正常',
      action: '可以正常使用预购功能'
    })
  }

  return recommendations
}
