import { NextApiRequest, NextApiResponse } from 'next'
import { getShopByDomain } from '../../lib/supabase'
import { HybridPreorderSystem } from '../../lib/hybrid-preorder-system'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shop, action } = req.query

  if (!shop || typeof shop !== 'string') {
    return res.status(400).json({ error: 'Shop parameter is required' })
  }

  try {
    // 获取商店数据
    const shopData = await getShopByDomain(shop)
    if (!shopData) {
      return res.status(404).json({ error: 'Shop not found' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopmall.dpdns.org'
    
    // 创建混合系统实例
    const hybridSystem = new HybridPreorderSystem({
      shop: shop,
      accessToken: shopData.access_token,
      appUrl: appUrl,
      debug: true
    })

    if (req.method === 'POST') {
      // 部署混合模式
      const result = await hybridSystem.deploy()
      
      res.json({
        success: result.success,
        method: result.method,
        message: result.message,
        details: {
          appEmbedStatus: result.appEmbedStatus,
          scriptTagStatus: result.scriptTagStatus,
          shop: shop,
          appUrl: appUrl,
          timestamp: new Date().toISOString()
        }
      })

    } else if (req.method === 'GET') {
      if (action === 'status') {
        // 检查部署状态
        const status = await hybridSystem.checkStatus()
        
        res.json({
          shop: shop,
          status: status.overallStatus,
          appEmbedActive: status.appEmbedActive,
          scriptTagActive: status.scriptTagActive,
          recommendations: status.recommendations,
          timestamp: new Date().toISOString()
        })
      } else {
        // 返回混合模式信息
        res.json({
          message: 'PreOrder Pro 混合模式 API',
          shop: shop,
          endpoints: {
            deploy: `POST ${req.headers.host}/api/hybrid-deploy?shop=${shop}`,
            status: `GET ${req.headers.host}/api/hybrid-deploy?shop=${shop}&action=status`
          },
          features: [
            '🧩 App Embed Block + Script Tag 双重保障',
            '🎯 最大覆盖率和可靠性',
            '🔄 智能检测和自动切换',
            '🛡️ 防重复加载机制'
          ]
        })
      }

    } else if (req.method === 'DELETE') {
      // 清理所有预购脚本
      const hybridSystem = new HybridPreorderSystem({
        shop: shop,
        accessToken: shopData.access_token,
        appUrl: appUrl
      })

      // 获取并删除所有预购相关的 Script Tags
      const scriptTags = await getScriptTags(shopData.access_token, shop)
      const preorderScripts = scriptTags.filter((tag: any) => 
        tag.src.includes('preorder') || 
        tag.src.includes('universal') ||
        tag.src.includes('hybrid') ||
        tag.src.includes(appUrl)
      )

      const deleteResults = []
      for (const script of preorderScripts) {
        try {
          const response = await fetch(`https://${shop}/admin/api/2023-10/script_tags/${script.id}.json`, {
            method: 'DELETE',
            headers: {
              'X-Shopify-Access-Token': shopData.access_token,
            }
          })

          deleteResults.push({
            id: script.id,
            src: script.src,
            success: response.ok
          })
        } catch (error) {
          deleteResults.push({
            id: script.id,
            src: script.src,
            success: false,
            error: error
          })
        }
      }

      res.json({
        success: true,
        message: `清理了 ${preorderScripts.length} 个预购脚本`,
        deletedScripts: deleteResults
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Hybrid deploy error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 获取 Script Tags
async function getScriptTags(accessToken: string, shop: string) {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/script_tags.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get script tags')
    }

    const result = await response.json()
    return result.script_tags || []

  } catch (error) {
    console.error('Error getting script tags:', error)
    return []
  }
}
